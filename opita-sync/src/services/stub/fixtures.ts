import type { AccessBootstrap, SessionState } from "../../domain/opita";
import type {
  BillingExportDto,
  DataReuseConsentDto,
  DraftResponseDto,
  GlobalGovernanceActionResultDto,
  GlobalGovernanceStateDto,
  NavigationManifestDto,
  CapabilityDto,
  CaseDetailDto,
  CaseSummaryDto,
  ConversationDto,
  DashboardDto,
  OperationalLogEntryDto,
  SessionDto,
  TenantConfigDto,
  ToolGovernanceDto,
  UsageAttributionDto,
  ValueReportDto,
  RetentionPolicyDto
} from "../api/types";

export const dashboardFixture: DashboardDto = {
  metrics: [
    { label: "Casos activos", value: "28", helper: "+6 hoy" },
    { label: "Tiempo medio a primera accion", value: "14 min", helper: "-22%" },
    { label: "Acciones positivas", value: "41", helper: "Ultimos 7 dias" },
    { label: "Bloqueos evitados", value: "9", helper: "Por policy mode" }
  ],
  inbox: [
    "3 casos requieren aclaracion de contexto antes de ejecutar accion.",
    "1 borrador regulatorio esta pendiente de aprobacion de supervisor.",
    "2 casos bloqueados por repuesto muestran riesgo de SLA."
  ],
  supervisorMetrics: [
    { label: "Aprobaciones pendientes", value: "6", helper: "3 con riesgo alto" },
    { label: "Casos bloqueados", value: "4", helper: "2 fuera de SLA" },
    { label: "Escalamientos hoy", value: "7", helper: "4 vienen de chat" },
    { label: "Trail listo para auditoria", value: "98%", helper: "Ultimo corte 09:45" }
  ],
  supervisorQueue: [
    {
      title: "Aprobar repuesto de valvula de seguridad",
      detail: "CAS-2035 espera confirmacion para destrabar la orden antes del mediodia.",
      tone: "warning"
    },
    {
      title: "Revisar borrador interno con riesgo operacional",
      detail: "Hay una comunicacion marcada como sensible y no puede salir sin visto bueno.",
      tone: "danger"
    },
    {
      title: "Confirmar escalamiento por variacion de presion",
      detail: "CAS-2048 ya tiene contexto, evidencia y propuesta de accion preparada.",
      tone: "brand"
    }
  ],
  supervisorSignals: [
    "2 casos comparten causa probable y ameritan vista consolidada por sitio.",
    "1 herramienta de escritura sigue en confirm_then_execute por riesgo alto.",
    "La cola movil muestra backlog sano, pero el detalle web sigue siendo la superficie de auditoria."
  ]
};

