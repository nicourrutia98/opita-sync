import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { PrismaClient, RoleKey, MessageTone, CaseStatus, PolicyMode, GovernanceActionStatus, AssistantRunStatus, AssistantRunPhase } from "@prisma/client";
import { z } from "zod";
import { AssistantProviderError, runAssistantTurn, testTenantAssistantConnection } from "./assistant-provider.js";
import { buildConversationAutotitle, buildInitialConversationTitle, buildInitialPromptDraft, buildToolEventId, isPlaceholderConversationTitle } from "./chat-helpers.js";

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
  admin: ["chat", "inicio", "casos", "detalle", "configuracion"]
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
  if (error instanceof AssistantProviderError) {
    return reply.status(error.statusCode).send({ code: "assistant_error", message: error.message });
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

const activeRunControllers = new Map<string, AbortController>();

function serializeConversationMessage(message: { id: string; conversationId: string; tone: MessageTone; body: string; createdAt: Date; runId?: string | null }) {
  return {
    id: message.id,
    conversationId: message.conversationId,
    role: message.tone as "user" | "assistant" | "system",
    content: message.body,
    createdAt: message.createdAt.toISOString(),
    runId: message.runId ?? undefined
  };
}

function serializeConversation(message: { id: string; title: string; caseId: string | null; promptDraft: string; updatedAt: Date; archivedAt?: Date | null; createdAt?: Date }) {
  return {
    id: message.id,
    title: message.title,
    caseId: message.caseId ?? undefined,
    promptDraft: message.promptDraft,
    updatedAt: message.updatedAt.toISOString(),
    archivedAt: message.archivedAt?.toISOString() ?? undefined,
    createdAt: message.createdAt?.toISOString()
  };
}

async function findPreferredConversationCase(tenantId: string, userId: string, caseCode?: string | null) {
  if (caseCode) {
    const explicitCase = await prisma.case.findFirst({
      where: { tenantId, code: caseCode }
    });
    if (explicitCase) {
      return explicitCase;
    }
  }

  const assignedCase = await prisma.case.findFirst({
    where: { tenantId, assignments: { some: { userId } } },
    orderBy: { updatedAt: "desc" }
  });
  if (assignedCase) {
    return assignedCase;
  }

  return prisma.case.findFirst({
    where: { tenantId },
    orderBy: { updatedAt: "desc" }
  });
}

async function ensureUserConversation(tenantId: string, userId: string, caseCode?: string | null) {
  const where = caseCode
    ? { tenantId, userId, case: { code: caseCode } }
    : { tenantId, userId };
  const existing = await prisma.conversation.findFirst({
    where,
    orderBy: { updatedAt: "desc" }
  });

  if (existing) {
    return existing;
  }

  const caseRow = await findPreferredConversationCase(tenantId, userId, caseCode);
  const conversation = await prisma.conversation.create({
    data: {
      tenantId,
      caseId: caseRow?.id ?? null,
      userId,
      title: buildInitialConversationTitle(caseRow?.code),
      promptDraft: buildInitialPromptDraft(caseRow?.code)
    }
  });

  await prisma.conversationMessage.create({
    data: {
      tenantId,
      conversationId: conversation.id,
      authorId: null,
      tone: MessageTone.assistant,
      body: caseRow
        ? `Ya dejé listo tu hilo para trabajar sobre ${caseRow.code}. Contame qué necesitás resolver.`
        : "Ya dejé listo tu hilo operativo. Contame qué necesitás resolver."
    }
  });

  return conversation;
}

async function createConversationRecord(tenantId: string, userId: string, caseCode?: string | null) {
  const caseRow = await findPreferredConversationCase(tenantId, userId, caseCode);
  return prisma.conversation.create({
    data: {
      tenantId,
      caseId: caseRow?.id ?? null,
      userId,
      title: buildInitialConversationTitle(caseRow?.code),
      promptDraft: buildInitialPromptDraft(caseRow?.code)
    }
  });
}

async function getConversationSummaryById(tenantId: string, userId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, tenantId, userId },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 6 },
      runs: { orderBy: { updatedAt: "desc" }, take: 1 }
    }
  });
  return conversation ? serializeConversationSummary(conversation) : null;
}

