'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

function safeParse(input: string) {
  try {
    return JSON.parse(input) as { kind?: string; runId?: string; updatedAt?: string };
  } catch {
    return null;
  }
}

export function GlobalStreamBridge() {
  const queryClient = useQueryClient();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource('/api/events/stream');
    eventSourceRef.current = source;

    source.onmessage = (event) => {
      const payload = safeParse(event.data);
      if (!payload) {
        return;
      }
      void queryClient.invalidateQueries();
    };

    source.addEventListener('snapshot', () => {
      void queryClient.invalidateQueries();
    });

    source.onerror = () => {
      // Let the browser handle automatic reconnects.
    };

    return () => {
      source.close();
      eventSourceRef.current = null;
    };
  }, [queryClient]);

  return null;
}

