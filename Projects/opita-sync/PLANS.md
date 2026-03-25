# PLANS.md

## Purpose

Use this file as the planning discipline for future work on Opita Sync.

This repository is not optimized for "write code immediately."
It is optimized for:
- understand the product
- preserve governance semantics
- then design and implement carefully

Before any major implementation, create or update an execution plan that follows this format.

---

## Required planning format

Every substantial plan must contain these sections.

### 1. Objective
What exact capability or subsystem is being designed or changed?

### 2. Why it exists in Opita Sync
Explain the business and governance reason, not only the technical reason.

### 3. Invariants touched
List which non-negotiable platform invariants are affected.

Examples:
- deny by default
- most restrictive rule wins
- output control
- connector governance
- immutable published semantics
- human-owned automation

### 4. Domain entities involved
List the core entities this plan changes or depends on.

Examples:
- tenant
- policy
- classification
- action
- workflow
- contract
- run
- approval
- connector
- system identity

### 5. User-facing behavior
Describe what the user, admin, or approver will experience.
Be concrete.

### 6. System behavior
Describe the backend state transitions and decision boundaries.

### 7. Risks if done incorrectly
Explain how a bad implementation could weaken governance, information control, or action control.

### 8. Proposed boundaries
Explain what belongs inside the subsystem and what must remain outside it.

### 9. Data and state implications
Describe important persisted state, versions, lifecycle, and audit consequences.

### 10. Open questions
List only real unresolved issues.
Do not invent ambiguity where the product docs already gave direction.

---

## Planning rules

### Rule 1
Do not write a plan that starts from framework choice.
Start from product semantics.

### Rule 2
Do not flatten separate concepts just because they feel similar.
Example:
- visibility is not usage
- draft is not apply
- connector availability is not connector authorization
- execution success is not output release

### Rule 3
Always explain how the plan preserves auditability.

### Rule 4
Always explain how the plan preserves policy explainability.

### Rule 5
If a plan weakens governance for convenience, call that out explicitly.

### Rule 6
For orchestration-related plans, keep the contract boundary explicit.

---

## Short plan template

Copy this template for future work:

```md
# <Plan name>

## Objective

## Why it exists in Opita Sync

## Invariants touched

## Domain entities involved

## User-facing behavior

## System behavior

## Risks if done incorrectly

## Proposed boundaries

## Data and state implications

## Open questions
```

---

## Definition of a good plan for this project

A good plan for Opita Sync makes it obvious:
- why the work matters
- where governance lives
- what state transitions happen
- what gets audited
- what gets blocked or escalated
- how the UI and backend stay semantically aligned

If the plan only explains tables, endpoints, queues, or components, it is incomplete.
# Operate Chat-First Governed Workspace Refactor

## Objective
Refactor Operate from a multipanel operational console into a chat-first, contract-first governed execution workspace for web, with shared artifact/event contracts that keep policy, approval, plan, run, and output-control semantics explicit without overwhelming the primary conversation surface.

## Why it exists in Opita Sync
Operate is the product's real home screen and the execution workspace where user intent becomes governed execution. In Opita Sync, user value comes from expressing intent, seeing the effective contract, understanding policy and approval constraints, and tracking execution and output release with auditability. A dashboard-like multipanel layout weakens operator clarity because it makes governance feel like unrelated boxes instead of one governed flow: intent -> contract -> policy validation -> execution compilation -> durable execution -> output control.

Operate must move to a chat-first workspace because this product is a governed intent compiler, not a free agent loop and not a debug console. The user should reason through one conversational thread with inline governed artifacts, while governance stays visible through compact summaries and progressive disclosure.

## Invariants touched
- deny by default
- most restrictive rule wins
- user controls intent, not arbitrary capability
- connectors are centrally governed
- output control is a first-class governance surface
- mixed-authority content is blocked by default
- governance outranks convenience
- Catalog does not bypass Operate
- execution success is not output release
- draft generation is not apply/send authority
- approvals are state transitions, not notifications
- the orchestrator is contract-first and policy-compiled, not an open agent loop