function serializeConversationSummary(conversation: {
  id: string;
  title: string;
  caseId: string | null;
  updatedAt: Date;
  archivedAt?: Date | null;
  createdAt?: Date;
  messages: Array<{ tone: MessageTone; body: string }>;
  runs?: Array<{ status: AssistantRunStatus }>;
}) {
  const lastVisibleMessage = [...conversation.messages].reverse().find((item) => item.tone !== MessageTone.system);
  return {
    id: conversation.id,
    title: conversation.title,
    caseId: conversation.caseId ?? undefined,
    lastMessagePreview: lastVisibleMessage?.body ?? "Sin mensajes todavia.",
    updatedAt: conversation.updatedAt.toISOString(),
    status: conversation.runs?.[0]?.status ?? AssistantRunStatus.completed,
    archivedAt: conversation.archivedAt?.toISOString() ?? undefined,
    createdAt: conversation.createdAt?.toISOString()
  };
}

function encodeMessageCursor(message: { createdAt: Date; id: string }) {
  return `${message.createdAt.toISOString()}:${message.id}`;
}

function decodeMessageCursor(cursor?: string) {
  if (!cursor) {
    return null;
  }
  const divider = cursor.lastIndexOf(":");
  if (divider === -1) {
    return null;
  }
  return {
    createdAt: cursor.slice(0, divider),
    id: cursor.slice(divider + 1)
  };
}

function chunkText(text: string, chunkSize = 42) {
  const chunks: string[] = [];
  for (let index = 0; index < text.length; index += chunkSize) {
    chunks.push(text.slice(index, index + chunkSize));
  }
  return chunks.length ? chunks : [text];
}

