# Local storage and token strategy

## Design

`spec-hub` reads and writes a shared `context-core` layer so the repo does not need to resend full conversation history on every run.

## Layers

### Stable prefix

- skill rules
- canonical spec template
- severity taxonomy
- workspace map

### Recoverable context

- normalized requirements
- decision cards
- prior specs
- approved diffs
- repo grounding evidence

### Session state

- current objective
- active file
- next steps
- open questions

## Policy

- retrieve only what the current task needs
- prefer filesystem full-text over vectors in v1
- every artifact has a stable id and timestamp
