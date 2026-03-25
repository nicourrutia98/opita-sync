export const CANONICAL_ROUTES = {
  operate: '/operate',
  catalog: '/catalog',
  inbox: '/inbox',
  activity: '/activity',
  governance: '/governance',
  settings: '/settings'
} as const;

export function launchCatalogAssetIntoOperate(assetId: string) {
  return { route: CANONICAL_ROUTES.operate, seededContractSource: 'catalog_launch', seededAssetId: assetId };
}
