export const CANONICAL_AREAS = [
  { key: 'operate', label: 'Operate', description: 'Governed execution workspace' },
  { key: 'catalog', label: 'Catalog', description: 'Approved action and workflow inventory' },
  { key: 'inbox', label: 'Inbox', description: 'Actionable approvals and work queue' },
  { key: 'activity', label: 'Activity', description: 'Operational history and audit trail' },
  { key: 'governance', label: 'Governance', description: 'Authority, policy, classification' },
  { key: 'settings', label: 'Settings', description: 'Tenant, provider, connector plumbing' }
] as const;

export type CanonicalArea = (typeof CANONICAL_AREAS)[number]['key'];

