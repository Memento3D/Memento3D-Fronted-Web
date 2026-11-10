import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useAuth } from '../../features/auth/context/AuthContext';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';
import { BASE_URL, refreshAccessToken, verifySessionAfterUnauthorized } from '../../services/apiClient';
import { readEventStream } from './sseTransport';
import type { ConnectionStatus, RealTimeEvent, RealTimeEventType } from './eventTypes';

type EventCallback<T = any> = (event: RealTimeEvent<T>) => void;

interface RealTimeContextValue {
  connectionStatus: ConnectionStatus;
  lastEvent: RealTimeEvent | null;
  reconnect: () => void;
  subscribe: <T = any>(eventType: RealTimeEventType, callback: EventCallback<T>) => () => void;
  subscribeToResource: <T = any>(resourceType: string, resourceId: string, callback: EventCallback<T>) => () => void;
}

const RealTimeContext = createContext<RealTimeContextValue | undefined>(undefined);

const MAX_DEDUP_SIZE = 300;
const INITIAL_BACKOFF_MS = 1000;
const MAX_BACKOFF_MS = 30000;
const HEARTBEAT_TIMEOUT_MS = 45000;
const MAX_RETRY_ATTEMPTS = 5;

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null);

  const eventSourceRef = useRef<{ close: () => void } | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffDelayRef = useRef<number>(INITIAL_BACKOFF_MS);
  const consecutiveFailuresRef = useRef<number>(0);
  const processedEventIdsRef = useRef<Set<string>>(new Set());

  // Subscription registries
  const typeSubscribersRef = useRef<Map<string, Set<EventCallback>>>(new Map());
  const resourceSubscribersRef = useRef<Map<string, Set<EventCallback>>>(new Map());

  // Reset heartbeat watchdog
  const resetHeartbeatWatchdog = useCallback(() => {
    if (heartbeatWatchdogRef.current) {
      clearTimeout(heartbeatWatchdogRef.current);
    }
    heartbeatWatchdogRef.current = setTimeout(() => {
      console.warn('[RealTime] Heartbeat watchdog timeout (45s). Reconnecting SSE stream...');
      reconnectStream();
    }, HEARTBEAT_TIMEOUT_MS);
  }, []);

  // Handle incoming RealTimeEvent
  const handleIncomingEvent = useCallback(
    (event: RealTimeEvent) => {
      if (!event || !event.eventId) return;

      // Event deduplication
      if (processedEventIdsRef.current.has(event.eventId)) {
        return;
      }
      processedEventIdsRef.current.add(event.eventId);
      if (processedEventIdsRef.current.size > MAX_DEDUP_SIZE) {
        // Drop oldest half
        const arr = Array.from(processedEventIdsRef.current);
        processedEventIdsRef.current = new Set(arr.slice(arr.length - 150));
      }

      setLastEvent(event);

      // Invalidate relevant TanStack Query caches automatically
      switch (event.type) {
        case 'ORDER_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
          if (event.resourceId) {
            queryClient.invalidateQueries({ queryKey: ['order', event.resourceId] });
          }
          if (event.data?.orderId) {
            queryClient.invalidateQueries({ queryKey: ['order', event.data.orderId] });
          }
          break;

        case 'PAYMENT_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['payments'] });
          if (event.resourceId) {
            queryClient.invalidateQueries({ queryKey: ['payment', event.resourceId] });
          }
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
          if (event.data?.orderId) {
            queryClient.invalidateQueries({ queryKey: ['order', event.data.orderId] });
          }
          break;

        case 'RECONSTRUCTION_PROGRESS':
        case 'RECONSTRUCTION_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['scans'] });
          if (event.data?.scanId) {
            queryClient.invalidateQueries({ queryKey: ['scan', event.data.scanId] });
          }
          if (event.resourceId) {
            queryClient.invalidateQueries({ queryKey: ['scan', event.resourceId] });
          }
          break;

        case 'MODEL_APPROVAL_REQUIRED':
        case 'MODEL_APPROVED':
        case 'MODEL_REVISION_COMPLETED':
          queryClient.invalidateQueries({ queryKey: ['orders'] });
          queryClient.invalidateQueries({ queryKey: ['customer-orders'] });
          queryClient.invalidateQueries({ queryKey: ['model-review'] });
          if (event.data?.orderId) {
            queryClient.invalidateQueries({ queryKey: ['order', event.data.orderId] });
          }
          if (event.type === 'MODEL_APPROVAL_REQUIRED') {
            notification.info({
              message: '3D Model Ready for Review',
              description: 'Your 3D model reconstruction has been processed and is ready for your approval.',
              placement: 'topRight',
              duration: 8,
            });
          }
          break;

        case 'PRINT_JOB_UPDATED':
          queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
          if (event.resourceId) {
            queryClient.invalidateQueries({ queryKey: ['print-job', event.resourceId] });
          }
          queryClient.invalidateQueries({ queryKey: ['inventory-balance'] });
          break;

        case 'PRINTER_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['printers'] });
          break;

        case 'QC_STATUS_CHANGED':
          queryClient.invalidateQueries({ queryKey: ['quality'] });
          queryClient.invalidateQueries({ queryKey: ['qc-inspections'] });
          queryClient.invalidateQueries({ queryKey: ['print-jobs'] });
          break;

        case 'NOTIFICATION_CREATED':
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
          break;

        default:
          break;
      }

      // Notify type-based subscribers
      const typeCallbacks = typeSubscribersRef.current.get(event.type);
      if (typeCallbacks) {
        typeCallbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (err) {
            console.error(`[RealTime] Error in subscriber callback for ${event.type}:`, err);
          }
        });
      }

      // Notify wildcard subscribers (*)
      const wildcardCallbacks = typeSubscribersRef.current.get('*');
      if (wildcardCallbacks) {
        wildcardCallbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (err) {
            console.error('[RealTime] Error in wildcard subscriber callback:', err);
          }
        });
      }

      // Notify resource-based subscribers
      const resourceKey = `${event.resourceType}:${event.resourceId}`;
      const resourceCallbacks = resourceSubscribersRef.current.get(resourceKey);
      if (resourceCallbacks) {
        resourceCallbacks.forEach((cb) => {
          try {
            cb(event);
          } catch (err) {
            console.error(`[RealTime] Error in resource subscriber for ${resourceKey}:`, err);
          }
        });
      }
    },
    [queryClient]
  );

  // Connect to SSE stream
  const connectStream = useCallback(() => {
    const token = tokenStorage.getAccessToken();
    if (!token || !isAuthenticated) {
      setConnectionStatus('DISCONNECTED');
      return;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const controller = new AbortController();
    const connection = { close: () => controller.abort() };
    eventSourceRef.current = connection;
    setConnectionStatus('CONNECTING');
    void (async () => {
      try {
        let accessToken = token;
        const open = () => fetch(BASE_URL + '/events/stream', {
          headers: {
            Accept: 'text/event-stream',
            Authorization: 'Bearer ' + accessToken,
            'ngrok-skip-browser-warning': 'true',
          },
          signal: controller.signal,
          cache: 'no-store',
        });
        let response = await open();
        if (response.status === 401) {
          await response.body?.cancel();
          accessToken = await refreshAccessToken(accessToken);
          if (controller.signal.aborted) return;
          response = await open();
          if (response.status === 401) await verifySessionAfterUnauthorized(accessToken);
        }
        if (!response.ok) throw new Error('Realtime HTTP ' + response.status);
        if (!response.headers.get('content-type')?.includes('text/event-stream')) {
          await response.body?.cancel();
          throw new Error('Realtime endpoint returned a non-stream response');
        }
        if (controller.signal.aborted) return;
        setConnectionStatus('CONNECTED');
        consecutiveFailuresRef.current = 0;
        backoffDelayRef.current = INITIAL_BACKOFF_MS;
        resetHeartbeatWatchdog();
        await readEventStream(response, controller.signal, (data) => {
          if (controller.signal.aborted) return;
          try { handleIncomingEvent(JSON.parse(data)); }
          catch { console.warn('[RealTime] Invalid event payload'); }
        }, resetHeartbeatWatchdog);
        if (!controller.signal.aborted) throw new Error('Realtime stream ended');
      } catch {
        if (controller.signal.aborted || eventSourceRef.current !== connection) return;
        controller.abort();
        eventSourceRef.current = null;
        if (heartbeatWatchdogRef.current) clearTimeout(heartbeatWatchdogRef.current);
        consecutiveFailuresRef.current += 1;
        // Transport/CORS/server failures never invalidate the login session.
        if (!tokenStorage.getAccessToken() || consecutiveFailuresRef.current >= MAX_RETRY_ATTEMPTS) {
          setConnectionStatus('DISCONNECTED');
          return;
        }
        setConnectionStatus('RECONNECTING');
        scheduleReconnection();
      }
    })();
  }, [isAuthenticated, handleIncomingEvent, resetHeartbeatWatchdog]);

  // Schedule reconnection with exponential backoff + jitter
  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    const currentToken = tokenStorage.getAccessToken();
    if (!isAuthenticated || !currentToken || consecutiveFailuresRef.current >= MAX_RETRY_ATTEMPTS) {
      setConnectionStatus('DISCONNECTED');
      return;
    }

    const currentBackoff = backoffDelayRef.current;
    const jitter = Math.random() * 500;
    const delay = Math.min(currentBackoff + jitter, MAX_BACKOFF_MS);

    backoffDelayRef.current = Math.min(currentBackoff * 1.8, MAX_BACKOFF_MS);

    reconnectTimeoutRef.current = setTimeout(() => {
      connectStream();
    }, delay);
  }, [isAuthenticated, connectStream]);

  const reconnectStream = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    consecutiveFailuresRef.current = 0;
    backoffDelayRef.current = INITIAL_BACKOFF_MS;
    connectStream();
  }, [connectStream]);

  // Lifecycle management based on auth state
  useEffect(() => {
    if (isAuthenticated && user) {
      connectStream();
    } else {
      consecutiveFailuresRef.current = 0;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatWatchdogRef.current) {
        clearTimeout(heartbeatWatchdogRef.current);
        heartbeatWatchdogRef.current = null;
      }
      setConnectionStatus('DISCONNECTED');
    }

    return () => {
      consecutiveFailuresRef.current = 0;
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (heartbeatWatchdogRef.current) {
        clearTimeout(heartbeatWatchdogRef.current);
        heartbeatWatchdogRef.current = null;
      }
    };
  }, [isAuthenticated, user, connectStream]);

  // Subscription helper functions
  const subscribe = useCallback(<T = any>(eventType: RealTimeEventType, callback: EventCallback<T>) => {
    if (!typeSubscribersRef.current.has(eventType)) {
      typeSubscribersRef.current.set(eventType, new Set());
    }
    const set = typeSubscribersRef.current.get(eventType)!;
    set.add(callback as EventCallback);

    return () => {
      set.delete(callback as EventCallback);
      if (set.size === 0) {
        typeSubscribersRef.current.delete(eventType);
      }
    };
  }, []);

  const subscribeToResource = useCallback(
    <T = any>(resourceType: string, resourceId: string, callback: EventCallback<T>) => {
      const key = `${resourceType}:${resourceId}`;
      if (!resourceSubscribersRef.current.has(key)) {
        resourceSubscribersRef.current.set(key, new Set());
      }
      const set = resourceSubscribersRef.current.get(key)!;
      set.add(callback as EventCallback);

      return () => {
        set.delete(callback as EventCallback);
        if (set.size === 0) {
          resourceSubscribersRef.current.delete(key);
        }
      };
    },
    []
  );

  return (
    <RealTimeContext.Provider
      value={{
        connectionStatus,
        lastEvent,
        reconnect: reconnectStream,
        subscribe,
        subscribeToResource,
      }}
    >
      {children}
    </RealTimeContext.Provider>
  );
};

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (!context) {
    throw new Error('useRealTime must be used within a RealTimeProvider');
  }
  return context;
};
