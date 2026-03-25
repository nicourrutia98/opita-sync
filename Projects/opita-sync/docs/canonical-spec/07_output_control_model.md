# 07. Output Control Model

## Purpose

Output governance is a first-class product path. It is not an afterthought after execution.

## Inputs to release evaluation
- output artifacts
- user effective authority
- classification marks
- policy snapshot
- outbound target/channel
- requested final effect
- approval state
- mixed-authority analysis

## Release outcomes
- release
- release_redacted
- hold_for_approval
- block

## Hard rules
- mixed-authority output blocks by default
- redaction requires explicit policy allowance
- release decisions are auditable
- disclosure and external send/apply are separate checks when necessary
- content in model context is not automatically releasable

## Release decision artifact
Must contain:
- decision
- reasons
- governing policy refs
- classification refs
- redaction strategy ref if applicable
- approval requirement ref if applicable
- scope of released artifact

## Artifact categories
- internal reasoning artifact
- draft artifact
- final user-visible artifact
- outbound payload
- audit-only artifact

Each category may carry distinct release rules.

## Safe default behavior
If the system cannot prove release is allowed, it must block or hold rather than release.
