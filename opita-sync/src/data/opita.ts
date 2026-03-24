export type Role = "solicitante" | "tecnico" | "supervisor" | "admin";
export type ViewKey = "inicio" | "chat" | "casos" | "detalle" | "configuracion";
export type ThemeMode = "light" | "dark";
export type CaseStatus = "Nuevo" | "En curso" | "Bloqueado" | "Resuelto";

export interface CaseItem {
  id: string;
  title: string;
  site: string;
  priority: "Alta" | "Media" | "Baja";
  status: CaseStatus;
  owner: string;
  updatedAt: string;
  summary: string;
}

export const roles: Array<{ id: Role; label: string; description: string }> = [
  { id: "solicitante", label: "Solicitante", description: "Reporta, consulta y hace seguimiento desde movil." },
  { id: "tecnico", label: "Tecnico", description: "Opera casos, bitacora y comunicacion asistida." },
  { id: "supervisor", label: "Supervisor", description: "Gestiona bloqueos, aprobaciones y valor operativo." },
  { id: "admin", label: "Administrador", description: "Organiza ajustes, herramientas y seguimiento general." }
];

export const cases: CaseItem[] = [
  {
    id: "CAS-2048",
    title: "Falla intermitente en compresor principal",
    site: "Planta Norte",
    priority: "Alta",
    status: "En curso",
    owner: "Laura Rojas",
    updatedAt: "Hace 12 min",
    summary: "Se detecto variacion de presion. Tecnico en sitio con evidencia fotografica."
  },
  {
    id: "CAS-2041",
    title: "Solicitud de inspeccion preventiva",
    site: "Bodega Central",
    priority: "Media",
    status: "Nuevo",
    owner: "Sin asignar",
    updatedAt: "Hace 34 min",
    summary: "Solicitud creada desde chat con checklist pendiente."
  },
  {
    id: "CAS-2035",
    title: "Revision de valvula de seguridad",
    site: "Planta Sur",
    priority: "Alta",
    status: "Bloqueado",
    owner: "Diego Gil",
    updatedAt: "Hace 1 h",
    summary: "Bloqueado por aprobacion de repuesto y validacion de supervisor."
  }
];

export const timeline = [
  { time: "09:12", type: "Avance", detail: "Bitacora creada con evidencia fotografica inicial." },
  { time: "09:26", type: "Chat", detail: "El sistema pidio confirmar riesgo operativo antes de ejecutar el cambio." },
  { time: "09:31", type: "Herramienta", detail: "Consulta de presion ejecutada en modo sugerir." },
  { time: "09:40", type: "Borrador", detail: "Se genero borrador para informar al supervisor." }
];

export const inbox = [
  "3 casos requieren aclaracion de contexto antes de ejecutar accion.",
  "1 borrador regulatorio esta pendiente de aprobacion de supervisor.",
  "2 casos bloqueados por repuesto muestran riesgo de SLA."
];

export const metrics = [
  { label: "Casos activos", value: "28", helper: "+6 hoy" },
  { label: "Tiempo medio a primera accion", value: "14 min", helper: "-22%" },
  { label: "Acciones positivas", value: "41", helper: "Ultimos 7 dias" },
  { label: "Bloqueos evitados", value: "9", helper: "Por policy mode" }
];

export const supervisorMetrics = [
  { label: "Aprobaciones pendientes", value: "6", helper: "3 con riesgo alto" },
  { label: "Casos bloqueados", value: "4", helper: "2 fuera de SLA" },
  { label: "Escalamientos hoy", value: "7", helper: "4 vienen de chat" },
  { label: "Trail listo para auditoria", value: "98%", helper: "Ultimo corte 09:45" }
];

export const supervisorQueue = [
  {
    title: "Aprobar repuesto de valvula de seguridad",
    detail: "CAS-2035 espera confirmacion para destrabar la orden antes del mediodia.",
    tone: "warning" as const
  },
  {
    title: "Revisar borrador interno con riesgo operacional",
    detail: "Hay una comunicacion marcada como sensible y no puede salir sin visto bueno.",
    tone: "danger" as const
  },
  {
    title: "Confirmar escalamiento por variacion de presion",
    detail: "CAS-2048 ya tiene contexto, evidencia y propuesta de accion preparada.",
    tone: "brand" as const
  }
];

export const supervisorSignals = [
  "2 casos comparten causa probable y ameritan vista consolidada por sitio.",
  "1 herramienta de escritura sigue en confirm_then_execute por riesgo alto.",
  "La cola movil muestra backlog sano, pero el detalle web sigue siendo la superficie de auditoria."
];

export const actorViews: Record<Role, ViewKey[]> = {
  solicitante: ["inicio", "chat", "casos", "detalle"],
  tecnico: ["inicio", "chat", "casos", "detalle"],
  supervisor: ["inicio", "chat", "casos", "detalle"],
  admin: ["inicio", "casos", "configuracion"]
};

export const viewLabels: Record<ViewKey, string> = {
  inicio: "Inicio",
  chat: "Chat",
  casos: "Casos",
  detalle: "Detalle",
  configuracion: "Configuracion"
};
