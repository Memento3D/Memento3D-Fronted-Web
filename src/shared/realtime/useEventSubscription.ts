import { useEffect, useRef } from 'react';
import { useRealTime } from './RealTimeContext';
import type { RealTimeEvent, RealTimeEventType } from './eventTypes';

/**
 * Hook to subscribe to real-time events of a specific type (or '*' for all events)
 */
export function useEventSubscription<T = any>(
  eventType: RealTimeEventType,
  handler: (event: RealTimeEvent<T>) => void,
  deps: any[] = []
) {
  const { subscribe } = useRealTime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const unsubscribe = subscribe<T>(eventType, (event) => {
      handlerRef.current(event);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe, eventType, ...deps]);
}

/**
 * Hook to subscribe to real-time events targeted at a specific resource (e.g. 'ORDER', 'order-123')
 */
export function useResourceSubscription<T = any>(
  resourceType: string,
  resourceId: string | undefined | null,
  handler: (event: RealTimeEvent<T>) => void,
  deps: any[] = []
) {
  const { subscribeToResource } = useRealTime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!resourceType || !resourceId) return;

    const unsubscribe = subscribeToResource<T>(resourceType, resourceId, (event) => {
      handlerRef.current(event);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribeToResource, resourceType, resourceId, ...deps]);
}
