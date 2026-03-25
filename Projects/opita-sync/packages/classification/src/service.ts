import type { ClassificationLevel, ClassificationMark } from '../../domain/src/index.js';
import { exceedsClassificationCeiling } from '../../domain/src/index.js';
import type { ClassificationEvaluationArtifact } from './models.js';

export function evaluateClassification(input: {
  artifactId: string;
  classification: ClassificationMark;
  ceiling: ClassificationLevel;
  mixedAuthority: boolean;
}): ClassificationEvaluationArtifact {
  const overCeiling = exceedsClassificationCeiling(input.classification, input.ceiling);
  const handlingObligations = [
    ...(overCeiling ? [`classification exceeds ceiling:${input.ceiling}`] : []),
    ...(input.classification.tags.length > 0 ? [`tags:${input.classification.tags.join(',')}`] : [])
  ];

  const releaseRestrictions = [
    ...(overCeiling ? ['block_release'] : []),
    ...(input.mixedAuthority ? ['mixed_authority_review_required'] : [])
  ];

  return {
    artifactId: input.artifactId,
    classification: input.classification,
    handlingObligations,
    releaseRestrictions,
    mixedAuthorityRisk: input.mixedAuthority ? 'confirmed' : 'none'
  };
}
