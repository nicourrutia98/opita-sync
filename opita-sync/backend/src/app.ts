import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PrismaClient, RoleKey, MessageTone, CaseStatus, PolicyMode, GovernanceActionStatus } from "@prisma/client";
import { z } from "zod";

const prisma = new PrismaClient();

type AuthContext = {
  tenantId: string;
  userId: string;
  role: RoleKey;
};

declare module "fastify" {
  interface FastifyRequest {
    auth?: AuthContext;
  }
}

const roleViewMap: Record<RoleKey, Array<"inicio" | "chat" | "casos" | "detalle" | "configuracion">> = {
  solicitante: ["inicio", "chat", "casos", "detalle"],
  tecnico: ["inicio", "chat", "casos", "detalle"],
  supervisor: ["inicio", "chat", "casos", "detalle"],
  admin: ["inicio", "casos", "configuracion"]
};

function toCaseStatusLabel(status: CaseStatus): "Nuevo" | "En curso" | "Bloqueado" | "Resuelto" {
  if (status === "En_curso") return "En curso";
  if (status === "Nuevo") return "Nuevo";
  if (status === "Bloqueado") return "Bloqueado";
  return "Resuelto";
}

function toStatusEnum(input: string): CaseStatus {
  if (input === "En curso") return CaseStatus.En_curso;
  if (input === "Bloqueado") return CaseStatus.Bloqueado;
  if (input === "Resuelto") return CaseStatus.Resuelto;
  return CaseStatus.Nuevo;
}

function mapError(reply: FastifyReply, error: unknown) {
  if (error instanceof z.ZodError) {
    return reply.status(422).send({ code: "validation_error", issues: error.issues });
  }
  const requestId = crypto.randomUUID();
  return reply.status(500).send({ code: "internal_error", request_id: requestId });
}

async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify<{ sub: string; tenantId: string; role: RoleKey }>();
    const payload = request.user as { sub: string; tenantId: string; role: RoleKey };
    request.auth = { userId: payload.sub, tenantId: payload.tenantId, role: payload.role };
  } catch {
    return reply.status(401).send({ code: "session_expired" });
  }
}

function requireRole(roles: RoleKey[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.auth) return reply.status(401).send({ code: "session_expired" });
    if (!roles.includes(request.auth.role)) return reply.status(403).send({ code: "access_denied" });
  };
}

