# Policy Engine Contract

## Purpose
Evaluate explicit policy over principals, resources, actions, and context.

## Inputs
- effective authority facts
- contract snapshot
- environment
- asset metadata
- connector scope
- classification context

## Outputs
- allow
- allow_with_restrictions
- require_approval
- require_redaction
- deny
- explainability artifact

## Rules
- deny by default
- most restrictive rule wins
- explainability is mandatory
