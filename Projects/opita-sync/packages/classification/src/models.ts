import type { ClassificationLevel, ClassificationMark, ClassificationTag } from '../../domain/src/index.js';

export interface ClassificationScheme {
  classificationSchemeId: string;
  version: string;
  levels: ClassificationLevel[];
  tags: ClassificationTag[];
  active: boolean;
}

export interface ClassificationEvaluationArtifact {
  artifactId: string;
  classification: ClassificationMark;
  handlingObligations: string[];
  releaseRestrictions: string[];
  mixedAuthorityRisk: 'none' | 'potential' | 'confirmed';
}
