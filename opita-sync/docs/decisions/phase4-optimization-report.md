# Phase 4 Optimization Report

## Optimization Findings

- Stable workflow instructions were moved into repo files instead of being repeated in prompts.
- The repo now distinguishes clearly between reusable templates and task-specific artifacts.
- The repo now uses a real command surface instead of staged placeholders.
- The browser-validation layer was operationalized with a minimal local site and Playwright checks.
- The MCP baseline stayed minimal: one docs MCP and one browser MCP only.
- Request execution artifacts now live under `docs/requests/<request-id>/`, which removes overwrite risk for future requests.

## Keep / Change / Remove

### Keep

- Short `AGENTS.md`
- Single default docs-MCP policy
- Real command surface backed by npm scripts and CI
- Small local status site instead of a larger unnecessary frontend

### Change Later

- Add screenshot baselines only if layout-regression value exceeds maintenance cost
- Promote any future repeated product checks into scripts instead of manual review
- Revisit docs-MCP profiles only if the repo grows beyond OpenAI/Codex-centric work

### Remove

- Nothing to remove yet; the repo started essentially empty

## MCP Review

| Profile | Purpose | Frequency of Use | Value | Overlap | Keep Decision |
| --- | --- | --- | --- | --- | --- |
| Default engineering | `playwright` + `openaiDeveloperDocs` | Active | High | Low | Keep |
| Extra docs MCPs | `ref`, `context7` | Not needed yet | Unproven here | High overlap | Do not enable by default |

## Quality-Cost Tuning

- Use low-cost work for template reuse and matrix maintenance.
- Use medium-cost work for gap classification, specification updates, and integration validation.
- Reserve high-cost work for future architecture tradeoffs or debugging once a real app exists.
- Keep QA cheapest-first and reuse the current `ci` pipeline as the backbone.

## Updated Guidance for the Next Similar Task

1. Inspect repo and existing scripts first.
2. Reuse templates instead of rewriting formats inline.
3. Ask the developer only about major behavior or scope gaps.
4. Do not claim tooling exists unless it runs.
5. Add complexity only when it materially improves correctness or repeat cost.
