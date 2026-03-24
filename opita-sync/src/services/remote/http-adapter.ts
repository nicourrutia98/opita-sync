import type {
  AssistedDraft,
  BillingExportResult,
  CapabilityItem,
  CaseDetail,
  CaseSummary,
  ChatMessage,
  ChatStreamEvent,
  ConversationMessagePage,
  ConversationSummary,
  DashboardData,
  DataReuseConsent,
  AssistantConnectionStatus,
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
  ChatStreamEventDto,
  ConversationDto,
  ConversationMessageDto,
  ConversationMessagePageDto,
  ConversationSummaryDto,
  AssistantConnectionStatusDto,
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
  SendChatMessageDto,
  SendChatMessageResultDto,
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

function mapHttpError(status: number, message?: string): ServiceError {
  if (status === 401) {
    return new ServiceError(message ?? "La sesion expiro. Inicia sesion nuevamente.", "session_expired", 401);
  }
  if (status === 403) {
    return new ServiceError(message ?? "Tu rol no puede acceder a esta vista.", "access_denied", 403);
  }
  return new ServiceError(message ?? `Request failed with status ${status}`, "unknown", status);
}

async function fetchJson<T>(
  baseUrl: string,
  pathname: string,
  options: {
    method?: "GET" | "POST" | "PATCH";
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
    let message: string | undefined;
    try {
      const payload = await response.json();
      message = payload?.message ?? payload?.detail ?? payload?.error;
    } catch {
      try {
        message = await response.text();
      } catch {
        message = undefined;
      }
    }
    throw mapHttpError(response.status, message?.trim() ? message.trim() : undefined);
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

function mapConversationDto(dto: ConversationDto) {
  return dto;
}

function mapConversationSummaryDto(dto: ConversationSummaryDto): ConversationSummary {
  return dto;
}

function mapBootstrapConversationDto(dto: ConversationSummaryDto | ConversationDto): ConversationSummary {
  return {
    id: dto.id,
    title: dto.title,
    caseId: dto.caseId,
    lastMessagePreview: "lastMessagePreview" in dto ? dto.lastMessagePreview : "",
    updatedAt: dto.updatedAt,
    status: "status" in dto ? dto.status : undefined
  };
}

function mapConversationMessageDto(dto: ConversationMessageDto): ChatMessage {
  return dto;
}

function mapConversationMessagePageDto(dto: ConversationMessagePageDto): ConversationMessagePage {
  return {
    items: dto.items.map(mapConversationMessageDto),
    prevCursor: dto.prevCursor,
    hasMoreBefore: dto.hasMoreBefore
  };
}

function mapChatStreamEventDto(dto: ChatStreamEventDto): ChatStreamEvent {
  return dto;
}

async function fetchStream(
  baseUrl: string,
  pathname: string,
  options: {
    token?: string;
    body?: unknown;
    signal?: AbortSignal;
    onEvent: (event: ChatStreamEvent) => void;
  }
): Promise<void> {
  const url = new URL(pathname, `${baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`}`);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      Accept: "application/x-ndjson",
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {})
    },
    body: JSON.stringify(options.body ?? {}),
    signal: options.signal
  });

  if (!response.ok) {
    let message: string | undefined;
    try {
      const payload = await response.json();
      message = payload?.message ?? payload?.detail ?? payload?.error;
    } catch {
      message = await response.text();
    }
    throw mapHttpError(response.status, message?.trim() ? message.trim() : undefined);
  }

  if (!response.body) {
    throw new ServiceError("El servidor no devolvio un stream valido.", "unknown", 502);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        continue;
      }
      options.onEvent(mapChatStreamEventDto(JSON.parse(trimmed) as ChatStreamEventDto));
    }
  }

  const tail = buffer.trim();
  if (tail) {
    options.onEvent(mapChatStreamEventDto(JSON.parse(tail) as ChatStreamEventDto));
  }
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
      async listConversations(input = {}): Promise<ConversationSummary[]> {
        const session = getRequiredSession(storageKey);
        const items = await fetchJson<ConversationSummaryDto[]>(apiBaseUrl, "conversations", {
          token: session.accessToken,
          params: { limit: String(input.limit ?? 20), sort: "updatedAt:desc" }
        });
        return items.map(mapConversationSummaryDto);
      },
      async createConversation(input = {}) {
        const session = getRequiredSession(storageKey);
        const dto = await fetchJson<ConversationSummaryDto>(apiBaseUrl, "conversations", {
          method: "POST",
          token: session.accessToken,
          body: { caseId: input.caseId }
        });
        return mapConversationSummaryDto(dto);
      },
      async updateConversation(input) {
        const session = getRequiredSession(storageKey);
        const dto = await fetchJson<ConversationSummaryDto>(apiBaseUrl, `conversations/${input.conversationId}`, {
          method: "PATCH",
          token: session.accessToken,
          body: {
            ...(input.title !== undefined ? { title: input.title } : {}),
            ...(input.archived !== undefined ? { archived: input.archived } : {})
          }
        });
        return mapConversationSummaryDto(dto);
      },
      async getConversationMessages(input): Promise<ConversationMessagePage> {
        const session = getRequiredSession(storageKey);
        const dto = await fetchJson<ConversationMessagePageDto>(apiBaseUrl, `conversations/${input.conversationId}/messages`, {
          token: session.accessToken,
          params: {
            limit: String(input.limit ?? 30),
            before: input.before
          }
        });
        return mapConversationMessagePageDto(dto);
      },
      async sendMessage(input) {
        const session = getRequiredSession(storageKey);
        const metadata = {
          ...(input.metadata ?? {}),
          ...(input.caseId ? { caseId: input.caseId } : {})
        };

        let conversationSummary: ConversationSummary | undefined;
        let conversationId = input.conversationId;

        if (!conversationId) {
          const bootstrap = await fetchJson<ConversationSummaryDto | ConversationDto | { conversation: ConversationSummaryDto | ConversationDto }>(apiBaseUrl, "conversations/bootstrap", {
            method: "POST",
            token: session.accessToken,
            body: {
              caseId: input.caseId,
              title: input.caseId ? `Caso ${input.caseId}` : undefined
            }
          });
          const bootstrapConversation = "conversation" in bootstrap ? bootstrap.conversation : bootstrap;
          conversationSummary = mapBootstrapConversationDto(bootstrapConversation);
          conversationId = conversationSummary.id;
        }

        const dto = await fetchJson<SendChatMessageResultDto & { conversationSummary?: ConversationSummaryDto }>(apiBaseUrl, `conversations/${conversationId}/messages`, {
          method: "POST",
          token: session.accessToken,
          body: { content: input.content, attachments: input.attachments ?? [], metadata } satisfies SendChatMessageDto
        });
        return {
          runId: dto.runId,
          conversationId: dto.conversationId,
          userMessage: mapConversationMessageDto(dto.userMessage),
          assistantDraftMessage: mapConversationMessageDto(dto.assistantDraftMessage),
          reusedUserMessageId: dto.reusedUserMessageId,
          conversationSummary: dto.conversationSummary ? mapConversationSummaryDto(dto.conversationSummary) : conversationSummary
        };
      },
      async retryLastMessage(input) {
        const session = getRequiredSession(storageKey);
        const dto = await fetchJson<SendChatMessageResultDto>(apiBaseUrl, `conversations/${input.conversationId}/retry-last`, {
          method: "POST",
          token: session.accessToken,
          body: {}
        });
        return {
          runId: dto.runId,
          conversationId: dto.conversationId,
          userMessage: mapConversationMessageDto(dto.userMessage),
          assistantDraftMessage: mapConversationMessageDto(dto.assistantDraftMessage),
          reusedUserMessageId: dto.reusedUserMessageId,
          conversationSummary: dto.conversationSummary ? mapConversationSummaryDto(dto.conversationSummary) : undefined
        };
      },
      async streamAssistantResponse(input) {
        const session = getRequiredSession(storageKey);
        await fetchStream(apiBaseUrl, `conversations/${input.conversationId}/messages/stream?runId=${encodeURIComponent(input.runId)}`, {
          token: session.accessToken,
          body: {},
          signal: input.signal,
          onEvent: input.onEvent
        });
      },
      async cancelRun(input) {
        const session = getRequiredSession(storageKey);
        await fetchJson<{ ok: true }>(apiBaseUrl, `runs/${input.runId}/cancel`, {
          method: "POST",
          token: session.accessToken
        });
      },
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
      },
      async testAssistantConnection(): Promise<AssistantConnectionStatus> {
        const session = getRequiredSession(storageKey);
        return await fetchJson<AssistantConnectionStatusDto>(apiBaseUrl, "tenant-config/test-ai", {
          method: "POST",
          token: session.accessToken
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
