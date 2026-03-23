import type {
  AssistedDraft,
  BillingExportResult,
  CapabilityItem,
  CaseDetail,
  CaseSummary,
  ConversationState,
  DashboardData,
  DataReuseConsent,
  GlobalGovernanceActionResult,
  GlobalGovernanceState,
  NavigationManifestByRole,
  OperationalLogEntry,
  Role,
  SessionState,
  TenantConfigData,
  ToolGovernanceItem,
  UsageAttribution,
  ValueReport,
  RetentionPolicy
} from "../../domain/opita";
import { clearSession, readSession, writeSession } from "../auth-storage";
import type {
  CapabilityDto,
  BillingExportDto,
  CaseDetailDto,
  CaseSummaryDto,
  ConversationDto,
  DataReuseConsentDto,
  DraftRequestDto,
  DraftResponseDto,
  GlobalGovernanceActionDto,
  GlobalGovernanceActionResultDto,
  GlobalGovernanceStateDto,
  CreateOperationalLogEntryDto,
  DashboardDto,
  MutationResponseDto,
  OperationalLogEntryDto,
  PasswordResetConfirmDto,
  PasswordResetRequestDto,
  SessionDto,
  SetCapabilityStateDto,
  SignInRequestDto,
  SignInResponseDto,
  TenantConfigDto,
  ToolGovernanceDto,
  UsageAttributionDto,
  UpdateDataReuseConsentDto,
  UpdateTenantParameterDto,
  ValueReportDto,
  RetentionPolicyDto,
  NavigationManifestDto
} from "../api/types";
import type { OpitaAppServices } from "../contracts";
import { ServiceError } from "../errors";

interface HttpAdapterOptions {
  apiBaseUrl: string;
  storageKey: string;
}

function mapHttpError(status: number): ServiceError {
  if (status === 401) {
    return new ServiceError("La sesion expiro. Inicia sesion nuevamente.", "session_expired", 401);
  }
  if (status === 403) {
    return new ServiceError("Tu rol no puede acceder a esta vista.", "access_denied", 403);
  }
  return new ServiceError(`Request failed with status ${status}`, "unknown", status);
}

async function fetchJson<T>(
  baseUrl: string,
  pathname: string,
  options: {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
    params?: Record<string, string | undefined>;
  } = {}
): Promise<T> {
  const url = new URL(pathname, `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}`);
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value) {
      url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    throw mapHttpError(response.status);
  }

  return (await response.json()) as T;
}

function mapDashboardDto(dto: DashboardDto, role: Role): DashboardData {
  return {
    metrics: role === "supervisor" ? dto.supervisorMetrics : dto.metrics,
    inbox: dto.inbox,
    supervisorQueue: dto.supervisorQueue,
    supervisorSignals: dto.supervisorSignals
  };
}

function getRequiredSession(storageKey: string): SessionState {
  const session = readSession(storageKey);
  if (!session) {
    throw new ServiceError("No hay una sesion activa.", "session_expired", 401);
  }
  return session;
}

