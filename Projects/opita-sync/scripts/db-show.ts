import { join } from 'node:path';

import { loadState } from '../services/api/src/store.js';
import { summarizeState } from './smoke-support.js';

const statePath = join(process.cwd(), 'data', 'state.json');

async function main() {
  const state = await loadState(statePath);
  const latestRun = state.runRecords[state.runRecords.length - 1];

  process.stdout.write(
    `${JSON.stringify(
      {
        ...summarizeState(state, statePath),
        policySet: {
          policySetId: state.policySet.policySetId,
          version: state.policySet.version,
          status: state.policySet.status,
          ruleCount: state.policySet.rules.length,
          rules: state.policySet.rules.map((rule) => ({
            ruleId: rule.ruleId,
            effect: rule.effect,
            precedenceWeight: rule.precedenceWeight,
            conditions: rule.conditions
          }))
        },
        catalog: state.catalog.map((asset) => ({
          assetId: asset.assetId,
          assetKind: asset.assetKind,
          name: asset.name,
          lifecycleState: asset.lifecycleState,
          approvalMode: asset.approvalMode,
          connectorIds: asset.connectorIds
        })),
        latestRun: latestRun
          ? {
              runId: latestRun.runId,
              contractId: latestRun.contract.contractId,
              objective: latestRun.contract.objectiveText,
              admissibility: latestRun.admissibility.status,
              policyOutcome: latestRun.policyDecision.outcome,
              runState: latestRun.run.state,
              approvalState: latestRun.approvalCase?.state ?? null,
              releaseDecision: latestRun.releaseDecision?.decision ?? null,
              inboxItems: latestRun.inboxItems.map((item) => ({
                inboxItemId: item.inboxItemId,
                itemType: item.itemType,
                summary: item.summary
              }))
            }
          : null
      },
      null,
      2
    )}\n`
  );
}

await main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
