import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { notification } from 'antd';
import { useAuth } from '../../features/auth/context/AuthContext';
import { tokenStorage } from '../../features/auth/utils/tokenStorage';
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

export const RealTimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const queryClient = useQueryClient();

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const [lastEvent, setLastEvent] = useState<RealTimeEvent | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heartbeatWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffDelayRef = useRef<number>(INITIAL_BACKOFF_MS);
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

    const apiBase = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    const sseUrl = `${apiBase}/events/stream?token=${encodeURIComponent(token)}`;

    setConnectionStatus((prev) => (prev === 'CONNECTED' ? 'CONNECTED' : 'CONNECTING'));

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setConnectionStatus('CONNECTED');
      backoffDelayRef.current = INITIAL_BACKOFF_MS;
      resetHeartbeatWatchdog();
      console.log('[RealTime] Connected to Memento3D real-time event stream');
    };

    // Generic message handler
    es.onmessage = (event) => {
      resetHeartbeatWatchdog();
      try {
        const parsed: RealTimeEvent = JSON.parse(event.data);
        handleIncomingEvent(parsed);
      } catch (err) {
        console.warn('[RealTime] Non-JSON SSE message received:', event.data);
      }
    };

    // Specific event listeners for all known event types
    const knownTypes: RealTimeEventType[] = [
      'RECONSTRUCTION_PROGRESS',
      'RECONSTRUCTION_UPDATED',
      'PAYMENT_STATUS_CHANGED',
      'ORDER_STATUS_CHANGED',
      'MODEL_APPROVAL_REQUIRED',
      'MODEL_APPROVED',
      'MODEL_REVISION_COMPLETED',
      'PRINT_JOB_UPDATED',
      'PRINTER_STATUS_CHANGED',
      'QC_STATUS_CHANGED',
      'NOTIFICATION_CREATED',
      'CONNECTED',
    ];

    knownTypes.forEach((evtType) => {
      es.addEventListener(evtType, (e: MessageEvent) => {
        resetHeartbeatWatchdog();
        try {
          const parsed: RealTimeEvent = JSON.parse(e.data);
          handleIncomingEvent(parsed);
        } catch (err) {
          console.warn(`[RealTime] Error parsing ${evtType} data:`, e.data);
        }
      });
    });

    es.onerror = () => {
      console.warn('[RealTime] SSE stream error. Closing and scheduling reconnection...');
      setConnectionStatus('RECONNECTING');
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      scheduleReconnection();
    };
  }, [isAuthenticated, handleIncomingEvent, resetHeartbeatWatchdog]);

  // Schedule reconnection with exponential backoff + jitter
  const scheduleReconnection = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const currentBackoff = backoffDelayRef.current;
    const jitter = Math.random() * 500;
    const delay = Math.min(currentBackoff + jitter, MAX_BACKOFF_MS);

    backoffDelayRef.current = Math.min(currentBackoff * 1.8, MAX_BACKOFF_MS);

    console.log(`[RealTime] Will attempt reconnection in ${Math.round(delay)}ms`);
    reconnectTimeoutRef.current = setTimeout(() => {
      connectStream();
    }, delay);
  }, [connectStream]);

  const reconnectStream = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    backoffDelayRef.current = INITIAL_BACKOFF_MS;
    connectStream();
  }, [connectStream]);

  // Lifecycle management based on auth state
  useEffect(() => {
    if (isAuthenticated && user) {
      connectStream();
    } else {
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
