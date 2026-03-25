import { existsSync } from 'node:fs';

const required = [
  'AGENTS.md',
  'opita-sync-context.md',
  'ORCHESTRATOR.md',
  'PLANS.md',
  'docs/canonical-spec/01_bounded_context_map.md',
  'docs/canonical-spec/10_phased_implementation_blueprint.md',
  'docs/canonical-spec/11_repo_blueprint.md',
  'docs/canonical-spec/12_module_implementation_map.md',
  'docs/canonical-spec/13_starter_pack_adaptation_policy.md'
];

const missing = required.filter((item) => !existsSync(item));
if (missing.length > 0) {
  console.error(JSON.stringify({ ok: false, missing }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true, checked: required }, null, 2));
