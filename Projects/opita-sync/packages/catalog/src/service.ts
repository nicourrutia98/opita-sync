import type { AssetLifecycleState, AssetRevisionChangeAssessment, CatalogAsset } from './models.js';

const LIFECYCLE_ORDER: Record<AssetLifecycleState, number> = {
  draft: 0,
  review: 1,
  approved: 2,
  published: 3,
  retired: 4
};

export function canTransitionLifecycle(from: AssetLifecycleState, to: AssetLifecycleState): boolean {
  const allowed: Record<AssetLifecycleState, AssetLifecycleState[]> = {
    draft: ['review', 'retired'],
    review: ['draft', 'approved', 'retired'],
    approved: ['published', 'retired'],
    published: ['retired'],
    retired: []
  };
  return allowed[from].includes(to);
}

export function assertValidLifecycleTransition(from: AssetLifecycleState, to: AssetLifecycleState): void {
  if (!canTransitionLifecycle(from, to)) {
    throw new Error(`Invalid lifecycle transition from ${from} to ${to}`);
  }
}

export function isPublishedInEnvironment(asset: CatalogAsset, environment: 'dev' | 'staging' | 'prod', publications: { environment: string; active: boolean }[]): boolean {
  return asset.lifecycleState === 'published' && publications.some((publication) => publication.environment === environment && publication.active);
}

export function assessAssetRevisionChange(input: {
  current: CatalogAsset;
  nextVersion: string;
  changedFields: string[];
  nextPublishedSemanticHash: string;
}): AssetRevisionChangeAssessment {
  const breakingChange = input.current.publishedSemanticHash !== input.nextPublishedSemanticHash;
  return {
    assetId: input.current.assetId,
    previousVersion: input.current.version,
    nextVersion: input.nextVersion,
    breakingChange,
    requiresNewAssetIdentity: breakingChange,
    changedFields: [...input.changedFields]
  };
}

export function assertPublishedAssetImmutableMeaning(current: CatalogAsset, nextPublishedSemanticHash: string): void {
  if (current.lifecycleState === 'published' && current.publishedSemanticHash !== nextPublishedSemanticHash) {
    throw new Error(`Published asset ${current.assetId} changed meaning and requires a new asset identity`);
  }
}

export function compareLifecycleState(left: AssetLifecycleState, right: AssetLifecycleState): number {
  return LIFECYCLE_ORDER[left] - LIFECYCLE_ORDER[right];
}
