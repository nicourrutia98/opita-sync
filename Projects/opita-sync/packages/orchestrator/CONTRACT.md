# Orchestrator Contract

## Purpose
Coordinate intent interpretation, contract construction, admissibility orchestration, capability selection, and execution compilation.

## Canonical flow
intent -> contract -> policy validation -> execution compilation -> durable execution -> output control

## Rules
- no free agent loop
- no direct tool calling from chat
- capability selection only from approved assets
