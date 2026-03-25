import { z } from 'zod';

export const runComposerSchema = z.object({
  rawIntent: z.string().min(10, 'Describe the intent with a little more detail.'),
  approvalMode: z.enum(['auto', 'pre-execution', 'pre-application', 'double_approval']),
  classificationLevel: z.enum(['internal', 'confidential', 'restricted', 'high_impact']),
  requestedActionAssetId: z.string().optional(),
  mixedAuthority: z.boolean(),
  externalSend: z.boolean()
});

export type RunComposerValues = z.infer<typeof runComposerSchema>;

export const settingsSchema = z.object({
  tenantId: z.string().min(1),
  tenantName: z.string().min(1),
  defaultEnvironment: z.enum(['dev', 'staging', 'prod']),
  preferredProvider: z.string().min(1),
  connectorNotes: z.string().max(500)
});

export type SettingsFormValues = z.infer<typeof settingsSchema>;