## Domain entities involved
- tenant
- environment
- user
- relationship/delegation context
- policy
- classification
- action
- workflow
- execution contract
- admissibility decision
- execution plan
- run
- approval case
- connector
- credential scope
- output artifact / release decision
- governed UI artifact
- event envelope / stream snapshot

## User-facing behavior
- Operate becomes a chat-first workspace where the conversation thread is the dominant surface.
- A compact header shows only workspace identity, tenant/environment, and compressed governance state.
- A compact contract summary strip remains always visible and answers: what the system thinks the user asked, what scope/connectors/data are allowed, whether delegation applies, which approval mode is in force, whether the final effect is draft-only or apply/send-capable, and what the release/run state is.
- The main thread shows user messages plus orchestrator/system messages rendered as governed artifacts, not raw HTML or ad hoc panels.
- Secondary detail moves to a collapsible side panel with tabs: Contract, Plan, Risk, Run, History, Inspector.
- Approvals, policy notices, redaction notices, plan summaries, and run transitions appear inline in the thread and can also be inspected in the side panel.
- Recent runs remain available but compact and secondary.
- Mobile keeps the same semantics, but detail moves into bottom-sheet-style progressive disclosure instead of persistent side panels.

Information always visible in Operate:
- interpreted objective
- effective scope
- allowed data domains
- allowed connectors
- delegation applied or not
- approval mode
- allowed final action (draft-only vs apply/send capable)
- release state
- run state
- current next action

Information moved to progressive disclosure:
- full contract details
- full plan graph or step inventory
- full risk and policy reasoning
- run timeline and event history
- technical inspector / raw identifiers
- audit evidence and explanation detail

Operator clarity is preserved by keeping the execution contract and governance outcome visible in compact summaries while moving detail into tabs, not by hiding policy or approval state.

## System behavior
- The backend projects a dedicated Operate workspace view model instead of reusing generic dashboard summaries.
- The orchestrator/UI boundary is formalized through a shared governed artifact DSL.
- The API emits typed, CloudEvents-like envelopes over SSE for chat/run/workspace updates.
- Conversation state contains inline artifacts for interpreted intent, contract candidate/effective contract, policy notices, plan summary, approval gates, execution timeline, release/redaction/block outcomes, and next actions.
- The model may interpret and propose from approved capabilities only; the platform still owns contract normalization, admissibility, plan compilation, durable execution, and output control.
- Approval modes remain explicit: auto, pre-execution, pre-application, double approval.
- Output control outcomes remain explicit: release, release redacted, hold for approval, block, reroute to safer alternative.

Artifact DSL fit:
- rich_text: governed narrative from orchestrator/system
- kv_summary: compact contract/run/policy summaries
- status_badges: compact state strip for approval/policy/release/run
- contract_diff: candidate vs effective changes when policy narrows scope
- plan_summary: compiled plan summary without exposing raw step editing by default
- timeline: governed run transition summary
- approval_card: inline governed approval gate
- data_table: constrained tabular evidence when needed
- policy_notice: restriction, denial, narrowing, or obligation explanation
- redaction_notice: explicit output-control disclosure path
- document_ref: references to durable artifacts or records
- cta_bar: allowed next actions only

SSE, contracts, and envelopes fit:
- SSE remains the native transport for run stream, approvals, resumptions, artifacts, and output-control outcomes.
- Shared event envelopes keep event names and payload semantics explicit.
- Shared contracts/artifacts let web and future mobile render the same governed meaning deterministically.

Web vs mobile fit:
- Web uses a compact header + contract strip + dominant thread + collapsible right-side detail tabs.
- Mobile keeps the same semantics with chat dominant, composer fixed, contract strip compact, and detail tabs/sheets under disclosure.
- Mobile does not get a separate product model; only the interaction container changes.

## Risks if done incorrectly
- Chat-first could drift into a generic chatbot that hides governance behind prose.
- A loose artifact model could become backend-controlled HTML and break deterministic rendering, safety, and portability.
- Treating approvals as generic notifications would flatten the difference between pre-execution and pre-application gates.
- Treating execution completion as release would leak output-control semantics.
- Leaving raw step editing in the primary path would weaken the contract-first model.
- Making the right-hand detail primary or always-open would recreate the current multipanel clutter.
- Failing to share artifact and event contracts between API and UI would reintroduce semantic drift.