export const caseSummariesFixture: CaseSummaryDto[] = [
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

export const caseDetailsFixture: Record<string, CaseDetailDto> = {
  "CAS-2048": {
    ...caseSummariesFixture[0],
    timeline: [
      { time: "09:12", type: "Avance", detail: "Bitacora creada con evidencia fotografica inicial." },
      { time: "09:26", type: "Chat", detail: "El sistema pidio confirmar riesgo operativo antes de ejecutar el cambio." },
      { time: "09:31", type: "Herramienta", detail: "Consulta de presion ejecutada en modo sugerir." },
      { time: "09:40", type: "Borrador", detail: "Se genero borrador para informar al supervisor." }
    ],
    suggestedAction: "registrar avance + generar borrador interno"
  },
  "CAS-2041": {
    ...caseSummariesFixture[1],
    timeline: [
      { time: "08:55", type: "Solicitud", detail: "Caso creado desde chat con checklist operativo pendiente." },
      { time: "09:05", type: "Clasificacion", detail: "Se asigno prioridad media y sitio Bodega Central." }
    ],
    suggestedAction: "asignar tecnico y completar checklist"
  },
  "CAS-2035": {
    ...caseSummariesFixture[2],
    timeline: [
      { time: "08:40", type: "Bloqueo", detail: "Repuesto pendiente de aprobacion de supervisor." },
      { time: "09:10", type: "Chat", detail: "Se genero alerta interna por riesgo de SLA." }
    ],
    suggestedAction: "aprobar repuesto y destrabar orden"
  }
};

export const conversationFixture: ConversationDto = {
  title: "Intencion operativa con contexto",
  promptDraft: "Resume la condicion del compresor, registra avance y redacta mensaje interno al supervisor.",
  messages: [
    {
      id: "m1",
      tone: "user",
      body: "Necesito actualizar el caso del compresor y notificar al supervisor con el riesgo operativo."
    },
    {
      id: "m2",
      tone: "assistant",
      body: "Identifique la capacidad actualizar caso y generar borrador. Falta confirmar si el mensaje es regulatorio o solo operativo."
    },
    {
      id: "m3",
      tone: "user",
      body: "Solo operativo. Quiero enviar resumen interno."
    },
    {
      id: "m4",
      tone: "system",
      body: "Accion preparada en modo confirmar y ejecutar. Se actualizara el estado y se generara un borrador interno."
    }
  ]
};

export const tenantConfigFixture: TenantConfigDto = {
  activeCapabilities: "Actualizar caso, generar borrador, consulta de estado, escalamiento y resumen de contexto.",
  limits: "El tenant no puede certificar herramientas ni ampliar policy ceilings desde esta vista.",
  risks: [
    "Los datos siguen mockeados. La siguiente fase debe introducir adapters de servicio sin reescribir componentes.",
    "Storybook es la fuente de verdad de estados y componentes. Las vistas criticas deben pasar primero por ahi.",
    "La app prioriza movil para operacion; los tableros administrativos siguen optimizados para web."
  ],
  parameters: [
    { key: "case.default_priority", label: "Prioridad por defecto", value: "Media", editable: true },
    { key: "case.visible_statuses", label: "Estados visibles", value: "Nuevo, En curso, Bloqueado, Resuelto", editable: false },
    { key: "draft.tone", label: "Tono de borradores", value: "Operativo formal", editable: true }
  ]
};

export const operationalLogEntriesFixture: Record<string, OperationalLogEntryDto[]> = {
  "CAS-2048": [
    {
      id: "LOG-2048-01",
      caseId: "CAS-2048",
      author: "Laura Rojas",
      type: "Avance",
      detail: "Lectura de presion estabilizada tras ajuste de valvula de alivio.",
      createdAt: "09:42",
      visibility: "internal",
      before: "Presion en 78 psi",
      after: "Presion en 64 psi",
      evidenceLabel: "Foto tablero compresor",
      auditId: "AUD-R2-1101"
    },
    {
      id: "LOG-2048-02",
      caseId: "CAS-2048",
      author: "Diego Gil",
      type: "Aprobacion",
      detail: "Supervisor autoriza continuar en modo confirm_then_execute.",
      createdAt: "09:47",
      visibility: "supervisor_only",
      auditId: "AUD-R2-1102"
    }
  ],
  "CAS-2035": [
    {
      id: "LOG-2035-01",
      caseId: "CAS-2035",
      author: "Diego Gil",
      type: "Bloqueo",
      detail: "Pendiente liberacion de repuesto certificado por compras.",
      createdAt: "09:10",
      visibility: "internal",
      auditId: "AUD-R2-1201"
    }
  ]
};

export const capabilityFixture: CapabilityDto[] = [
  {
    id: "cap-update-case",
    name: "Actualizar caso",
    description: "Registra cambios operativos y transiciones autorizadas.",
    enabled: true,
    policyMode: "confirm_then_execute",
    requiresApproval: false
  },
  {
    id: "cap-generate-draft",
    name: "Generar borrador",
    description: "Crea borradores contextuales con templates del tenant.",
    enabled: true,
    policyMode: "suggest",
    requiresApproval: true
  },
  {
    id: "cap-auto-close",
    name: "Cierre automatico de caso",
    description: "Cierra casos con evidencia completa y checklist validado.",
    enabled: false,
    policyMode: "auto_execute",
    requiresApproval: true
  }
];

export const toolGovernanceFixture: ToolGovernanceDto[] = [
  {
    id: "tool-pressure-reader",
    name: "Lectura de sensores de presion",
    capabilityId: "cap-update-case",
    riskLevel: "low",
    certification: "certified",
    environment: "production",
    maxPolicyMode: "auto_execute",
    tenantOverrideAllowed: false
  },
  {
    id: "tool-work-order-write",
    name: "Actualizacion de orden de trabajo",
    capabilityId: "cap-update-case",
    riskLevel: "high",
    certification: "certified",
    environment: "production",
    maxPolicyMode: "confirm_then_execute",
    tenantOverrideAllowed: false
  },
  {
    id: "tool-outbound-message",
    name: "Envio de comunicacion externa",
    capabilityId: "cap-generate-draft",
    riskLevel: "critical",
    certification: "draft",
    environment: "staging",
    maxPolicyMode: "suggest",
    tenantOverrideAllowed: false,
    blockedReason: "Herramienta sin certificacion para produccion en este tenant."
  }
];

export const draftFixture: DraftResponseDto = {
  id: "DRF-2048-01",
  caseId: "CAS-2048",
  channel: "interno",
  tone: "Operativo formal",
  content:
    "Equipo supervisor: el caso CAS-2048 presenta estabilizacion parcial tras ajuste de valvula. Se recomienda mantener confirm_then_execute para siguientes mutaciones hasta validar lectura continua por 30 minutos.",
  requiresApproval: true,
  status: "pending_approval",
  auditId: "AUD-R3-3001"
};

export const valueReportFixture: ValueReportDto = {
  periodLabel: "Ultimos 7 dias",
  metrics: [
    {
      id: "value-positive-actions",
      label: "Acciones positivas",
      value: "126",
      trend: "+18%",
      positiveImpact: "Resoluciones con validacion de contexto sin retrabajo."
    },
    {
      id: "value-friction-reduction",
      label: "Reduccion de friccion",
      value: "31%",
      trend: "+6 pts",
      positiveImpact: "Menos aclaraciones manuales por solicitud incompleta."
    },
    {
      id: "value-sla-protection",
      label: "SLA protegido",
      value: "92%",
      trend: "+4%",
      positiveImpact: "Bloqueos de riesgo alto escalados antes de vencer ventana."
    }
  ]
};

export const usageAttributionFixture: UsageAttributionDto = {
  tenantId: "tenant-acme",
  periodLabel: "Marzo 2026",
  successfulActions: 412,
  totalEstimatedTokens: 824000
};

export const billingExportFixture: BillingExportDto = {
  exportId: "EXP-R3-0007",
  generatedAt: "2026-03-23T15:40:00.000Z",
  rows: 128
};

export const globalGovernanceStateFixture: GlobalGovernanceStateDto = {
  releaseChannel: "production",
  capabilitiesCertified: 14,
  toolsCertified: 11,
  lastDeploymentAt: "2026-03-22T23:15:00.000Z",
  rollbackReady: true
};

export const governanceActionFixture: GlobalGovernanceActionResultDto = {
  action: "deploy_release",
  status: "success",
  auditId: "AUD-R4-4001",
  detail: "Accion global ejecutada en entorno controlado."
};

export const retentionPolicyFixture: RetentionPolicyDto = {
  tenantId: "tenant-acme",
  operationalRetentionDays: 365,
  auditRetentionDays: 1825,
  anonymizationRequiredForReuse: true,
  dataReuseDefaultOptIn: false
};

export const dataReuseConsentFixture: DataReuseConsentDto = {
  tenantId: "tenant-acme",
  enabled: false,
  updatedAt: "2026-03-20T10:30:00.000Z",
  auditId: "AUD-R4-4101"
};

export const navigationManifestFixtures: Record<NavigationManifestDto["role"], NavigationManifestDto> = {
  solicitante: {
    role: "solicitante",
    primaryViews: ["inicio", "chat", "casos", "detalle"],
    backofficeViews: []
  },
  tecnico: {
    role: "tecnico",
    primaryViews: ["inicio", "chat", "casos", "detalle"],
    backofficeViews: []
  },
  supervisor: {
    role: "supervisor",
    primaryViews: ["inicio", "chat", "casos", "detalle"],
    backofficeViews: ["inicio"]
  },
  admin: {
    role: "admin",
    primaryViews: ["chat", "inicio", "casos", "detalle", "configuracion"],
    backofficeViews: ["chat", "configuracion"]
  }
};

export const demoPassword = "Demo1234!";

export const accessBootstrapFixtures: Record<AccessBootstrap["role"], AccessBootstrap> = {
  solicitante: {
    user: { id: "usr-sol-01", fullName: "Ana Pineda", email: "solicitante@acme.opita.test" },
    tenant: { id: "tenant-acme", name: "Acme Industrial" },
    role: "solicitante",
    allowedViews: ["inicio", "chat", "casos", "detalle"]
  },
  tecnico: {
    user: { id: "usr-tec-01", fullName: "Laura Rojas", email: "tecnico@acme.opita.test" },
    tenant: { id: "tenant-acme", name: "Acme Industrial" },
    role: "tecnico",
    allowedViews: ["inicio", "chat", "casos", "detalle"]
  },
  supervisor: {
    user: { id: "usr-sup-01", fullName: "Diego Gil", email: "supervisor@acme.opita.test" },
    tenant: { id: "tenant-acme", name: "Acme Industrial" },
    role: "supervisor",
    allowedViews: ["inicio", "chat", "casos", "detalle"]
  },
  admin: {
    user: { id: "usr-adm-01", fullName: "Paula Mejia", email: "admin@acme.opita.test" },
    tenant: { id: "tenant-acme", name: "Acme Industrial" },
    role: "admin",
    allowedViews: ["chat", "inicio", "casos", "detalle", "configuracion"]
  }
};

export const demoUsers = [
  { email: "solicitante@acme.opita.test", password: demoPassword, role: "solicitante" as const },
  { email: "tecnico@acme.opita.test", password: demoPassword, role: "tecnico" as const },
  { email: "supervisor@acme.opita.test", password: demoPassword, role: "supervisor" as const },
  { email: "admin@acme.opita.test", password: demoPassword, role: "admin" as const }
];

export function toSessionDto(role: keyof typeof accessBootstrapFixtures): SessionDto {
  return accessBootstrapFixtures[role];
}

export function createSessionFixture(role: keyof typeof accessBootstrapFixtures): SessionState {
  return {
    accessToken: `stub-token-${role}`,
    expiresAt: "2026-12-31T23:59:59.000Z",
    bootstrap: accessBootstrapFixtures[role]
  };
}
