import { CasePriority, CaseStatus, MessageTone, PrismaClient, type Case } from "@prisma/client";

type TenantAssistantConfig = {
  provider: string;
  baseUrl: string;
  apiKey: string;
  model: string;
};

type AssistantTurnInput = {
  tenantId: string;
  prompt: string;
  caseRow?: Case | null;
  history: Array<{ tone: MessageTone; body: string }>;
  signal?: AbortSignal;
};

type AssistantTurnResult = {
  text: string;
  provider: string;
  model: string;
  estimatedTokens: number;
};

export class AssistantProviderError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AssistantProviderError";
    this.statusCode = statusCode;
  }
}

function toCaseStatusLabel(status: CaseStatus): string {
  if (status === CaseStatus.En_curso) return "En curso";
  return status;
}

function toCasePriorityLabel(priority: CasePriority): string {
  return priority;
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

function normalizeProvider(provider: string): string {
  const normalized = provider.trim().toLowerCase();
  if (normalized === "google" || normalized === "google-gemini") {
    return "gemini";
  }
  return normalized;
}

function truncateDetail(detail: string, limit = 240): string {
  const compact = detail.replace(/\s+/g, " ").trim();
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
}

function getGeminiErrorDetail(raw: string): string {
  try {
    const payload = JSON.parse(raw);
    const message = payload?.error?.message;
    if (typeof message === "string" && message.trim()) {
      return truncateDetail(message);
    }
  } catch {
    // noop
  }

  return truncateDetail(raw || "Gemini respondio sin detalle util.");
}

function getTextFromGeminiResponse(payload: any): string {
  const finishReason = payload?.candidates?.[0]?.finishReason;
  const parts = payload?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) {
    const blockReason = payload?.promptFeedback?.blockReason;
    throw new AssistantProviderError(
      `Gemini no devolvio contenido util${blockReason ? ` (${blockReason})` : finishReason ? ` (${finishReason})` : ""}.`,
      502
    );
  }

  const text = parts
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("")
    .trim();

  if (!text) {
    throw new AssistantProviderError(`Gemini respondio sin texto util${finishReason ? ` (${finishReason})` : ""}.`, 502);
  }

  return text;
}

async function callGemini(config: TenantAssistantConfig, prompt: string, signal?: AbortSignal): Promise<{ text: string; estimatedTokens: number }> {
  const url = `${normalizeBaseUrl(config.baseUrl)}/models/${config.model}:generateContent`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": config.apiKey
      },
      signal,
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.35,
          topP: 0.9
        }
      })
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new AssistantProviderError("La solicitud a Gemini fue cancelada.", 499);
    }

    throw new AssistantProviderError(
      `No se pudo conectar con Gemini. ${error instanceof Error ? truncateDetail(error.message) : "Error de red no identificado."}`,
      502
    );
  }

  if (!response.ok) {
    const detail = getGeminiErrorDetail(await response.text());
    const statusCode =
      response.status === 400
        ? 422
        : response.status === 401 || response.status === 403
          ? 403
          : response.status === 429
            ? 429
            : 502;
    throw new AssistantProviderError(`Gemini rechazo la solicitud (${response.status}). ${detail}`, statusCode);
  }

  const payload = await response.json();
  return {
    text: getTextFromGeminiResponse(payload),
    estimatedTokens: Number(payload?.usageMetadata?.totalTokenCount ?? 0)
  };
}

export async function readTenantAssistantConfig(prisma: PrismaClient, tenantId: string): Promise<TenantAssistantConfig> {
  const rows = await prisma.tenantParameterValue.findMany({
    where: {
      tenantId,
      parameter: {
        key: {
          in: ["ai.provider", "ai.base_url", "ai.api_key", "ai.model"]
        }
      }
    },
    include: { parameter: true }
  });

  const map = new Map(rows.map((row) => [row.parameter.key, row.value]));
  const provider = normalizeProvider(map.get("ai.provider") ?? "");
  const baseUrl = (map.get("ai.base_url") ?? "").trim();
  const apiKey = (map.get("ai.api_key") ?? "").trim();
  const model = (map.get("ai.model") ?? "").trim();

  if (!provider || !baseUrl || !apiKey || !model) {
    throw new AssistantProviderError("Faltan datos del asistente. Revisa proveedor, direccion, clave y modelo.", 422);
  }

  if (apiKey.includes("<") || apiKey.toLowerCase().includes("replace_me")) {
    throw new AssistantProviderError("La API key configurada para Gemini no es valida todavia.", 422);
  }

  return { provider, baseUrl, apiKey, model };
}

function buildAssistantPrompt(input: AssistantTurnInput): string {
  const caseBlock = input.caseRow
    ? [
        `Caso: ${input.caseRow.code}`,
        `Titulo: ${input.caseRow.title}`,
        `Sitio: ${input.caseRow.site}`,
        `Prioridad: ${toCasePriorityLabel(input.caseRow.priority)}`,
        `Estado: ${toCaseStatusLabel(input.caseRow.status)}`,
        `Resumen: ${input.caseRow.summary}`
      ].join("\n")
    : "Sin caso asociado.";

  const historyBlock = input.history
    .filter((item) => item.tone !== MessageTone.system)
    .slice(-8)
    .map((item) => `${item.tone === MessageTone.user ? "Usuario" : "Orquestador"}: ${item.body}`)
    .join("\n");

  return [
    "Eres el orquestador de Opita Sync.",
    "Responde en espanol, con tono operativo, claro y accionable.",
    "Si falta contexto, dilo con precision y sugiere el siguiente paso mas util.",
    "",
    caseBlock,
    "",
    historyBlock ? `Historial reciente:\n${historyBlock}` : "Sin historial previo.",
    "",
    `Nuevo mensaje del usuario:\n${input.prompt}`
  ].join("\n");
}

export async function testTenantAssistantConnection(prisma: PrismaClient, tenantId: string) {
  const config = await readTenantAssistantConfig(prisma, tenantId);
  if (config.provider !== "gemini") {
    throw new AssistantProviderError(`El proveedor configurado no tiene prueba implementada: ${config.provider}.`, 422);
  }

  await callGemini(config, "Responde solo con OK.");
  return {
    ok: true as const,
    provider: config.provider,
    model: config.model,
    detail: "Conexion validada correctamente con Gemini."
  };
}

export async function runAssistantTurn(prisma: PrismaClient, input: AssistantTurnInput): Promise<AssistantTurnResult> {
  const config = await readTenantAssistantConfig(prisma, input.tenantId);

  if (config.provider !== "gemini") {
    throw new AssistantProviderError(`El proveedor configurado no esta soportado todavia: ${config.provider}.`, 422);
  }

  const result = await callGemini(config, buildAssistantPrompt(input), input.signal);
  return {
    text: result.text,
    provider: config.provider,
    model: config.model,
    estimatedTokens: result.estimatedTokens
  };
}