## Proposed boundaries
Inside this refactor:
- Operate-specific workspace view model
- governed UI artifact DSL
- CloudEvents-like event envelope types for Operate streams
- shared API client for Operate workspace commands/queries/streams
- web Operate chat-first layout and artifact rendering
- mobile-ready semantic shapes and optional lite stubs for future reuse

Outside this refactor:
- governance/settings IA changes
- catalog lifecycle semantics
- connector governance semantics
- authority model redesign
- runtime durable-engine replacement
- policy engine redesign
- raw step-builder UX

## Data and state implications
- Add shared persisted/payload shapes for governed UI artifacts and workspace event envelopes.
- Extend Operate view models to include contract summary, thread entries, side-panel detail, and allowed next actions.
- Chat records and run records remain source-of-truth state, but projections derive governed artifacts for the UI.
- SSE payloads gain deterministic event envelopes and artifact payloads.
- Auditability improves because the same artifact/event shapes can be persisted or replayed later without reconstructing UI semantics from ad hoc strings.
- No change to the core execution flow ordering; only projection and surface semantics change.

## Open questions
- Should recent runs remain in the Operate side panel or move fully into History for very narrow laptop widths?
- For mobile, should the secondary detail use tabs-in-sheet or stacked accordions first when Expo surfaces are implemented?
- Which subset of risk evidence should be shown in the default Risk tab before drilling into Inspector?

# Operate Mobile Chat-First Governed Workspace Alignment

## Objective
Rework Operate mobile so it preserves the same governed execution semantics and nearly the same functional surface as the web chat-first workspace, while presenting them through a mobile-native single-column layout with compact context, dominant thread, persistent composer, and progressive disclosure for secondary detail.

## Why it exists in Opita Sync
Operate mobile cannot become a simplified consumer chat or a compressed desktop console, because the product's value still depends on explicit contract, policy, approval, risk, durable execution, and output-control semantics. Mobile operators and approvers need the same model clarity as web, but expressed through touch-first containers that keep the conversation central and secondary detail recoverable on demand.

This work exists to preserve the same product truth in mobile: the model interprets and proposes, while the platform decides, compiles, executes, and releases under contract and policy. The UI must make that visible without requiring sidebars, desktop columns, or debug-console density.

## Invariants touched
- Operate remains contract-first, not raw-step-first
- governance remains explicit rather than implicit in prose
- approval is a state transition, not a notification
- output control remains distinct from execution success
- most restrictive rule still wins
- deny by default remains visible in operator flow
- connectors are governed centrally, not invoked arbitrarily
- mixed-authority remains blocked by default
- mobile does not weaken auditability for convenience
- Catalog, Inbox, and Activity continue to hand off into Operate with preserved run/contract identity

## Domain entities involved
- tenant
- environment
- user
- delegation context
- execution contract
- admissibility decision
- execution plan
- run
- approval case
- policy decision
- classification evaluation
- output artifact
- release decision
- governed UI artifact
- run/chat/workspace event stream

## User-facing behavior
- Mobile Operate becomes a true single-column chat-first workspace.
- A compact top bar identifies Operate and current workspace state without large hero content.
- A compact contract summary strip remains visible or immediately recoverable and answers: what the system thinks the user asked, what data/connectors are allowed, whether delegation applies, which approval mode applies, what final action is allowed, and what state the run/release are in.
- The main thread remains the dominant surface and renders the same governed artifacts as web.
- The composer stays anchored near the bottom with touch-friendly controls and clear pending/approval/running states.
- Secondary detail moves into mobile-native disclosure, using a bottom sheet or equivalent pattern for Contract, Plan, Risk, Run, History, and Inspector.
- Approval and output-control states stay visible inline and remain actionable for touch.

What stays always visible in mobile:
- interpreted objective
- compact contract/risk/release summary
- allowed data/connectors summary
- approval mode
- allowed final action
- current run/release status
- current next action through inline artifacts and composer controls
- conversation thread

