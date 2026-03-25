import { z } from 'zod';
import { operateThreadEntrySchema, governedArtifactSchema } from '../../ui-artifacts/src/index.js';

export const operateEventEnvelopeSchema = z.object({
  id: z.string(),
  source: z.string(),
  type: z.enum([
    'operate.thread.updated',
    'operate.run.updated',
    'operate.approval.required',
    'operate.output.resolved',
    'operate.artifact.emitted'
  ]),
  subject: z.string().optional(),
  time: z.string(),
  data: z.object({
    runId: z.string().optional(),
    threadEntry: operateThreadEntrySchema.optional(),
    artifact: governedArtifactSchema.optional(),
    status: z.string().optional()
  })
});

export type OperateEventEnvelope = z.infer<typeof operateEventEnvelopeSchema>;
