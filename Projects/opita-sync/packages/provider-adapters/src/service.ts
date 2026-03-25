import OpenAI from 'openai';
import { z } from 'zod';

import type {
  IntentInterpreterRequest,
  IntentInterpreterResult,
  ProviderAdapter,
  ProviderChatAsset,
  ProviderChatEvent,
  ProviderErrorCode,
  ProviderChatHistoryEntry,
  ProviderChatRequest,
  ProviderToolProposal
} from './models.js';

type StreamChunk = Record<string, unknown>;

interface ResponsesClientLike {
  create(request: Record<string, unknown>, options?: { signal?: AbortSignal }): unknown;
}

interface OpenAIClientLike {
  responses: ResponsesClientLike;
}

interface OpenAIAdapterOptions {
  apiKey?: string;
  model?: string;
  client?: OpenAIClientLike;
}

const openAIUserHistoryPartSchema = z.object({
  type: z.literal('input_text'),
  text: z.string().min(1)
});

const openAIAssistantHistoryPartSchema = z.union([
  z.object({
    type: z.literal('output_text'),
    text: z.string().min(1)
  }),
  z.object({
    type: z.literal('refusal'),
    refusal: z.string().min(1)
  })
]);

const openAIHistoryEntrySchema = z.union([
  z.object({
    role: z.literal('user'),
    content: z.array(openAIUserHistoryPartSchema).min(1)
  }),
  z.object({
    role: z.literal('assistant'),
    content: z.array(openAIAssistantHistoryPartSchema).min(1)
  })
]);

const openAIToolSchema = z.object({
  type: z.literal('function'),
  name: z.literal('propose_governed_action'),
  description: z.string().min(1),
  strict: z.literal(true),
  parameters: z.object({
    type: z.literal('object'),
    additionalProperties: z.literal(false),
    properties: z.record(z.string(), z.unknown()),
    required: z.array(z.string()).min(1)
  })
});

const openAIRequestSchema = z.object({
  model: z.string().min(1),
  instructions: z.string().min(1),
  input: z.array(openAIHistoryEntrySchema),
  tools: z.array(openAIToolSchema),
  tool_choice: z.literal('auto'),
  text: z.object({
    format: z.object({
      type: z.literal('text')
    })
  }),
  stream: z.literal(true),
  store: z.literal(false),
  previous_response_id: z.string().min(1).optional()
});

type OpenAIHistoryEntry = z.infer<typeof openAIHistoryEntrySchema>;

