export interface InboxItem {
  inboxItemId: string;
  itemType: 'approval' | 'blocked_run' | 'release_review' | 'intervention';
  runId: string;
  status: 'pending' | 'completed';
  summary: string;
}
