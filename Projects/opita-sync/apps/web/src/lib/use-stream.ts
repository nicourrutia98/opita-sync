'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './query-keys.js';
import { subscribeToGlobalStream, subscribeToRunStream } from './api.js';

export function useGlobalStateStream() {
  const queryClient = useQueryClient();

  useEffect(() => subscribeToGlobalStream(() => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
    void queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
    void queryClient.invalidateQueries({ queryKey: queryKeys.catalog });
    void queryClient.invalidateQueries({ queryKey: queryKeys.inbox });
    void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
    void queryClient.invalidateQueries({ queryKey: queryKeys.governance });
    void queryClient.invalidateQueries({ queryKey: queryKeys.settings });
  }), [queryClient]);
}

export function useRunStream(runId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!runId) return;
    return subscribeToRunStream(runId, () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.run(runId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.viewModel });
      void queryClient.invalidateQueries({ queryKey: queryKeys.operateWorkspace });
      void queryClient.invalidateQueries({ queryKey: queryKeys.activity });
      void queryClient.invalidateQueries({ queryKey: queryKeys.inbox });
    });
  }, [queryClient, runId]);
}

