// @ts-nocheck
import http from "node:http";
import fs from "node:fs";
import { URL } from "node:url";

const port = Number(process.env.OPITA_MOCK_API_PORT ?? 4799);
const dbPath = process.env.OPITA_MOCK_API_DB_PATH ?? "scripts/mock-remote-db.json";

const fallbackUsers = {
  "admin@mock.opita.test": { password: "Admin123!", role: "admin" },
  "tecnico@mock.opita.test": { password: "Tec12345!", role: "tecnico" }
};

function readDbUsers() {
  try {
    const parsed = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    if (parsed && typeof parsed === "object" && parsed.users && typeof parsed.users === "object") {
      return parsed.users;
    }
  } catch {
    return fallbackUsers;
  }
  return fallbackUsers;
}

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function notFound(res) {
  json(res, 404, { error: "not_found" });
}

function parseBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://127.0.0.1:${port}`);
  const path = url.pathname.replace(/^\//, "");

  if (method === "POST" && path === "auth/login") {
    const body = await parseBody(req);
    const users = readDbUsers();
    const user = users[String(body.email).toLowerCase()];
    if (!user || user.password !== body.password) {
      return json(res, 401, { error: "invalid_credentials" });
    }
    return json(res, 200, {
      accessToken: `mock-token-${user.role}`,
      expiresAt: "2027-01-01T00:00:00.000Z",
      bootstrap: {
        user: { id: `usr-${user.role}`, fullName: user.role === "admin" ? "Mock Admin" : "Mock Tecnico", email: body.email },
        tenant: { id: "tenant-mock", name: "Mock Tenant" },
        role: user.role,
        allowedViews: user.role === "admin" ? ["inicio", "casos", "configuracion"] : ["inicio", "chat", "casos", "detalle"]
      }
    });
  }

  if (method === "POST" && path === "drafts/generate") {
    return json(res, 200, {
      id: "DRF-MOCK-01",
      caseId: "CAS-2048",
      channel: "interno",
      tone: "Operativo formal",
      content: "Draft generado desde mock remote API.",
      requiresApproval: true,
      status: "pending_approval",
      auditId: "AUD-MOCK-DRF-01"
    });
  }

  if (method === "GET" && path === "reporting/value") {
    return json(res, 200, {
      periodLabel: "Mock period",
      metrics: [{ id: "m1", label: "Acciones positivas", value: "10", trend: "+2%", positiveImpact: "Mock impact" }]
    });
  }

  if (method === "GET" && path === "usage/attribution") {
    return json(res, 200, {
      tenantId: "tenant-mock",
      periodLabel: "Mock period",
      successfulActions: 42,
      totalEstimatedTokens: 4242
    });
  }

  if (method === "POST" && path === "usage/export") {
    return json(res, 200, {
      exportId: "EXP-MOCK-01",
      generatedAt: new Date().toISOString(),
      rows: 12
    });
  }

  if (method === "GET" && path === "governance/state") {
    return json(res, 200, {
      releaseChannel: "staging",
      capabilitiesCertified: 4,
      toolsCertified: 5,
      lastDeploymentAt: new Date().toISOString(),
      rollbackReady: true
    });
  }

  if (method === "POST" && path === "governance/action") {
    const body = await parseBody(req);
    return json(res, 200, {
      action: body.action ?? "approve_capability",
      status: "success",
      auditId: "AUD-MOCK-GOV-01",
      detail: "Mock governance action executed."
    });
  }

  if (method === "GET" && path === "compliance/retention-policy") {
    return json(res, 200, {
      tenantId: "tenant-mock",
      operationalRetentionDays: 365,
      auditRetentionDays: 1825,
      anonymizationRequiredForReuse: true,
      dataReuseDefaultOptIn: false
    });
  }

  if (method === "GET" && path === "compliance/data-reuse-consent") {
    return json(res, 200, {
      tenantId: "tenant-mock",
      enabled: false,
      updatedAt: new Date().toISOString(),
      auditId: "AUD-MOCK-CMP-READ"
    });
  }

  if (method === "POST" && path === "compliance/data-reuse-consent") {
    const body = await parseBody(req);
    return json(res, 200, {
      tenantId: "tenant-mock",
      enabled: Boolean(body.enabled),
      updatedAt: new Date().toISOString(),
      auditId: "AUD-MOCK-CMP-WRITE"
    });
  }

  if (method === "GET" && path === "navigation/manifest") {
    const role = url.searchParams.get("role") ?? "tecnico";
    return json(res, 200, {
      role,
      primaryViews: role === "admin" ? ["inicio", "casos", "configuracion"] : ["inicio", "chat", "casos", "detalle"],
      backofficeViews: role === "admin" ? ["inicio", "configuracion"] : []
    });
  }

  return notFound(res);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Mock remote API listening on http://127.0.0.1:${port} using ${dbPath}`);
});
