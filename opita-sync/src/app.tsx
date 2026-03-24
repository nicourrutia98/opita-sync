import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Bot, BrainCircuit, CheckCircle2, Cog, Download, Filter, FolderKanban, LoaderCircle, MessageSquareText, Search, SendHorizontal, Settings2, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { AppShell } from "./components/opita/app-shell";
import { AuthShell } from "./components/opita/auth-shell";
import { CaseCard } from "./components/opita/case-card";
import { ChatWorkspace } from "./components/opita/chat/chat-workspace";
import { MetricCard } from "./components/opita/metric-card";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { StateBlock } from "./components/ui/state-block";
import { Textarea } from "./components/ui/textarea";
import { defaultCaseId, roles, type Role, type SessionState, type ThemeMode, type ViewKey } from "./domain/opita";
import { useAsyncResource } from "./hooks/use-async-resource";
import { createOpitaAppServices } from "./services";
import type { OpitaAppServices } from "./services/contracts";
import {
  toAssistantConnectionStatusViewModel,
  toCaseDetailViewModel,
  toCaseSummaryViewModel,
  toDashboardViewModel,
  toDataReuseConsentViewModel,
  toGlobalGovernanceActionViewModel,
  toGlobalGovernanceStateViewModel,
  toNavigationManifestViewModel,
  toRetentionPolicyViewModel,
  toTenantConfigViewModel,
  toUsageAttributionViewModel,
  toValueReportViewModel
} from "./services/view-models";

interface AppProps {
  initialRole?: Role;
  initialView?: ViewKey;
  initialTheme?: ThemeMode;
  services?: OpitaAppServices;
}

type AuthScreen = "signIn" | "requestReset" | "resetPassword";
type SessionBootstrapStatus = "booting" | "ready" | "unauthenticated" | "error";
type ConfigSection = "general" | "frontend" | "backend";

function getResetToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return new URLSearchParams(window.location.search).get("resetToken") ?? "";
}

function getPreferredView(availableViews: ViewKey[], fallback: ViewKey): ViewKey {
  if (!availableViews.length) {
    return fallback;
  }

  if (typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches && availableViews.includes("chat")) {
    return "chat";
  }

  return availableViews.includes(fallback) ? fallback : availableViews[0];
}

