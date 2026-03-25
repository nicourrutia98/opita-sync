# Runtime Contract

## Purpose
Own durable runs, steps, waits, retries, callbacks, and resume semantics.

## Must support
- pause/resume
- approval waits
- external waits
- retryable vs terminal failure
- immutable refs to contract, plan, policy, classification snapshots

## Rules
- execution_completed != released
