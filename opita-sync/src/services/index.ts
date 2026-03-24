import { getAppRuntimeConfig } from "../config/app-env";
import type { FailureKey } from "../config/app-env";
import type { OpitaAppServices } from "./contracts";
import { isServiceError } from "./errors";
import { createHttpOpitaAppServices } from "./remote/http-adapter";
import { createStubOpitaAppServices } from "./stub/stub-adapter";

function withFallback(primary: OpitaAppServices, fallback: OpitaAppServices): OpitaAppServices {
  return {
    authService: primary.authService,
    dashboardService: {
      async getDashboard(role) {
        try {
          return await primary.dashboardService.getDashboard(role);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.dashboardService.getDashboard(role);
        }
      }
    },
    caseService: {
      async listCases() {
        try {
          return await primary.caseService.listCases();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.caseService.listCases();
        }
      },
      async getCaseDetail(caseId) {
        try {
          return await primary.caseService.getCaseDetail(caseId);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.caseService.getCaseDetail(caseId);
        }
      }
    },
    chatService: {
      async listConversations(input) {
        try {
          return await primary.chatService.listConversations(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.listConversations(input);
        }
      },
      async createConversation(input) {
        try {
          return await primary.chatService.createConversation(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.createConversation(input);
        }
      },
      async updateConversation(input) {
        try {
          return await primary.chatService.updateConversation(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.updateConversation(input);
        }
      },
      async getConversationMessages(input) {
        try {
          return await primary.chatService.getConversationMessages(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.getConversationMessages(input);
        }
      },
      async sendMessage(input) {
        try {
          return await primary.chatService.sendMessage(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.sendMessage(input);
        }
      },
      async retryLastMessage(input) {
        try {
          return await primary.chatService.retryLastMessage(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.retryLastMessage(input);
        }
      },
      async streamAssistantResponse(input) {
        try {
          return await primary.chatService.streamAssistantResponse(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.streamAssistantResponse(input);
        }
      },
      async cancelRun(input) {
        try {
          return await primary.chatService.cancelRun(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.chatService.cancelRun(input);
        }
      },
      subscribeConversationUpdates(input) {
        return primary.chatService.subscribeConversationUpdates?.(input) ?? fallback.chatService.subscribeConversationUpdates?.(input) ?? (() => {});
      }
    },
    tenantConfigService: {
      async getTenantConfig() {
        try {
          return await primary.tenantConfigService.getTenantConfig();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.tenantConfigService.getTenantConfig();
        }
      },
      async updateParameter(input) {
        try {
          return await primary.tenantConfigService.updateParameter(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.tenantConfigService.updateParameter(input);
        }
      },
      async testAssistantConnection() {
        try {
          return await primary.tenantConfigService.testAssistantConnection();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.tenantConfigService.testAssistantConnection();
        }
      }
    },
    operationalLogService: {
      async listEntries(caseId) {
        try {
          return await primary.operationalLogService.listEntries(caseId);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.operationalLogService.listEntries(caseId);
        }
      },
      async createEntry(input) {
        try {
          return await primary.operationalLogService.createEntry(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.operationalLogService.createEntry(input);
        }
      }
    },
    capabilityService: {
      async listCapabilities() {
        try {
          return await primary.capabilityService.listCapabilities();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.capabilityService.listCapabilities();
        }
      },
      async setCapabilityState(input) {
        try {
          return await primary.capabilityService.setCapabilityState(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.capabilityService.setCapabilityState(input);
        }
      }
    },
    toolGovernanceService: {
      async listTools() {
        try {
          return await primary.toolGovernanceService.listTools();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.toolGovernanceService.listTools();
        }
      }
    },
    draftService: {
      async generateDraft(input) {
        try {
          return await primary.draftService.generateDraft(input);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.draftService.generateDraft(input);
        }
      }
    },
    reportingService: {
      async getValueReport(role) {
        try {
          return await primary.reportingService.getValueReport(role);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.reportingService.getValueReport(role);
        }
      }
    },
    usageService: {
      async getUsageAttribution() {
        try {
          return await primary.usageService.getUsageAttribution();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.usageService.getUsageAttribution();
        }
      },
      async exportBillingUsage() {
        try {
          return await primary.usageService.exportBillingUsage();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.usageService.exportBillingUsage();
        }
      }
    },
    governanceService: {
      async getGlobalState() {
        try {
          return await primary.governanceService.getGlobalState();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.governanceService.getGlobalState();
        }
      },
      async runAction(action) {
        try {
          return await primary.governanceService.runAction(action);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.governanceService.runAction(action);
        }
      }
    },
    complianceService: {
      async getRetentionPolicy() {
        try {
          return await primary.complianceService.getRetentionPolicy();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.complianceService.getRetentionPolicy();
        }
      },
      async getDataReuseConsent() {
        try {
          return await primary.complianceService.getDataReuseConsent();
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.complianceService.getDataReuseConsent();
        }
      },
      async updateDataReuseConsent(enabled) {
        try {
          return await primary.complianceService.updateDataReuseConsent(enabled);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.complianceService.updateDataReuseConsent(enabled);
        }
      }
    },
    navigationService: {
      async getManifest(role) {
        try {
          return await primary.navigationService.getManifest(role);
        } catch (error) {
          if (isServiceError(error) && (error.status === 401 || error.status === 403)) {
            throw error;
          }
          return await fallback.navigationService.getManifest(role);
        }
      }
    }
  };
}

export function createOpitaAppServices(
  overrides?: Partial<{
    fail: FailureKey[];
    failOnce: FailureKey[];
    authFail: Array<`${FailureKey}:unauthorized` | `${FailureKey}:forbidden`>;
    authFailOnce: Array<`${FailureKey}:unauthorized` | `${FailureKey}:forbidden`>;
  }>
): OpitaAppServices {
  const runtime = getAppRuntimeConfig();
  const stub = createStubOpitaAppServices({
    storageKey: runtime.authStorageKey,
    fail: overrides?.fail ?? runtime.fail,
    failOnce: overrides?.failOnce ?? runtime.failOnce,
    authFail: overrides?.authFail ?? runtime.authFail,
    authFailOnce: overrides?.authFailOnce ?? runtime.authFailOnce
  });

  if (runtime.dataSource === "stub") {
    return stub;
  }

  const remote = createHttpOpitaAppServices({
    apiBaseUrl: runtime.apiBaseUrl,
    storageKey: runtime.authStorageKey
  });

  return runtime.enableStubFallback ? withFallback(remote, stub) : remote;
}
