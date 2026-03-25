export const CANONICAL_NAVIGATION = [
  { key: 'operate', label: 'Operate' },
  { key: 'catalog', label: 'Catalog' },
  { key: 'inbox', label: 'Inbox' },
  { key: 'activity', label: 'Activity' },
  { key: 'governance', label: 'Governance' },
  { key: 'settings', label: 'Settings' }
] as const;

export function areGovernanceAndSettingsSeparated(): boolean {
  const keys = CANONICAL_NAVIGATION.map((item) => item.key);
  return keys.includes('governance') && keys.includes('settings') && keys.indexOf('governance') !== keys.indexOf('settings');
}
