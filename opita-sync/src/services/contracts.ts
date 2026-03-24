import type {
  AssistedDraft,
  BillingExportResult,
  CapabilityItem,
  CaseDetail,
  CaseSummary,
  CancelRunInput,
  ChatTransport,
  ConversationMessagePage,
  ConversationMessagesInput,
  ConversationSummary,
  DashboardData,
  DataReuseConsent,
  DraftRequestInput,
  GlobalGovernanceActionResult,
  GlobalGovernanceState,
  ListConversationsInput,
  NavigationManifestByRole,
  OperationalLogCreateInput,
  OperationalLogEntry,
  Role,
  SendMessageInput,
  SendMessageResult,
  SessionState,
  AssistantConnectionStatus,
  TenantConfigData,
  ToolGovernanceItem,
  UsageAttribution,
  ValueReport,
  RetentionPolicy
} from "../domain/opita";

export interface AuthService {
  signIn(email: string, password: string): Promise<SessionState>;
  requestPasswordReset(email: string): Promise<{ email: string }>;
  resetPassword(token: string, password: string): Promise<void>;
  getSession(): Promise<SessionState | null>;
  signOut(): Promise<void>;
}

export interface DashboardService {
  getDashboard(role: Role): Promise<DashboardData>;
}

export interface CaseService {
  listCases(): Promise<CaseSummary[]>;
  getCaseDetail(caseId: string): Promise<CaseDetail>;
}

export interface ChatService {
  listConversations(input?: ListConversationsInput): Promise<ConversationSummary[]>;
  createConversation(input?: { caseId?: string }): Promise<ConversationSummary>;
  updateConversation(input: { conversationId: string; title?: string; archived?: boolean }): Promise<ConversationSummary>;
  getConversationMessages(input: ConversationMessagesInput): Promise<ConversationMessagePage>;
  sendMessage(input: SendMessageInput): Promise<SendMessageResult>;
  retryLastMessage(input: { conversationId: string }): Promise<SendMessageResult>;
  streamAssistantResponse: ChatTransport["streamAssistantResponse"];
  cancelRun(input: CancelRunInput): Promise<void>;
  subscribeConversationUpdates?: ChatTransport["subscribeConversationUpdates"];
}

export interface TenantConfigService {
  getTenantConfig(): Promise<TenantConfigData>;
  updateParameter(input: { key: string; value: string }): Promise<{ updated: boolean; auditId: string }>;
  testAssistantConnection(): Promise<AssistantConnectionStatus>;
}

export interface OperationalLogService {
  listEntries(caseId: string): Promise<OperationalLogEntry[]>;
  createEntry(input: OperationalLogCreateInput): Promise<{ entry: OperationalLogEntry; auditId: string }>;
}

export interface CapabilityService {
  listCapabilities(): Promise<CapabilityItem[]>;
  setCapabilityState(input: { capabilityId: string; enabled: boolean }): Promise<{ updated: boolean; auditId: string }>;
}

export interface ToolGovernanceService {
  listTools(): Promise<ToolGovernanceItem[]>;
}

export interface DraftService {
  generateDraft(input: DraftRequestInput): Promise<AssistedDraft>;
}

export interface ReportingService {
  getValueReport(role: Role): Promise<ValueReport>;
}

export interface UsageService {
  getUsageAttribution(): Promise<UsageAttribution>;
  exportBillingUsage(): Promise<BillingExportResult>;
}

export interface GovernanceService {
  getGlobalState(): Promise<GlobalGovernanceState>;
  runAction(action: "approve_capability" | "deploy_release" | "rollback_release"): Promise<GlobalGovernanceActionResult>;
}

export interface ComplianceService {
  getRetentionPolicy(): Promise<RetentionPolicy>;
  getDataReuseConsent(): Promise<DataReuseConsent>;
  updateDataReuseConsent(enabled: boolean): Promise<DataReuseConsent>;
}

export interface NavigationService {
  getManifest(role: Role): Promise<NavigationManifestByRole>;
}

export interface OpitaAppServices {
  authService: AuthService;
  dashboardService: DashboardService;
  caseService: CaseService;
  chatService: ChatService;
  tenantConfigService: TenantConfigService;
  operationalLogService: OperationalLogService;
  capabilityService: CapabilityService;
  toolGovernanceService: ToolGovernanceService;
  draftService: DraftService;
  reportingService: ReportingService;
  usageService: UsageService;
  governanceService: GovernanceService;
  complianceService: ComplianceService;
  navigationService: NavigationService;
}
