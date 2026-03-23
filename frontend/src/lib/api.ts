import Constants from 'expo-constants';
import type {
  AuthExchangeResponse,
  CaseRecord,
  ConfirmationRequest,
  Conversation,
  ConversationMessage,
  OrchestratorResponse,
  PositiveAction,
  TenantMember,
  TenantUiBaseline,
  ToolExecutionAttempt,
  ToolRegistryItem,
  UiProfile,
} from './types';

const configuredBaseUrl =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  ((Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined)?.apiBaseUrl ?? '');

export const apiBaseUrl = configuredBaseUrl || 'http://localhost:3000/api';

async function request<T>(
  path: string,
  options: RequestInit & { accessToken?: string } = {},
): Promise<T> {
  const headers = new Headers(options.headers ?? {});
  headers.set('Content-Type', 'application/json');
  if (options.accessToken) {
    headers.set('Authorization', `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  exchangeFirebaseToken: (firebaseIdToken: string, inviteToken?: string) =>
    request<AuthExchangeResponse>('/auth/firebase/exchange', {
      method: 'POST',
      body: JSON.stringify({ firebaseIdToken, inviteToken }),
    }),
  getMe: (accessToken: string) =>
    request<{
      userId: string;
      tenantId: string;
      role: string;
      permissions: string[];
    }>('/auth/me', { accessToken }),
  getUiProfile: (accessToken: string) =>
    request<UiProfile>('/auth/me/ui-profile', { accessToken }),
  updateUiProfile: (
    accessToken: string,
    payload: Partial<UiProfile> & { accessibilityOverrides?: Record<string, unknown> },
  ) =>
    request<UiProfile>('/auth/me/ui-profile', {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify(payload),
    }),
  getTenantUiBaseline: (accessToken: string) =>
    request<TenantUiBaseline>('/tenants/current/ui-baseline', { accessToken }),
  updateTenantUiBaseline: (
    accessToken: string,
    payload: Partial<TenantUiBaseline>,
  ) =>
    request<TenantUiBaseline>('/tenants/current/ui-baseline', {
      method: 'PATCH',
      accessToken,
      body: JSON.stringify(payload),
    }),
  listTenantMembers: (accessToken: string) =>
    request<TenantMember[]>('/tenants/current/members', { accessToken }),
  inviteMember: (accessToken: string, email: string, roleCode: string) =>
    request('/tenants/current/members/invite', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ email, roleCode }),
    }),
  listConversations: (accessToken: string) =>
    request<Conversation[]>('/conversations', { accessToken }),
  createConversation: (accessToken: string, title?: string, activeCaseId?: string) =>
    request<Conversation>('/conversations', {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ title, activeCaseId }),
    }),
  getConversation: (accessToken: string, conversationId: string) =>
    request<Conversation>(`/conversations/${conversationId}`, { accessToken }),
  listMessages: (accessToken: string, conversationId: string) =>
    request<ConversationMessage[]>(`/conversations/${conversationId}/messages`, {
      accessToken,
    }),
  appendMessage: (
    accessToken: string,
    conversationId: string,
    payload: {
      senderType: 'USER' | 'ASSISTANT' | 'SYSTEM';
      contentText: string;
      senderRef?: string;
      contentStructuredJson?: Record<string, unknown>;
      isSensitive?: boolean;
    },
  ) =>
    request<ConversationMessage>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify(payload),
    }),
  listCases: (accessToken: string) => request<CaseRecord[]>('/cases', { accessToken }),
  getCase: (accessToken: string, caseId: string) =>
    request<CaseRecord>(`/cases/${caseId}`, { accessToken }),
  executeOrchestrator: (accessToken: string, payload: Record<string, unknown>) =>
    request<OrchestratorResponse>('/orchestrator/execute', {
      method: 'POST',
      accessToken,
      body: JSON.stringify(payload),
    }),
  confirmOrchestrator: (
    accessToken: string,
    confirmationId: string,
    confirmationCode?: string,
  ) =>
    request<OrchestratorResponse>(`/orchestrator/confirm/${confirmationId}`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ confirmationCode }),
    }),
  listConfirmationRequests: (accessToken: string) =>
    request<ConfirmationRequest[]>('/confirmation-requests', { accessToken }),
  confirmConfirmationRequest: (
    accessToken: string,
    confirmationId: string,
    confirmationCode?: string,
  ) =>
    request<ConfirmationRequest>(`/confirmation-requests/${confirmationId}/confirm`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({ confirmationCode }),
    }),
  rejectConfirmationRequest: (accessToken: string, confirmationId: string) =>
    request<ConfirmationRequest>(`/confirmation-requests/${confirmationId}/reject`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({}),
    }),
  listTools: (accessToken: string) => request<ToolRegistryItem[]>('/tools', { accessToken }),
  createTool: (accessToken: string, payload: Record<string, unknown>) =>
    request<ToolRegistryItem>('/tools', {
      method: 'POST',
      accessToken,
      body: JSON.stringify(payload),
    }),
  transitionTool: (accessToken: string, toolId: string, action: string) =>
    request<ToolRegistryItem>(`/tools/${toolId}/${action}`, {
      method: 'POST',
      accessToken,
      body: JSON.stringify({}),
    }),
  listToolExecutions: (accessToken: string) =>
    request<ToolExecutionAttempt[]>('/tool-executions', { accessToken }),
  listPositiveActions: (accessToken: string) =>
    request<PositiveAction[]>('/positive-actions', { accessToken }),
};
