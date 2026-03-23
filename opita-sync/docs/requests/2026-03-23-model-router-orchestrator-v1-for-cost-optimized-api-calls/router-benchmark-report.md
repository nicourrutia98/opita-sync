# Router Benchmark Report

## Metadata

- Generated at: 2026-03-23T15:39:20.630Z
- Dataset version: benchmark-set.v1
- Policy version: routing-policy.v1
- Execution mode: mock

## Summary Table

| Metric | Baseline | Router |
| --- | --- | --- |
| Requests | 6 | 6 |
| Pass rate (%) | 100 | 100 |
| Cost per successful request (USD) | 0.00081 | 0.000278 |
| P95 latency (ms) | 1 | 0 |
| Fallback rate (%) | 0 | 0 |
| Avg tokens/request | 76 | 71 |

## Delta

- Cost delta (%): -65.68
- Pass-rate delta (pp): 0
- P95 latency delta (%): -100
- Fallback-rate delta (pp): 0
- Bootstrap CI cost delta (%): [-92.89, -35.39]

## Decision

- Cost reduction target (%): 20
- Max quality drop (pp): 2
- Go / No-Go: go

