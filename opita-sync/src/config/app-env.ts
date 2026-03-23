export type DataSource = "stub" | "remote";
export type FailureKey =
  | "dashboard"
  | "cases"
  | "detail"
  | "chat"
  | "tenant"
  | "log"
  | "capabilities"
  | "tools"
  | "tenantUpdate"
  | "draft"
  | "reporting"
  | "usage"
  | "governance"
  | "compliance"
  | "navigation";
export type AuthFailureRule = `${FailureKey}:unauthorized` | `${FailureKey}:forbidden`;

export interface AppRuntimeConfig {
  dataSource: DataSource;
  apiBaseUrl: string;
  authStorageKey: string;
  enableStubFallback: boolean;
  fail: FailureKey[];
  failOnce: FailureKey[];
  authFail: AuthFailureRule[];
  authFailOnce: AuthFailureRule[];
}

function readCsv(value: string | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toBool(value: string | undefined, defaultValue: boolean): boolean {
  if (value == null || value === "") {
    return defaultValue;
  }
  return value === "true";
}

function readSearchParams(): URLSearchParams {
  if (typeof window === "undefined") {
    return new URLSearchParams();
  }
  return new URLSearchParams(window.location.search);
}

export function getAppRuntimeConfig(): AppRuntimeConfig {
  const params = readSearchParams();
  const env = import.meta.env;

  const dataSource = (params.get("source") ?? env.VITE_OPITA_DATA_SOURCE ?? "stub") as DataSource;
  const apiBaseUrl = params.get("apiBaseUrl") ?? env.VITE_OPITA_API_BASE_URL ?? "";
  const authStorageKey = params.get("authStorageKey") ?? env.VITE_OPITA_AUTH_STORAGE_KEY ?? "opita-sync.session";
  const enableStubFallback = toBool(params.get("fallback") ?? env.VITE_OPITA_ENABLE_STUB_FALLBACK, true);
  const fail = readCsv(params.get("fail") ?? env.VITE_OPITA_FAIL);
  const failOnce = readCsv(params.get("failOnce") ?? env.VITE_OPITA_FAIL_ONCE);
  const authFail = readCsv(params.get("authFail") ?? env.VITE_OPITA_AUTH_FAIL);
  const authFailOnce = readCsv(params.get("authFailOnce") ?? env.VITE_OPITA_AUTH_FAIL_ONCE);

  return {
    dataSource,
    apiBaseUrl,
    authStorageKey,
    enableStubFallback,
    fail: fail.filter((item): item is FailureKey => ["dashboard", "cases", "detail", "chat", "tenant", "log", "capabilities", "tools", "tenantUpdate", "draft", "reporting", "usage", "governance", "compliance", "navigation"].includes(item)),
    failOnce: failOnce.filter((item): item is FailureKey => ["dashboard", "cases", "detail", "chat", "tenant", "log", "capabilities", "tools", "tenantUpdate", "draft", "reporting", "usage", "governance", "compliance", "navigation"].includes(item)),
    authFail: authFail.filter((item): item is AuthFailureRule => /^((dashboard|cases|detail|chat|tenant|log|capabilities|tools|tenantUpdate|draft|reporting|usage|governance|compliance|navigation):(unauthorized|forbidden))$/.test(item)),
    authFailOnce: authFailOnce.filter((item): item is AuthFailureRule => /^((dashboard|cases|detail|chat|tenant|log|capabilities|tools|tenantUpdate|draft|reporting|usage|governance|compliance|navigation):(unauthorized|forbidden))$/.test(item))
  };
}
