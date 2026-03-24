import type { CaseDetail, CaseSummary, ConversationState, DashboardData, OperationalLogEntry, Role, SessionState, TenantConfigData } from "../../domain/opita";
import type { AuthFailureRule, FailureKey } from "../../config/app-env";
import { clearSession, readSession, writeSession } from "../auth-storage";
import type {
  BillingExportDto,
  CapabilityDto,
  CaseDetailDto,
  CaseSummaryDto,
  ConversationDto,
  DataReuseConsentDto,
  DashboardDto,
  DraftResponseDto,
  GlobalGovernanceActionResultDto,
  GlobalGovernanceStateDto,
  NavigationManifestDto,
  TenantConfigDto,
  ToolGovernanceDto,
  UsageAttributionDto,
  ValueReportDto,
  RetentionPolicyDto
} from "../api/types";
import type { OpitaAppServices } from "../contracts";
import { ServiceError } from "../errors";
import {
  capabilityFixture,
  billingExportFixture,
  caseDetailsFixture,
  caseSummariesFixture,
  conversationFixture,
  createSessionFixture,
  dashboardFixture,
  draftFixture,
  dataReuseConsentFixture,
  demoUsers,
  globalGovernanceStateFixture,
  governanceActionFixture,
  navigationManifestFixtures,
  operationalLogEntriesFixture,
  retentionPolicyFixture,
  tenantConfigFixture,
  toolGovernanceFixture,
  usageAttributionFixture,
  valueReportFixture
} from "./fixtures";