function makeNeutralAdapter(providerId: ProviderAdapter['providerId']): ProviderAdapter {
  return {
    providerId,
    interpretIntent(request: IntentInterpreterRequest): IntentInterpreterResult {
      return { providerId, normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
    },
    async *streamChat(request: ProviderChatRequest): AsyncIterable<ProviderChatEvent> {
      const text = request.history.at(-1)?.content.trim() ?? '';
      yield { type: 'started', model: `${providerId}-stub`, continuityMode: 'manual' };
      if (text) {
        yield { type: 'delta', delta: text };
      }
      yield { type: 'completed', model: `${providerId}-stub`, continuityMode: 'manual', text, proposals: [] };
    }
  };
}

function buildAssetCatalogPrompt(assets: ProviderChatAsset[]): string {
  if (!assets.length) {
    return 'No governed assets are currently available.';
  }

  return assets
    .map((asset) => `- ${asset.assetId}: ${asset.name} | ${asset.description} | approval=${asset.approvalMode} | connectors=${asset.connectorIds.join(',') || 'none'}`)
    .join('\n');
}

function buildGovernedInstructions(assets: ProviderChatAsset[]): string {
  return [
    'You are the governed planning assistant for Opita Sync.',
    'Interpret the user request and respond with concise operational guidance.',
    'Never claim to execute tools, connectors, workflows, or external actions.',
    'You may only suggest governed assets that already exist in the catalog.',
    'Always provide a short textual interpretation first.',
    'If a catalog asset is a strong fit, you may additionally call propose_governed_action one or more times.',
    'If no governed asset fits, explain that clearly and do not invent one.',
    'Surface governance or approval concerns when relevant.',
    'Available governed assets:',
    buildAssetCatalogPrompt(assets)
  ].join('\n');
}

function toAssistantHistoryPart(content: string) {
  const trimmed = content.trim();
  if (/^refusal:/i.test(trimmed)) {
    return {
      type: 'refusal' as const,
      refusal: trimmed.replace(/^refusal:\s*/i, '') || trimmed
    };
  }

  return {
    type: 'output_text' as const,
    text: trimmed
  };
}

function buildHistoryInput(history: ProviderChatHistoryEntry[]): OpenAIHistoryEntry[] {
  return history
    .filter((entry) => entry.content.trim().length > 0)
    .map((entry) => {
      if (entry.role === 'assistant') {
        return {
          role: 'assistant' as const,
          content: [toAssistantHistoryPart(entry.content)]
        };
      }

      return {
        role: 'user' as const,
        content: [
          {
            type: 'input_text' as const,
            text: entry.content.trim()
          }
        ]
      };
    });
}

function parseProposal(callId: string, argumentsJson: string): ProviderToolProposal {
  try {
    const parsed = JSON.parse(argumentsJson) as {
      assetId?: string;
      intentSummary?: string;
      rationale?: string;
      requiresApproval?: boolean;
      riskNotes?: string[];
    };

    return {
      callId,
      name: 'propose_governed_action',
      argumentsJson,
      assetId: parsed.assetId,
      intentSummary: parsed.intentSummary,
      rationale: parsed.rationale,
      requiresApproval: parsed.requiresApproval,
      riskNotes: Array.isArray(parsed.riskNotes) ? parsed.riskNotes.filter((item): item is string => typeof item === 'string') : []
    };
  } catch {
    return {
      callId,
      name: 'propose_governed_action',
      argumentsJson
    };
  }
}

function createOpenAIClient(options: OpenAIAdapterOptions): OpenAIClientLike | null {
  if (options.client) {
    return options.client;
  }

  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return null;
  }

  return new OpenAI({ apiKey });
}

function toProviderError(
  code: ProviderErrorCode,
  message: string,
  options: { requestId?: string; recoverable?: boolean; detail?: string } = {}
): ProviderChatEvent {
  return {
    type: 'error',
    code,
    message,
    requestId: options.requestId,
    recoverable: options.recoverable,
    detail: options.detail
  };
}

function classifyProviderError(message: string): ProviderErrorCode {
  if (isPreviousResponseMissing(message)) {
    return 'provider_state_resume_miss';
  }
  if (/rate limit/i.test(message) || /\b429\b/.test(message)) {
    return 'provider_rate_limited';
  }
  if (/Invalid value|invalid_request_error|Unsupported value/i.test(message) || /\b400\b/.test(message)) {
    return 'provider_request_rejected';
  }
  if (/stream/i.test(message)) {
    return 'provider_stream_unavailable';
  }
  return 'provider_transient_failure';
}

function buildOpenAITools() {
  return [
    {
      type: 'function' as const,
      name: 'propose_governed_action' as const,
      description: 'Propose a governed catalog asset that the operator may choose to launch later. This is suggestion-only and never executes anything.',
      strict: true as const,
      parameters: {
        type: 'object' as const,
        additionalProperties: false as const,
        properties: {
          assetId: {
            type: 'string',
            description: 'Exact assetId from the available governed catalog.'
          },
          intentSummary: {
            type: 'string',
            description: 'Short summary of the user intent that this asset would address.'
          },
          rationale: {
            type: 'string',
            description: 'Why this governed asset is the right fit.'
          },
          requiresApproval: {
            type: 'boolean',
            description: 'Whether the asset likely requires human approval based on the request.'
          },
          riskNotes: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Governance or release-control cautions to surface before launch.'
          }
        },
        required: ['assetId', 'intentSummary', 'rationale', 'requiresApproval', 'riskNotes']
      }
    }
  ];
}

