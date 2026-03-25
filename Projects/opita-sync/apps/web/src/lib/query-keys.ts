export const queryKeys = {
  health: ['health'] as const,
  viewModel: ['view-model'] as const,
  operateWorkspace: ['operate-workspace'] as const,
  operateThread: (scope: string) => ['operate-thread', scope] as const,
  catalog: ['catalog'] as const,
  inbox: ['inbox'] as const,
  activity: ['activity'] as const,
  governance: ['governance'] as const,
  settings: ['settings'] as const,
  run: (runId: string) => ['run', runId] as const
};

