// @ts-nocheck
import process from "node:process";

const requiredEnv = [
  "OPITA_SMOKE_API_BASE_URL",
  "OPITA_SMOKE_ADMIN_EMAIL",
  "OPITA_SMOKE_ADMIN_PASSWORD",
  "OPITA_SMOKE_TECNICO_EMAIL",
  "OPITA_SMOKE_TECNICO_PASSWORD"
];

function missingVars() {
  return requiredEnv.filter((name) => !process.env[name]);
}

function toUrl(baseUrl, path, params = {}) {
  const url = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

async function request(baseUrl, path, { method = "GET", token, body, params } = {}) {
  const response = await fetch(toUrl(baseUrl, path, params), {
    method,
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    const payload = await response.text();
    throw new Error(`${method} ${path} failed with ${response.status}: ${payload.slice(0, 280)}`);
  }

  return await response.json();
}

async function signIn(baseUrl, email, password) {
  const session = await request(baseUrl, "auth/login", {
    method: "POST",
    body: { email, password }
  });
  return session?.accessToken;
}

async function runCheck(checks, label, runner) {
  try {
    await runner();
    checks.push({ label, status: "ok", detail: "" });
  } catch (error) {
    checks.push({
      label,
      status: "fail",
      detail: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

async function main() {
  const missing = missingVars();
  if (missing.length > 0) {
    console.log("Remote smoke skipped: missing required environment variables.");
    for (const name of missing) {
      console.log(`- ${name}`);
    }
    process.exit(0);
  }

  const allowMutations = process.env.OPITA_SMOKE_ALLOW_MUTATIONS === "true";
  const baseUrl = process.env.OPITA_SMOKE_API_BASE_URL;
  const checks = [];

  const adminToken = await signIn(baseUrl, process.env.OPITA_SMOKE_ADMIN_EMAIL, process.env.OPITA_SMOKE_ADMIN_PASSWORD);
  const tecnicoToken = await signIn(baseUrl, process.env.OPITA_SMOKE_TECNICO_EMAIL, process.env.OPITA_SMOKE_TECNICO_PASSWORD);

  if (!adminToken || !tecnicoToken) {
    throw new Error("Auth login did not return accessToken for smoke users.");
  }

  await runCheck(checks, "R3 drafts.generate", async () => {
    await request(baseUrl, "drafts/generate", {
      method: "POST",
      token: tecnicoToken,
      body: {
        caseId: "CAS-2048",
        prompt: "Smoke test draft generation",
        channel: "interno",
        tone: "Operativo formal"
      }
    });
  });

  await runCheck(checks, "R3 reporting.value", async () => {
    await request(baseUrl, "reporting/value", {
      token: tecnicoToken,
      params: { role: "tecnico" }
    });
  });

  await runCheck(checks, "R3 usage.attribution", async () => {
    await request(baseUrl, "usage/attribution", { token: adminToken });
  });

  await runCheck(checks, "R3 usage.export", async () => {
    if (!allowMutations) {
      return;
    }
    await request(baseUrl, "usage/export", {
      method: "POST",
      token: adminToken
    });
  });

  await runCheck(checks, "R4 governance.state", async () => {
    await request(baseUrl, "governance/state", { token: adminToken });
  });

  await runCheck(checks, "R4 governance.action", async () => {
    if (!allowMutations) {
      return;
    }
    await request(baseUrl, "governance/action", {
      method: "POST",
      token: adminToken,
      body: { action: "approve_capability" }
    });
  });

  await runCheck(checks, "R4 compliance.retention-policy", async () => {
    await request(baseUrl, "compliance/retention-policy", { token: adminToken });
  });

  await runCheck(checks, "R4 compliance.data-reuse-consent.read", async () => {
    await request(baseUrl, "compliance/data-reuse-consent", { token: adminToken });
  });

  await runCheck(checks, "R4 compliance.data-reuse-consent.write", async () => {
    if (!allowMutations) {
      return;
    }
    await request(baseUrl, "compliance/data-reuse-consent", {
      method: "POST",
      token: adminToken,
      body: { enabled: false }
    });
  });

  await runCheck(checks, "R4 navigation.manifest", async () => {
    await request(baseUrl, "navigation/manifest", {
      token: tecnicoToken,
      params: { role: "tecnico" }
    });
  });

  await runCheck(checks, "AI tenant-config.test-ai", async () => {
    await request(baseUrl, "tenant-config/test-ai", {
      method: "POST",
      token: adminToken
    });
  });

  await runCheck(checks, "AI chat.message", async () => {
    await request(baseUrl, "chat/message", {
      method: "POST",
      token: adminToken,
      body: {
        caseId: process.env.OPITA_SMOKE_CASE_ID ?? "CAS-2048",
        message: "Prueba de integracion del orquestador con historial y estados visibles."
      }
    });
  });

  const failures = checks.filter((item) => item.status === "fail");
  for (const check of checks) {
    const suffix = check.detail ? ` -> ${check.detail}` : "";
    console.log(`[${check.status.toUpperCase()}] ${check.label}${suffix}`);
  }

  if (failures.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
