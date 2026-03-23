# Normalized Technical Language

## Original Intent Translation

Build a Codex-native model router that decides which Codex profile and model to use before the next Codex run starts.

## Objective

Optimize Codex usage for speed and quality by routing simple tasks to a cheaper/lighter Codex profile and escalating harder tasks to a stronger profile.

## In Scope

- Project-scoped Codex profiles in `.codex/config.toml`
- A deterministic router script for recommendation and launch
- `npm` command surface for recommendation, `codex exec`, and interactive Codex launches
- A repo-local skill that invokes the router workflow
- Unit tests and request artifacts documenting the supported behavior and limitations

## Out of Scope

- Changing the model of the current running Codex chat in place
- Billing reconciliation against API usage endpoints
- Replacing or deleting the previously built API router in this task

## Confirmed Decisions

- Route new Codex runs with `--profile` and `--model` inputs instead of routing OpenAI API calls.
- Keep MCP as complementary infrastructure, not as the serving path for model selection.
- Keep the current repo default model untouched and expose routing through opt-in launch commands.

## Assumptions Accepted by Context

- `gpt-5-mini` is the economical profile target for lightweight work and `gpt-5.4` remains the stronger default for important work.
- Codex CLI is available on the machine and can be launched from the workspace.

## Primary Behavior

- Analyze prompt and explicit routing hints.
- Score complexity, risk, tool usage, and prompt size.
- Emit a recommended Codex profile, model, reasoning effort, and rationale codes.
- Optionally launch `codex exec` or interactive `codex` with the selected profile.

## Alternate and Failure Behavior

- If the user forces a profile, the router honors it.
- If `codex` is unavailable, dry-run recommendation still works and launch modes fail with a clear error.
- If no prompt is provided, the router can still make a recommendation from explicit flags but requires a prompt to launch meaningful work.

## UI/Content Requirements

- CLI output must be readable in both JSON and human text forms.
- README must describe the command surface and the limitation around current-session mutation.

## Non-Functional Constraints

- No network dependency is required for routing decisions.
- Heuristics must be deterministic and cheap.
- Launch commands must preserve the current working directory by default.

## Acceptance Criteria

- The repo exposes commands to recommend a Codex profile and to launch `codex exec` / interactive Codex through the router.
- The router explains why it chose a profile.
- Project-scoped profiles exist for at least fast, balanced, and deep work.
- A repo-local skill documents and reuses the workflow.
- Tests cover low-complexity and high-complexity routing cases.

## Risks and Unresolved Non-Blockers

- Model slug availability may vary by account or rollout; profiles rely on currently documented names.
- The desktop app may still start its own threads outside this launcher; those threads will keep using normal config resolution unless launched through the new commands.
