export type AuthExchangeResponse = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    displayName: string;
    email?: string | null;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
  permissions: string[];
};

export type SessionSnapshot = AuthExchangeResponse;

export type Conversation = {
  id: string;
  title?: string | null;
  activeCaseId?: string | null;
  status: string;
  updatedAt: string;
};

export type ConversationMessage = {
  id: string;
  senderType: 'USER' | 'ASSISTANT' | 'SYSTEM';
  contentText: string;
  contentStructuredJson?: Record<string, unknown> | null;
  messageIndex: number;
  createdAt: string;
};

export type CaseRecord = {
  id: string;
  caseCode: string;
  caseType: string;
  statusCode: string;
  priorityCode: string;
  ownerUserId?: string | null;
  requesterUserId: string;
  updatedAt: string;
  contexts?: Array<{
    id: string;
    contextType: string;
    contextKey: string;
    contextValueJson: Record<string, unknown>;
    updatedAt: string;
  }>;
};

export type OrchestratorResponse = {
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  executionMode: 'SUGGEST' | 'CONFIRM_THEN_EXECUTE' | 'AUTO_EXECUTE' | string;
  executionResult: 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'REQUIRES_CONFIRMATION' | string;
  confirmationRequired: boolean;
  confirmationStatus: string;
  confirmationId?: string | null;
  confirmationCode?: string | null;
  payload?: Record<string, unknown> | null;
  blockedReason?: string | null;
  openQuestions?: string[] | null;
};

export type ConfirmationRequest = {
  id: string;
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  status: string;
  confirmationCode?: string;
  requestedPayloadJson: Record<string, unknown>;
  expiresAt: string;
  confirmedAt?: string | null;
  confirmedByUserId?: string | null;
};

export type ToolRegistryItem = {
  id: string;
  toolCode: string;
  toolVersion: string;
  capabilityCode: string;
  toolType: string;
  riskLevel: string;
  executionMode: string;
  certificationStatus: string;
  permissionsRequiredJson: string[];
  requiresProvider: boolean;
  rollbackStrategy: string;
  inputContractRef: string;
  outputContractRef: string;
  updatedAt: string;
};

export type ToolExecutionAttempt = {
  id: string;
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  executionMode: string;
  executionResult: string;
  confirmationStatus: string;
  createdAt: string;
  responsePayloadJson?: Record<string, unknown> | null;
};

export type PositiveAction = {
  id: string;
  capabilityCode: string;
  toolCode: string;
  toolVersion: string;
  createdAt: string;
  caseId?: string | null;
  executionAttemptId: string;
};

export type UiProfile = {
  userId: string;
  tenantId: string;
  displayName: string;
  locale: string;
  timezone: string;
  accessibilityOverrides: Record<string, unknown>;
};

export type TenantUiBaseline = {
  tenantId: string;
  branding: {
    appName: string;
    brandOwner: string;
    logoUrl?: string | null;
    shortMark: string;
    supportContact: string;
    legalFooterText: string;
  };
  themeDefaults: {
    colorThemeMode: string;
    contrastMode: string;
    focusIndicatorMode: string;
    contentDensity: string;
  };
  accessibilityDefaults: {
    fontScale: string;
    lineSpacingMode: string;
    letterSpacingMode: string;
    reducedMotion: string;
    formAssistanceMode: string;
  };
};

export type TenantMember = {
  id: string;
  userId: string;
  status: string;
  user: {
    id: string;
    displayName: string;
    email?: string | null;
  };
  roles?: Array<{ roleCode: string }>;
};