function buildOpenAIRequestPayload(
  request: ProviderChatRequest,
  model: string,
  previousResponseId?: string
): Record<string, unknown> {
  const payload = {
    model,
    instructions: request.governedInstructions || buildGovernedInstructions(request.assets),
    input: buildHistoryInput(request.history),
    tools: buildOpenAITools(),
    tool_choice: 'auto' as const,
    text: {
      format: {
        type: 'text' as const
      }
    },
    stream: true as const,
    store: false as const,
    ...(previousResponseId ? { previous_response_id: previousResponseId } : {})
  };

  const parsed = openAIRequestSchema.safeParse(payload);
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw Object.assign(new Error('provider_payload_invalid'), {
      providerCode: 'provider_payload_invalid' satisfies ProviderErrorCode,
      detail
    });
  }

  return parsed.data;
}

async function createResponseStream(
  client: OpenAIClientLike,
  payload: Record<string, unknown>,
  abortSignal?: AbortSignal
): Promise<{ stream: AsyncIterable<StreamChunk>; requestId?: string | null }> {
  const request = client.responses.create(payload, abortSignal ? { signal: abortSignal } : undefined) as {
    withResponse?: () => Promise<{ data: AsyncIterable<StreamChunk>; request_id: string | null }>;
  } & AsyncIterable<StreamChunk>;

  if (typeof request.withResponse === 'function') {
    const { data, request_id } = await request.withResponse();
    return { stream: data, requestId: request_id };
  }

  return { stream: request, requestId: undefined };
}

function isPreviousResponseMissing(message: string): boolean {
  return /Previous response with id .* not found/i.test(message);
}

