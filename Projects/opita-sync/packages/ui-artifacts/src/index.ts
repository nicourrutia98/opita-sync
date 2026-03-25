import { z } from 'zod';

const badgeToneSchema = z.enum(['neutral', 'brand', 'success', 'warning', 'danger', 'muted']);

export const statusBadgeSchema = z.object({
  label: z.string(),
  value: z.string().optional(),
  tone: badgeToneSchema.default('muted')
});

export const richTextArtifactSchema = z.object({
  type: z.literal('rich_text'),
  title: z.string().optional(),
  body: z.string(),
  tone: badgeToneSchema.default('neutral')
});

export const kvSummaryArtifactSchema = z.object({
  type: z.literal('kv_summary'),
  title: z.string(),
  items: z.array(
    z.object({
      key: z.string(),
      value: z.string(),
      emphasis: z.boolean().optional()
    })
  )
});

export const statusBadgesArtifactSchema = z.object({
  type: z.literal('status_badges'),
  title: z.string().optional(),
  badges: z.array(statusBadgeSchema)
});

export const contractDiffArtifactSchema = z.object({
  type: z.literal('contract_diff'),
  title: z.string(),
  beforeLabel: z.string().default('Requested'),
  afterLabel: z.string().default('Effective'),
  changes: z.array(
    z.object({
      field: z.string(),
      requested: z.string(),
      effective: z.string(),
      reason: z.string().optional()
    })
  )
});

export const planSummaryArtifactSchema = z.object({
  type: z.literal('plan_summary'),
  title: z.string(),
  selectedCapability: z.string(),
  executionMode: z.string(),
  checkpoints: z.array(z.string()),
  summary: z.string()
});

export const timelineArtifactSchema = z.object({
  type: z.literal('timeline'),
  title: z.string(),
  events: z.array(
    z.object({
      label: z.string(),
      state: z.string().optional(),
      detail: z.string().optional(),
      occurredAt: z.string().optional()
    })
  )
});

export const approvalCardArtifactSchema = z.object({
  type: z.literal('approval_card'),
  title: z.string(),
  mode: z.string(),
  rationale: z.string(),
  allowedEffect: z.string(),
  riskSummary: z.string(),
  actions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      intent: z.enum(['approve', 'reject', 'request_redacted', 'reduce_scope', 'open_panel'])
    })
  )
});

export const dataTableArtifactSchema = z.object({
  type: z.literal('data_table'),
  title: z.string(),
  columns: z.array(z.string()),
  rows: z.array(z.array(z.string()))
});

export const datasetSummaryArtifactSchema = z.object({
  type: z.literal('dataset_summary'),
  title: z.string(),
  datasetRef: z.string(),
  rowCount: z.number().int().nonnegative(),
  columnCount: z.number().int().nonnegative(),
  allowedDataDomains: z.array(z.string()),
  classification: z.string(),
  notes: z.array(z.string()).default([])
});

export const querySummaryArtifactSchema = z.object({
  type: z.literal('query_summary'),
  title: z.string(),
  datasetRef: z.string(),
  analysisMode: z.string(),
  requestedChartFamily: z.string().optional(),
  transforms: z.array(z.string()),
  narrowedFields: z.array(z.string()).default([]),
  releaseMode: z.string()
});

export const chartSpecArtifactSchema = z.object({
  type: z.literal('chart_spec'),
  title: z.string(),
  subtitle: z.string().optional(),
  library: z.literal('vega_lite'),
  schemaVersion: z.string(),
  spec: z.unknown(),
  datasetRef: z.string(),
  releaseMode: z.string()
});

export const policyNoticeArtifactSchema = z.object({
  type: z.literal('policy_notice'),
  title: z.string(),
  message: z.string(),
  tone: badgeToneSchema.default('warning'),
  nextActions: z.array(z.string()).default([])
});

export const redactionNoticeArtifactSchema = z.object({
  type: z.literal('redaction_notice'),
  title: z.string(),
  message: z.string(),
  releaseOutcome: z.enum(['release', 'release_redacted', 'hold_for_approval', 'block', 'reroute'])
});

export const documentRefArtifactSchema = z.object({
  type: z.literal('document_ref'),
  title: z.string(),
  refLabel: z.string(),
  refValue: z.string(),
  supportingText: z.string().optional()
});

export const ctaBarArtifactSchema = z.object({
  type: z.literal('cta_bar'),
  title: z.string().optional(),
  actions: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      tone: badgeToneSchema.default('brand'),
      intent: z.enum(['start_run', 'approve', 'reject', 'reduce_scope', 'request_redacted', 'open_panel'])
    })
  )
});

export const governedArtifactSchema = z.discriminatedUnion('type', [
  richTextArtifactSchema,
  kvSummaryArtifactSchema,
  statusBadgesArtifactSchema,
  contractDiffArtifactSchema,
  planSummaryArtifactSchema,
  timelineArtifactSchema,
  approvalCardArtifactSchema,
  dataTableArtifactSchema,
  datasetSummaryArtifactSchema,
  querySummaryArtifactSchema,
  chartSpecArtifactSchema,
  policyNoticeArtifactSchema,
  redactionNoticeArtifactSchema,
  documentRefArtifactSchema,
  ctaBarArtifactSchema
]);

export const operateThreadEntrySchema = z.object({
  entryId: z.string(),
  actor: z.enum(['user', 'orchestrator', 'system']),
  title: z.string().optional(),
  body: z.string().optional(),
  status: z.string().optional(),
  createdAt: z.string().optional(),
  artifacts: z.array(governedArtifactSchema).default([])
});

export type StatusBadge = z.infer<typeof statusBadgeSchema>;
export type GovernedArtifact = z.infer<typeof governedArtifactSchema>;
export type OperateThreadEntry = z.infer<typeof operateThreadEntrySchema>;
