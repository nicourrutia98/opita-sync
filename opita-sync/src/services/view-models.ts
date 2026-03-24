import type {
  AssistedDraft,
  BillingExportResult,
  CapabilityItem,
  CaseDetail,
  CaseSummary,
  ConversationState,
  DataReuseConsent,
  DashboardData,
  GlobalGovernanceActionResult,
  GlobalGovernanceState,
  AssistantConnectionStatus,
  NavigationManifestByRole,
  OperationalLogEntry,
  OperationalMetric,
  SupervisorQueueItem,
  TenantConfigData,
  TenantParameter,
  TimelineEntry,
  ToolGovernanceItem,
  UsageAttribution,
  ValueReport,
  RetentionPolicy
} from "../domain/opita";

export interface CaseSummaryViewModel {
  id: string;
  title: string;
  site: string;
  priority: string;
  status: CaseSummary["status"];
  owner: string;
  updatedAt: string;
  summary: string;
}

export interface CaseDetailViewModel extends CaseSummaryViewModel {
  timeline: TimelineEntry[];
  suggestedAction: string;
}

export interface DashboardViewModel {
  metrics: OperationalMetric[];
  inbox: string[];
  supervisorQueue: SupervisorQueueItem[];
  supervisorSignals: string[];
}

export interface ConversationViewModel extends ConversationState {}
export interface AssistantConnectionStatusViewModel extends AssistantConnectionStatus {}

export interface TenantConfigViewModel extends TenantConfigData {}
export interface OperationalLogViewModel extends OperationalLogEntry {}
export interface CapabilityViewModel extends CapabilityItem {}
export interface ToolGovernanceViewModel extends ToolGovernanceItem {}
export interface TenantParameterViewModel extends TenantParameter {}
export interface AssistedDraftViewModel extends AssistedDraft {}
export interface ValueReportViewModel extends ValueReport {}
export interface UsageAttributionViewModel extends UsageAttribution {}
export interface BillingExportViewModel extends BillingExportResult {}
export interface GlobalGovernanceStateViewModel extends GlobalGovernanceState {}
export interface GlobalGovernanceActionViewModel extends GlobalGovernanceActionResult {}
export interface RetentionPolicyViewModel extends RetentionPolicy {}
export interface DataReuseConsentViewModel extends DataReuseConsent {}
export interface NavigationManifestViewModel extends NavigationManifestByRole {}

export function toDashboardViewModel(data: DashboardData): DashboardViewModel {
  return data;
}

export function toCaseSummaryViewModel(item: CaseSummary): CaseSummaryViewModel {
  return item;
}

export function toCaseDetailViewModel(item: CaseDetail): CaseDetailViewModel {
  return item;
}

export function toConversationViewModel(data: ConversationState): ConversationViewModel {
  return data;
}

export function toAssistantConnectionStatusViewModel(data: AssistantConnectionStatus): AssistantConnectionStatusViewModel {
  return data;
}

export function toTenantConfigViewModel(data: TenantConfigData): TenantConfigViewModel {
  return data;
}

export function toOperationalLogViewModel(data: OperationalLogEntry): OperationalLogViewModel {
  return data;
}

export function toCapabilityViewModel(data: CapabilityItem): CapabilityViewModel {
  return data;
}

export function toToolGovernanceViewModel(data: ToolGovernanceItem): ToolGovernanceViewModel {
  return data;
}

export function toTenantParameterViewModel(data: TenantParameter): TenantParameterViewModel {
  return data;
}

export function toAssistedDraftViewModel(data: AssistedDraft): AssistedDraftViewModel {
  return data;
}

export function toValueReportViewModel(data: ValueReport): ValueReportViewModel {
  return data;
}

export function toUsageAttributionViewModel(data: UsageAttribution): UsageAttributionViewModel {
  return data;
}

export function toBillingExportViewModel(data: BillingExportResult): BillingExportViewModel {
  return data;
}

export function toGlobalGovernanceStateViewModel(data: GlobalGovernanceState): GlobalGovernanceStateViewModel {
  return data;
}

export function toGlobalGovernanceActionViewModel(data: GlobalGovernanceActionResult): GlobalGovernanceActionViewModel {
  return data;
}

export function toRetentionPolicyViewModel(data: RetentionPolicy): RetentionPolicyViewModel {
  return data;
}

export function toDataReuseConsentViewModel(data: DataReuseConsent): DataReuseConsentViewModel {
  return data;
}

export function toNavigationManifestViewModel(data: NavigationManifestByRole): NavigationManifestViewModel {
  return data;
}