async function* streamOpenAIChat(
  client: OpenAIClientLike,
  request: ProviderChatRequest,
  model: string
): AsyncIterable<ProviderChatEvent> {
  const canResumeProviderState = Boolean(request.providerStateHint?.canResumeProviderState && request.providerStateHint.lastResponseId);
  const attempts = canResumeProviderState
    ? [
        { continuityMode: 'provider' as const, previousResponseId: request.providerStateHint?.lastResponseId },
        { continuityMode: 'fallback_manual' as const, previousResponseId: undefined }
      ]
    : [{ continuityMode: 'manual' as const, previousResponseId: undefined }];

  let recoverableError: string | undefined;

  for (const attempt of attempts) {
    const seenProposalIds = new Set<string>();
    const proposals: ProviderToolProposal[] = [];
    let fullText = '';
    let responseId: string | undefined;
    let resolvedModel = model;
    let requestId: string | undefined;

    try {
      const payload = buildOpenAIRequestPayload(request, model, attempt.previousResponseId);
      const { stream, requestId: streamRequestId } = await createResponseStream(client, payload, request.abortSignal);
      requestId = streamRequestId ?? undefined;

      if (!stream || typeof stream[Symbol.asyncIterator] !== 'function') {
        yield toProviderError('provider_stream_unavailable', 'Provider stream unavailable.', { requestId });
        return;
      }

      for await (const event of stream) {
        const type = typeof event.type === 'string' ? event.type : '';

        if (type === 'response.created' || type === 'response.in_progress') {
          const response = (event as { response?: { id?: string; model?: string } }).response;
          responseId = response?.id ?? responseId;
          resolvedModel = response?.model ?? resolvedModel;
          yield {
            type: 'started',
            responseId,
            model: resolvedModel,
            requestId,
            continuityMode: attempt.continuityMode
          };
          continue;
        }

        if (type === 'response.output_text.delta') {
          const delta = typeof (event as { delta?: unknown }).delta === 'string' ? (event as { delta: string }).delta : '';
          if (delta) {
            fullText += delta;
            yield { type: 'delta', delta };
          }
          continue;
        }

        if (type === 'response.output_item.done') {
          const item = (event as { item?: { type?: string; call_id?: string; arguments?: string; name?: string } }).item;
          if (item?.type === 'function_call' && item.call_id && !seenProposalIds.has(item.call_id)) {
            seenProposalIds.add(item.call_id);
            const proposal = parseProposal(item.call_id, item.arguments ?? '{}');
            proposal.name = item.name ?? proposal.name;
            proposals.push(proposal);
            yield { type: 'tool_proposals', proposals: [proposal] };
          }
          continue;
        }

        if (type === 'response.completed') {
          const response = (event as {
            response?: {
              id?: string;
              model?: string;
              output?: Array<{
                type?: string;
                call_id?: string;
                arguments?: string;
                name?: string;
                content?: Array<{ type?: string; text?: string }>;
              }>;
            };
          }).response;

          responseId = response?.id ?? responseId;
          resolvedModel = response?.model ?? resolvedModel;

          for (const item of response?.output ?? []) {
            if (item.type === 'function_call' && item.call_id && !seenProposalIds.has(item.call_id)) {
              seenProposalIds.add(item.call_id);
              const proposal = parseProposal(item.call_id, item.arguments ?? '{}');
              proposal.name = item.name ?? proposal.name;
              proposals.push(proposal);
            }

            if (item.type === 'message') {
              for (const part of item.content ?? []) {
                if (part.type === 'output_text' && typeof part.text === 'string' && !fullText) {
                  fullText = part.text;
                }
              }
            }
          }

          yield {
            type: 'completed',
            responseId,
            model: resolvedModel,
            requestId,
            continuityMode: attempt.continuityMode,
            recoverableError,
            text: fullText,
            proposals
          };
          return;
        }

        if (type === 'response.failed' || type === 'error') {
          const message = typeof (event as { message?: unknown }).message === 'string'
            ? (event as { message: string }).message
            : 'openai_stream_failed';

          if (attempt.continuityMode === 'provider' && isPreviousResponseMissing(message)) {
            recoverableError = message;
            break;
          }

          yield toProviderError(classifyProviderError(message), 'Provider request failed.', {
            requestId,
            detail: message
          });
          return;
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'openai_stream_failed';
      const providerCode = error && typeof error === 'object' && 'providerCode' in error
        ? (error as { providerCode?: ProviderErrorCode }).providerCode
        : undefined;
      const detail = error && typeof error === 'object' && 'detail' in error
        ? String((error as { detail?: unknown }).detail ?? '')
        : undefined;
      const requestId = error && typeof error === 'object' && 'request_id' in error
        ? String((error as { request_id?: unknown }).request_id ?? '')
        : undefined;

      if (attempt.continuityMode === 'provider' && isPreviousResponseMissing(message)) {
        recoverableError = message;
        continue;
      }

      yield toProviderError(providerCode ?? classifyProviderError(message), providerCode === 'provider_payload_invalid' ? 'Provider payload invalid.' : 'Provider request failed.', {
        requestId,
        recoverable: false,
        detail: detail || message
      });
      return;
    }
  }

  yield toProviderError(
    recoverableError ? 'provider_state_resume_miss' : 'provider_transient_failure',
    recoverableError ? 'Provider continuity state was unavailable.' : 'Provider request failed.',
    {
      recoverable: Boolean(recoverableError),
      detail: recoverableError ?? 'openai_stream_failed'
    }
  );
}

export function createOpenAIAdapter(options: OpenAIAdapterOptions = {}): ProviderAdapter {
  const model = options.model ?? process.env.OPENAI_MODEL ?? 'gpt-5-mini';

  return {
    providerId: 'openai',
    interpretIntent(request: IntentInterpreterRequest): IntentInterpreterResult {
      return { providerId: 'openai', normalizedIntent: request.rawIntent.trim(), confidence: 0.9 };
    },
    async *streamChat(request: ProviderChatRequest): AsyncIterable<ProviderChatEvent> {
      const client = createOpenAIClient(options);
      if (!client) {
        yield toProviderError('provider_not_configured', 'OpenAI provider not configured.');
        return;
      }
      yield* streamOpenAIChat(client, request, model);
    }
  };
}

export const openaiAdapter = createOpenAIAdapter();
export const anthropicAdapter = makeNeutralAdapter('anthropic');
export const geminiAdapter = makeNeutralAdapter('gemini');