async function writeNdjson(reply: FastifyReply, payload: unknown) {
  reply.raw.write(`${JSON.stringify(payload)}\n`);
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
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
    const successfulActions = await prisma.usageEvent.count({ where: { tenantId, successful: true } });
    const pendingDrafts = await prisma.draft.count({ where: { tenantId, status: "pending_approval" } });
    const certifiedTools = await prisma.tool.count({ where: { certification: "certified", deletedAt: null } });
    const latestLog = await prisma.operationalLogEntry.findFirst({
      where: { tenantId },
      include: { case: true },
      orderBy: { createdAt: "desc" }
    });
    const blockedCases = await prisma.case.findMany({
      where: { tenantId, status: CaseStatus.Bloqueado },
      orderBy: { updatedAt: "desc" },
      take: 3
    });
    const pendingApprovalDraft = await prisma.draft.findFirst({
      where: { tenantId, status: "pending_approval" },
      include: { case: true },
      orderBy: { createdAt: "desc" }
    });
    return {
      metrics: [
        { label: "Casos activos", value: String(activeCount), helper: "Casos abiertos en el tenant" },
        ...(blockedCount > 0 ? [{ label: "Bloqueados", value: String(blockedCount), helper: "Requieren destrabe operativo" }] : []),
        ...(successfulActions > 0 ? [{ label: "Acciones exitosas", value: String(successfulActions), helper: "Registradas en usage" }] : []),
        ...(pendingDrafts > 0 ? [{ label: "Aprobaciones pendientes", value: String(pendingDrafts), helper: "Borradores en espera" }] : []),
        ...(certifiedTools > 0 ? [{ label: "Herramientas certificadas", value: String(certifiedTools), helper: "Disponibles para operar" }] : [])
      ],
      inbox: [
        ...(latestLog ? [`Ultimo movimiento: ${latestLog.type} en ${latestLog.case.code}.`] : []),
        ...blockedCases.slice(0, 2).map((item) => `${item.code} sigue bloqueado en ${item.site}.`),
        ...(pendingApprovalDraft ? [`${pendingApprovalDraft.case.code} tiene un borrador pendiente de aprobacion.`] : [])
      ],
      supervisorMetrics: [
        ...(pendingDrafts > 0 ? [{ label: "Aprobaciones pendientes", value: String(pendingDrafts), helper: "Borradores por revisar" }] : []),
        ...(blockedCount > 0 ? [{ label: "Casos bloqueados", value: String(blockedCount), helper: "Seguimiento supervisor" }] : []),
        ...(successfulActions > 0 ? [{ label: "Acciones exitosas", value: String(successfulActions), helper: "Con evidencia registrada" }] : []),
        ...(certifiedTools > 0 ? [{ label: "Herramientas certificadas", value: String(certifiedTools), helper: "Disponibles en el tenant" }] : [])
      ],
      supervisorQueue:
        role === RoleKey.supervisor
          ? [
              ...blockedCases.map((item) => ({
                title: `Destrabar ${item.code}`,
                detail: `${item.title} continua bloqueado en ${item.site}.`,
                tone: "warning" as const
              })),
              ...(pendingApprovalDraft
                ? [
                    {
                      title: `Revisar borrador de ${pendingApprovalDraft.case.code}`,
                      detail: "Hay una aprobacion pendiente antes de continuar la operacion.",
                      tone: "brand" as const
                    }
                  ]
                : [])
            ]
          : [],
      supervisorSignals:
        role === RoleKey.supervisor
          ? [
              ...(blockedCount > 0 ? [`${blockedCount} caso(s) bloqueado(s) requieren seguimiento.`] : []),
              ...(pendingDrafts > 0 ? [`${pendingDrafts} borrador(es) esperan aprobacion.`] : []),
              ...(latestLog ? [`Ultima evidencia registrada a las ${latestLog.createdAt.toISOString()}.`] : [])
            ]
          : []
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

  app.get("/conversations", { preHandler: [requireAuth] }, async (request) => {
    const query = request.query as { limit?: string; includeArchived?: string };
    const limit = Math.min(Number(query.limit ?? "20") || 20, 50);
    const includeArchived = query.includeArchived === "true";
    const conversations = await prisma.conversation.findMany({
      where: {
        tenantId: request.auth!.tenantId,
        userId: request.auth!.userId,
        ...(includeArchived ? {} : { archivedAt: null })
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        messages: { orderBy: { createdAt: "desc" }, take: 6 },
        runs: { orderBy: { updatedAt: "desc" }, take: 1 }
      }
    });

    return conversations.map(serializeConversationSummary);
  });

  app.post("/conversations", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z.object({ caseId: z.string().optional() }).optional().parse(request.body ?? {});
      const conversation = await createConversationRecord(request.auth!.tenantId, request.auth!.userId, body?.caseId ?? null);
      const summary = await getConversationSummaryById(request.auth!.tenantId, request.auth!.userId, conversation.id);
      if (!summary) {
        return reply.status(500).send({ code: "internal_error" });
      }
      return summary;
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.patch("/conversations/:id", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const params = request.params as { id: string };
      const body = z
        .object({
          title: z.string().min(1).max(80).optional(),
          archived: z.boolean().optional()
        })
        .refine((value) => value.title !== undefined || value.archived !== undefined, { message: "Debes enviar al menos un cambio." })
        .parse(request.body ?? {});
      const conversation = await prisma.conversation.findFirst({
        where: { id: params.id, tenantId: request.auth!.tenantId, userId: request.auth!.userId }
      });
      if (!conversation) {
        return reply.status(404).send({ code: "not_found" });
      }

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          ...(body.title ? { title: body.title.trim() } : {}),
          ...(body.archived !== undefined ? { archivedAt: body.archived ? new Date() : null } : {}),
          updatedAt: new Date()
        }
      });

      const summary = await getConversationSummaryById(request.auth!.tenantId, request.auth!.userId, conversation.id);
      if (!summary) {
        return reply.status(404).send({ code: "not_found" });
      }
      return summary;
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post("/conversations/bootstrap", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const body = z.object({ caseId: z.string().optional() }).optional().parse(request.body ?? {});
      const conversation = await ensureUserConversation(request.auth!.tenantId, request.auth!.userId, body?.caseId ?? null);
      return serializeConversation(conversation);
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.get("/conversations/:id/messages", { preHandler: [requireAuth] }, async (request, reply) => {
    const params = request.params as { id: string };
    const query = request.query as { before?: string; limit?: string };
    const limit = Math.min(Number(query.limit ?? "30") || 30, 100);
    const cursor = decodeMessageCursor(query.before);
    const conversation = await prisma.conversation.findFirst({
      where: { id: params.id, tenantId: request.auth!.tenantId, userId: request.auth!.userId }
    });
    if (!conversation) {
      return reply.status(404).send({ code: "not_found" });
    }
    const messages = await prisma.conversationMessage.findMany({
      where: {
        tenantId: request.auth!.tenantId,
        conversationId: params.id,
        tone: { in: [MessageTone.user, MessageTone.assistant] },
        ...(cursor
          ? {
              OR: [
                { createdAt: { lt: new Date(cursor.createdAt) } },
                {
                  createdAt: new Date(cursor.createdAt),
                  id: { lt: cursor.id }
                }
              ]
            }
          : {})
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1
    });
    const hasMoreBefore = messages.length > limit;
    const slice = hasMoreBefore ? messages.slice(0, limit) : messages;
    const chronological = [...slice].reverse();
    const previousAnchor = messages[limit];
    return {
      items: chronological.map(serializeConversationMessage),
      prevCursor: previousAnchor ? encodeMessageCursor(previousAnchor) : null,
      hasMoreBefore
    };
  });

  app.post("/conversations/:id/messages", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const params = request.params as { id: string };
      const body = z.object({
        content: z.string().min(1),
        attachments: z.array(z.object({ id: z.string(), name: z.string() })).optional(),
        metadata: z.record(z.string()).optional()
      }).parse(request.body);
      const tenantId = request.auth!.tenantId;
      const userId = request.auth!.userId;
      const conversation = await prisma.conversation.findFirst({
        where: { id: params.id, tenantId, userId }
      });
      if (!conversation) {
        return reply.status(404).send({ code: "not_found" });
      }
      const activeRun = await prisma.assistantRun.findFirst({
        where: { tenantId, conversationId: conversation.id, status: { in: [AssistantRunStatus.queued, AssistantRunStatus.running] } },
        orderBy: { createdAt: "desc" }
      });
      if (activeRun) {
        return reply.status(409).send({ code: "run_in_progress", message: "Ya hay una respuesta en curso para esta conversacion." });
      }

      const userMessage = await prisma.conversationMessage.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          authorId: userId,
          tone: MessageTone.user,
          body: body.content
        }
      });

      const run = await prisma.assistantRun.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          userMessageId: userMessage.id,
          status: AssistantRunStatus.queued,
          phase: AssistantRunPhase.thinking
        }
      });

      const nextTitle =
        isPlaceholderConversationTitle(conversation.title) && body.content.trim()
          ? buildConversationAutotitle(body.content, conversation.title)
          : conversation.title;

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          title: nextTitle,
          promptDraft: body.content,
          updatedAt: new Date()
        }
      });

      const conversationSummary = await getConversationSummaryById(tenantId, userId, conversation.id);

      return {
        runId: run.id,
        conversationId: conversation.id,
        userMessage: serializeConversationMessage({ ...userMessage, conversationId: conversation.id, createdAt: userMessage.createdAt }),
        assistantDraftMessage: {
          id: `draft-${run.id}`,
          conversationId: conversation.id,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          runId: run.id
        },
        conversationSummary: conversationSummary ?? undefined
      };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post("/conversations/:id/retry-last", { preHandler: [requireAuth] }, async (request, reply) => {
    try {
      const params = request.params as { id: string };
      const tenantId = request.auth!.tenantId;
      const userId = request.auth!.userId;
      const conversation = await prisma.conversation.findFirst({
        where: { id: params.id, tenantId, userId }
      });
      if (!conversation) {
        return reply.status(404).send({ code: "not_found" });
      }

      const activeRun = await prisma.assistantRun.findFirst({
        where: { tenantId, conversationId: conversation.id, status: { in: [AssistantRunStatus.queued, AssistantRunStatus.running] } },
        orderBy: { createdAt: "desc" }
      });
      if (activeRun) {
        return reply.status(409).send({ code: "run_in_progress", message: "Ya hay una respuesta en curso para esta conversacion." });
      }

      const lastUserMessage = await prisma.conversationMessage.findFirst({
        where: { tenantId, conversationId: conversation.id, tone: MessageTone.user },
        orderBy: { createdAt: "desc" }
      });
      if (!lastUserMessage) {
        return reply.status(409).send({ code: "no_user_turn", message: "Este hilo no tiene un mensaje de usuario para reintentar." });
      }

      const run = await prisma.assistantRun.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          userMessageId: lastUserMessage.id,
          status: AssistantRunStatus.queued,
          phase: AssistantRunPhase.thinking
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          promptDraft: lastUserMessage.body,
          updatedAt: new Date()
        }
      });

      const conversationSummary = await getConversationSummaryById(tenantId, userId, conversation.id);

      return {
        runId: run.id,
        conversationId: conversation.id,
        userMessage: serializeConversationMessage({ ...lastUserMessage, conversationId: conversation.id, createdAt: lastUserMessage.createdAt }),
        assistantDraftMessage: {
          id: `draft-${run.id}`,
          conversationId: conversation.id,
          role: "assistant",
          content: "",
          createdAt: new Date().toISOString(),
          runId: run.id
        },
        reusedUserMessageId: lastUserMessage.id,
        conversationSummary: conversationSummary ?? undefined
      };
    } catch (error) {
      return mapError(reply, error);
    }
  });

  app.post("/conversations/:id/messages/stream", { preHandler: [requireAuth] }, async (request, reply) => {
    const params = request.params as { id: string };
    const query = request.query as { runId?: string };
    if (!query.runId) {
      return reply.status(422).send({ code: "validation_error", message: "runId es requerido para abrir el stream." });
    }
    const tenantId = request.auth!.tenantId;
    const userId = request.auth!.userId;
    const conversation = await prisma.conversation.findFirst({
      where: { id: params.id, tenantId, userId },
      include: {
        case: true,
        messages: {
          where: { tone: { in: [MessageTone.user, MessageTone.assistant] } },
          orderBy: { createdAt: "asc" }
        }
      }
    });
    if (!conversation) {
      return reply.status(404).send({ code: "not_found" });
    }
    const run = await prisma.assistantRun.findFirst({
      where: { id: query.runId, tenantId, conversationId: conversation.id }
    });
    if (!run) {
      return reply.status(404).send({ code: "not_found", message: "Run no encontrado." });
    }

    reply.hijack();
    reply.raw.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
    reply.raw.setHeader("Cache-Control", "no-cache, no-transform");
    reply.raw.setHeader("Connection", "keep-alive");

    const controller = new AbortController();
    activeRunControllers.set(run.id, controller);
    request.raw.on("close", () => {
      if (!controller.signal.aborted) {
        controller.abort();
      }
      activeRunControllers.delete(run.id);
    });

    try {
      await prisma.assistantRun.update({
        where: { id: run.id },
        data: { status: AssistantRunStatus.running, phase: AssistantRunPhase.thinking }
      });

      const assistantMessageId = `draft-${run.id}`;
      await writeNdjson(reply, {
        type: "run.started",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        userMessageId: run.userMessageId,
        assistantDraftMessageId: assistantMessageId,
        createdAt: new Date().toISOString()
      });
      await writeNdjson(reply, {
        type: "status.changed",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        phase: "thinking",
        label: "Pensando",
        detail: "Analizando el nuevo turno y preparando la respuesta."
      });
      await sleep(90);
      await prisma.assistantRun.update({
        where: { id: run.id },
        data: { phase: AssistantRunPhase.reading_context }
      });
      await writeNdjson(reply, {
        type: "context.reading",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        detail: "Leyendo historial reciente y contexto del caso."
      });
      await writeNdjson(reply, {
        type: "status.changed",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        phase: "reading_context",
        label: "Analizando contexto",
        detail: "Reuniendo el historial y el estado operativo antes de responder."
      });
      await sleep(90);
      await prisma.assistantRun.update({
        where: { id: run.id },
        data: { phase: AssistantRunPhase.reasoning }
      });
      await writeNdjson(reply, {
        type: "reasoning.started",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        detail: "Priorizando la mejor accion util para este turno."
      });
      await writeNdjson(reply, {
        type: "status.changed",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        phase: "reasoning",
        label: "Razonando",
        detail: "Organizando la respuesta final."
      });
      await sleep(90);
      await prisma.assistantRun.update({
        where: { id: run.id },
        data: { phase: AssistantRunPhase.using_tool }
      });
      await writeNdjson(reply, {
        type: "tool.started",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        toolCallId: buildToolEventId(run.id, "tenant-context", "started"),
        toolName: "tenant-context",
        detail: "Preparando contexto de tenant y del caso antes de consultar el proveedor.",
        createdAt: new Date().toISOString()
      });
      await writeNdjson(reply, {
        type: "tool.progress",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        toolCallId: buildToolEventId(run.id, "tenant-context", "progress"),
        toolName: "tenant-context",
        detail: conversation.case ? `Contexto del caso ${conversation.case.code} listo para el run.` : "Contexto general del tenant listo para el run.",
        createdAt: new Date().toISOString()
      });
      await writeNdjson(reply, {
        type: "tool.completed",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        toolCallId: buildToolEventId(run.id, "tenant-context", "completed"),
        toolName: "tenant-context",
        detail: "Contexto operativo consolidado.",
        createdAt: new Date().toISOString()
      });
      await writeNdjson(reply, {
        type: "tool.started",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        toolCallId: buildToolEventId(run.id, "assistant-provider", "started"),
        toolName: "assistant-provider",
        detail: "Consultando el proveedor configurado.",
        createdAt: new Date().toISOString()
      });

      const assistantResult = await runAssistantTurn(prisma, {
        tenantId,
        prompt: conversation.promptDraft,
        caseRow: conversation.case,
        history: conversation.messages.map((item) => ({ tone: item.tone, body: item.body })),
        signal: controller.signal
      });

      await writeNdjson(reply, {
        type: "tool.completed",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        toolCallId: buildToolEventId(run.id, "assistant-provider", "completed"),
        toolName: "assistant-provider",
        detail: "Proveedor consultado correctamente.",
        createdAt: new Date().toISOString()
      });
      await prisma.assistantRun.update({
        where: { id: run.id },
        data: { phase: AssistantRunPhase.drafting, provider: assistantResult.provider, model: assistantResult.model }
      });
      await writeNdjson(reply, {
        type: "status.changed",
        runId: run.id,
        conversationId: conversation.id,
        messageId: assistantMessageId,
        phase: "drafting",
        label: "Redactando respuesta",
        detail: "Transmitiendo la respuesta en tiempo real."
      });

      let text = "";
      for (const chunk of chunkText(assistantResult.text)) {
        if (controller.signal.aborted) {
          throw new AssistantProviderError("Run cancelado por el usuario.", 499);
        }
        text += chunk;
        await writeNdjson(reply, {
          type: "message.delta",
          runId: run.id,
          conversationId: conversation.id,
          messageId: assistantMessageId,
          delta: chunk
        });
        await sleep(45);
      }

      const assistantMessage = await prisma.conversationMessage.create({
        data: {
          tenantId,
          conversationId: conversation.id,
          authorId: userId,
          tone: MessageTone.assistant,
          body: text,
          runId: run.id
        }
      });

      await prisma.assistantRun.update({
        where: { id: run.id },
        data: {
          assistantMessageId: assistantMessage.id,
          status: AssistantRunStatus.completed,
          phase: AssistantRunPhase.completed,
          completedAt: new Date()
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      await prisma.usageEvent.create({
        data: {
          tenantId,
          caseId: conversation.caseId,
          successful: true,
          estimatedTokens: assistantResult.estimatedTokens || 0
        }
      });

      await audit(tenantId, userId, "chat", "message_stream", "success", { conversationId: conversation.id, provider: assistantResult.provider, model: assistantResult.model }, "conversation", conversation.id);

      await writeNdjson(reply, {
        type: "message.completed",
        runId: run.id,
        conversationId: conversation.id,
        message: serializeConversationMessage({ ...assistantMessage, conversationId: conversation.id, createdAt: assistantMessage.createdAt })
      });
      await writeNdjson(reply, {
        type: "run.completed",
        runId: run.id,
        conversationId: conversation.id,
        provider: assistantResult.provider,
        model: assistantResult.model
      });
    } catch (error) {
      const isCancelled = controller.signal.aborted || (error instanceof AssistantProviderError && error.statusCode === 499);
      if (!isCancelled) {
        await writeNdjson(reply, {
          type: "tool.failed",
          runId: run.id,
          conversationId: conversation.id,
          messageId: `draft-${run.id}`,
          toolCallId: buildToolEventId(run.id, "assistant-provider", "failed"),
          toolName: "assistant-provider",
          detail: error instanceof Error ? error.message : "No se pudo completar la consulta al proveedor.",
          createdAt: new Date().toISOString()
        });
      }
      await prisma.assistantRun.update({
        where: { id: run.id },
        data: {
          status: isCancelled ? AssistantRunStatus.cancelled : AssistantRunStatus.error,
          phase: isCancelled ? AssistantRunPhase.cancelled : AssistantRunPhase.error,
          errorMessage: error instanceof Error ? error.message : "No se pudo completar el run.",
          cancelledAt: isCancelled ? new Date() : null,
          completedAt: isCancelled ? null : new Date()
        }
      });
      await writeNdjson(reply, isCancelled ? { type: "run.cancelled", runId: run.id, conversationId: conversation.id } : { type: "run.error", runId: run.id, conversationId: conversation.id, error: error instanceof Error ? error.message : "No se pudo completar el run." });
    } finally {
      activeRunControllers.delete(run.id);
      reply.raw.end();
    }
  });

  app.post("/runs/:id/cancel", { preHandler: [requireAuth] }, async (request, reply) => {
    const params = request.params as { id: string };
    const run = await prisma.assistantRun.findFirst({
      where: { id: params.id, tenantId: request.auth!.tenantId, conversation: { userId: request.auth!.userId } }
    });
    if (!run) {
      return reply.status(404).send({ code: "not_found" });
    }
    activeRunControllers.get(run.id)?.abort();
    await prisma.assistantRun.update({
      where: { id: run.id },
      data: {
        status: AssistantRunStatus.cancelled,
        phase: AssistantRunPhase.cancelled,
        cancelledAt: new Date()
      }
    });
    return { ok: true };
  });

  app.get("/chat/conversation", { preHandler: [requireAuth] }, async (request) => {
    const query = request.query as { caseId?: string };
    const base = await ensureUserConversation(request.auth!.tenantId, request.auth!.userId, query.caseId ?? null);
    return serializeConversation(base);
  });

  app.post("/chat/message", { preHandler: [requireAuth] }, async (_request, reply) => {
    return reply.status(410).send({ code: "deprecated", message: "Usa /conversations/:id/messages y /stream." });
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

  app.post("/tenant-config/test-ai", { preHandler: [requireAuth, requireRole([RoleKey.admin])] }, async (request, reply) => {
    try {
      return await testTenantAssistantConnection(prisma, request.auth!.tenantId);
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
      backofficeViews: (manifest?.backofficeViews as string[] | null) ?? (role === RoleKey.admin ? ["chat", "configuracion"] : [])
    };
  });

  app.addHook("onClose", async () => {
    await prisma.$disconnect();
  });

  return app;
}
