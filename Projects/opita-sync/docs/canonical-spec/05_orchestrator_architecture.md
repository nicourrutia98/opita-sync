# 05. Orchestrator Architecture

## Core principle

The orchestrator is contract-first and policy-compiled.
The LLM may help interpret and propose, but the system retains authority over execution.

## Canonical orchestrator layers

### 1. Intent Interpreter
Inputs:
- user message or event
- user identity
- tenant and environment context
- visible catalog surface

Outputs:
- normalized candidate intent
- ambiguity markers
- candidate asset families

### 2. Contract Builder
Builds the canonical execution contract.
Applies safe defaults and captures explicit constraints.

### 3. Authorization and Policy Evaluator
Evaluates:
- effective authority
- policy
- classification
- environment constraints
- publication state
- connector perimeter
- approval obligations

Outputs:
- admissibility decision
- restrictions
- obligations
- deny reasons

### 4. Capability Selector
Chooses only from:
- approved assets
- published assets
- visible and usable assets in the current scope

### 5. Plan Compiler
Compiles:
- selected actions/workflows
- branching rules
- waits
- approval nodes
- output checkpoints
- failure handling

### 6. Durable Runtime
Executes the plan durably with:
- retries
- waits
- callbacks
- pause/resume
- approvals
- event history

### 7. Human Gate Controller
Handles approval pauses and resumptions.

### 8. Output Controller
Evaluates final release outcomes before disclosure or external effect.

### 9. Audit Recorder
Persists decision path and execution evidence.

## Hard orchestrator rules
- no direct tool execution from raw chat
- no bypass of contract normalization
- no bypass of policy validation
- no execution from unpublished/unapproved capabilities
- no hidden prompt-only governance
- no implicit output release

## Dynamic workflow rule
Dynamic workflows may assemble only from approved actions and within policy-valid scope.
The orchestrator may assemble; it may not invent capabilities.