export function createHttpOpitaAppServices({ apiBaseUrl, storageKey }: HttpAdapterOptions): OpitaAppServices {
  if (!apiBaseUrl) {
    throw new Error("VITE_OPITA_API_BASE_URL is required when data source is remote.");
  }

  return {
    authService: {
      async signIn(email, password): Promise<SessionState> {
        const dto = await fetchJson<SignInResponseDto>(apiBaseUrl, "auth/login", {
          method: "POST",
          body: { email, password } satisfies SignInRequestDto
        });
        const session = {
          accessToken: dto.accessToken,
          expiresAt: dto.expiresAt,
          bootstrap: dto.bootstrap
        };
        writeSession(storageKey, session);
        return session;
      },
      async requestPasswordReset(email) {
        await fetchJson<{ email: string }>(apiBaseUrl, "auth/password-reset/request", {
          method: "POST",
          body: { email } satisfies PasswordResetRequestDto
        });
        return { email };
      },
      async resetPassword(token, password) {
        await fetchJson<{ ok: true }>(apiBaseUrl, "auth/password-reset/confirm", {
          method: "POST",
          body: { token, password } satisfies PasswordResetConfirmDto
        });
      },
      async getSession(): Promise<SessionState | null> {
        const persisted = readSession(storageKey);
        if (!persisted) {
          return null;
        }
        try {
          const bootstrap = await fetchJson<SessionDto>(apiBaseUrl, "auth/session", {
            token: persisted.accessToken
          });
          const session = { ...persisted, bootstrap };
          writeSession(storageKey, session);
          return session;
        } catch (error) {
          if (error instanceof ServiceError && error.status === 401) {
            clearSession(storageKey);
            return null;
          }
          throw error;
        }
      },
      async signOut() {
        clearSession(storageKey);
      }
    },
    dashboardService: {
      async getDashboard(role): Promise<DashboardData> {
        const session = getRequiredSession(storageKey);
        const dto = await fetchJson<DashboardDto>(apiBaseUrl, "dashboard", {
          token: session.accessToken,
          params: { role }
        });
        return mapDashboardDto(dto, role);
      }
    },
    caseService: {
      async listCases(): Promise<CaseSummary[]> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<CaseSummaryDto[]>(apiBaseUrl, "cases", { token: session.accessToken });
      },
      async getCaseDetail(caseId: string): Promise<CaseDetail> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<CaseDetailDto>(apiBaseUrl, `cases/${caseId}`, { token: session.accessToken });
      }
    },
    chatService: {
      async getConversation(role: Role, caseId?: string): Promise<ConversationState> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<ConversationDto>(apiBaseUrl, "chat/conversation", {
          token: session.accessToken,
          params: { role, caseId }
        });
      }
    },
    tenantConfigService: {
      async getTenantConfig(): Promise<TenantConfigData> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<TenantConfigDto>(apiBaseUrl, "tenant-config", { token: session.accessToken });
      },
      async updateParameter(input) {
        const session = getRequiredSession(storageKey);
        return await fetchJson<MutationResponseDto>(apiBaseUrl, "tenant-config/parameter", {
          method: "POST",
          token: session.accessToken,
          body: input satisfies UpdateTenantParameterDto
        });
      }
    },
    operationalLogService: {
      async listEntries(caseId: string): Promise<OperationalLogEntry[]> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<OperationalLogEntryDto[]>(apiBaseUrl, "operational-log", {
          token: session.accessToken,
          params: { caseId }
        });
      },
      async createEntry(input) {
        const session = getRequiredSession(storageKey);
        return await fetchJson<{ entry: OperationalLogEntryDto; auditId: string }>(apiBaseUrl, "operational-log", {
          method: "POST",
          token: session.accessToken,
          body: input satisfies CreateOperationalLogEntryDto
        });
      }
    },
    capabilityService: {
      async listCapabilities(): Promise<CapabilityItem[]> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<CapabilityDto[]>(apiBaseUrl, "capabilities", { token: session.accessToken });
      },
      async setCapabilityState(input) {
        const session = getRequiredSession(storageKey);
        return await fetchJson<MutationResponseDto>(apiBaseUrl, "capabilities/state", {
          method: "POST",
          token: session.accessToken,
          body: input satisfies SetCapabilityStateDto
        });
      }
    },
    toolGovernanceService: {
      async listTools(): Promise<ToolGovernanceItem[]> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<ToolGovernanceDto[]>(apiBaseUrl, "tool-governance", { token: session.accessToken });
      }
    },
    draftService: {
      async generateDraft(input): Promise<AssistedDraft> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<DraftResponseDto>(apiBaseUrl, "drafts/generate", {
          method: "POST",
          token: session.accessToken,
          body: input satisfies DraftRequestDto
        });
      }
    },
    reportingService: {
      async getValueReport(role: Role): Promise<ValueReport> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<ValueReportDto>(apiBaseUrl, "reporting/value", {
          token: session.accessToken,
          params: { role }
        });
      }
    },
    usageService: {
      async getUsageAttribution(): Promise<UsageAttribution> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<UsageAttributionDto>(apiBaseUrl, "usage/attribution", {
          token: session.accessToken
        });
      },
      async exportBillingUsage(): Promise<BillingExportResult> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<BillingExportDto>(apiBaseUrl, "usage/export", {
          method: "POST",
          token: session.accessToken
        });
      }
    },
    governanceService: {
      async getGlobalState(): Promise<GlobalGovernanceState> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<GlobalGovernanceStateDto>(apiBaseUrl, "governance/state", {
          token: session.accessToken
        });
      },
      async runAction(action): Promise<GlobalGovernanceActionResult> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<GlobalGovernanceActionResultDto>(apiBaseUrl, "governance/action", {
          method: "POST",
          token: session.accessToken,
          body: { action } satisfies GlobalGovernanceActionDto
        });
      }
    },
    complianceService: {
      async getRetentionPolicy(): Promise<RetentionPolicy> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<RetentionPolicyDto>(apiBaseUrl, "compliance/retention-policy", {
          token: session.accessToken
        });
      },
      async getDataReuseConsent(): Promise<DataReuseConsent> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<DataReuseConsentDto>(apiBaseUrl, "compliance/data-reuse-consent", {
          token: session.accessToken
        });
      },
      async updateDataReuseConsent(enabled): Promise<DataReuseConsent> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<DataReuseConsentDto>(apiBaseUrl, "compliance/data-reuse-consent", {
          method: "POST",
          token: session.accessToken,
          body: { enabled } satisfies UpdateDataReuseConsentDto
        });
      }
    },
    navigationService: {
      async getManifest(role): Promise<NavigationManifestByRole> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<NavigationManifestDto>(apiBaseUrl, "navigation/manifest", {
          token: session.accessToken,
          params: { role }
        });
      }
    }
  };
}