function ErrorState({ title, description, onRetry }: { title: string; description: string; onRetry: () => void }) {
  return (
    <div className="space-y-3">
      <StateBlock tone="error" title={title} description={description} />
      <Button variant="secondary" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}

function AuthCard({ title, description, children }: { title?: string; description?: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      {(title || description) && (
        <div className="space-y-2">
          {title ? <CardTitle className="text-xl tracking-[-0.02em]">{title}</CardTitle> : null}
          {description ? <p className="text-sm leading-6 text-muted">{description}</p> : null}
        </div>
      )}
      <CardContent className="space-y-4 px-0 pb-0 pt-0">{children}</CardContent>
    </div>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <section className="rounded-[32px] border border-line/90 bg-panel/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] md:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-subtle md:text-[11px]">{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink md:mt-3 md:text-3xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted md:mt-3 md:text-base">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
    </section>
  );
}

export function DisclosureBlock({
  title,
  summary,
  children,
  defaultOpen = false
}: {
  title: string;
  summary: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details open={defaultOpen || undefined} className="rounded-[28px] border border-line/80 bg-panel/80 p-4">
      <summary className="cursor-pointer list-none">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-1 pr-6 text-sm leading-6 text-muted">{summary}</p>
      </summary>
      <div className="mt-4 space-y-3">{children}</div>
    </details>
  );
}

function ConfigMetric({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-[24px] border border-line/80 bg-surface/85 p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-ink">{value}</p>
      <p className="mt-2 text-sm text-muted">{hint}</p>
    </div>
  );
}

export function App({ initialView = "inicio", initialTheme = "light", services }: AppProps) {
  const [serviceLayer] = useState<OpitaAppServices>(() => services ?? createOpitaAppServices());
  const [theme, setTheme] = useState<ThemeMode>(initialTheme);
  const [view, setView] = useState<ViewKey>(initialView);
  const [query, setQuery] = useState("");
  const [selectedCaseId, setSelectedCaseId] = useState(defaultCaseId);
  const [session, setSession] = useState<SessionState | null>(null);
  const [sessionStatus, setSessionStatus] = useState<SessionBootstrapStatus>("booting");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreen>(getResetToken() ? "resetPassword" : "signIn");
  const [authMessage, setAuthMessage] = useState<{ tone: "warning" | "danger" | "brand"; label: string; detail: string } | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [logType, setLogType] = useState("Avance");
  const [logDetail, setLogDetail] = useState("");
  const [logBefore, setLogBefore] = useState("");
  const [logAfter, setLogAfter] = useState("");
  const [logVisibility, setLogVisibility] = useState<"internal" | "supervisor_only">("internal");
  const [logEvidenceLabel, setLogEvidenceLabel] = useState("");
  const [logBusy, setLogBusy] = useState(false);
  const [logMutationMessage, setLogMutationMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [tenantMutationBusyKey, setTenantMutationBusyKey] = useState<string | null>(null);
  const [tenantMutationMessage, setTenantMutationMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [parameterDrafts, setParameterDrafts] = useState<Record<string, string>>({});
  const [capabilityMutationBusyId, setCapabilityMutationBusyId] = useState<string | null>(null);
  const [capabilityMutationMessage, setCapabilityMutationMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [usageBusy, setUsageBusy] = useState(false);
  const [usageMessage, setUsageMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [governanceBusy, setGovernanceBusy] = useState(false);
  const [governanceMessage, setGovernanceMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [complianceBusy, setComplianceBusy] = useState(false);
  const [complianceMessage, setComplianceMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [assistantConnectionBusy, setAssistantConnectionBusy] = useState(false);
  const [assistantConnectionMessage, setAssistantConnectionMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [configSection, setConfigSection] = useState<ConfigSection>("general");
  const resetToken = useMemo(() => getResetToken(), []);

  const role = session?.bootstrap.role ?? "tecnico";
  const availableViews = session?.bootstrap.allowedViews ?? [];

  const loadSession = useCallback(async () => {
    setSessionStatus("booting");
    setSessionError(null);
    try {
      const restored = await serviceLayer.authService.getSession();
      if (restored) {
        setSession(restored);
        setSessionStatus("ready");
        setView(getPreferredView(restored.bootstrap.allowedViews, initialView));
      } else {
        setSession(null);
        setSessionStatus("unauthenticated");
      }
    } catch (error) {
      setSession(null);
      setSessionStatus("error");
      setSessionError(error instanceof Error ? error.message : "No se pudo validar la sesion.");
    }
  }, [initialView, serviceLayer]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (session && !availableViews.includes(view)) {
      setView(availableViews[0]);
    }
  }, [availableViews, session, view]);

  const loadDashboard = useCallback(() => serviceLayer.dashboardService.getDashboard(role), [role, serviceLayer]);
  const loadCases = useCallback(() => serviceLayer.caseService.listCases(), [serviceLayer]);
  const loadDetail = useCallback(() => serviceLayer.caseService.getCaseDetail(selectedCaseId), [selectedCaseId, serviceLayer]);
  const loadTenantConfig = useCallback(() => serviceLayer.tenantConfigService.getTenantConfig(), [serviceLayer]);
  const loadOperationalLog = useCallback(() => serviceLayer.operationalLogService.listEntries(selectedCaseId), [selectedCaseId, serviceLayer]);
  const loadCapabilities = useCallback(() => serviceLayer.capabilityService.listCapabilities(), [serviceLayer]);
  const loadTools = useCallback(() => serviceLayer.toolGovernanceService.listTools(), [serviceLayer]);
  const loadValueReport = useCallback(() => serviceLayer.reportingService.getValueReport(role), [role, serviceLayer]);
  const loadUsageAttribution = useCallback(() => serviceLayer.usageService.getUsageAttribution(), [serviceLayer]);
  const loadGovernanceState = useCallback(() => serviceLayer.governanceService.getGlobalState(), [serviceLayer]);
  const loadRetentionPolicy = useCallback(() => serviceLayer.complianceService.getRetentionPolicy(), [serviceLayer]);
  const loadDataReuseConsent = useCallback(() => serviceLayer.complianceService.getDataReuseConsent(), [serviceLayer]);
  const loadNavigationManifest = useCallback(() => serviceLayer.navigationService.getManifest(role), [role, serviceLayer]);

  const resourceEnabled = sessionStatus === "ready";
  const dashboardResource = useAsyncResource(loadDashboard, [role], { enabled: resourceEnabled && view === "inicio" });
  const casesResource = useAsyncResource(loadCases, [], { enabled: resourceEnabled && (view === "casos" || view === "detalle") });
  const detailResource = useAsyncResource(loadDetail, [selectedCaseId], { enabled: resourceEnabled && view === "detalle" });
  const tenantConfigResource = useAsyncResource(loadTenantConfig, [], { enabled: resourceEnabled && view === "configuracion" });
  const operationalLogResource = useAsyncResource(loadOperationalLog, [selectedCaseId], { enabled: resourceEnabled && view === "detalle" });
  const capabilitiesResource = useAsyncResource(loadCapabilities, [], { enabled: resourceEnabled && view === "configuracion" });
  const toolsResource = useAsyncResource(loadTools, [], { enabled: resourceEnabled && view === "configuracion" });
  const valueReportResource = useAsyncResource(loadValueReport, [role], { enabled: resourceEnabled && view === "inicio" });
  const usageResource = useAsyncResource(loadUsageAttribution, [], { enabled: resourceEnabled && view === "configuracion" });
  const governanceResource = useAsyncResource(loadGovernanceState, [], { enabled: resourceEnabled && view === "configuracion" });
  const retentionPolicyResource = useAsyncResource(loadRetentionPolicy, [], { enabled: resourceEnabled && view === "configuracion" });
  const dataReuseConsentResource = useAsyncResource(loadDataReuseConsent, [], { enabled: resourceEnabled && view === "configuracion" });
  const navigationManifestResource = useAsyncResource(loadNavigationManifest, [role], { enabled: resourceEnabled && (view === "inicio" || view === "configuracion") });

  const dashboard = dashboardResource.data ? toDashboardViewModel(dashboardResource.data) : null;
  const detail = detailResource.data ? toCaseDetailViewModel(detailResource.data) : null;
  const tenantConfig = tenantConfigResource.data ? toTenantConfigViewModel(tenantConfigResource.data) : null;
  const aiParameters = useMemo(() => tenantConfig?.parameters.filter((item) => item.key.startsWith("ai.")) ?? [], [tenantConfig]);
  const tenantParameters = useMemo(() => tenantConfig?.parameters.filter((item) => !item.key.startsWith("ai.")) ?? [], [tenantConfig]);
  const operationalLog = operationalLogResource.data ?? [];
  const capabilities = capabilitiesResource.data ?? [];
  const tools = toolsResource.data ?? [];
  const valueReport = valueReportResource.data ? toValueReportViewModel(valueReportResource.data) : null;
  const usageAttribution = usageResource.data ? toUsageAttributionViewModel(usageResource.data) : null;
  const governanceState = governanceResource.data ? toGlobalGovernanceStateViewModel(governanceResource.data) : null;
  const retentionPolicy = retentionPolicyResource.data ? toRetentionPolicyViewModel(retentionPolicyResource.data) : null;
  const dataReuseConsent = dataReuseConsentResource.data ? toDataReuseConsentViewModel(dataReuseConsentResource.data) : null;
  const navigationManifest = navigationManifestResource.data ? toNavigationManifestViewModel(navigationManifestResource.data) : null;
  const activeCapabilitiesCount = capabilities.filter((item) => item.enabled).length;
  const certifiedToolsCount = tools.filter((item) => item.certification === "certified").length;
  const highRiskToolsCount = tools.filter((item) => item.riskLevel === "critical" || item.riskLevel === "high").length;
  const configSections: Array<{ id: ConfigSection; label: string; helper: string; icon: typeof Settings2 }> = [
    { id: "general", label: "General", helper: "Ajustes base", icon: Settings2 },
    { id: "frontend", label: "Frontend", helper: "Experiencia y capacidades", icon: Wrench },
    { id: "backend", label: "Backend", helper: "Asistente, consumo y control", icon: ShieldAlert }
  ];

  useEffect(() => {
    if (!tenantConfig) {
      return;
    }
    const nextDrafts = Object.fromEntries(tenantConfig.parameters.map((item) => [item.key, item.value]));
    setParameterDrafts(nextDrafts);
  }, [tenantConfig]);

  const filteredCases = useMemo(() => {
    const base = (casesResource.data ?? []).map(toCaseSummaryViewModel);
    if (!query) {
      return base;
    }
    return base.filter((item) => `${item.title} ${item.id} ${item.site}`.toLowerCase().includes(query.toLowerCase()));
  }, [casesResource.data, query]);

  const handleUnauthorized = useCallback(async () => {
    await serviceLayer.authService.signOut();
    setSession(null);
    setSessionStatus("unauthenticated");
    setAuthScreen("signIn");
    setPassword("");
    setAuthMessage({
      tone: "warning",
      label: "Sesion expirada",
      detail: "Tu sesion caduco o fue invalidada. Inicia sesion nuevamente para continuar."
    });
  }, [serviceLayer]);

  useEffect(() => {
    const resources = [
      dashboardResource,
      casesResource,
      detailResource,
      tenantConfigResource,
      operationalLogResource,
      capabilitiesResource,
      toolsResource,
      valueReportResource,
      usageResource,
      governanceResource,
      retentionPolicyResource,
      dataReuseConsentResource,
      navigationManifestResource
    ];
    if (resources.some((resource) => resource.errorStatus === 401)) {
      void handleUnauthorized();
    }
  }, [
    dashboardResource.errorStatus,
    casesResource.errorStatus,
    detailResource.errorStatus,
    handleUnauthorized,
    tenantConfigResource.errorStatus,
    operationalLogResource.errorStatus,
    capabilitiesResource.errorStatus,
    toolsResource.errorStatus,
    valueReportResource.errorStatus,
    usageResource.errorStatus,
    governanceResource.errorStatus,
    retentionPolicyResource.errorStatus,
    dataReuseConsentResource.errorStatus,
    navigationManifestResource.errorStatus
  ]);

  const signIn = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthBusy(true);
      setAuthMessage(null);
      try {
        const nextSession = await serviceLayer.authService.signIn(email.trim(), password);
        setSession(nextSession);
        setSessionStatus("ready");
        setView(getPreferredView(nextSession.bootstrap.allowedViews, initialView));
        setPassword("");
      } catch (error) {
        setAuthMessage({
          tone: "danger",
          label: "No pudimos iniciar sesion",
          detail: error instanceof Error ? error.message : "Ocurrio un error con tus credenciales."
        });
      } finally {
        setAuthBusy(false);
      }
    },
    [email, initialView, password, serviceLayer]
  );

  const requestReset = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthBusy(true);
      setAuthMessage(null);
      try {
        const result = await serviceLayer.authService.requestPasswordReset(resetEmail.trim());
        setAuthMessage({
          tone: "brand",
          label: "Recuperacion solicitada",
          detail: `Si el correo existe, enviaremos un enlace de recuperacion a ${result.email}.`
        });
      } catch (error) {
        setAuthMessage({
          tone: "danger",
          label: "No pudimos solicitar el reset",
          detail: error instanceof Error ? error.message : "Ocurrio un error solicitando el restablecimiento."
        });
      } finally {
        setAuthBusy(false);
      }
    },
    [resetEmail, serviceLayer]
  );

  const confirmReset = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthBusy(true);
      setAuthMessage(null);
      try {
        await serviceLayer.authService.resetPassword(resetToken, newPassword);
        setAuthScreen("signIn");
        setNewPassword("");
        setAuthMessage({
          tone: "brand",
          label: "Contrasena actualizada",
          detail: "Tu nueva contrasena ya fue registrada. Inicia sesion con tus credenciales vigentes."
        });
      } catch (error) {
        setAuthMessage({
          tone: "danger",
          label: "No pudimos restablecer la contrasena",
          detail: error instanceof Error ? error.message : "Ocurrio un error actualizando la contrasena."
        });
      } finally {
        setAuthBusy(false);
      }
    },
    [newPassword, resetToken, serviceLayer]
  );

  const registerOperationalLog = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLogMutationMessage(null);
      setLogBusy(true);
      try {
        const result = await serviceLayer.operationalLogService.createEntry({
          caseId: selectedCaseId,
          type: logType.trim() || "Avance",
          detail: logDetail.trim(),
          visibility: logVisibility,
          before: logBefore.trim() || undefined,
          after: logAfter.trim() || undefined,
          evidenceLabel: logEvidenceLabel.trim() || undefined
        });
        setLogDetail("");
        setLogBefore("");
        setLogAfter("");
        setLogEvidenceLabel("");
        setLogMutationMessage({
          tone: "success",
          detail: `Entrada registrada con auditoria ${result.auditId}.`
        });
        operationalLogResource.retry();
      } catch (error) {
        setLogMutationMessage({
          tone: "error",
          detail: error instanceof Error ? error.message : "No se pudo registrar la entrada de bitacora."
        });
      } finally {
        setLogBusy(false);
      }
    },
    [logAfter, logBefore, logDetail, logEvidenceLabel, logType, logVisibility, operationalLogResource, selectedCaseId, serviceLayer]
  );

  const updateTenantParameter = useCallback(
    async (key: string) => {
      if (!tenantConfig) {
        return;
      }
      const current = tenantConfig.parameters.find((item) => item.key === key);
      if (!current) {
        return;
      }
      const nextValue = parameterDrafts[key] ?? current.value;
      setTenantMutationBusyKey(key);
      setTenantMutationMessage(null);
      try {
        const result = await serviceLayer.tenantConfigService.updateParameter({ key, value: nextValue.trim() });
        setTenantMutationMessage({
          tone: "success",
          detail: `Cambio actualizado. Auditoria ${result.auditId}.`
        });
        tenantConfigResource.retry();
      } catch (error) {
        setTenantMutationMessage({
          tone: "error",
          detail: error instanceof Error ? error.message : "No se pudo actualizar este ajuste."
        });
      } finally {
        setTenantMutationBusyKey(null);
      }
    },
    [parameterDrafts, serviceLayer, tenantConfig, tenantConfigResource]
  );

  const toggleCapability = useCallback(
    async (capabilityId: string, enabled: boolean) => {
      setCapabilityMutationBusyId(capabilityId);
      setCapabilityMutationMessage(null);
      try {
        const result = await serviceLayer.capabilityService.setCapabilityState({ capabilityId, enabled });
        setCapabilityMutationMessage({
          tone: "success",
          detail: `Cambio aplicado. Auditoria ${result.auditId}.`
        });
        capabilitiesResource.retry();
      } catch (error) {
        setCapabilityMutationMessage({
          tone: "error",
          detail: error instanceof Error ? error.message : "No se pudo cambiar el estado de la capacidad."
        });
      } finally {
        setCapabilityMutationBusyId(null);
      }
    },
    [capabilitiesResource, serviceLayer]
  );

  const exportUsageForBilling = useCallback(async () => {
    setUsageBusy(true);
    setUsageMessage(null);
    try {
      const result = await serviceLayer.usageService.exportBillingUsage();
      setUsageMessage({
        tone: "success",
        detail: `Export ${result.exportId} generado con ${result.rows} filas (${result.generatedAt}).`
      });
      usageResource.retry();
    } catch (error) {
      setUsageMessage({
        tone: "error",
        detail: error instanceof Error ? error.message : "No se pudo exportar el consumo de billing."
      });
    } finally {
      setUsageBusy(false);
    }
  }, [serviceLayer, usageResource]);

  const testAssistantConnection = useCallback(async () => {
    setAssistantConnectionBusy(true);
    setAssistantConnectionMessage(null);
    try {
      const result = toAssistantConnectionStatusViewModel(await serviceLayer.tenantConfigService.testAssistantConnection());
      setAssistantConnectionMessage({
        tone: result.ok ? "success" : "error",
        detail: `${result.detail} (${result.provider} / ${result.model})`
      });
    } catch (error) {
      setAssistantConnectionMessage({
        tone: "error",
        detail: error instanceof Error ? error.message : "No se pudo validar la conexion del asistente."
      });
    } finally {
      setAssistantConnectionBusy(false);
    }
  }, [serviceLayer]);

  const runGovernanceAction = useCallback(
    async (action: "approve_capability" | "deploy_release" | "rollback_release") => {
      setGovernanceBusy(true);
      setGovernanceMessage(null);
      try {
        const result = await serviceLayer.governanceService.runAction(action);
        const mapped = toGlobalGovernanceActionViewModel(result);
        setGovernanceMessage({
          tone: mapped.status === "success" ? "success" : "error",
          detail: `${mapped.detail} · Audit ${mapped.auditId}`
        });
        governanceResource.retry();
      } catch (error) {
        setGovernanceMessage({
          tone: "error",
          detail: error instanceof Error ? error.message : "No se pudo ejecutar la accion de gobernanza."
        });
      } finally {
        setGovernanceBusy(false);
      }
    },
    [governanceResource, serviceLayer]
  );

  const toggleDataReuseConsent = useCallback(async () => {
    if (!dataReuseConsent) {
      return;
    }
    setComplianceBusy(true);
    setComplianceMessage(null);
    try {
      const result = await serviceLayer.complianceService.updateDataReuseConsent(!dataReuseConsent.enabled);
      const mapped = toDataReuseConsentViewModel(result);
      setComplianceMessage({
        tone: "success",
        detail: `Consentimiento actualizado: ${mapped.enabled ? "activo" : "inactivo"} · Audit ${mapped.auditId}`
      });
      dataReuseConsentResource.retry();
    } catch (error) {
      setComplianceMessage({
        tone: "error",
        detail: error instanceof Error ? error.message : "No se pudo actualizar el consentimiento."
      });
    } finally {
      setComplianceBusy(false);
    }
  }, [dataReuseConsent, dataReuseConsentResource, serviceLayer]);

  const signOut = useCallback(async () => {
    await serviceLayer.authService.signOut();
    setSession(null);
    setSessionStatus("unauthenticated");
    setAuthScreen("signIn");
    setAuthMessage(null);
    setView("inicio");
  }, [serviceLayer]);

  if (sessionStatus === "booting") {
    return (
      <AuthShell
        theme={theme}
        title="Conectando tu sesion operativa"
        description="Estamos preparando tu acceso y el contenido disponible antes de abrir el espacio de trabajo."
      >
        <StateBlock tone="loading" title="Cargando sesion" description="Recuperando tu acceso y preparando el contexto inicial." />
      </AuthShell>
    );
  }

  if (sessionStatus === "error") {
    return (
      <AuthShell
        theme={theme}
        title="No pudimos validar la sesion"
        description="Hubo un problema al abrir tu acceso. Puedes reintentar sin salir de esta pantalla."
        status={sessionError ? { tone: "danger", label: "Acceso no disponible", detail: sessionError } : null}
      >
        <AuthCard title="Reintentar acceso" description="Cuando la conexion vuelva a estar disponible podras continuar normalmente.">
          <ErrorState title="Acceso no disponible" description={sessionError ?? "No se pudo validar la sesion actual."} onRetry={() => void loadSession()} />
        </AuthCard>
      </AuthShell>
    );
  }

  if (!session) {
    return (
      <AuthShell
        theme={theme}
        title={
          authScreen === "requestReset"
            ? "Recupera tu acceso"
            : authScreen === "resetPassword"
              ? "Restablece tu contraseña"
              : "Iniciar sesión"
        }
        description={
          authScreen === "requestReset"
            ? "Ingresa tu correo corporativo y te enviaremos las instrucciones para restablecer tu contraseña."
            : authScreen === "resetPassword"
              ? "Define una nueva contraseña para volver a ingresar de forma segura."
              : "Accede a Opita Sync con tus credenciales corporativas."
        }
        status={authMessage}
      >
        {authScreen === "signIn" && (
          <AuthCard>
            <form className="space-y-5" onSubmit={signIn}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="sign-in-email">
                  Correo corporativo
                </label>
                <Input
                  id="sign-in-email"
                  className="h-14 rounded-[20px] bg-white/90 px-4 text-[15px]"
                  type="email"
                  placeholder="correo@empresa.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="sign-in-password">
                  Contraseña
                </label>
                <Input
                  id="sign-in-password"
                  className="h-14 rounded-[20px] bg-white/90 px-4 text-[15px]"
                  type="password"
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
              <Button type="submit" className="h-14 w-full rounded-[20px] text-[15px]" disabled={authBusy}>
                {authBusy ? "Iniciando sesión..." : "Iniciar sesión"}
              </Button>
            </form>
            <div className="space-y-2 pt-1">
              <Button variant="ghost" type="button" className="h-11 w-full justify-center rounded-[18px] text-sm" onClick={() => setAuthScreen("requestReset")}>
                Olvidé mi contraseña
              </Button>
              {resetToken && (
                <Button variant="ghost" type="button" className="h-11 w-full justify-center rounded-[18px] text-sm" onClick={() => setAuthScreen("resetPassword")}>
                  Tengo código de acceso
                </Button>
              )}
            </div>
          </AuthCard>
        )}

        {authScreen === "requestReset" && (
          <AuthCard>
            <form className="space-y-5" onSubmit={requestReset}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-ink" htmlFor="reset-email">
                  Correo corporativo
                </label>
                <Input
                  id="reset-email"
                  className="h-14 rounded-[20px] bg-white/90 px-4 text-[15px]"
                  type="email"
                  placeholder="correo@empresa.com"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                />
              </div>
              <Button type="submit" className="h-14 w-full rounded-[20px] text-[15px]" disabled={authBusy}>
                {authBusy ? "Solicitando..." : "Enviar enlace"}
              </Button>
            </form>
            <Button variant="ghost" type="button" className="h-11 w-full justify-center rounded-[18px] text-sm" onClick={() => setAuthScreen("signIn")}>
              Volver a iniciar sesión
            </Button>
          </AuthCard>
        )}

        {authScreen === "resetPassword" && (
          <AuthCard>
            {!resetToken ? (
              <StateBlock tone="error" title="Falta el código de acceso" description="Agrega `?resetToken=...` a la URL para completar este flujo." />
            ) : (
              <form className="space-y-5" onSubmit={confirmReset}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink" htmlFor="reset-token">
                    Código de acceso
                  </label>
                  <Input id="reset-token" className="h-14 rounded-[20px] bg-white/80 px-4 text-[15px]" value={resetToken} readOnly aria-label="Código de acceso" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-ink" htmlFor="new-password">
                    Contraseña
                  </label>
                  <Input
                    id="new-password"
                    className="h-14 rounded-[20px] bg-white/90 px-4 text-[15px]"
                    type="password"
                    placeholder="Define tu nueva contraseña"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                  />
                </div>
                <Button type="submit" className="h-14 w-full rounded-[20px] text-[15px]" disabled={authBusy}>
                  {authBusy ? "Actualizando..." : "Actualizar contraseña"}
                </Button>
              </form>
            )}
            <Button variant="ghost" type="button" className="h-11 w-full justify-center rounded-[18px] text-sm" onClick={() => setAuthScreen("signIn")}>
              Volver a iniciar sesión
            </Button>
          </AuthCard>
        )}
      </AuthShell>
    );
  }

  return (
    <AppShell
      role={role}
      view={view}
      theme={theme}
      availableViews={availableViews}
      roles={roles}
      userName={session.bootstrap.user.fullName}
      showRoleSwitcher={false}
      onRoleChange={() => {}}
      onViewChange={setView}
      onThemeChange={setTheme}
      onSignOut={() => void signOut()}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-5">
        {view === "inicio" && (
          <section className="space-y-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
            {dashboardResource.status === "loading" && <StateBlock tone="loading" title="Cargando inicio" description="Estamos reuniendo contexto, metricas y prioridades segun tu perfil." />}
            {dashboardResource.status === "error" && (
              <ErrorState title={dashboardResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar el home"} description={dashboardResource.error ?? "Ocurrio un error cargando la bandeja principal."} onRetry={dashboardResource.retry} />
            )}
            {dashboardResource.status === "ready" && dashboard && (
              <>
                <div className="md:hidden">
                  <PageIntro
                    eyebrow={role === "supervisor" ? "Decision y supervision" : role === "admin" ? "Control y configuracion" : "Trabajo del turno"}
                    title={
                      role === "supervisor"
                        ? "Resuelve bloqueos y aprobaciones sin perder continuidad."
                        : role === "admin"
                          ? "Organiza tu espacio con menos friccion y mas criterio."
                          : "Empieza por lo importante y entra al caso correcto mas rapido."
                    }
                    description={
                      role === "supervisor"
                        ? "La vista prioriza decisiones pendientes, riesgos y accesos directos. El contexto secundario queda disponible sin competir con la accion principal."
                        : role === "admin"
                          ? "Configuracion, gobierno y reporting se ordenan por intencion operativa, no por acumulacion de paneles."
                          : "La superficie de inicio se limpia para que el siguiente paso, la cola activa y los bloqueos sean visibles de inmediato."
                    }
                    actions={
                      <>
                        <Button size="sm" className="flex-1 sm:flex-none" onClick={() => setView(role === "admin" ? "configuracion" : "casos")}>
                          {role === "admin" ? "Abrir control" : "Abrir trabajo"}
                        </Button>
                        <Button size="sm" className="flex-1 sm:flex-none" variant="secondary" onClick={() => setView("chat")}>
                          Ir a chat
                        </Button>
                      </>
                    }
                  />
                </div>

                <div className="hidden rounded-[28px] border border-line/90 bg-panel/95 p-4 shadow-[0_12px_26px_rgba(15,23,42,0.05)] md:block">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Resumen general</p>
                      <p className="mt-2 text-lg font-semibold text-ink">Contexto operativo real del espacio</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setView("chat")}>
                        Abrir chat
                      </Button>
                      <Button size="sm" onClick={() => setView(role === "admin" ? "configuracion" : "casos")}>
                        {role === "admin" ? "Abrir control" : "Abrir trabajo"}
                      </Button>
                    </div>
                  </div>
                </div>

                <section className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
                  {dashboard.metrics.map((item) => (
                    <div key={item.label} className="min-w-[240px] flex-1 sm:min-w-0">
                      <MetricCard {...item} />
                    </div>
                  ))}
                </section>

                {role === "supervisor" ? (
                  <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                      <CardHeader>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Supervisor workspace</p>
                          <CardTitle className="mt-2">Triage de decisiones</CardTitle>
                        </div>
                        <Badge tone="warning">Alta prioridad</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {dashboard.supervisorQueue.map((item) => (
                          <div key={item.title} className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-ink">{item.title}</p>
                                <p className="mt-1">{item.detail}</p>
                              </div>
                              <Badge tone={item.tone}>{item.tone === "danger" ? "Riesgo alto" : item.tone === "warning" ? "Pendiente" : "Listo"}</Badge>
                            </div>
                          </div>
                        ))}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button
                            className="w-full"
                            onClick={() => {
                              setSelectedCaseId(defaultCaseId);
                              setView("detalle");
                            }}
                          >
                            Abrir caso bloqueado
                          </Button>
                          <Button variant="secondary" className="w-full" onClick={() => setView("chat")}>
                            Revisar borrador sensible
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid gap-5">
                      <DisclosureBlock title="Senales operativas" summary="Solo se mantienen visibles cuando afectan una aprobacion, un bloqueo o una escalacion." defaultOpen>
                        <div className="space-y-3">
                          {dashboard.supervisorSignals.map((item) => (
                            <div key={item} className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                              {item}
                            </div>
                          ))}
                        </div>
                      </DisclosureBlock>

                      <DisclosureBlock title="Lenguaje visual" summary="Guia breve para mantener la nueva superficie supervisor limpia y consistente.">
                        <div className="space-y-3 text-sm text-muted">
                          <p>El lockup horizontal vive en header y superficies de sistema. El mark compacto queda para switchers, favicon y huellas de app.</p>
                          <p>El patron de grid no entra como fondo de formularios o listas. Se reserva para identidad y estados vacios de marca.</p>
                          <p>Claro y oscuro comparten la misma semantica; cambian solo contraste, fondos y variante de logo.</p>
                        </div>
                      </DisclosureBlock>
                    </div>
                  </section>
                ) : (
                  <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card>
                      <CardHeader>
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Bandeja operativa</p>
                          <CardTitle className="mt-2">Siguiente paso recomendado</CardTitle>
                        </div>
                        <Badge tone="warning">Foco actual</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {dashboard.inbox.map((item) => (
                          <div key={item} className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                            {item}
                          </div>
                        ))}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Button className="w-full" onClick={() => setView("chat")}>
                            Abrir chat operativo
                          </Button>
                          <Button variant="secondary" className="w-full" onClick={() => setView("casos")}>
                            Revisar cola de casos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <DisclosureBlock title="Base de experiencia" summary="La app prioriza continuidad entre trabajo, caso y decision. La informacion secundaria queda detras de capas mas ligeras.">
                      <div className="space-y-3 text-sm text-muted">
                        <p>La vista resume solo estados reales del espacio activo.</p>
                        <p>El chat pasa a ser la superficie principal en web y las demas acciones viven como contexto auxiliar.</p>
                        <p>La navegacion prioriza continuidad sin desplazar toda la pagina.</p>
                      </div>
                    </DisclosureBlock>
                  </section>
                )}

                <section>
                  <Card>
                    <CardHeader>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Reporting de valor</p>
                        <CardTitle className="mt-2">Adopcion y mejora operacional</CardTitle>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {valueReportResource.status === "loading" && <StateBlock tone="loading" title="Cargando valor y adopcion" description="Reconstruyendo metricas por capacidad y periodo." />}
                      {valueReportResource.status === "error" && (
                        <ErrorState
                          title={valueReportResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar el reporte"}
                          description={valueReportResource.error ?? "No fue posible consultar el reporte de valor."}
                          onRetry={valueReportResource.retry}
                        />
                      )}
                      {valueReportResource.status === "empty" && <StateBlock tone="empty" title="Sin metricas disponibles" description="No hay datos de adopcion para el periodo activo." />}
                      {valueReportResource.status === "ready" && valueReport && (
                        <div className="space-y-3">
                          <p className="text-xs uppercase tracking-[0.15em] text-subtle">Periodo: {valueReport.periodLabel}</p>
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {valueReport.metrics.map((metric) => (
                              <div key={metric.id} className="rounded-3xl border border-line bg-surface p-4">
                                <p className="text-sm font-semibold text-ink">{metric.label}</p>
                                <p className="mt-2 text-2xl font-semibold text-brand-strong">{metric.value}</p>
                                <p className="mt-1 text-xs uppercase tracking-[0.12em] text-subtle">{metric.trend}</p>
                                <p className="mt-2 text-sm text-muted">{metric.positiveImpact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                <section>
                  <DisclosureBlock title="Navegacion por perfil" summary="La estructura de vistas sigue disponible, pero se muestra como referencia secundaria para no competir con el trabajo actual.">
                    <div className="space-y-3 text-sm text-muted">
                      {navigationManifestResource.status === "loading" && <StateBlock tone="loading" title="Cargando navegacion" description="Resolviendo vistas principales y de gestion segun tu perfil." />}
                      {navigationManifestResource.status === "error" && (
                        <ErrorState
                          title={navigationManifestResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar navegacion"}
                          description={navigationManifestResource.error ?? "No fue posible consultar el manifiesto de navegacion."}
                          onRetry={navigationManifestResource.retry}
                        />
                      )}
                      {navigationManifestResource.status === "ready" && navigationManifest && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-3xl border border-line bg-surface p-4">
                            <p className="font-semibold text-ink">Vistas primarias</p>
                            <p className="mt-2">{navigationManifest.primaryViews.join(", ")}</p>
                          </div>
                          <div className="rounded-3xl border border-line bg-surface p-4">
                            <p className="font-semibold text-ink">Vistas backoffice</p>
                            <p className="mt-2">{navigationManifest.backofficeViews.length ? navigationManifest.backofficeViews.join(", ") : "Sin vistas adicionales para este perfil."}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </DisclosureBlock>
                </section>
              </>
            )}
          </section>
        )}

        {view === "chat" && (
          <ChatWorkspace services={serviceLayer} selectedCaseId={selectedCaseId} />
        )}

        {view === "casos" && (
          <section className="space-y-5 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
            <PageIntro
              eyebrow="Casos y solicitudes"
              title="Una cola mas limpia para decidir mas rapido."
              description="La lista reduce metadatos visibles y prioriza el titulo, el estado, el responsable y el acceso inmediato al detalle."
            />
            <Card>
              <CardHeader>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Cola de trabajo</p>
                  <CardTitle className="mt-2">Casos activos y continuidad</CardTitle>
                </div>
                <FolderKanban className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input placeholder="Buscar por caso, sitio o descripcion" value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>

                {casesResource.status === "loading" && <StateBlock tone="loading" title="Cargando cola de casos" description="Se esta reconstruyendo la vista con filtros, permisos y contexto disponible." />}
                {casesResource.status === "error" && (
                  <ErrorState title={casesResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar la cola"} description={casesResource.error ?? "La consulta de casos fallo."} onRetry={casesResource.retry} />
                )}
                {casesResource.status === "empty" && <StateBlock tone="empty" title="No hay casos disponibles" description="La lista esta vacia por ahora." />}

                {casesResource.status === "ready" && (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {filteredCases.map((item) => (
                      <CaseCard
                        key={item.id}
                        item={item}
                        onOpen={() => {
                          setSelectedCaseId(item.id);
                          setView("detalle");
                        }}
                      />
                    ))}
                    {!filteredCases.length && <StateBlock tone="empty" title="Sin resultados" description="No encontramos casos para esa busqueda. Ajusta terminos o limpia el filtro." className="lg:col-span-2" />}
                  </div>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {view === "detalle" && (
          <section className="space-y-5 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
            <PageIntro
              eyebrow="Detalle de caso"
              title="El caso como centro de continuidad."
              description="Resumen, accion actual y registro gobernado viven en una misma superficie. La auditoria profunda y el before/after se consultan sin saturar la vista inicial."
              actions={
                <>
                  <Button>Registrar avance y generar borrador</Button>
                  <Button variant="secondary">Escalar a supervisor</Button>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
            {detailResource.status === "loading" && (
              <div className="xl:col-span-2">
                <StateBlock tone="loading" title="Cargando detalle del caso" description="Estamos reuniendo resumen, bitacora y acciones disponibles." />
              </div>
            )}
            {detailResource.status === "error" && (
              <div className="xl:col-span-2">
                <ErrorState title={detailResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar el detalle"} description={detailResource.error ?? "El detalle del caso no esta disponible."} onRetry={detailResource.retry} />
              </div>
            )}
            {detailResource.status === "ready" && detail && (
              <>
                <Card>
                  <CardHeader>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">{detail.id}</p>
                      <CardTitle className="mt-2">{detail.title}</CardTitle>
                      <p className="mt-2 text-sm text-muted">{detail.site}</p>
                    </div>
                    <Badge tone="warning">{detail.status}</Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[24px] bg-surface/80 p-4 text-sm">
                        <p className="text-muted">Responsable</p>
                        <p className="mt-1 font-semibold text-ink">{detail.owner}</p>
                      </div>
                      <div className="rounded-[24px] bg-surface/80 p-4 text-sm">
                        <p className="text-muted">Prioridad</p>
                        <p className="mt-1 font-semibold text-ink">{detail.priority}</p>
                      </div>
                      <div className="rounded-[24px] bg-surface/80 p-4 text-sm">
                        <p className="text-muted">Actualizado</p>
                        <p className="mt-1 font-semibold text-ink">{detail.updatedAt}</p>
                      </div>
                    </div>
                    <div className="rounded-panel border border-line bg-panel p-4">
                      <p className="text-sm text-muted">{detail.summary}</p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-subtle">Resumen operativo</h3>
                      {detail.timeline.map((entry) => (
                        <div key={`${entry.time}-${entry.type}`} className="flex gap-3 rounded-[24px] border border-line/80 bg-panel p-4 text-sm">
                          <div className="w-12 shrink-0 font-semibold text-brand-strong">{entry.time}</div>
                          <div>
                            <p className="font-semibold text-ink">{entry.type}</p>
                            <p className="mt-1 text-muted">{entry.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <DisclosureBlock title="Bitacora gobernada" summary="La vista inicial prioriza lectura rapida. El detalle before/after y la trazabilidad completa se abren cuando hacen falta.">
                      {operationalLogResource.status === "loading" && <StateBlock tone="loading" title="Cargando bitacora conectada" description="Validando entradas, evidencias y before/after por caso." />}
                      {operationalLogResource.status === "error" && (
                        <ErrorState
                          title={operationalLogResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar la bitacora"}
                          description={operationalLogResource.error ?? "No fue posible consultar la bitacora operativa."}
                          onRetry={operationalLogResource.retry}
                        />
                      )}
                      {operationalLogResource.status === "empty" && <StateBlock tone="empty" title="Sin entradas conectadas" description="Este caso aun no tiene eventos registrados en la bitacora." />}
                      {operationalLogResource.status === "ready" &&
                        operationalLog.map((entry) => (
                          <div key={entry.id} className="rounded-[24px] border border-line/80 bg-panel p-4 text-sm text-muted">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-ink">{entry.type}</p>
                              <Badge tone={entry.visibility === "supervisor_only" ? "warning" : "brand"}>{entry.visibility === "supervisor_only" ? "Supervisor" : "Interno"}</Badge>
                            </div>
                            <p className="mt-2">{entry.detail}</p>
                            {(entry.before || entry.after) && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                <div className="rounded-2xl bg-surface p-3">
                                  <p className="text-xs uppercase tracking-[0.15em] text-subtle">Before</p>
                                  <p className="mt-1 text-ink">{entry.before ?? "Sin registro"}</p>
                                </div>
                                <div className="rounded-2xl bg-surface p-3">
                                  <p className="text-xs uppercase tracking-[0.15em] text-subtle">After</p>
                                  <p className="mt-1 text-ink">{entry.after ?? "Sin registro"}</p>
                                </div>
                              </div>
                            )}
                            <p className="mt-3 text-xs uppercase tracking-[0.12em] text-subtle">
                              {entry.createdAt} · {entry.author} · Audit {entry.auditId}
                            </p>
                          </div>
                        ))}
                    </DisclosureBlock>
                  </CardContent>
                </Card>

                <Card className={configSection === "general" ? "" : "hidden"}>
                  <CardHeader>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Accion actual</p>
                      <CardTitle className="mt-2">Siguiente paso sugerido</CardTitle>
                    </div>
                    <Bot className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-[28px] bg-brand p-4 text-sm text-white">
                      La accion sugerida es <strong>{detail.suggestedAction}</strong>. Se requiere confirmacion del tecnico.
                    </div>
                    <DisclosureBlock title="Registrar en bitacora" summary="La captura de avance queda disponible como accion secundaria, sin robar protagonismo al caso.">
                      {logMutationMessage && (
                        <StateBlock
                          tone={logMutationMessage.tone === "success" ? "success" : "error"}
                          title={logMutationMessage.tone === "success" ? "Entrada registrada" : "No se pudo guardar"}
                          description={logMutationMessage.detail}
                        />
                      )}
                      <form className="space-y-3" onSubmit={registerOperationalLog}>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input value={logType} onChange={(event) => setLogType(event.target.value)} placeholder="Tipo de evento" />
                          <select
                            className="h-11 rounded-2xl border border-line bg-surface px-3 text-sm text-ink"
                            value={logVisibility}
                            onChange={(event) => setLogVisibility(event.target.value as "internal" | "supervisor_only")}
                          >
                            <option value="internal">Visibilidad interna</option>
                            <option value="supervisor_only">Solo supervisor</option>
                          </select>
                        </div>
                        <Textarea value={logDetail} onChange={(event) => setLogDetail(event.target.value)} placeholder="Detalle del avance o evento operativo" />
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Input value={logBefore} onChange={(event) => setLogBefore(event.target.value)} placeholder="Before (opcional)" />
                          <Input value={logAfter} onChange={(event) => setLogAfter(event.target.value)} placeholder="After (opcional)" />
                        </div>
                        <Input value={logEvidenceLabel} onChange={(event) => setLogEvidenceLabel(event.target.value)} placeholder="Evidencia (opcional)" />
                        <Button type="submit" className="w-full" disabled={logBusy || !logDetail.trim()}>
                          {logBusy ? "Registrando..." : "Guardar entrada auditada"}
                        </Button>
                      </form>
                    </DisclosureBlock>
                    <Button variant="ghost" className="w-full">
                      Abrir trail de auditoria
                    </Button>
                  </CardContent>
                </Card>
              </>
            )}
            </div>
          </section>
        )}

        {view === "configuracion" && (
          <section className="space-y-5 md:min-h-0 md:flex-1 md:overflow-y-auto md:pr-1">
            <PageIntro
              eyebrow="Configuracion"
              title="Un espacio de control mas claro y consistente."
              description="La vista se organiza por tareas concretas: ajustes generales, asistente, herramientas y control. Todo queda visible con mejor jerarquia y menos ruido."
            />
            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.85fr]">
              {tenantConfigResource.status === "ready" && tenantConfig && (
                <>
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b border-line/80 pb-5">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Resumen ejecutivo</p>
                        <CardTitle className="mt-2">Estado diario del espacio</CardTitle>
                        <p className="mt-2 text-sm text-muted">Solo se muestran las señales utiles para decidir hoy.</p>
                      </div>
                      <Settings2 className="h-5 w-5 text-muted" />
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid gap-3 md:grid-cols-3">
                        <ConfigMetric label="Ajustes editables" value={String(tenantParameters.filter((item) => item.editable).length)} hint="Campos listos para actualizar" />
                        <ConfigMetric label="Asistente" value={aiParameters.length ? "Conectable" : "Pendiente"} hint={aiParameters.length ? "Datos listos para completar" : "Faltan datos base"} />
                        <ConfigMetric label="Alertas" value={String(tenantConfig.risks.length)} hint={tenantConfig.risks.length ? "Requieren revision" : "Sin alertas visibles"} />
                      </div>
                      <div className="rounded-[26px] border border-line/80 bg-surface/80 p-2">
                        <div className="grid gap-2 md:grid-cols-3">
                          {configSections.map((item) => {
                            const Icon = item.icon;
                            const active = configSection === item.id;
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => setConfigSection(item.id)}
                                className={active ? "rounded-[20px] bg-ink px-4 py-3 text-left text-panel shadow-[0_16px_34px_rgba(15,23,42,0.18)]" : "rounded-[20px] px-4 py-3 text-left text-muted transition hover:bg-panel"}
                              >
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <p className="text-sm font-semibold">{item.label}</p>
                                </div>
                                <p className={active ? "mt-1 text-xs text-panel/75" : "mt-1 text-xs text-subtle"}>{item.helper}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hidden">
                    <CardHeader>
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">Atencion</p>
                        <CardTitle className="mt-2">Puntos a vigilar</CardTitle>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {tenantConfig.risks.length ? (
                        tenantConfig.risks.map((item) => (
                          <div key={item} className="rounded-[22px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                            {item}
                          </div>
                        ))
                      ) : (
                        <StateBlock tone="success" title="Sin alertas activas" description="No hay advertencias visibles para este espacio en este momento." />
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
            <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            {tenantConfigResource.status === "loading" && (
              <div className="xl:col-span-2">
                <StateBlock tone="loading" title="Cargando configuracion" description="Estamos reconstruyendo parametros aprobados y riesgos visibles." />
              </div>
            )}
            {tenantConfigResource.status === "error" && (
              <div className="xl:col-span-2">
                <ErrorState title={tenantConfigResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar la configuracion"} description={tenantConfigResource.error ?? "La configuracion del espacio no esta disponible."} onRetry={tenantConfigResource.retry} />
              </div>
            )}
            {tenantConfigResource.status === "ready" && tenantConfig && (
              <>
                <div className="xl:col-span-2">
                  <Card className="overflow-hidden">
                    <CardHeader className="border-b border-line/80 pb-5">
                      <div>
                        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">
                          {configSection === "general" ? "General" : configSection === "frontend" ? "Frontend" : "Backend"}
                        </p>
                        <CardTitle className="mt-2">
                          {configSection === "general"
                            ? "Ajustes base del espacio"
                            : configSection === "frontend"
                              ? "Experiencia visible y herramientas operativas"
                              : "Integracion del asistente, consumo y control"}
                        </CardTitle>
                        <p className="mt-2 text-sm text-muted">
                          {configSection === "general"
                            ? "Parametros centrales, limites y alertas visibles en una sola superficie."
                            : configSection === "frontend"
                              ? "Todo lo que afecta la experiencia diaria y la disponibilidad de funciones."
                              : "Conexion del asistente, exportacion, acciones sensibles y reglas de conservacion."}
                        </p>
                      </div>
                      {configSection === "general" ? <Settings2 className="h-5 w-5 text-muted" /> : configSection === "frontend" ? <Wrench className="h-5 w-5 text-muted" /> : <ShieldAlert className="h-5 w-5 text-muted" />}
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {configSection === "general" && (
                        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                          <div className="space-y-4">
                            {tenantMutationMessage && <StateBlock tone={tenantMutationMessage.tone === "success" ? "success" : "error"} title={tenantMutationMessage.tone === "success" ? "Configuracion actualizada" : "No se pudo actualizar"} description={tenantMutationMessage.detail} />}
                            {tenantParameters.map((parameter) => (
                              <div key={`canvas-${parameter.key}`} className="rounded-[24px] border border-line/80 bg-surface/80 p-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                  <div>
                                    <p className="font-semibold text-ink">{parameter.label}</p>
                                    <p className="mt-1 text-sm text-muted">{parameter.editable ? "Se puede actualizar desde esta vista." : "Se mantiene como referencia."}</p>
                                  </div>
                                  <Badge tone={parameter.editable ? "brand" : "warning"}>{parameter.editable ? "Editable" : "Solo lectura"}</Badge>
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                                  <Input
                                    aria-label={parameter.label}
                                    value={parameterDrafts[parameter.key] ?? parameter.value}
                                    onChange={(event) =>
                                      setParameterDrafts((current) => ({
                                        ...current,
                                        [parameter.key]: event.target.value
                                      }))
                                    }
                                    readOnly={!parameter.editable}
                                  />
                                  {parameter.editable ? (
                                    <Button variant="secondary" className="w-full md:w-auto" disabled={tenantMutationBusyKey === parameter.key} onClick={() => void updateTenantParameter(parameter.key)}>
                                      {tenantMutationBusyKey === parameter.key ? "Guardando..." : "Guardar"}
                                    </Button>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="space-y-4">
                            <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                              <p className="font-semibold text-ink">Capacidades activas</p>
                              <p className="mt-1">{tenantConfig.activeCapabilities}</p>
                            </div>
                            <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                              <p className="font-semibold text-ink">Limites actuales</p>
                              <p className="mt-1">{tenantConfig.limits}</p>
                            </div>
                            <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                              <p className="font-semibold text-ink">Alertas visibles</p>
                              <div className="mt-3 space-y-3">
                                {tenantConfig.risks.length ? tenantConfig.risks.map((item) => <div key={`risk-${item}`} className="rounded-[18px] border border-line/70 bg-panel p-3">{item}</div>) : <p>Sin alertas activas por ahora.</p>}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {configSection === "frontend" && (
                        <div className="space-y-6">
                          {capabilityMutationMessage && <StateBlock tone={capabilityMutationMessage.tone === "success" ? "success" : "error"} title={capabilityMutationMessage.tone === "success" ? "Capacidad actualizada" : "No se pudo actualizar"} description={capabilityMutationMessage.detail} />}
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-semibold text-ink">Capacidades disponibles</p>
                              <p className="mt-1 text-sm text-muted">Activa o pausa funciones visibles desde una lista uniforme.</p>
                            </div>
                            {capabilitiesResource.status === "loading" && <StateBlock tone="loading" title="Cargando capacidades" description="Obteniendo el catalogo habilitado para este espacio." />}
                            {capabilitiesResource.status === "error" && <ErrorState title={capabilitiesResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar capacidades"} description={capabilitiesResource.error ?? "No fue posible consultar el catalogo de capacidades."} onRetry={capabilitiesResource.retry} />}
                            {capabilitiesResource.status === "empty" && <StateBlock tone="empty" title="Sin capacidades" description="No hay capacidades visibles para este espacio." />}
                            {capabilitiesResource.status === "ready" && (
                              <div className="grid gap-3 lg:grid-cols-2">
                                {capabilities.map((item) => (
                                  <div key={`frontend-${item.id}`} className="rounded-[24px] border border-line/80 bg-surface/80 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-semibold text-ink">{item.name}</p>
                                      <Badge tone={item.enabled ? "brand" : "warning"}>{item.enabled ? "Activa" : "Inactiva"}</Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted">{item.description}</p>
                                    <p className="mt-2 text-xs uppercase tracking-[0.15em] text-subtle">Modo {item.policyMode} {item.requiresApproval ? "· Requiere aprobacion" : "· Sin aprobacion extra"}</p>
                                    <Button variant={item.enabled ? "secondary" : "primary"} className="mt-4 w-full" disabled={capabilityMutationBusyId === item.id} onClick={() => void toggleCapability(item.id, !item.enabled)}>
                                      {capabilityMutationBusyId === item.id ? "Actualizando..." : item.enabled ? "Desactivar" : "Activar"}
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-semibold text-ink">Catalogo de herramientas</p>
                              <p className="mt-1 text-sm text-muted">Visibilidad de riesgo, certificacion y disponibilidad operativa.</p>
                            </div>
                            {toolsResource.status === "loading" && <StateBlock tone="loading" title="Cargando herramientas" description="Consultando riesgo, certificacion y alcance de uso." />}
                            {toolsResource.status === "error" && <ErrorState title={toolsResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar herramientas"} description={toolsResource.error ?? "No fue posible consultar el catalogo de herramientas."} onRetry={toolsResource.retry} />}
                            {toolsResource.status === "empty" && <StateBlock tone="empty" title="Sin herramientas registradas" description="No hay herramientas visibles para este perfil en el espacio activo." />}
                            {toolsResource.status === "ready" && (
                              <div className="grid gap-3 lg:grid-cols-2">
                                {tools.map((item) => (
                                  <div key={`tool-${item.id}`} className="rounded-[24px] border border-line/80 bg-surface/80 p-4">
                                    <div className="flex items-center justify-between gap-3">
                                      <p className="font-semibold text-ink">{item.name}</p>
                                      <Badge tone={item.riskLevel === "critical" || item.riskLevel === "high" ? "warning" : "brand"}>{item.riskLevel}</Badge>
                                    </div>
                                    <p className="mt-2 text-sm text-muted">Certificacion {item.certification} · Entorno {item.environment} · Modo maximo {item.maxPolicyMode}</p>
                                    {item.blockedReason ? <p className="mt-2 text-sm text-warning">{item.blockedReason}</p> : <p className="mt-2 text-sm text-muted">Sin bloqueos activos para esta herramienta.</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {configSection === "backend" && (
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-semibold text-ink">Conexion del asistente</p>
                              <p className="mt-1 text-sm text-muted">Proveedor, direccion, clave y modelo en una sola superficie.</p>
                            </div>
                            {assistantConnectionMessage && (
                              <StateBlock
                                tone={assistantConnectionMessage.tone === "success" ? "success" : "error"}
                                title={assistantConnectionMessage.tone === "success" ? "Conexion validada" : "No se pudo validar la conexion"}
                                description={assistantConnectionMessage.detail}
                              />
                            )}
                            <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                              Esta configuracion pertenece al espacio activo y solo la administra el perfil <strong className="text-ink">Administrador</strong>.
                            </div>
                            {aiParameters.length ? (
                              <div className="grid gap-3">
                                {aiParameters.map((parameter) => (
                                  <div key={`backend-${parameter.key}`} className="rounded-[24px] border border-line/80 bg-surface/80 p-4">
                                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                      <div>
                                        <p className="font-semibold text-ink">{parameter.label}</p>
                                        <p className="mt-1 text-sm text-muted">{parameter.key === "ai.api_key" ? "La clave se guarda como dato sensible." : parameter.key === "ai.base_url" ? "Direccion base del proveedor." : parameter.key === "ai.model" ? "Modelo principal para las respuestas." : "Proveedor activo para este espacio."}</p>
                                      </div>
                                      <Badge tone={parameter.editable ? "brand" : "warning"}>{parameter.editable ? "Editable" : "Solo lectura"}</Badge>
                                    </div>
                                    <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                                      <Input
                                        aria-label={parameter.label}
                                        type={parameter.key === "ai.api_key" ? "password" : parameter.key === "ai.base_url" ? "url" : "text"}
                                        value={parameterDrafts[parameter.key] ?? parameter.value}
                                        onChange={(event) =>
                                          setParameterDrafts((current) => ({
                                            ...current,
                                            [parameter.key]: event.target.value
                                          }))
                                        }
                                        readOnly={!parameter.editable}
                                        placeholder={parameter.key === "ai.provider" ? "gemini" : parameter.key === "ai.base_url" ? "https://generativelanguage.googleapis.com/v1beta" : parameter.key === "ai.model" ? "gemini-2.5-flash" : "Ingresa el valor"}
                                      />
                                      {parameter.editable ? (
                                        <Button variant="secondary" className="w-full md:w-auto" disabled={tenantMutationBusyKey === parameter.key} onClick={() => void updateTenantParameter(parameter.key)}>
                                          {tenantMutationBusyKey === parameter.key ? "Guardando..." : "Guardar"}
                                        </Button>
                                      ) : null}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <StateBlock tone="empty" title="Sin datos de conexion" description="Agrega proveedor, direccion, clave y modelo para conectar un asistente desde este espacio." />
                            )}
                            <Button className="w-full md:w-auto" variant="secondary" disabled={assistantConnectionBusy} onClick={() => void testAssistantConnection()}>
                              {assistantConnectionBusy ? "Probando..." : "Probar conexion"}
                            </Button>
                          </div>

                          <div className="grid gap-6 xl:grid-cols-2">
                            <div className="space-y-4">
                              {usageMessage && <StateBlock tone={usageMessage.tone === "success" ? "success" : "error"} title={usageMessage.tone === "success" ? "Export generado" : "No se pudo exportar"} description={usageMessage.detail} />}
                              <div>
                                <p className="text-sm font-semibold text-ink">Consumo y exportacion</p>
                                <p className="mt-1 text-sm text-muted">Seguimiento del periodo y salida para procesos externos.</p>
                              </div>
                              {usageResource.status === "loading" && <StateBlock tone="loading" title="Cargando consumo" description="Calculando acciones exitosas y volumen estimado del periodo." />}
                              {usageResource.status === "error" && <ErrorState title={usageResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar consumo"} description={usageResource.error ?? "No fue posible consultar el consumo atribuible."} onRetry={usageResource.retry} />}
                              {usageResource.status === "ready" && usageAttribution && (
                                <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                                  <p className="font-semibold text-ink">Espacio {usageAttribution.tenantId} · {usageAttribution.periodLabel}</p>
                                  <p className="mt-2">Acciones exitosas: {usageAttribution.successfulActions}</p>
                                  <p className="mt-1">Tokens estimados: {usageAttribution.totalEstimatedTokens}</p>
                                </div>
                              )}
                              <Button className="w-full" disabled={usageBusy} onClick={() => void exportUsageForBilling()}>
                                <Download className="mr-2 h-4 w-4" />
                                {usageBusy ? "Exportando..." : "Exportar consumo"}
                              </Button>
                            </div>

                            <div className="space-y-4">
                              {governanceMessage && <StateBlock tone={governanceMessage.tone === "success" ? "success" : "error"} title={governanceMessage.tone === "success" ? "Accion ejecutada" : "Accion bloqueada"} description={governanceMessage.detail} />}
                              {complianceMessage && <StateBlock tone={complianceMessage.tone === "success" ? "success" : "error"} title={complianceMessage.tone === "success" ? "Preferencia actualizada" : "No se pudo actualizar"} description={complianceMessage.detail} />}
                              <div>
                                <p className="text-sm font-semibold text-ink">Control y conservacion</p>
                                <p className="mt-1 text-sm text-muted">Acciones sensibles, reglas de conservacion y consentimiento.</p>
                              </div>
                              {governanceResource.status === "loading" && <StateBlock tone="loading" title="Cargando estado general" description="Consultando certificaciones, despliegues y estado de reversa." />}
                              {governanceResource.status === "error" && <ErrorState title={governanceResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar el control"} description={governanceResource.error ?? "No fue posible consultar el estado general."} onRetry={governanceResource.retry} />}
                              {governanceResource.status === "ready" && governanceState && (
                                <>
                                  <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                                    <p className="font-semibold text-ink">Canal {governanceState.releaseChannel}</p>
                                    <p className="mt-2">Capacidades certificadas: {governanceState.capabilitiesCertified}</p>
                                    <p className="mt-1">Herramientas certificadas: {governanceState.toolsCertified}</p>
                                    <p className="mt-1">Ultimo despliegue: {governanceState.lastDeploymentAt}</p>
                                    <p className="mt-1">Reversa lista: {governanceState.rollbackReady ? "Si" : "No"}</p>
                                  </div>
                                  <div className="grid gap-2">
                                    <Button data-testid="governance-approve-capability" disabled={governanceBusy} onClick={() => void runGovernanceAction("approve_capability")}>
                                      Aprobar capacidad
                                    </Button>
                                    <Button data-testid="governance-deploy-release" variant="secondary" disabled={governanceBusy} onClick={() => void runGovernanceAction("deploy_release")}>
                                      Publicar cambios
                                    </Button>
                                    <Button data-testid="governance-rollback-release" variant="ghost" disabled={governanceBusy || !governanceState.rollbackReady} onClick={() => void runGovernanceAction("rollback_release")}>
                                      Ejecutar reversa
                                    </Button>
                                  </div>
                                </>
                              )}
                              {retentionPolicyResource.status === "loading" && <StateBlock tone="loading" title="Cargando politica de retencion" description="Resolviendo tiempos y reglas de conservacion." />}
                              {retentionPolicyResource.status === "error" && <ErrorState title={retentionPolicyResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar retencion"} description={retentionPolicyResource.error ?? "No fue posible consultar la politica de retencion."} onRetry={retentionPolicyResource.retry} />}
                              {retentionPolicyResource.status === "ready" && retentionPolicy && (
                                <div className="rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                                  <p className="font-semibold text-ink">Espacio {retentionPolicy.tenantId}</p>
                                  <p className="mt-2">Retencion operativa: {retentionPolicy.operationalRetentionDays} dias</p>
                                  <p className="mt-1">Retencion auditoria: {retentionPolicy.auditRetentionDays} dias</p>
                                  <p className="mt-1">Anonimizacion previa para reutilizacion: {retentionPolicy.anonymizationRequiredForReuse ? "Obligatoria" : "No obligatoria"}</p>
                                  <p className="mt-1">Opt-in por defecto: {retentionPolicy.dataReuseDefaultOptIn ? "Activo" : "Desactivado"}</p>
                                </div>
                              )}
                              {dataReuseConsentResource.status === "loading" && <StateBlock tone="loading" title="Cargando consentimiento" description="Consultando estado actual y trazabilidad." />}
                              {dataReuseConsentResource.status === "error" && <ErrorState title={dataReuseConsentResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar consentimiento"} description={dataReuseConsentResource.error ?? "No fue posible consultar el consentimiento de reutilizacion."} onRetry={dataReuseConsentResource.retry} />}
                              {dataReuseConsentResource.status === "ready" && dataReuseConsent && (
                                <div className="space-y-3 rounded-[24px] border border-line/80 bg-surface/80 p-4 text-sm text-muted">
                                  <p>
                                    Estado de consentimiento: <strong>{dataReuseConsent.enabled ? "Activo" : "Inactivo"}</strong>
                                  </p>
                                  <p>Ultima actualizacion: {dataReuseConsent.updatedAt}</p>
                                  <p>Registro: {dataReuseConsent.auditId}</p>
                                  <Button data-testid="compliance-toggle-consent" className="w-full" variant="secondary" disabled={complianceBusy} onClick={() => void toggleDataReuseConsent()}>
                                    {complianceBusy ? "Actualizando..." : dataReuseConsent.enabled ? "Desactivar reutilizacion" : "Activar reutilizacion"}
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card className="hidden">
                  <CardHeader>
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-subtle">General</p>
                      <CardTitle className="mt-2">Ajustes base del espacio</CardTitle>
                    </div>
                    <Settings2 className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent />
                </Card>

                <Card className="hidden" />
                <Card className="hidden" />
                <Card className="hidden" />
                <Card className="hidden" />
              </>
            )}
            </div>
          </section>
        )}

        <footer className="rounded-[28px] border border-line/90 bg-panel/95 p-4 text-sm text-muted shadow-[0_10px_26px_rgba(15,23,42,0.05)] md:hidden">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-ink">Fuente documental activa</p>
              <p>Specs modulares de Opita Sync, matrices transversales y request frontend con Storybook y QA.</p>
            </div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-subtle">
              <Filter className="h-3.5 w-3.5" />
              {roles.find((item) => item.id === role)?.label}
            </div>
          </div>
        </footer>
      </div>
    </AppShell>
  );
}
