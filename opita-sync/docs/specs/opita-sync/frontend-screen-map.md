# Frontend Screen Map

## Priority Screens

1. Inicio operativo
2. Supervisor workspace
3. Chat / Orchestrator
4. Casos y Solicitudes
5. Detalle de caso
6. Configuracion tenant

## Navigation Map

### Solicitante

- Inicio
- Chat
- Casos
- Detalle

### Tecnico

- Inicio
- Chat
- Casos
- Detalle

### Supervisor

- Inicio
- Supervisor workspace
- Chat
- Casos
- Detalle

### Admin tenant

- Inicio
- Casos
- Configuracion

## Actor x Screen x Primary Action

| Actor | Screen | Primary Action |
| --- | --- | --- |
| Solicitante | Chat | Iniciar solicitud o seguimiento |
| Tecnico | Casos | Priorizar, abrir y operar caso |
| Tecnico | Detalle | Registrar avance y generar borrador |
| Supervisor | Inicio | Ver bloqueos, aprobaciones y riesgo por prioridad |
| Supervisor | Detalle | Aprobar, bloquear o escalar |
| Admin tenant | Configuracion | Ajustar parametros aprobados |

## Flow x State x Error

| Flow | State | Error To Handle |
| --- | --- | --- |
| Crear o actualizar desde chat | Missing context | Solicitar datos faltantes |
| Consultar cola de casos | Loading | Timeout o dependencia caida |
| Operar caso | Success | Accion auditada incompleta |
| Generar borrador | Approval required | Politica bloquea uso directo |
| Configurar tenant | Guardrail violation | Cambio fuera de libreria aprobada |
