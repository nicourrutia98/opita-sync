---
name: frontend-browser-qa
description: browser-based quality assurance for frontend repositories. use when chatgpt needs to run or validate a web app in a browser, test components and routes, verify real integration behavior, inspect console and network errors, reproduce ui bugs, capture screenshots, or re-run checks after fixes. especially useful for react, next.js, vite, vue, and similar frontend projects where static code review is not enough and the task requires loading the app, exercising flows, and reporting concrete failures or remediation steps.
---

# Frontend Browser QA

Validate frontend behavior in a running browser. Prefer evidence from the actual app over assumptions from static code.

## Default workflow

Follow this sequence unless the user requests a narrower task.

1. Identify the app entrypoint and runtime.
   - Inspect `package.json`, workspace files, lockfiles, monorepo config, readme instructions, env examples, and existing test setup.
   - Determine the package manager, likely dev command, likely build command, and any existing browser test command.

2. Decide the execution path.
   - **App can run locally now** -> start the app and continue with live browser validation.
   - **App cannot run because setup is incomplete** -> explain the blocker precisely, avoid pretending validation happened, and prepare the smallest useful test plan for when the app exists.
   - **The repo already has e2e tooling** -> prefer the repo's existing Playwright/Cypress setup instead of inventing a parallel one.

3. Start the frontend safely.
   - Prefer existing scripts from `package.json`.
   - Note the selected command, port, and any required environment variables.
   - Wait for the app to become reachable before testing.

4. Exercise real user flows in the browser.
   - Open the app.
   - Navigate the main routes relevant to the user's request.
   - Interact with forms, menus, tabs, drawers, modals, chat composers, and other visible controls.
   - Verify empty, loading, success, and error states whenever reachable.
   - Check responsive behavior at a minimum for desktop and a narrow mobile viewport when layout matters.

5. Inspect runtime signals while testing.
   - Check browser console for uncaught errors, warnings that indicate broken behavior, hydration mismatches, and failed asset loads.
   - Check network activity for failed requests, CORS issues, auth failures, bad payloads, and latency or timeout symptoms.
   - Distinguish clearly between frontend bugs, backend/integration failures, and missing local setup.

6. Record evidence and diagnose.
   - Capture the exact route, action, expected behavior, actual behavior, and any error text.
   - Prefer screenshots when visual defects or transient failures matter.
   - Trace the failure back to the most likely component, state transition, API dependency, or configuration gap.

7. Fix and re-verify when appropriate.
   - If the user asked for debugging or improvement, patch the smallest credible fix.
   - Re-run the affected flow after changes.
   - Report whether the issue is resolved, partially improved, or still blocked.

## Testing priorities

Use these priorities by default unless the user gives a custom checklist.

1. App boot and first paint
2. Core navigation and route rendering
3. Primary interactive components
4. Form submission and validation
5. Empty/loading/error states
6. Browser console and network health
7. Responsive layout integrity
8. Accessibility basics that are obvious during interaction, such as focus movement, labels, button states, and keyboard traps

## Chat UI checks

When the app is a chatbot or assistant interface, verify these behaviors whenever present:

- Thread list or conversation history renders correctly
- Message list preserves ordering and clear role separation
- Composer accepts input, multiline behavior works, and submit state is clear
- Loading or streaming states appear intentional and do not duplicate messages
- Error handling is visible and recoverable
- Long messages wrap correctly without breaking layout
- Scrolling behavior is stable when new messages appear
- Attachments, tool calls, references, or side panels do not overlap critical controls

## Guardrails

- Never claim browser validation happened if the app did not run.
- Never stop at static inspection if the task explicitly asks to test behavior and the app can be launched.
- Prefer the repository's existing scripts, config, and testing framework.
- Keep changes minimal and targeted when fixing issues discovered during QA.
- Separate facts from inferences. Quote the exact error when available.
- If backend services are unavailable, still test as much frontend-only behavior as possible and state the boundary clearly.

## Output format

Use this structure by default for QA reports.

# Frontend browser QA report

## Status
State whether validation passed, failed, or was blocked.

## Environment
List the app command used, port, relevant test command, and important setup assumptions.

## Flows exercised
List the routes, components, or user journeys that were actually tested.

## Findings
For each finding, include:
- severity
- route or screen
- reproduction steps
- expected behavior
- actual behavior
- likely cause
- evidence such as console error, network failure, or screenshot note

## Fixes applied
List any code or config changes made. If none were made, say so.

## Re-validation
State exactly what was re-tested after changes and the result.

## Remaining risks or blockers
Call out missing services, missing environment variables, incomplete repo setup, flaky behavior, or areas not yet exercised.

## Use bundled reference

When you need a more explicit checklist or a triage pattern, consult `references/browser-qa-playbook.md`.