What moves to progressive disclosure:
- full contract detail
- detailed plan preview
- full risk reasoning and evidence
- run metadata and timeline history
- technical inspector references
- extended audit references

Approvals and output control in touch:
- approvals render as governed inline cards and can also be opened in detail sheets
- approval actions remain explicit: approve, reject, request redacted, reduce scope, view details
- output-control outcomes remain explicit: release, release redacted, hold for approval, block, reroute
- blocked or redacted results show policy-safe explanation and allowed next moves

Operator clarity is preserved by keeping the effective contract and governance state compact but always visible, while using touch-native disclosure for deeper inspection rather than hiding policy behind a simplified chat shell.

## System behavior
- Mobile consumes the same Operate workspace projection, governed artifact DSL, and SSE semantics as web.
- No separate mobile execution semantics are introduced; only the container and interaction pattern differ.
- Contract, Plan, Risk, Run, History, and Inspector are resolved without a side panel by opening bottom-sheet-style disclosure surfaces keyed to the same workspace side-panel data.
- The thread continues to receive governed artifacts and stream updates from the same SSE/query invalidation path.
- The composer and inline artifacts remain the primary execution surface.
- Inbox and Activity can continue to deep-link into the same run identity because mobile still uses the same run/workspace query model.

How mobile preserves the same semantics as web:
- same contract summary fields
- same thread entry model
- same artifact DSL
- same run and approval commands
- same release and output-control states
- same side-panel data, only rendered in disclosure instead of split-pane

## Risks if done incorrectly
- mobile could collapse into a consumer chat that hides governance
- a compressed desktop shell could keep sidebars partially visible and make the thread unreadable
- hiding approval/release/output control for brevity would break operator trust
- replacing explicit contract context with generic prompt suggestions would weaken contract-first behavior
- poor disclosure patterns could make risk and run detail effectively inaccessible on touch
- overflow or broken wrapping could damage operator comprehension at the exact moment governance needs to be clearest

## Proposed boundaries
Inside this alignment:
- mobile app-shell behavior for small screens
- Operate mobile-specific layout and disclosure patterns
- touch-friendly presentation of existing side-panel data
- sticky/semi-sticky compact contract summary behavior
- touch-friendly approval and release controls

Outside this alignment:
- new orchestration semantics
- new governance states
- mobile-only contract or event schemas
- Settings/Governance parity redesign
- changes to Catalog/Inbox/Activity handoff semantics

## Data and state implications
- Prefer reusing existing shared contracts, events, ui-artifacts, and api-client shapes.
- No new product semantics are required if the current Operate workspace projection already contains enough information for compact and disclosed mobile presentation.
- If needed, only presentation metadata should be added; contract and governance meaning must remain shared.
- SSE continues to drive run and artifact updates; mobile layout must tolerate streaming updates without clipping or overflow.

## Open questions
- Should the contract summary strip on mobile remain sticky at all times or collapse into a recoverable header after the first thread screen?
- Should the mobile disclosure use one bottom sheet with tab switching or route-level subviews for deep details once the Expo surface exists?
- How much of History should appear in the mobile disclosure before the user drills into Activity proper?

# Operate Mobile Full-Viewport Chat Workspace Refinement

## Objective
Refine Operate mobile from a correct but still panel-like mobile adaptation into a true full-viewport governed chat workspace where the conversation thread is the primary surface, the composer remains fixed at the bottom, and contract/governance context stays compact, explicit, and recoverable without competing with the thread.

## Why it exists in Opita Sync
Operate mobile already preserves the core semantics of the web workspace, but the current presentation can still feel like a panel placed inside the app rather than the execution workspace itself. In Opita Sync that matters because the operator needs to understand one coherent governed flow, not a stack of nested cards. The mobile experience should feel like a native execution workspace where intent, contract, policy, approval, execution, and output control remain legible while the conversation owns the screen.

This refinement exists to preserve the same web/mobile semantics while making mobile layout reflect the product's real mental model: chat-first, contract-first, policy-compiled, approval-aware, and output-controlled.

