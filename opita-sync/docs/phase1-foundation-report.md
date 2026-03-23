# Phase 1 Foundation Report

## Inventory Table

| Component | Location | Role | Current Value | Overlap or Noise Risk | Action |
| --- | --- | --- | --- | --- | --- |
| Global Codex config | `%USERPROFILE%/.codex/config.toml` | User-level Codex defaults | `personality=pragmatic`, `model=gpt-5.4`, project trust, global `openaiDeveloperDocs` and `playwright` MCP entries | Low; one docs MCP and one browser MCP only | Keep |
| Repo Codex config | `.codex/config.toml` | Repo-specific Codex baseline | Present with local `openaiDeveloperDocs` and `playwright` entries | Low; mirrors repo intent without extra overlap | Keep |
| Workflow guardrails | `AGENTS.md` | Stable repo instruction layer | Present | Low; short and specific | Keep |
| Local instruction files | repo root | Additional repo instructions | None found | None | Keep absent |
| Git repository | repo root | Versioned execution surface | Initialized | Low | Keep |
| Build/test manifest | `package.json` / `.github/workflows/ci.yml` | Script source of truth | Present with executable command surface and CI pipeline | Low; commands map cleanly to repo checks | Keep |
| Frontend QA tooling | `playwright.config.ts`, `tests/e2e`, `tests/visual`, `tests/a11y` | UI validation | Present with local site, browser tests, layout checks, and axe-based audit | Low; no redundant browser stack | Keep |
| Docs/spec patterns | `docs/` and related dirs | Specs, audits, compliance | Present with reusable templates and task artifacts | Low | Keep |
| Master-package workflow | `master-package/` | External process instructions | Present with 4 phases | Low; source package only | Keep |

## Chosen MCP Stack

- Default engineering profile: `playwright` + `openaiDeveloperDocs`.
- Rationale: this repository is Codex/OpenAI-oriented and benefits most from one browser MCP and one docs MCP.
- Anti-noise decision: do not enable `ref` or `context7` by default at this stage.
- Current state: the MCP baseline is configured globally and mirrored in `.codex/config.toml` for repo-local clarity.

## Repo Structure Created

- `AGENTS.md`
- `.codex/`
- `.docs/`
- `docs/`
- `docs/requests/`
- `docs/specs/`
- `docs/decisions/`
- `docs/test-plans/`
- `playwright/`
- `scripts/`
- `site/`
- `tests/e2e/`
- `tests/content/`
- `tests/visual/`
- `tests/a11y/`

## Executable Command Surface

| Command | Current State | Role |
| --- | --- | --- |
| `lint` | Implemented | Static hygiene checks for repo files |
| `typecheck` | Implemented | Strict type validation for scripts and Playwright tests |
| `unit` | Implemented | Low-cost validation of repo utility functions |
| `integration` | Implemented | Structural validation of required repo assets |
| `e2e` | Implemented | Browser validation of the local control-plane site |
| `visual` | Implemented | Layout and overflow checks on desktop and mobile |
| `a11y` | Implemented | Axe-based accessibility validation |
| `content` | Implemented | Required-heading and command-surface consistency checks |
| `ci` | Implemented | Full validation pipeline |

## Remaining Optional Tooling

- Versioned screenshot baselines if visual diffs become higher value than layout assertions
- Additional docs-MCP profiles if the repo grows beyond OpenAI/Codex-centric work
- Deeper content linting once the repo accumulates more long-form docs
- Request scaffolding automation for creating new `docs/requests/<request-id>/` folders

## Exit Gate Assessment

- MCP stack is minimal and justified: yes, and configured.
- Templates exist in repo: yes.
- Instruction layer is short and stable: yes.
- Command surface is known or clearly planned: yes, implemented.
- Major ambiguity about the control plane remains: no blocking ambiguity.
