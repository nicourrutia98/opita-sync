# Request Specification

## Summary

Implement a Codex-native launcher router that selects the Codex profile and model for new interactive or `exec` runs, with explainable heuristics, repo-scoped profiles, and a skill wrapper.

## Objective

Let the user delegate model selection for Codex work to a repo-local tool that economizes lightweight tasks while escalating heavier tasks, without routing through the OpenAI API directly.

## Business Context

The current repo already contains an API-oriented router from a previous misunderstanding. The user clarified that the real requirement is operational inside Codex itself. The corrected solution must fit Codex's actual customization model: project config, profiles, skills, and launch-time CLI flags.

## Scope

- Add project-scoped Codex profiles for fast, balanced, and deep work.
- Implement a deterministic launcher router in Node.
- Expose commands for recommendation, `codex exec`, and interactive Codex launch.
- Add a repo-local skill that instructs Codex to use the router workflow.
- Update documentation and request artifacts.
- Add unit tests for routing decisions and command construction.

## Out of Scope

- Altering the current active desktop thread's model in place
- Removing the existing API router files
- Building a new MCP server for model selection
- Financial benchmarking against API billing endpoints

## Confirmed Decisions

- Routing occurs before starting a new Codex run.
- Profiles are opt-in and do not replace the existing top-level model default.
- The router uses deterministic heuristics rather than online learning.
- Skills are used as workflow packaging; MCP remains available only for external-system integrations.

## Accepted Assumptions

- `codex --profile` and `codex exec --profile` are stable supported surfaces.
- `gpt-5-mini` and `gpt-5.4` are acceptable profile targets in the current Codex environment.
- The workspace root is the correct working directory for launched Codex runs.

## Affected Systems and Layers

- Codex project configuration: `.codex/config.toml`
- Node scripts command surface: `scripts/` and `package.json`
- Repo-local skills: `.agents/skills/`
- Documentation and control-plane records: `README.md`, `docs/requests/...`
- Unit test surface: `tests/unit/`

## Functional Behavior

1. The router accepts a prompt plus optional hints such as task type, risk, tool needs, file count, and forced profile.
2. The router computes a deterministic score from prompt size, task category, risk, tool usage, and keyword signals.
3. The router returns a recommendation object with:
   - `selected_profile`
   - `selected_model`
   - `reasoning_effort`
   - `service_tier`
   - `rationale_codes`
   - `score`
4. In dry-run mode, the router prints the recommendation and the exact Codex command it would run.
5. In `--exec` mode, the router launches `codex exec --profile <profile> ...`.
6. In `--chat` mode, the router launches `codex --profile <profile> ...`.

## Alternate Behavior and Failure Handling

- If `--force-profile` is set, heuristic scoring is bypassed and the requested profile is returned.
- If both `--chat` and `--exec` are omitted, the router defaults to recommendation-only mode.
- If `codex` cannot be found when launch mode is requested, the script exits non-zero with an explicit error.
- If the prompt is empty in recommendation mode, the router still routes from explicit flags and uses an empty prompt size.

## UI/Content Behavior

- Human-readable mode prints a concise recommendation summary plus launch command preview.
- JSON mode prints a machine-readable object for integrations and scripts.
- README explains the new command surface and states that current-session mutation is unsupported.

## Localization Rules

- Documentation and request artifacts may remain in English, consistent with repo scaffolding.
- CLI behavior is locale-agnostic.

## Accessibility Expectations

- N/A for UI changes; this work is CLI and documentation focused.

## Observability or Analytics Expectations

- Each recommendation includes score and rationale codes to make routing decisions auditable.
- Validation output is captured in the active request artifact folder.

## Non-Functional Constraints

- The router must run with built-in Node modules only.
- Decisions must be deterministic across runs for the same inputs.
- Launch mode must preserve stdio for interactive Codex usage.

## Risks and Regressions

- Model availability can change upstream; a profile may need future retuning.
- Users who continue launching Codex manually outside the router will keep current behavior.
- Existing API-router commands remain in the repo and may cause conceptual confusion until explicitly deprecated later.

## Acceptance Criteria

- AC-R1: `.codex/config.toml` defines at least three project-scoped Codex profiles for routing.
- AC-R2: `scripts/codex-route.mjs` can recommend a profile from prompt and hints without network access.
- AC-R3: The router can preview or launch `codex exec` through the selected profile.
- AC-R4: The router can preview or launch a new interactive Codex session through the selected profile.
- AC-R5: `package.json` exposes commands for recommendation and launch.
- AC-R6: A repo-local skill documents how to use the router workflow.
- AC-R7: Unit tests cover low-complexity and high-complexity routing decisions plus command construction.
- AC-R8: Active request artifacts are updated and the request remains the only active one in `docs/requests/index.md`.

## Test Strategy

- Run `npm run lint`.
- Run `npm run typecheck`.
- Run targeted dry-run commands:
  - `npm run codex:pick -- --prompt "Summarize this file" --json`
  - `npm run codex:exec:auto -- --dry-run --prompt "Fix the failing test in tests/unit/model-router.test.mjs"`
  - `npm run codex:chat:auto -- --dry-run --prompt "Review the current repo structure"`
- Run `npm run content`.
- Attempt `npm run unit` if the environment allows `node --test`.

## Rollout and Rollback

- Rollout is immediate and opt-in through new commands and skill usage.
- Rollback is limited to removing the new router script, profiles, skill, tests, and command references.

## Documentation Updates Required

- README command surface
- Request artifacts for this request
- Repo-local skill instructions