## Invariants touched
- web and mobile must preserve the same product semantics
- contract-first remains primary over raw-step editing
- policy, approval, release, and risk remain explicit
- execution completion remains distinct from output release
- mobile cannot hide governance behind a simplified chat shell
- the thread is the primary execution surface, not a debug panel
- output control remains visible and auditable
- approvals remain state transitions with explicit actions
- mobile interaction changes containers, not authority boundaries

## Domain entities involved
- tenant
- environment
- user
- execution contract
- policy decision
- classification evaluation
- admissibility decision
- execution plan
- run
- approval case
- output artifact
- release decision
- governed UI artifact
- workspace stream / run stream / chat stream

## User-facing behavior
- Operate mobile uses a real full-viewport workspace layout.
- The top app bar remains fixed and compact.
- The contract/governance strip remains fixed or semisticky directly under the top bar.
- The conversation thread becomes the single primary scroller for the screen.
- The composer remains fixed at the bottom with safe-area-aware spacing.
- Secondary details open through bottom-sheet disclosure and do not compete with the main thread.
- New stream events append naturally to the thread without disrupting users reading older history.

What stays fixed:
- top app bar
- composer

What stays semisticky:
- compact contract/governance summary strip

What moves to progressive disclosure:
- Contract detail
- Plan
- Risk
- Run metadata
- History
- Inspector

How operator clarity is preserved:
- the thread remains dominant, so intent and governed outcomes read as one narrative
- the effective contract and governance state remain visible near the top, not hidden behind secondary navigation
- approvals and output-control outcomes remain inline and actionable
- deeper detail remains one touch away through disclosure, not permanently on screen

## System behavior
- Mobile continues to consume the same Operate workspace projection and governed artifact DSL as web.
- The thread becomes the only main scrolling region on mobile.
- The composer remains mounted outside the thread scroller so keyboard and state transitions do not shift the whole page.
- Scroll anchoring preserves chat continuity:
  - if the user is near the bottom, new events keep the thread pinned to the latest state
  - if the user is reading older entries, new events do not aggressively jump the scroll
- Mobile disclosure continues to render the same `Contract / Plan / Risk / Run / History / Inspector` data from the existing workspace projection.
- Minimal motion is added only to reinforce hierarchy:
  - mobile menu enter/exit
  - bottom sheet open/close
  - disclosure transitions
- motion should respect reduced-motion preferences and remain functional, fast, and non-ornamental

Why the thread is the only primary scroller:
- it preserves the messaging/workspace mental model
- it keeps header, context strip, and composer stable
- it avoids nested page scroll behavior that breaks operator focus
- it makes streamed run/artifact updates feel like part of one governed execution surface

## Risks if done incorrectly
- the screen could still feel like a card-based panel floating inside the app
- multiple scrolling regions could make the workspace feel broken and unauditable
- sticky/fixed regions could consume too much height and harm readability
- aggressive auto-scroll could interrupt operators reading older evidence
- softening approval/output-control visibility for visual cleanliness would weaken governance clarity
- excessive motion would undermine the sober enterprise feel

## Proposed boundaries
Inside this refinement:
- mobile full-viewport layout behavior
- fixed/semisticky chrome behavior
- internal thread scrolling and scroll anchoring
- touch disclosure transitions
- subtle mobile motion for menu and sheets

Outside this refinement:
- new orchestration semantics
- new artifact types
- changes to approval or release meaning
- native mobile app implementation beyond the current web surface
- Inbox/Catalog/Activity semantic changes

## Data and state implications
- No new product data model is required if the current workspace projection remains sufficient.
- The refinement mostly changes containment and interaction behavior.
- Thread anchoring may require local UI state for scroll position and bottom proximity.
- Reduced-motion-aware animation state may be added locally in UI without changing domain semantics.
- SSE/query invalidation semantics remain the same; the layout must simply consume them in a less page-like way.

## Open questions
- Should the semisticky contract strip collapse further once a run is active and the user scrolls deeper into the thread?
- Should mobile disclosure eventually expose approval actions in a dedicated sticky action bar inside the sheet?
- If the future Expo client uses native keyboard avoidance, which parts of the current web behavior should be mirrored vs. left web-specific?
