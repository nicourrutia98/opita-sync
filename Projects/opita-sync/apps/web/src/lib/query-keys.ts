export const queryKeys = {
  health: ['health'] as const,
  viewModel: ['view-model'] as const,
  catalog: ['catalog'] as const,
  inbox: ['inbox'] as const,
  activity: ['activity'] as const,
  governance: ['governance'] as const,
  settings: ['settings'] as const,
  run: (runId: string) => ['run', runId] as const
};