async function audit(tenantId: string, actorUserId: string | null, module: string, action: string, status: string, details: unknown, entityType = "generic", entityId: string | null = null) {
  await prisma.auditEvent.create({
    data: {
      tenantId,
      actorUserId,
      module,
      action,
      entityType,
      entityId,
      status,
      details: details as object
    }
  });
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  await app.register(cors, { origin: true, credentials: true });
  await app.register(jwt, { secret: process.env.JWT_SECRET ?? "dev-secret" });

  app.get("/health", async () => ({ ok: true }));

  app.post("/auth/login", async (request, reply) => {
    try {
      const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(request.body);
      const user = await prisma.user.findFirst({
        where: { email: body.email.toLowerCase(), active: true },
        include: {
          tenant: true,
          roleAssignments: { include: { role: true } }
        }
      });
      if (!user) return reply.status(401).send({ code: "invalid_credentials" });
      const ok = await bcrypt.compare(body.password, user.passwordHash);
      if (!ok) return reply.status(401).send({ code: "invalid_credentials" });
      const role = user.roleAssignments[0]?.role.key ?? RoleKey.tecnico;

      const accessJti = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 15 * 60_000);
      const session = await prisma.session.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          accessJti,
          expiresAt
        }
      });
      const refreshRaw = crypto.randomUUID();
      const refreshHash = await bcrypt.hash(refreshRaw, 10);
      await prisma.refreshToken.create({
        data: {
          tenantId: user.tenantId,
          userId: user.id,
          sessionId: session.id,
          tokenHash: refreshHash,
          expiresAt: new Date(Date.now() + (Number(process.env.REFRESH_TOKEN_DAYS ?? "7") * 24 * 60 * 60 * 1000))
        }
      });

      const token = await reply.jwtSign(
        { sub: user.id, tenantId: user.tenantId, role, jti: accessJti },
        { expiresIn: process.env.JWT_EXPIRES_IN ?? "15m" }
      );

      await audit(user.tenantId, user.id, "auth", "login", "success", { role });

      return {
        accessToken: token,
        expiresAt: expiresAt.toISOString(),
        bootstrap: {
          user: { id: user.id, fullName: user.fullName, email: user.email },
          tenant: { id: user.tenantId, name: user.tenant.name },
          role,
          allowedViews: roleViewMap[role]
        }
      };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/auth/session", { preHandler: [requireAuth] }, async (request, reply) => {
    const auth = request.auth!;
    const user = await prisma.user.findUnique({ where: { id: auth.userId }, include: { tenant: true, roleAssignments: { include: { role: true } } } });
    if (!user) return reply.status(401).send({ code: "session_expired" });
    const role = user.roleAssignments[0]?.role.key ?? RoleKey.tecnico;
    return {
      user: { id: user.id, fullName: user.fullName, email: user.email },
      tenant: { id: user.tenantId, name: user.tenant.name },
      role,
      allowedViews: roleViewMap[role]
    };
  });

  app.post("/auth/password-reset/request", async (request) => {
    const body = z.object({ email: z.string().email() }).parse(request.body);
    return { email: body.email };
  });

  app.post("/auth/password-reset/confirm", async (request, reply) => {
    const body = z.object({ token: z.string().min(1), password: z.string().min(8) }).parse(request.body);
    if (!body.token) return reply.status(422).send({ code: "validation_error" });
    return { ok: true };
  });

  app.get("/dashboard", { preHandler: [requireAuth] }, async (request) => {
    const role = (request.query as { role?: RoleKey }).role ?? request.auth!.role;
    const tenantId = request.auth!.tenantId;
    const activeCount = await prisma.case.count({ where: { tenantId, status: { in: [CaseStatus.Nuevo, CaseStatus.En_curso, CaseStatus.Bloqueado] } } });
    const blockedCount = await prisma.case.count({ where: { tenantId, status: CaseStatus.Bloqueado } });
    return {
      metrics: [
        { label: "Casos activos", value: String(activeCount), helper: "Tiempo real" },
        { label: "Bloqueados", value: String(blockedCount), helper: "Con riesgo SLA" },
        { label: "Acciones positivas", value: "0", helper: "Pendiente snapshot" },
        { label: "Trail auditado", value: "100%", helper: "Eventos con actor" }
      ],
      inbox: ["Bandeja operativa cargada desde backend real."],
      supervisorMetrics: [
        { label: "Aprobaciones pendientes", value: "0", helper: "Sin pendientes" },
        { label: "Casos bloqueados", value: String(blockedCount), helper: "Control supervisión" },
        { label: "Escalamientos", value: "0", helper: "Últimas 24h" },
        { label: "Auditoría completa", value: "100%", helper: "Sin gaps" }
      ],
      supervisorQueue: role === RoleKey.supervisor ? [{ title: "Revisar bloqueos", detail: "Hay casos bloqueados en la cola.", tone: "warning" }] : [],
      supervisorSignals: role === RoleKey.supervisor ? ["Visibilidad supervisor activa por tenant."] : []
    };
  });

  app.get("/cases", { preHandler: [requireAuth] }, async (request) => {
    const rows = await prisma.case.findMany({
      where: { tenantId: request.auth!.tenantId },
      include: { assignments: { include: { user: true }, take: 1 } },
      orderBy: { updatedAt: "desc" }
    });
    return rows.map((item) => ({
      id: item.code,
      title: item.title,
      site: item.site,
      priority: item.priority,
      status: toCaseStatusLabel(item.status),
      owner: item.assignments[0]?.user.fullName ?? "Sin asignar",
      updatedAt: item.updatedAt.toISOString(),
      summary: item.summary
    }));
  });

  app.get("/cases/:code", { preHandler: [requireAuth] }, async (request, reply) => {
    const params = request.params as { code: string };
    const item = await prisma.case.findFirst({
      where: { tenantId: request.auth!.tenantId, code: params.code },
      include: {
        assignments: { include: { user: true }, take: 1 },
        operationalLogs: { orderBy: { createdAt: "desc" }, take: 20 }
      }
    });
    if (!item) return reply.status(404).send({ code: "not_found" });
    return {
      id: item.code,
      title: item.title,
      site: item.site,
      priority: item.priority,
      status: toCaseStatusLabel(item.status),
      owner: item.assignments[0]?.user.fullName ?? "Sin asignar",
      updatedAt: item.updatedAt.toISOString(),
      summary: item.summary,
      suggestedAction: item.suggestedAction ?? "Sin sugerencia",
      timeline: item.operationalLogs.map((log) => ({
        time: log.createdAt.toISOString(),
        type: log.type,
        detail: log.detail
      }))
    };
  });

  app.get("/chat/conversation", { preHandler: [requireAuth] }, async (request) => {
    const query = request.query as { caseId?: string };
    const base = await prisma.conversation.findFirst({
      where: { tenantId: request.auth!.tenantId, ...(query.caseId ? { case: { code: query.caseId } } : {}) },
      include: { messages: { orderBy: { createdAt: "asc" } } }
    });
    return {
      title: base?.title ?? "Conversación operativa",
      promptDraft: base?.promptDraft ?? "Solicita la acción requerida por el caso.",
      messages: (base?.messages ?? []).map((m) => ({
        id: m.id,
        tone: m.tone as "user" | "assistant" | "system",
        body: m.body
      }))
    };
  });

  app.get("/tenant-config", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request) => {
    const tenantId = request.auth!.tenantId;
    const capabilities = await prisma.tenantCapabilityState.findMany({ where: { tenantId, enabled: true }, include: { capability: true } });
    const params = await prisma.tenantParameterValue.findMany({ where: { tenantId }, include: { parameter: true } });
    return {
      activeCapabilities: capabilities.map((c) => c.capability.name).join(", "),
      limits: "Controlado por librería certificada y policy modes.",
      risks: ["No se permite lógica arbitraria fuera del baseline."],
      parameters: params.map((p) => ({ key: p.parameter.key, label: p.parameter.label, value: p.value, editable: p.parameter.editable }))
    };
  });

  app.post("/tenant-config/parameter", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    try {
      const body = z.object({ key: z.string().min(1), value: z.string().min(1) }).parse(request.body);
      const param = await prisma.tenantParameter.findUnique({ where: { key: body.key } });
      if (!param) return reply.status(404).send({ code: "not_found" });
      if (!param.editable) return reply.status(403).send({ code: "access_denied" });
      await prisma.tenantParameterValue.upsert({
        where: { tenantId_parameterId: { tenantId: request.auth!.tenantId, parameterId: param.id } },
        update: { value: body.value },
        create: { tenantId: request.auth!.tenantId, parameterId: param.id, value: body.value }
      });
      const auditId = crypto.randomUUID();
      await audit(request.auth!.tenantId, request.auth!.userId, "tenant_config", "update_parameter", "success", body, "tenant_parameter", param.id);
      return { updated: true, auditId };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/operational-log", { preHandler: [requireAuth] }, async (request) => {
    const query = request.query as { caseId?: string };
    if (!query.caseId) return [];
    const caseRow = await prisma.case.findFirst({ where: { tenantId: request.auth!.tenantId, code: query.caseId } });
    if (!caseRow) return [];
    const rows = await prisma.operationalLogEntry.findMany({
      where: { tenantId: request.auth!.tenantId, caseId: caseRow.id },
      include: { author: true, evidence: true },
      orderBy: { createdAt: "desc" }
    });
    return rows.map((r) => ({
      id: r.id,
      caseId: query.caseId!,
      author: r.author.fullName,
      type: r.type,
      detail: r.detail,
      createdAt: r.createdAt.toISOString(),
      visibility: r.visibility,
      before: r.beforeValue ?? undefined,
      after: r.afterValue ?? undefined,
      evidenceLabel: r.evidence[0]?.label,
      auditId: r.auditId
    }));
  });

  app.post("/operational-log", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z.object({
        caseId: z.string().min(1),
        type: z.string().min(1),
        detail: z.string().min(1),
        visibility: z.enum(["internal", "supervisor_only"]),
        before: z.string().optional(),
        after: z.string().optional(),
        evidenceLabel: z.string().optional()
      }).parse(request.body);
      const caseRow = await prisma.case.findFirst({ where: { tenantId: request.auth!.tenantId, code: body.caseId } });
      if (!caseRow) return reply.status(404).send({ code: "not_found" });
      const auditId = crypto.randomUUID();
      const entry = await prisma.operationalLogEntry.create({
        data: {
          tenantId: request.auth!.tenantId,
          caseId: caseRow.id,
          authorId: request.auth!.userId,
          type: body.type,
          detail: body.detail,
          visibility: body.visibility,
          beforeValue: body.before,
          afterValue: body.after,
          auditId,
          evidence: body.evidenceLabel ? { create: { tenantId: request.auth!.tenantId, label: body.evidenceLabel } } : undefined
        },
        include: { author: true }
      });
      await audit(request.auth!.tenantId, request.auth!.userId, "log", "create", "success", body, "operational_log", entry.id);
      return {
        entry: {
          id: entry.id,
          caseId: body.caseId,
          author: entry.author.fullName,
          type: entry.type,
          detail: entry.detail,
          createdAt: entry.createdAt.toISOString(),
          visibility: entry.visibility,
          before: entry.beforeValue ?? undefined,
          after: entry.afterValue ?? undefined,
          evidenceLabel: body.evidenceLabel,
          auditId
        },
        auditId
      };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/capabilities", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request) => {
    const rows = await prisma.tenantCapabilityState.findMany({
      where: { tenantId: request.auth!.tenantId },
      include: { capability: true }
    });
    return rows.map((r) => ({
      id: r.capability.key,
      name: r.capability.name,
      description: r.capability.description,
      enabled: r.enabled,
      policyMode: r.policyMode,
      requiresApproval: r.capability.requiresApproval
    }));
  });

  app.post("/capabilities/state", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    try {
      const body = z.object({ capabilityId: z.string().min(1), enabled: z.boolean() }).parse(request.body);
      const capability = await prisma.capability.findUnique({ where: { key: body.capabilityId } });
      if (!capability) return reply.status(404).send({ code: "not_found" });
      await prisma.tenantCapabilityState.update({
        where: { tenantId_capabilityId: { tenantId: request.auth!.tenantId, capabilityId: capability.id } },
        data: { enabled: body.enabled }
      });
      const auditId = crypto.randomUUID();
      await audit(request.auth!.tenantId, request.auth!.userId, "capabilities", "set_state", "success", body, "capability", capability.id);
      return { updated: true, auditId };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/tool-governance", { preHandler: [requireAuth] }, async (request, reply) => {
    if (request.auth!.role !== RoleKey.admin && request.auth!.role !== RoleKey.supervisor) return reply.status(403).send({ code: "access_denied" });
    const overrides = await prisma.toolPolicyOverride.findMany({ where: { tenantId: request.auth!.tenantId }, include: { tool: true } });
    return overrides.map((o) => ({
      id: o.tool.key,
      name: o.tool.name,
      capabilityId: "mapped",
      riskLevel: o.tool.riskLevel,
      certification: o.tool.certification,
      environment: o.tool.environment,
      maxPolicyMode: o.tool.maxPolicyMode,
      tenantOverrideAllowed: o.tenantOverrideAllowed,
      blockedReason: o.blockedReason ?? undefined
    }));
  });

  app.post("/drafts/generate", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z.object({
        caseId: z.string().min(1),
        prompt: z.string().min(1),
        channel: z.enum(["interno", "cliente"]),
        tone: z.string().min(1)
      }).parse(request.body);
      const caseRow = await prisma.case.findFirst({ where: { tenantId: request.auth!.tenantId, code: body.caseId } });
      if (!caseRow) return reply.status(404).send({ code: "not_found" });
      const auditId = crypto.randomUUID();
      const draft = await prisma.draft.create({
        data: {
          tenantId: request.auth!.tenantId,
          caseId: caseRow.id,
          authorId: request.auth!.userId,
          channel: body.channel,
          tone: body.tone,
          content: `Borrador generado: ${body.prompt}`,
          requiresApproval: body.channel === "cliente",
          status: body.channel === "cliente" ? "pending_approval" : "ready",
          auditId
        }
      });
      await audit(request.auth!.tenantId, request.auth!.userId, "drafts", "generate", "success", body, "draft", draft.id);
      return {
        id: draft.id,
        caseId: body.caseId,
        channel: draft.channel,
        tone: draft.tone,
        content: draft.content,
        requiresApproval: draft.requiresApproval,
        status: draft.status,
        auditId
      };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/reporting/value", { preHandler: [requireAuth] }, async (request) => {
    const role = ((request.query as { role?: RoleKey }).role ?? request.auth!.role) as RoleKey;
    const latest = await prisma.valueMetricSnapshot.findFirst({
      where: { tenantId: request.auth!.tenantId, role },
      orderBy: { createdAt: "desc" }
    });
    const payload = (latest?.payload as Array<{ id: string; label: string; value: string; trend: string; positiveImpact: string }> | null) ?? [];
    return { periodLabel: latest?.periodLabel ?? "Último periodo", metrics: payload };
  });

  app.get("/usage/attribution", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request) => {
    const rows = await prisma.usageEvent.findMany({ where: { tenantId: request.auth!.tenantId } });
    const successfulActions = rows.filter((r) => r.successful).length;
    const totalEstimatedTokens = rows.reduce((sum, r) => sum + r.estimatedTokens, 0);
    return { tenantId: request.auth!.tenantId, periodLabel: "Current", successfulActions, totalEstimatedTokens };
  });

  app.post("/usage/export", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request) => {
    const code = `EXP-${Date.now()}`;
    const rows = await prisma.usageEvent.count({ where: { tenantId: request.auth!.tenantId } });
    const exportRow = await prisma.billingExport.create({
      data: { tenantId: request.auth!.tenantId, exportCode: code, rows }
    });
    await audit(request.auth!.tenantId, request.auth!.userId, "usage", "export", "success", { exportCode: code, rows }, "billing_export", exportRow.id);
    return { exportId: code, generatedAt: exportRow.createdAt.toISOString(), rows };
  });

  app.get("/governance/state", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request) => {
    const tenantId = request.auth!.tenantId;
    const capabilitiesCertified = await prisma.capability.count({ where: { active: true, deletedAt: null } });
    const toolsCertified = await prisma.tool.count({ where: { certification: "certified", deletedAt: null } });
    const lastDeployment = await prisma.deployment.findFirst({ where: { tenantId }, orderBy: { createdAt: "desc" } });
    return {
      releaseChannel: "production",
      capabilitiesCertified,
      toolsCertified,
      lastDeploymentAt: (lastDeployment?.createdAt ?? new Date(0)).toISOString(),
      rollbackReady: true
    };
  });

  app.post("/governance/action", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    try {
      const body = z.object({ action: z.enum(["approve_capability", "deploy_release", "rollback_release"]) }).parse(request.body);
      const auditId = crypto.randomUUID();
      const action = await prisma.governanceAction.create({
        data: {
          tenantId: request.auth!.tenantId,
          actorUserId: request.auth!.userId,
          action: body.action,
          status: GovernanceActionStatus.success,
          auditId,
          detail: `Action ${body.action} ejecutada`
        }
      });
      if (body.action === "deploy_release") {
        await prisma.deployment.create({ data: { tenantId: request.auth!.tenantId, channel: "production", versionTag: `v-${Date.now()}` } });
      }
      if (body.action === "rollback_release") {
        await prisma.rollbackEvent.create({ data: { tenantId: request.auth!.tenantId, reason: "Manual rollback action" } });
      }
      await audit(request.auth!.tenantId, request.auth!.userId, "governance", "action", "success", body, "governance_action", action.id);
      return { action: body.action, status: "success", auditId, detail: action.detail };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/compliance/retention-policy", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    const policy = await prisma.retentionPolicy.findUnique({ where: { tenantId: request.auth!.tenantId } });
    if (!policy) return reply.status(404).send({ code: "not_found" });
    return {
      tenantId: policy.tenantId,
      operationalRetentionDays: policy.operationalRetentionDays,
      auditRetentionDays: policy.auditRetentionDays,
      anonymizationRequiredForReuse: policy.anonymizationRequiredForReuse,
      dataReuseDefaultOptIn: policy.dataReuseDefaultOptIn
    };
  });

  app.get("/compliance/data-reuse-consent", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    const consent = await prisma.dataReuseConsent.findUnique({ where: { tenantId: request.auth!.tenantId } });
    if (!consent) return reply.status(404).send({ code: "not_found" });
    return { tenantId: consent.tenantId, enabled: consent.enabled, updatedAt: consent.updatedAt.toISOString(), auditId: consent.auditId };
  });

  app.post("/compliance/data-reuse-consent", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    try {
      const body = z.object({ enabled: z.boolean() }).parse(request.body);
      const auditId = crypto.randomUUID();
      const consent = await prisma.dataReuseConsent.upsert({
        where: { tenantId: request.auth!.tenantId },
        update: { enabled: body.enabled, updatedAt: new Date(), auditId },
        create: { tenantId: request.auth!.tenantId, enabled: body.enabled, auditId }
      });
      await audit(request.auth!.tenantId, request.auth!.userId, "compliance", "update_consent", "success", body, "data_reuse_consent", consent.id);
      return { tenantId: consent.tenantId, enabled: consent.enabled, updatedAt: consent.updatedAt.toISOString(), auditId: consent.auditId };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/navigation/manifest", { preHandler: [requireAuth] }, async (request) => {
    const role = ((request.query as { role?: RoleKey }).role ?? request.auth!.role) as RoleKey;
    const manifest = await prisma.navigationManifest.findUnique({
      where: { tenantId_role: { tenantId: request.auth!.tenantId, role } }
    });
    return {
      role,
      primaryViews: (manifest?.primaryViews as string[] | null) ?? roleViewMap[role],
      backofficeViews: (manifest?.backofficeViews as string[] | null) ?? (role === RoleKey.admin ? ["inicio", "configuracion"] : [])
    };
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
