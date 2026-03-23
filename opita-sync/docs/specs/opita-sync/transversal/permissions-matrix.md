# Permissions Matrix

Legend:
- `V`: view
- `C`: create
- `U`: update or act
- `A`: approve or govern
- `G`: global governance

| Module | Solicitante | Tecnico | Supervisor | Admin tenant | Operador Opita Code |
| --- | --- | --- | --- | --- | --- |
| 01. Chat / Orchestrator | V,C | V,C,U | V,C,U | V,C,U | V,U,G |
| 02. Casos y Solicitudes | V,C | V,C,U | V,C,U,A | V,V,U | V,U,G |
| 03. Bitacora Operativa | V limited | C,U | V,C,U,A | V limited | V,U,G |
| 04. Borradores y Comunicacion Asistida | - | C,U | C,U,A | V,U,A | V,U,G |
| 05. Catalogo de Capacidades | V limited | V limited | V limited | V,U | V,U,A,G |
| 06. Gobierno de Herramientas | - | - | V limited | V limited | V,U,A,G |
| 07. Parametrizacion del Tenant | - | - | V limited | V,U,A | V,U,A,G |
| 08. Roles, Accesos y Visibilidad | - | - | V limited | V,U limited | V,U,A,G |
| 09. Auditoria y Trazabilidad | V own summary | V scoped | V scoped | V tenant summary | V,U,A,G |
| 10. Reporting de Valor y Adopcion | V own summary | V team summary | V,U | V,U | V,U,A,G |
| 11. Billing y Consumo | - | - | V limited | V tenant summary | V,U,A,G |
| 12. Administracion Opita Code | - | - | - | - | V,U,A,G |
| 13. Contexto, Memoria Operativa y Resolucion | - | - | - | - | G system |
| 14. Compliance, Datos y Retencion | V policy summary | V policy summary | V scoped | V,U scoped | V,U,A,G |
| 15. Navegacion, UX global y experiencia multiplataforma | V | V | V | V | V,G |

## Notes

- This is a planning baseline, not the final authorization matrix.
- Entity-level visibility rules still require further refinement in implementation.
- Split governance is fixed: tenant admins manage approved configuration and certified capability toggles; Opita Code controls publication, certification, rollout, rollback, and policy ceilings.
