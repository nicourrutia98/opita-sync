import { z } from 'zod';
import { operateThreadEntrySchema, statusBadgeSchema } from '../../ui-artifacts/src/index.js';

export const operateWorkspaceResponseSchema = z.object({
  header: z.object({
    workspace: z.string(),
    tenantLabel: z.string(),
    environment: z.string(),
    runStatus: z.string(),
    badges: z.array(statusBadgeSchema)
  }),
  contractSummary: z.object({
    objective: z.string(),
    scopeSummary: z.string(),
    allowedDataDomains: z.array(z.string()),
    allowedConnectorIds: z.array(z.string()),
    delegationApplied: z.boolean(),
    approvalMode: z.string(),
    allowedFinalAction: z.string(),
    releaseState: z.string(),
    runState: z.string()
  }),
  thread: z.array(operateThreadEntrySchema),
  sidePanel: z.object({
    contract: z.array(operateThreadEntrySchema),
    plan: z.array(operateThreadEntrySchema),
    risk: z.array(operateThreadEntrySchema),
    run: z.array(operateThreadEntrySchema),
    history: z.array(operateThreadEntrySchema),
    inspector: z.array(operateThreadEntrySchema)
  }),
  quickIntents: z.array(z.string()),
  composer: z.object({
    placeholder: z.string(),
    canExecute: z.boolean()
  })
});

export type OperateWorkspaceResponse = z.infer<typeof operateWorkspaceResponseSchema>;
