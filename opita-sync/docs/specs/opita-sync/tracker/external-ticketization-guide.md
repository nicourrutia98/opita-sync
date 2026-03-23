# Opita Sync External Ticketization Guide

## Purpose

Provide import-ready backlog exports for external trackers (Jira, Linear, or equivalent) from the release execution boards.

## Export Files

- `docs/specs/opita-sync/tracker/release-1-ticket-export.csv`
- `docs/specs/opita-sync/tracker/release-2-ticket-export.csv`
- `docs/specs/opita-sync/tracker/release-3-ticket-export.csv`
- `docs/specs/opita-sync/tracker/release-4-ticket-export.csv`

## CSV Field Mapping

| CSV Column | Suggested Tracker Field |
| --- | --- |
| `ticket_id` | Issue key or external ID |
| `title` | Title |
| `release` | Milestone or release label |
| `workstream` | Team or component |
| `description` | Description |
| `dependencies` | Linked issues / blockers |
| `exit_criteria` | Acceptance criteria |
| `priority` | Priority |
| `status` | Status |
| `owner` | Assignee |
| `eta` | Target date or sprint |

## Import Notes

- `status` defaults to `Backlog`.
- `owner` defaults to `Unassigned`.
- `eta` defaults to `Unscheduled`.
- Dependencies are comma-separated ticket IDs and should be converted to tracker links after import.
