# Policy Mode Matrix

| Capability Family | Example Capability | Default Policy Mode | Escalation Rules | Notes |
| --- | --- | --- | --- | --- |
| Read-only consultation | Consultar estado de caso | suggest | Auto-execution allowed only if no sensitive data expansion occurs | Low-risk baseline |
| Structured follow-up | Resumir caso y siguiente paso | suggest | Confirmation if summary includes restricted evidence | No external side effects |
| Case creation | Crear solicitud desde chat | confirm_then_execute | Require required fields and tenant scope | Creates operational entity |
| Case transition | Cambiar estado de caso | confirm_then_execute | Supervisor approval for restricted transitions | Sensitive operational effect |
| Assignment and escalation | Reasignar o escalar caso | confirm_then_execute | May require supervisor or policy approval | Role-sensitive workflow |
| Log and evidence update | Registrar avance o evidencia | confirm_then_execute | Auto only for low-risk note types in future | Mutates operational record |
| Draft generation | Generar borrador contextual | suggest | Confirmation if approval workflow is required | No send side effect |
| Tenant configuration | Cambiar parametro permitido | confirm_then_execute | Admin tenant only inside closed option library | Governance-sensitive |
| Capability enablement | Activar o desactivar capacidad | confirm_then_execute | Opita Code approval when release-gated | Cross-module impact |
| Tool invocation with write effects | Ejecutar herramienta de mutacion | confirm_then_execute | Never auto by default for sensitive tools | Requires tool certification |
| Tool invocation read-only | Ejecutar herramienta de consulta | suggest | Auto only after certification and bounded scope | Environment-dependent |
| Global governance | Certificar herramienta o rollback | confirm_then_execute | Opita Code only | High-risk internal action |