interface StubAdapterOptions {
  delayMs?: number;
  storageKey?: string;
  fail?: FailureKey[];
  failOnce?: FailureKey[];
  authFail?: AuthFailureRule[];
  authFailOnce?: AuthFailureRule[];
  seedSession?: boolean | Role;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function mapDashboardDto(dto: DashboardDto, role: Role): DashboardData {
  return {
    metrics: role === "supervisor" ? dto.supervisorMetrics : dto.metrics,
    inbox: dto.inbox,
    supervisorQueue: dto.supervisorQueue,
    supervisorSignals: dto.supervisorSignals
  };
}

function mapCaseSummaryDto(dto: CaseSummaryDto): CaseSummary {
  return dto;
}

function mapCaseDetailDto(dto: CaseDetailDto): CaseDetail {
  return dto;
}

function mapConversationDto(dto: ConversationDto): ConversationState {
  return dto;
}

function mapTenantConfigDto(dto: TenantConfigDto): TenantConfigData {
  return dto;
}

function mapOperationalLogDto(dto: OperationalLogEntry): OperationalLogEntry {
  return dto;
}

function resolveSeedRole(seedSession: StubAdapterOptions["seedSession"]): Role | null {
  if (seedSession === true) {
    return "tecnico";
  }
  if (seedSession === false || seedSession == null) {
    return null;
  }
  return seedSession;
}

export function createStubOpitaAppServices(options: StubAdapterOptions = {}): OpitaAppServices {
  const storageKey = options.storageKey ?? "opita-sync.session";
  const fail = new Set(options.fail ?? []);
  const failOnceCounters = new Map<FailureKey, number>();
  const authFail = new Set(options.authFail ?? []);
  const authFailOnceCounters = new Map<AuthFailureRule, number>();

  for (const key of options.failOnce ?? []) {
    failOnceCounters.set(key, 1);
  }
  for (const key of options.authFailOnce ?? []) {
    authFailOnceCounters.set(key, 1);
  }

  const seedRole = resolveSeedRole(options.seedSession);
  const mutableTenantConfig = clone(tenantConfigFixture);
  const mutableCapabilities = clone(capabilityFixture);
  const mutableOperationalLogs = clone(operationalLogEntriesFixture);
  const mutableTools = clone(toolGovernanceFixture);
  const mutableDataReuseConsent = clone(dataReuseConsentFixture);
  const mutableConversation = clone(conversationFixture);
  let logCounter = 1;
  if (seedRole && !readSession(storageKey)) {
    writeSession(storageKey, createSessionFixture(seedRole));
  }

  async function maybeFail(key: FailureKey, message: string) {
    await delay(options.delayMs ?? 180);
    if (fail.has(key)) {
      throw new Error(message);
    }
    const remaining = failOnceCounters.get(key) ?? 0;
    if (remaining > 0) {
      failOnceCounters.set(key, remaining - 1);
      throw new Error(message);
    }
  }

  async function requireSession(key: FailureKey): Promise<SessionState> {
    await delay(options.delayMs ?? 180);
    const authRuleUnauthorized = `${key}:unauthorized` as AuthFailureRule;
    const authRuleForbidden = `${key}:forbidden` as AuthFailureRule;

    if (authFail.has(authRuleUnauthorized)) {
      throw new ServiceError("La sesion expiro. Inicia sesion nuevamente.", "session_expired", 401);
    }
    if (authFail.has(authRuleForbidden)) {
      throw new ServiceError("Tu rol no puede acceder a esta vista.", "access_denied", 403);
    }

    const unauthorizedRemaining = authFailOnceCounters.get(authRuleUnauthorized) ?? 0;
    if (unauthorizedRemaining > 0) {
      authFailOnceCounters.set(authRuleUnauthorized, unauthorizedRemaining - 1);
      throw new ServiceError("La sesion expiro. Inicia sesion nuevamente.", "session_expired", 401);
    }

    const forbiddenRemaining = authFailOnceCounters.get(authRuleForbidden) ?? 0;
    if (forbiddenRemaining > 0) {
      authFailOnceCounters.set(authRuleForbidden, forbiddenRemaining - 1);
      throw new ServiceError("Tu rol no puede acceder a esta vista.", "access_denied", 403);
    }

    const session = readSession(storageKey);
    if (!session) {
      throw new ServiceError("No hay una sesion activa.", "session_expired", 401);
    }

    return session;
  }

  return {
    authService: {
      async signIn(email, password) {
        await delay(options.delayMs ?? 180);
        const match = demoUsers.find((item) => item.email === email.toLowerCase() && item.password === password);
        if (!match) {
          throw new ServiceError("Credenciales invalidas. Revisa correo y contrasena.", "invalid_credentials", 401);
        }
        const session = createSessionFixture(match.role);
        writeSession(storageKey, session);
        return clone(session);
      },
      async requestPasswordReset(email) {
        await delay(options.delayMs ?? 180);
        return { email };
      },
      async resetPassword(token, _password) {
        await delay(options.delayMs ?? 180);
        if (token !== "demo-reset-token") {
          throw new ServiceError("El enlace de restablecimiento no es valido o ya expiro.", "unknown", 400);
        }
      },
      async getSession() {
        await delay(options.delayMs ?? 120);
        const session = readSession(storageKey);
        return session ? clone(session) : null;
      },
      async signOut() {
        await delay(40);
        clearSession(storageKey);
      }
    },
    dashboardService: {
      async getDashboard(role) {
        const session = await requireSession("dashboard");
        await maybeFail("dashboard", "No se pudo cargar el home operativo.");
        return mapDashboardDto(clone(dashboardFixture), session.bootstrap.role === "supervisor" ? "supervisor" : role);
      }
    },
    caseService: {
      async listCases() {
        await requireSession("cases");
        await maybeFail("cases", "No se pudo cargar la cola de casos.");
        return clone(caseSummariesFixture).map(mapCaseSummaryDto);
      },
      async getCaseDetail(caseId) {
        await requireSession("detail");
        await maybeFail("detail", "No se pudo cargar el detalle del caso.");
        const detail = caseDetailsFixture[caseId] ?? caseDetailsFixture["CAS-2048"];
        return mapCaseDetailDto(clone(detail));
      }
    },
    chatService: {
      async getConversation(role) {
        const session = await requireSession("chat");
        await maybeFail("chat", "No se pudo reconstruir la conversacion.");
        const conversation = clone(mutableConversation);
        if (session.bootstrap.role === "supervisor" || role === "supervisor") {
          conversation.title = "Intencion operativa con contexto de supervisor";
        }
        return mapConversationDto(conversation);
      },
      async sendMessage(input) {
        const session = await requireSession("chat");
        await maybeFail("chat", "No se pudo enviar el mensaje.");
        mutableConversation.messages.push(
          {
            id: `stub-user-${Date.now()}`,
            tone: "user",
            body: input.message
          },
          {
            id: `stub-activity-thinking-${Date.now()}`,
            tone: "system",
            body: "[[activity:thinking]] Analizando el nuevo turno y preparando la siguiente accion."
          },
          {
            id: `stub-activity-reasoning-${Date.now()}`,
            tone: "system",
            body: "[[activity:reasoning]] Organizando el contexto operativo y el historial visible."
          },
          {
            id: `stub-activity-tool-${Date.now()}`,
            tone: "system",
            body: "[[activity:tool]] Consultando el proveedor configurado para responder desde el orquestador."
          },
          {
            id: `stub-assistant-${Date.now()}`,
            tone: "assistant",
            body: `Respuesta de prueba para ${session.bootstrap.tenant.name}: ${input.message}`
          },
          {
            id: `stub-activity-ready-${Date.now()}`,
            tone: "system",
            body: "[[activity:ready]] Respuesta lista desde el proveedor configurado."
          }
        );
        mutableConversation.promptDraft = input.message;
        return clone(mutableConversation);
      }
    },
    tenantConfigService: {
      async getTenantConfig() {
        const session = await requireSession("tenant");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede acceder a esta vista.", "access_denied", 403);
        }
        await maybeFail("tenant", "No se pudo cargar la configuracion del tenant.");
        const config = clone(mutableTenantConfig);
        config.risks = [
          `Tenant activo: ${session.bootstrap.tenant.name}.`,
          ...config.risks
        ];
        return mapTenantConfigDto(config);
      },
      async updateParameter(input) {
        const session = await requireSession("tenantUpdate");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede actualizar configuracion.", "access_denied", 403);
        }
        await maybeFail("tenantUpdate", "No se pudo actualizar el parametro.");
        const parameter = mutableTenantConfig.parameters.find((item) => item.key === input.key);
        if (!parameter) {
          throw new ServiceError("Parametro no encontrado.", "unknown", 404);
        }
        if (!parameter.editable) {
          throw new ServiceError("Este parametro es solo lectura para el tenant.", "access_denied", 403);
        }
        parameter.value = input.value;
        return { updated: true, auditId: `AUD-R2-CONF-${Date.now()}` };
      },
      async testAssistantConnection() {
        const session = await requireSession("tenantUpdate");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede actualizar configuracion.", "access_denied", 403);
        }
        return {
          ok: true,
          provider: "stub",
          model: "stub-orchestrator",
          detail: "Conexion simulada disponible para pruebas locales."
        };
      }
    },
    operationalLogService: {
      async listEntries(caseId) {
        await requireSession("log");
        await maybeFail("log", "No se pudo cargar la bitacora operativa.");
        return clone(mutableOperationalLogs[caseId] ?? []).map(mapOperationalLogDto);
      },
      async createEntry(input) {
        const session = await requireSession("log");
        await maybeFail("log", "No se pudo registrar la entrada de bitacora.");
        const entry: OperationalLogEntry = {
          id: `LOG-${input.caseId}-${String(logCounter).padStart(2, "0")}`,
          caseId: input.caseId,
          author: session.bootstrap.user.fullName,
          type: input.type,
          detail: input.detail,
          createdAt: "Ahora",
          visibility: input.visibility,
          before: input.before,
          after: input.after,
          evidenceLabel: input.evidenceLabel,
          auditId: `AUD-R2-LOG-${Date.now()}`
        };
        logCounter += 1;
        mutableOperationalLogs[input.caseId] = [entry, ...(mutableOperationalLogs[input.caseId] ?? [])];
        return { entry: clone(entry), auditId: entry.auditId };
      }
    },
    capabilityService: {
      async listCapabilities() {
        const session = await requireSession("capabilities");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede consultar el catalogo de capacidades.", "access_denied", 403);
        }
        await maybeFail("capabilities", "No se pudo cargar el catalogo de capacidades.");
        return clone(mutableCapabilities) as CapabilityDto[];
      },
      async setCapabilityState(input) {
        const session = await requireSession("capabilities");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede cambiar capacidades.", "access_denied", 403);
        }
        await maybeFail("capabilities", "No se pudo actualizar el estado de la capacidad.");
        const capability = mutableCapabilities.find((item) => item.id === input.capabilityId);
        if (!capability) {
          throw new ServiceError("Capacidad no encontrada.", "unknown", 404);
        }
        capability.enabled = input.enabled;
        return { updated: true, auditId: `AUD-R2-CAP-${Date.now()}` };
      }
    },
    toolGovernanceService: {
      async listTools() {
        const session = await requireSession("tools");
        if (session.bootstrap.role !== "admin" && session.bootstrap.role !== "supervisor") {
          throw new ServiceError("Tu rol no puede consultar gobierno de herramientas.", "access_denied", 403);
        }
        await maybeFail("tools", "No se pudo cargar gobierno de herramientas.");
        return clone(mutableTools) as ToolGovernanceDto[];
      }
    },
    draftService: {
      async generateDraft(input) {
        await requireSession("draft");
        await maybeFail("draft", "No se pudo generar el borrador asistido.");
        const draft = clone(draftFixture) as DraftResponseDto;
        draft.caseId = input.caseId;
        draft.channel = input.channel;
        draft.tone = input.tone;
        draft.content = `${draft.content}\n\nPrompt base: ${input.prompt}`;
        draft.auditId = `AUD-R3-DRF-${Date.now()}`;
        return draft;
      }
    },
    reportingService: {
      async getValueReport() {
        await requireSession("reporting");
        await maybeFail("reporting", "No se pudo cargar el reporte de valor.");
        return clone(valueReportFixture) as ValueReportDto;
      }
    },
    usageService: {
      async getUsageAttribution() {
        await requireSession("usage");
        await maybeFail("usage", "No se pudo cargar la atribucion de consumo.");
        return clone(usageAttributionFixture) as UsageAttributionDto;
      },
      async exportBillingUsage() {
        await requireSession("usage");
        await maybeFail("usage", "No se pudo exportar el consumo para billing.");
        const result = clone(billingExportFixture) as BillingExportDto;
        result.exportId = `EXP-R3-${Date.now()}`;
        return result;
      }
    },
    governanceService: {
      async getGlobalState() {
        const session = await requireSession("governance");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede acceder a gobernanza global.", "access_denied", 403);
        }
        await maybeFail("governance", "No se pudo cargar el estado global de gobierno.");
        return clone(globalGovernanceStateFixture) as GlobalGovernanceStateDto;
      },
      async runAction(action) {
        const session = await requireSession("governance");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede ejecutar acciones globales.", "access_denied", 403);
        }
        await maybeFail("governance", "No se pudo ejecutar la accion de gobierno.");
        const result = clone(governanceActionFixture) as GlobalGovernanceActionResultDto;
        result.action = action;
        result.auditId = `AUD-R4-ACT-${Date.now()}`;
        result.detail =
          action === "rollback_release"
            ? "Rollback operativo aplicado al ultimo despliegue certificado."
            : action === "deploy_release"
              ? "Despliegue certificado aplicado en produccion."
              : "Aprobacion de capacidad registrada.";
        return result;
      }
    },
    complianceService: {
      async getRetentionPolicy() {
        const session = await requireSession("compliance");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede consultar politicas de retencion.", "access_denied", 403);
        }
        await maybeFail("compliance", "No se pudo cargar la politica de retencion.");
        return clone(retentionPolicyFixture) as RetentionPolicyDto;
      },
      async getDataReuseConsent() {
        const session = await requireSession("compliance");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede consultar consentimiento de reutilizacion.", "access_denied", 403);
        }
        await maybeFail("compliance", "No se pudo cargar el consentimiento de reutilizacion.");
        return clone(mutableDataReuseConsent) as DataReuseConsentDto;
      },
      async updateDataReuseConsent(enabled) {
        const session = await requireSession("compliance");
        if (session.bootstrap.role !== "admin") {
          throw new ServiceError("Tu rol no puede cambiar consentimiento de reutilizacion.", "access_denied", 403);
        }
        await maybeFail("compliance", "No se pudo actualizar el consentimiento de reutilizacion.");
        mutableDataReuseConsent.enabled = enabled;
        mutableDataReuseConsent.updatedAt = new Date().toISOString();
        mutableDataReuseConsent.auditId = `AUD-R4-CONS-${Date.now()}`;
        return clone(mutableDataReuseConsent) as DataReuseConsentDto;
      }
    },
    navigationService: {
      async getManifest(role) {
        await requireSession("navigation");
        await maybeFail("navigation", "No se pudo cargar el manifiesto de navegacion.");
        return clone(navigationManifestFixtures[role]) as NavigationManifestDto;
      }
    }
  };
}
