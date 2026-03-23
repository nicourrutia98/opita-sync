import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bot, CheckCircle2, Download, Filter, FolderKanban, MessageSquareText, Settings2, ShieldAlert, Sparkles, Wrench } from "lucide-react";
import { AppShell } from "./components/opita/app-shell";
import { AuthShell } from "./components/opita/auth-shell";
import { CaseCard } from "./components/opita/case-card";
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
  toAssistedDraftViewModel,
  toCaseDetailViewModel,
  toCaseSummaryViewModel,
  toConversationViewModel,
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

function getResetToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return new URLSearchParams(window.location.search).get("resetToken") ?? "";
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

function AuthCard({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Acceso</p>
          <CardTitle className="mt-2">{title}</CardTitle>
          <p className="mt-2 text-sm text-muted">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
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
  const [draftBusy, setDraftBusy] = useState(false);
  const [draftMessage, setDraftMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<ReturnType<typeof toAssistedDraftViewModel> | null>(null);
  const [usageBusy, setUsageBusy] = useState(false);
  const [usageMessage, setUsageMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [governanceBusy, setGovernanceBusy] = useState(false);
  const [governanceMessage, setGovernanceMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
  const [complianceBusy, setComplianceBusy] = useState(false);
  const [complianceMessage, setComplianceMessage] = useState<{ tone: "success" | "error"; detail: string } | null>(null);
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
        setView(restored.bootstrap.allowedViews.includes(initialView) ? initialView : restored.bootstrap.allowedViews[0]);
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
  const loadConversation = useCallback(() => serviceLayer.chatService.getConversation(role, selectedCaseId), [role, selectedCaseId, serviceLayer]);
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
  const chatResource = useAsyncResource(loadConversation, [role, selectedCaseId], { enabled: resourceEnabled && view === "chat" });
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
  const conversation = chatResource.data ? toConversationViewModel(chatResource.data) : null;
  const tenantConfig = tenantConfigResource.data ? toTenantConfigViewModel(tenantConfigResource.data) : null;
  const operationalLog = operationalLogResource.data ?? [];
  const capabilities = capabilitiesResource.data ?? [];
  const tools = toolsResource.data ?? [];
  const valueReport = valueReportResource.data ? toValueReportViewModel(valueReportResource.data) : null;
  const usageAttribution = usageResource.data ? toUsageAttributionViewModel(usageResource.data) : null;
  const governanceState = governanceResource.data ? toGlobalGovernanceStateViewModel(governanceResource.data) : null;
  const retentionPolicy = retentionPolicyResource.data ? toRetentionPolicyViewModel(retentionPolicyResource.data) : null;
  const dataReuseConsent = dataReuseConsentResource.data ? toDataReuseConsentViewModel(dataReuseConsentResource.data) : null;
  const navigationManifest = navigationManifestResource.data ? toNavigationManifestViewModel(navigationManifestResource.data) : null;

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
      chatResource,
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
    chatResource.errorStatus,
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
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthBusy(true);
      setAuthMessage(null);
      try {
        const nextSession = await serviceLayer.authService.signIn(email.trim(), password);
        setSession(nextSession);
        setSessionStatus("ready");
        setView(nextSession.bootstrap.allowedViews[0]);
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
    [email, password, serviceLayer]
  );

  const requestReset = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setAuthBusy(true);
      setAuthMessage(null);
      try {
        const result = await serviceLayer.authService.requestPasswordReset(resetEmail.trim());
        setAuthMessage({
          tone: "brand",
          label: "Reset solicitado",
          detail: `Si el correo existe, enviaremos un enlace de recuperacion a ${result.email}. En modo stub usa el token demo-reset-token.`
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
    async (event: React.FormEvent<HTMLFormElement>) => {
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
          detail: "Tu nueva contrasena ya fue registrada. Inicia sesion con las credenciales vigentes del backend."
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
    async (event: React.FormEvent<HTMLFormElement>) => {
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
          detail: `Parametro actualizado. Auditoria ${result.auditId}.`
        });
        tenantConfigResource.retry();
      } catch (error) {
        setTenantMutationMessage({
          tone: "error",
          detail: error instanceof Error ? error.message : "No se pudo actualizar el parametro del tenant."
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

  const generateAssistedDraft = useCallback(async () => {
    setDraftBusy(true);
    setDraftMessage(null);
    try {
      const result = await serviceLayer.draftService.generateDraft({
        caseId: selectedCaseId,
        prompt: conversation?.promptDraft ?? "Generar borrador contextual para seguimiento operativo.",
        channel: "interno",
        tone: "Operativo formal"
      });
      setGeneratedDraft(toAssistedDraftViewModel(result));
      setDraftMessage({
        tone: "success",
        detail: `Borrador generado con auditoria ${result.auditId}.`
      });
    } catch (error) {
      setDraftMessage({
        tone: "error",
        detail: error instanceof Error ? error.message : "No se pudo generar el borrador asistido."
      });
    } finally {
      setDraftBusy(false);
    }
  }, [conversation?.promptDraft, selectedCaseId, serviceLayer]);

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
        description="Estamos validando identidad, tenant activo y vistas habilitadas antes de abrir el espacio de trabajo."
      >
        <StateBlock tone="loading" title="Cargando sesion" description="Rehidratando token, bootstrap de acceso y contexto inicial." />
      </AuthShell>
    );
  }

  if (sessionStatus === "error") {
    return (
      <AuthShell
        theme={theme}
        title="No pudimos validar la sesion"
        description="El bootstrap autenticado fallo por red o configuracion. Puedes reintentar sin perder la base visual."
        status={sessionError ? { tone: "danger", label: "Bootstrap fallido", detail: sessionError } : null}
      >
        <AuthCard title="Reintentar bootstrap" description="Si el backend o la configuracion publica estan disponibles, la app continuara al shell autenticado.">
          <ErrorState title="Bootstrap no disponible" description={sessionError ?? "No se pudo validar la sesion actual."} onRetry={() => void loadSession()} />
        </AuthCard>
      </AuthShell>
    );
  }

  if (!session) {
    return (
      <AuthShell
        theme={theme}
        title="Accede a Opita Sync"
        description="Inicia sesion para cargar tenant, rol efectivo y vistas habilitadas desde backend."
        status={authMessage}
      >
        {authScreen === "signIn" && (
          <AuthCard title="Iniciar sesion" description="Accede con correo y contrasena. El tenant y el rol se resuelven server-side.">
            <form className="space-y-4" onSubmit={signIn}>
              <Input type="email" placeholder="correo@tenant.com" value={email} onChange={(event) => setEmail(event.target.value)} />
              <Input type="password" placeholder="Contrasena" value={password} onChange={(event) => setPassword(event.target.value)} />
              <Button type="submit" className="w-full" disabled={authBusy}>
                {authBusy ? "Ingresando..." : "Entrar"}
              </Button>
            </form>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" className="w-full" onClick={() => setAuthScreen("requestReset")}>
                Olvide mi contrasena
              </Button>
              {resetToken && (
                <Button variant="ghost" className="w-full" onClick={() => setAuthScreen("resetPassword")}>
                  Tengo token de reset
                </Button>
              )}
            </div>
          </AuthCard>
        )}

        {authScreen === "requestReset" && (
          <AuthCard title="Solicitar restablecimiento" description="Envio de enlace para renovar acceso sin exponer el tenant en la UI.">
            <form className="space-y-4" onSubmit={requestReset}>
              <Input type="email" placeholder="correo@tenant.com" value={resetEmail} onChange={(event) => setResetEmail(event.target.value)} />
              <Button type="submit" className="w-full" disabled={authBusy}>
                {authBusy ? "Solicitando..." : "Enviar enlace"}
              </Button>
            </form>
            <Button variant="ghost" className="w-full" onClick={() => setAuthScreen("signIn")}>
              Volver a iniciar sesion
            </Button>
          </AuthCard>
        )}

        {authScreen === "resetPassword" && (
          <AuthCard title="Restablecer contrasena" description="Completa el reset usando el token entregado por backend.">
            {!resetToken ? (
              <StateBlock tone="error" title="Falta token de restablecimiento" description="Agrega `?resetToken=...` a la URL para completar este flujo." />
            ) : (
              <form className="space-y-4" onSubmit={confirmReset}>
                <Input value={resetToken} readOnly aria-label="Token de reset" />
                <Input type="password" placeholder="Nueva contrasena" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
                <Button type="submit" className="w-full" disabled={authBusy}>
                  {authBusy ? "Actualizando..." : "Actualizar contrasena"}
                </Button>
              </form>
            )}
            <Button variant="ghost" className="w-full" onClick={() => setAuthScreen("signIn")}>
              Volver a iniciar sesion
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
      tenantName={session.bootstrap.tenant.name}
      showRoleSwitcher={false}
      onRoleChange={() => {}}
      onViewChange={setView}
      onThemeChange={setTheme}
      onSignOut={() => void signOut()}
    >
      <div className="space-y-5">
        {view === "inicio" && (
          <>
            {dashboardResource.status === "loading" && <StateBlock tone="loading" title="Cargando home operativo" description="Estamos reuniendo contexto, metricas y prioridades por rol." />}
            {dashboardResource.status === "error" && (
              <ErrorState title={dashboardResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar el home"} description={dashboardResource.error ?? "Ocurrio un error cargando la bandeja principal."} onRetry={dashboardResource.retry} />
            )}
            {dashboardResource.status === "ready" && dashboard && (
              <>
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {dashboard.metrics.map((item) => (
                    <MetricCard key={item.label} {...item} />
                  ))}
                </section>

                {role === "supervisor" ? (
                  <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                    <Card>
                      <CardHeader>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Supervisor workspace</p>
                          <CardTitle className="mt-2">Aprobaciones, bloqueos y escalamiento</CardTitle>
                        </div>
                        <Badge tone="warning">Prioridad movil</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {dashboard.supervisorQueue.map((item) => (
                          <div key={item.title} className="rounded-3xl border border-line bg-surface p-4 text-sm text-muted">
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
                      <Card>
                        <CardHeader>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Senales operativas</p>
                            <CardTitle className="mt-2">Lo que cambia la decision</CardTitle>
                          </div>
                          <ShieldAlert className="h-5 w-5 text-muted" />
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {dashboard.supervisorSignals.map((item) => (
                            <div key={item} className="rounded-3xl border border-line bg-surface p-4 text-sm text-muted">
                              {item}
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Uso de marca</p>
                            <CardTitle className="mt-2">Flow Grid v3 dentro del producto</CardTitle>
                          </div>
                          <Settings2 className="h-5 w-5 text-muted" />
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted">
                          <p>El lockup horizontal vive en header y superficies de sistema. El mark compacto queda para switchers, favicon y huellas de app.</p>
                          <p>El patron de grid no entra como fondo de formularios o listas. Se reserva para identidad y estados vacios de marca.</p>
                          <p>Claro y oscuro comparten la misma semantica; cambian solo contraste, fondos y variante de logo.</p>
                        </CardContent>
                      </Card>
                    </div>
                  </section>
                ) : (
                  <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card>
                      <CardHeader>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Bandeja operativa</p>
                          <CardTitle className="mt-2">Lo urgente en este turno</CardTitle>
                        </div>
                        <Badge tone="warning">Mobile-first</Badge>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {dashboard.inbox.map((item) => (
                          <div key={item} className="rounded-3xl border border-line bg-surface p-4 text-sm text-muted">
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

                    <Card>
                      <CardHeader>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Arquitectura UI</p>
                          <CardTitle className="mt-2">Base elegida</CardTitle>
                        </div>
                        <Settings2 className="h-5 w-5 text-muted" />
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm text-muted">
                        <p>React + Vite + Tailwind + Storybook como base web mobile-first y open-code.</p>
                        <p>La app ya consume servicios tipados, con adapters intercambiables para stub y backend remoto.</p>
                        <p>Admin y gobierno permanecen web-first. Roles operativos priorizan movil.</p>
                      </CardContent>
                    </Card>
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
                  <Card>
                    <CardHeader>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Navegacion por rol</p>
                        <CardTitle className="mt-2">Manifesto de experiencia</CardTitle>
                      </div>
                      <Filter className="h-5 w-5 text-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted">
                      {navigationManifestResource.status === "loading" && <StateBlock tone="loading" title="Cargando manifiesto de navegacion" description="Resolviendo vistas primarias y backoffice por rol." />}
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
                            <p className="mt-2">{navigationManifest.backofficeViews.length ? navigationManifest.backofficeViews.join(", ") : "Sin vistas backoffice para este rol."}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>
              </>
            )}
          </>
        )}

        {view === "chat" && (
          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <Card>
              <CardHeader>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Chat / Orchestrator</p>
                  <CardTitle className="mt-2">{conversation?.title ?? "Intencion operativa con contexto"}</CardTitle>
                </div>
                <MessageSquareText className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {chatResource.status === "loading" && <StateBlock tone="loading" title="Resolviendo contexto" description="El sistema esta reuniendo tenant, rol, caso y capacidad antes de ejecutar." />}
                {chatResource.status === "error" && (
                  <ErrorState title={chatResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo reconstruir la conversacion"} description={chatResource.error ?? "La conversacion no se pudo cargar."} onRetry={chatResource.retry} />
                )}
                {chatResource.status === "ready" && conversation && (
                  <>
                    <div className="space-y-3">
                      {conversation.messages.map((message) => (
                        <div
                          key={message.id}
                          className={
                            message.tone === "assistant"
                              ? "rounded-3xl bg-brand p-4 text-sm text-white"
                              : message.tone === "system"
                                ? "rounded-3xl bg-panel p-4 text-sm text-subtle shadow-soft"
                                : "rounded-3xl bg-surface p-4 text-sm text-subtle"
                          }
                        >
                          {message.body}
                        </div>
                      ))}
                    </div>
                    <Textarea defaultValue={conversation.promptDraft} />
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button>Confirmar y ejecutar</Button>
                      <Button variant="secondary">Guardar como sugerencia</Button>
                    </div>
                    {draftMessage && (
                      <StateBlock
                        tone={draftMessage.tone === "success" ? "success" : "error"}
                        title={draftMessage.tone === "success" ? "Borrador generado" : "No se pudo generar borrador"}
                        description={draftMessage.detail}
                      />
                    )}
                    <Button className="w-full" variant="secondary" disabled={draftBusy} onClick={() => void generateAssistedDraft()}>
                      {draftBusy ? "Generando..." : "Generar borrador asistido"}
                    </Button>
                    {generatedDraft && (
                      <div className="rounded-3xl border border-line bg-panel p-4 text-sm text-muted">
                        <p className="font-semibold text-ink">Borrador {generatedDraft.channel}</p>
                        <p className="mt-2">{generatedDraft.content}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.12em] text-subtle">
                          {generatedDraft.status === "pending_approval" ? "Pendiente aprobacion" : "Listo"} · Audit {generatedDraft.auditId}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Estados conectados</p>
                  <CardTitle className="mt-2">Loading, empty, error y success</CardTitle>
                </div>
                <Sparkles className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent className="space-y-3">
                <StateBlock tone="loading" title="Resolviendo contexto" description="El sistema esta reuniendo tenant, rol, caso y capacidad antes de ejecutar." />
                <StateBlock tone="empty" title="Sin conversacion activa" description="Inicia desde una intencion, un caso existente o un acceso rapido." />
                <StateBlock tone="error" title="Falta aprobacion" description="La accion fue bloqueada porque el borrador se marco como regulatorio." />
                <StateBlock tone="success" title="Ejecucion auditada" description="Caso actualizado, borrador generado y evento registrado en auditoria." />
              </CardContent>
            </Card>
          </section>
        )}

        {view === "casos" && (
          <section className="space-y-5">
            <Card>
              <CardHeader>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Casos y solicitudes</p>
                  <CardTitle className="mt-2">Cola priorizada</CardTitle>
                </div>
                <FolderKanban className="h-5 w-5 text-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Input placeholder="Buscar por caso, sitio o descripcion" value={query} onChange={(event) => setQuery(event.target.value)} />
                </div>

                {casesResource.status === "loading" && <StateBlock tone="loading" title="Cargando cola de casos" description="Se esta reconstruyendo la vista con filtros, permisos y contexto del tenant." />}
                {casesResource.status === "error" && (
                  <ErrorState title={casesResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar la cola"} description={casesResource.error ?? "La consulta de casos fallo."} onRetry={casesResource.retry} />
                )}
                {casesResource.status === "empty" && <StateBlock tone="empty" title="No hay casos disponibles" description="La cola llego vacia desde el servicio configurado." />}

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
          <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
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
                      <div className="rounded-3xl bg-surface p-4 text-sm">
                        <p className="text-muted">Responsable</p>
                        <p className="mt-1 font-semibold text-ink">{detail.owner}</p>
                      </div>
                      <div className="rounded-3xl bg-surface p-4 text-sm">
                        <p className="text-muted">Prioridad</p>
                        <p className="mt-1 font-semibold text-ink">{detail.priority}</p>
                      </div>
                      <div className="rounded-3xl bg-surface p-4 text-sm">
                        <p className="text-muted">Actualizado</p>
                        <p className="mt-1 font-semibold text-ink">{detail.updatedAt}</p>
                      </div>
                    </div>
                    <div className="rounded-panel border border-line bg-panel p-4">
                      <p className="text-sm text-muted">{detail.summary}</p>
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-subtle">Bitacora operativa</h3>
                      {detail.timeline.map((entry) => (
                        <div key={`${entry.time}-${entry.type}`} className="flex gap-3 rounded-3xl border border-line bg-panel p-4 text-sm">
                          <div className="w-12 shrink-0 font-semibold text-brand-strong">{entry.time}</div>
                          <div>
                            <p className="font-semibold text-ink">{entry.type}</p>
                            <p className="mt-1 text-muted">{entry.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-subtle">Bitacora gobernada (Release 2)</h3>
                      {operationalLogResource.status === "loading" && <StateBlock tone="loading" title="Cargando bitacora conectada" description="Validando entradas, evidencias y before/after por caso." />}
                      {operationalLogResource.status === "error" && (
                        <ErrorState
                          title={operationalLogResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar la bitacora"}
                          description={operationalLogResource.error ?? "No fue posible consultar la bitacora operativa."}
                          onRetry={operationalLogResource.retry}
                        />
                      )}
                      {operationalLogResource.status === "empty" && <StateBlock tone="empty" title="Sin entradas conectadas" description="Este caso aun no tiene eventos gobernados en la bitacora del servicio." />}
                      {operationalLogResource.status === "ready" &&
                        operationalLog.map((entry) => (
                          <div key={entry.id} className="rounded-3xl border border-line bg-panel p-4 text-sm text-muted">
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
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Acciones</p>
                      <CardTitle className="mt-2">Siguiente paso sugerido</CardTitle>
                    </div>
                    <Bot className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-3xl bg-brand p-4 text-sm text-white">
                      La capacidad sugerida es <strong>{detail.suggestedAction}</strong>. Se requiere confirmacion del tecnico.
                    </div>
                    <Button className="w-full">Registrar avance y generar borrador</Button>
                    <Button variant="secondary" className="w-full">
                      Escalar a supervisor
                    </Button>
                    <Button variant="ghost" className="w-full">
                      Abrir trail de auditoria
                    </Button>

                    <div className="space-y-3 rounded-3xl border border-line bg-panel p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">Registrar en bitacora</p>
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
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </section>
        )}

        {view === "configuracion" && (
          <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
            {tenantConfigResource.status === "loading" && (
              <div className="xl:col-span-2">
                <StateBlock tone="loading" title="Cargando configuracion" description="Estamos reconstruyendo parametros aprobados y riesgos visibles." />
              </div>
            )}
            {tenantConfigResource.status === "error" && (
              <div className="xl:col-span-2">
                <ErrorState title={tenantConfigResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar la configuracion"} description={tenantConfigResource.error ?? "La configuracion del tenant no esta disponible."} onRetry={tenantConfigResource.retry} />
              </div>
            )}
            {tenantConfigResource.status === "ready" && tenantConfig && (
              <>
                <Card>
                  <CardHeader>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Parametrizacion del tenant</p>
                      <CardTitle className="mt-2">Biblioteca certificada</CardTitle>
                    </div>
                    <Settings2 className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm text-muted">
                    <div className="rounded-3xl border border-line bg-panel p-4">
                      <p className="font-semibold text-ink">Capacidades activas</p>
                      <p className="mt-1">{tenantConfig.activeCapabilities}</p>
                    </div>
                    <div className="rounded-3xl border border-line bg-panel p-4">
                      <p className="font-semibold text-ink">Limites</p>
                      <p className="mt-1">{tenantConfig.limits}</p>
                    </div>
                    {tenantMutationMessage && (
                      <StateBlock
                        tone={tenantMutationMessage.tone === "success" ? "success" : "error"}
                        title={tenantMutationMessage.tone === "success" ? "Configuracion actualizada" : "No se pudo actualizar"}
                        description={tenantMutationMessage.detail}
                      />
                    )}
                    {tenantConfig.parameters.map((parameter) => (
                      <div key={parameter.key} data-testid={`tenant-parameter-${parameter.key}`} className="space-y-2 rounded-3xl border border-line bg-surface p-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-ink">{parameter.label}</p>
                          <Badge tone={parameter.editable ? "brand" : "warning"}>{parameter.editable ? "Editable" : "Solo lectura"}</Badge>
                        </div>
                        <Input
                          value={parameterDrafts[parameter.key] ?? parameter.value}
                          onChange={(event) =>
                            setParameterDrafts((current) => ({
                              ...current,
                              [parameter.key]: event.target.value
                            }))
                          }
                          readOnly={!parameter.editable}
                        />
                        {parameter.editable && (
                          <Button variant="secondary" className="w-full" disabled={tenantMutationBusyKey === parameter.key} onClick={() => void updateTenantParameter(parameter.key)}>
                            {tenantMutationBusyKey === parameter.key ? "Guardando..." : "Guardar parametro"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Continuidad y riesgos</p>
                      <CardTitle className="mt-2">Puntos a vigilar</CardTitle>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {tenantConfig.risks.map((item) => (
                      <div key={item} className="rounded-3xl border border-line bg-panel p-4 text-sm text-muted">
                        {item}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                  <CardHeader>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Catalogo de capacidades y herramientas</p>
                      <CardTitle className="mt-2">Gobierno por policy mode y riesgo</CardTitle>
                    </div>
                    <Wrench className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {capabilityMutationMessage && (
                      <StateBlock
                        tone={capabilityMutationMessage.tone === "success" ? "success" : "error"}
                        title={capabilityMutationMessage.tone === "success" ? "Capacidad actualizada" : "No se pudo actualizar"}
                        description={capabilityMutationMessage.detail}
                      />
                    )}

                    {capabilitiesResource.status === "loading" && <StateBlock tone="loading" title="Cargando capacidades" description="Obteniendo catalogo habilitado para este tenant." />}
                    {capabilitiesResource.status === "error" && (
                      <ErrorState
                        title={capabilitiesResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar capacidades"}
                        description={capabilitiesResource.error ?? "No fue posible consultar el catalogo de capacidades."}
                        onRetry={capabilitiesResource.retry}
                      />
                    )}
                    {capabilitiesResource.status === "empty" && <StateBlock tone="empty" title="Sin capacidades" description="No hay capacidades visibles para este tenant." />}
                    {capabilitiesResource.status === "ready" && (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {capabilities.map((item) => (
                          <div key={item.id} className="rounded-3xl border border-line bg-panel p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-ink">{item.name}</p>
                              <Badge tone={item.enabled ? "brand" : "warning"}>{item.enabled ? "Activa" : "Inactiva"}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted">{item.description}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.15em] text-subtle">
                              Policy {item.policyMode} {item.requiresApproval ? "· Requiere aprobacion" : "· Sin aprobacion extra"}
                            </p>
                            <Button
                              variant={item.enabled ? "secondary" : "primary"}
                              className="mt-3 w-full"
                              disabled={capabilityMutationBusyId === item.id}
                              onClick={() => void toggleCapability(item.id, !item.enabled)}
                            >
                              {capabilityMutationBusyId === item.id ? "Actualizando..." : item.enabled ? "Desactivar capacidad" : "Activar capacidad"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {toolsResource.status === "loading" && <StateBlock tone="loading" title="Cargando herramientas" description="Consultando riesgo, certificacion y techo de policy mode." />}
                    {toolsResource.status === "error" && (
                      <ErrorState title={toolsResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar herramientas"} description={toolsResource.error ?? "No fue posible consultar gobierno de herramientas."} onRetry={toolsResource.retry} />
                    )}
                    {toolsResource.status === "empty" && <StateBlock tone="empty" title="Sin herramientas registradas" description="No hay herramientas visibles para este rol en el tenant activo." />}
                    {toolsResource.status === "ready" && (
                      <div className="grid gap-3 lg:grid-cols-2">
                        {tools.map((item) => (
                          <div key={item.id} className="rounded-3xl border border-line bg-surface p-4">
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-ink">{item.name}</p>
                              <Badge tone={item.riskLevel === "critical" || item.riskLevel === "high" ? "warning" : "brand"}>{item.riskLevel}</Badge>
                            </div>
                            <p className="mt-2 text-sm text-muted">
                              Certificacion {item.certification} · Entorno {item.environment} · Max mode {item.maxPolicyMode}
                            </p>
                            {item.blockedReason ? (
                              <p className="mt-2 text-sm text-warning">{item.blockedReason}</p>
                            ) : (
                              <p className="mt-2 text-sm text-muted">Sin bloqueos activos para esta herramienta.</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3 rounded-3xl border border-line bg-panel p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Billing externo</p>
                      {usageMessage && (
                        <StateBlock
                          tone={usageMessage.tone === "success" ? "success" : "error"}
                          title={usageMessage.tone === "success" ? "Export generado" : "No se pudo exportar"}
                          description={usageMessage.detail}
                        />
                      )}
                      {usageResource.status === "loading" && <StateBlock tone="loading" title="Cargando consumo atribuible" description="Calculando acciones exitosas y tokens del periodo." />}
                      {usageResource.status === "error" && (
                        <ErrorState
                          title={usageResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar consumo"}
                          description={usageResource.error ?? "No fue posible consultar el consumo atribuible."}
                          onRetry={usageResource.retry}
                        />
                      )}
                      {usageResource.status === "ready" && usageAttribution && (
                        <div className="rounded-2xl bg-surface p-3 text-sm text-muted">
                          <p>
                            Tenant {usageAttribution.tenantId} · {usageAttribution.periodLabel}
                          </p>
                          <p className="mt-1">Acciones exitosas: {usageAttribution.successfulActions}</p>
                          <p className="mt-1">Tokens estimados: {usageAttribution.totalEstimatedTokens}</p>
                        </div>
                      )}
                      <Button className="w-full" disabled={usageBusy} onClick={() => void exportUsageForBilling()}>
                        <Download className="mr-2 h-4 w-4" />
                        {usageBusy ? "Exportando..." : "Exportar consumo para billing"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="xl:col-span-2">
                  <CardHeader>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-subtle">Administracion Opita Code y Compliance</p>
                      <CardTitle className="mt-2">Gobierno global, retencion y reutilizacion</CardTitle>
                    </div>
                    <ShieldAlert className="h-5 w-5 text-muted" />
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {governanceMessage && (
                      <StateBlock
                        tone={governanceMessage.tone === "success" ? "success" : "error"}
                        title={governanceMessage.tone === "success" ? "Accion de gobierno ejecutada" : "Accion bloqueada"}
                        description={governanceMessage.detail}
                      />
                    )}

                    {governanceResource.status === "loading" && <StateBlock tone="loading" title="Cargando estado global" description="Consultando certificaciones, despliegue y rollback." />}
                    {governanceResource.status === "error" && (
                      <ErrorState
                        title={governanceResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar gobierno global"}
                        description={governanceResource.error ?? "No fue posible consultar el estado global."}
                        onRetry={governanceResource.retry}
                      />
                    )}
                    {governanceResource.status === "ready" && governanceState && (
                      <div className="grid gap-3 lg:grid-cols-2">
                        <div className="rounded-3xl border border-line bg-surface p-4 text-sm text-muted">
                          <p className="font-semibold text-ink">Canal {governanceState.releaseChannel}</p>
                          <p className="mt-2">Capacidades certificadas: {governanceState.capabilitiesCertified}</p>
                          <p className="mt-1">Herramientas certificadas: {governanceState.toolsCertified}</p>
                          <p className="mt-1">Ultimo despliegue: {governanceState.lastDeploymentAt}</p>
                          <p className="mt-1">Rollback listo: {governanceState.rollbackReady ? "Si" : "No"}</p>
                        </div>
                        <div className="grid gap-2">
                          <Button data-testid="governance-approve-capability" disabled={governanceBusy} onClick={() => void runGovernanceAction("approve_capability")}>
                            Aprobar capacidad
                          </Button>
                          <Button data-testid="governance-deploy-release" variant="secondary" disabled={governanceBusy} onClick={() => void runGovernanceAction("deploy_release")}>
                            Desplegar release
                          </Button>
                          <Button data-testid="governance-rollback-release" variant="ghost" disabled={governanceBusy || !governanceState.rollbackReady} onClick={() => void runGovernanceAction("rollback_release")}>
                            Ejecutar rollback
                          </Button>
                        </div>
                      </div>
                    )}

                    {complianceMessage && (
                      <StateBlock
                        tone={complianceMessage.tone === "success" ? "success" : "error"}
                        title={complianceMessage.tone === "success" ? "Compliance actualizado" : "No se pudo actualizar compliance"}
                        description={complianceMessage.detail}
                      />
                    )}

                    {retentionPolicyResource.status === "loading" && <StateBlock tone="loading" title="Cargando politica de retencion" description="Resolviendo dias de retencion y reglas de anonimización." />}
                    {retentionPolicyResource.status === "error" && (
                      <ErrorState
                        title={retentionPolicyResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar retencion"}
                        description={retentionPolicyResource.error ?? "No fue posible consultar la politica de retencion."}
                        onRetry={retentionPolicyResource.retry}
                      />
                    )}
                    {retentionPolicyResource.status === "ready" && retentionPolicy && (
                      <div className="rounded-3xl border border-line bg-panel p-4 text-sm text-muted">
                        <p className="font-semibold text-ink">Tenant {retentionPolicy.tenantId}</p>
                        <p className="mt-2">Retencion operativa: {retentionPolicy.operationalRetentionDays} dias</p>
                        <p className="mt-1">Retencion auditoria: {retentionPolicy.auditRetentionDays} dias</p>
                        <p className="mt-1">Anonimizacion previa para reutilizacion: {retentionPolicy.anonymizationRequiredForReuse ? "Obligatoria" : "No obligatoria"}</p>
                        <p className="mt-1">Opt-in por defecto: {retentionPolicy.dataReuseDefaultOptIn ? "Activo" : "Desactivado"}</p>
                      </div>
                    )}

                    {dataReuseConsentResource.status === "loading" && <StateBlock tone="loading" title="Cargando consentimiento de reutilizacion" description="Consultando estado actual y trazabilidad." />}
                    {dataReuseConsentResource.status === "error" && (
                      <ErrorState
                        title={dataReuseConsentResource.errorStatus === 403 ? "Acceso denegado" : "No se pudo cargar consentimiento"}
                        description={dataReuseConsentResource.error ?? "No fue posible consultar el consentimiento de reutilizacion."}
                        onRetry={dataReuseConsentResource.retry}
                      />
                    )}
                    {dataReuseConsentResource.status === "ready" && dataReuseConsent && (
                      <div className="space-y-3 rounded-3xl border border-line bg-surface p-4 text-sm text-muted">
                        <p>
                          Estado de consentimiento: <strong>{dataReuseConsent.enabled ? "Activo" : "Inactivo"}</strong>
                        </p>
                        <p>Ultima actualizacion: {dataReuseConsent.updatedAt}</p>
                        <p>Audit trail: {dataReuseConsent.auditId}</p>
                        <Button data-testid="compliance-toggle-consent" className="w-full" variant="secondary" disabled={complianceBusy} onClick={() => void toggleDataReuseConsent()}>
                          {complianceBusy ? "Actualizando..." : dataReuseConsent.enabled ? "Desactivar opt-in de reutilizacion" : "Activar opt-in de reutilizacion"}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </section>
        )}

        <footer className="rounded-shell border border-line bg-panel p-4 text-sm text-muted shadow-soft">
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
