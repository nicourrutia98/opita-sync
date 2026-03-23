# Audit Events Matrix

| Event ID | Trigger | Minimum Fields | Notes |
| --- | --- | --- | --- |
| AUD-01 | Chat request received | request_id, tenant_id, actor_id, role, conversation_id | Captures conversational entry point |
| AUD-02 | Capability resolved | request_id, capability_id, confidence_band, context_sources | Must explain decision basis |
| AUD-03 | Missing context requested | request_id, missing_fields, blocking_reason | Distinguishes clarification from failure |
| AUD-04 | Policy mode determined | request_id, capability_id, tool_id, policy_mode | Supports suggest/confirm/execute explainability |
| AUD-05 | Execution blocked | request_id, actor_id, reason_code, dependency_block | Required for permissions and governance denials |
| AUD-06 | Tool execution attempted | request_id, tool_id, environment, actor_id | Logged even if denied |
| AUD-07 | Tool execution completed | request_id, tool_id, result_status, before_after_ref | Sensitive writes should reference before/after |
| AUD-08 | Case created | case_id, tenant_id, actor_id, source_surface | Supports chat or form provenance |
| AUD-09 | Case status changed | case_id, from_status, to_status, actor_id | Include escalation or block reason when relevant |
| AUD-10 | Bitacora entry created | case_id, entry_type, actor_id, visibility_scope | Distinguishes note from evidence event |
| AUD-11 | Evidence attached | case_id, evidence_type, actor_id, visibility_scope | Avoid storing raw sensitive payload in audit body |
| AUD-12 | Draft generated | case_id, template_id, actor_id, consumption_ref | Draft generation is not send action |
| AUD-13 | Tenant configuration changed | tenant_id, config_area, actor_id, before_after_ref | Critical admin event |
| AUD-14 | Permission model changed | tenant_id, subject_id, actor_id, before_after_ref | Must support supportability and compliance |
| AUD-15 | Capability enabled or disabled | tenant_id, capability_id, actor_id, new_state | Cross-links catalog governance |
| AUD-16 | Tool certified or deprecated | tool_id, actor_id, old_state, new_state | Internal governance event |
| AUD-17 | Billing attribution recorded | tenant_id, capability_id, action_id, inclusion_class | Separates included versus additional |
| AUD-18 | Data reuse consent updated | tenant_id, consent_state, actor_id, effective_date | Required for compliance traceability |
| AUD-19 | Retention or deletion action applied | tenant_id, data_class, actor_id, rule_ref | Compliance-grade event |
| AUD-20 | Rollback executed | release_id, actor_id, reason_code, impacted_modules | Opita Code governance event |
