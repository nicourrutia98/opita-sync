import { useCallback, useMemo, useState } from "react";
import type { AssistantRunPhase, AssistantRunStatus, ChatStreamEvent } from "../domain/opita";

export interface ToolActivityViewModel {
  id: string;
  toolName: string;
  status: "started" | "progress" | "completed" | "failed";
  detail?: string;
  createdAt: string;
}

export interface RunStatusViewModel {
  runId: string;
  conversationId: string;
  status: AssistantRunStatus;
  phase: AssistantRunPhase;
  label: string;
  detail?: string;
  provider?: string;
  model?: string;
  collapsed: boolean;
  tools: ToolActivityViewModel[];
}

export function useRunStatus() {
  const [statuses, setStatuses] = useState<Record<string, RunStatusViewModel>>({});

  const applyEvent = useCallback((event: ChatStreamEvent) => {
    setStatuses((current) => {
      const existing = current[event.runId];
      const next = { ...current };

      if (event.type === "run.started") {
        next[event.runId] = {
          runId: event.runId,
          conversationId: event.conversationId,
          status: "running",
          phase: "thinking",
          label: "Pensando",
          detail: "Preparando la respuesta en tiempo real.",
          collapsed: false,
          tools: []
        };
        return next;
      }

      if (!existing) {
        return current;
      }

      if (event.type === "status.changed") {
        next[event.runId] = {
          ...existing,
          status: event.phase === "completed" ? "completed" : event.phase === "error" ? "error" : event.phase === "cancelled" ? "cancelled" : "running",
          phase: event.phase,
          label: event.label,
          detail: event.detail,
          collapsed: false
        };
        return next;
      }

      if (event.type === "context.reading") {
        next[event.runId] = {
          ...existing,
          status: "running",
          phase: "reading_context",
          label: "Analizando contexto",
          detail: event.detail ?? existing.detail,
          collapsed: false
        };
        return next;
      }

      if (event.type === "reasoning.started") {
        next[event.runId] = {
          ...existing,
          status: "running",
          phase: "reasoning",
          label: "Razonando",
          detail: event.detail ?? existing.detail,
          collapsed: false
        };
        return next;
      }

      if (event.type === "tool.started" || event.type === "tool.progress" || event.type === "tool.completed") {
        const status: ToolActivityViewModel["status"] = event.type === "tool.started" ? "started" : event.type === "tool.progress" ? "progress" : "completed";
        next[event.runId] = {
          ...existing,
          status: "running",
          phase: "using_tool",
          label: event.type === "tool.completed" ? "Herramienta completada" : "Usando herramienta",
          detail: event.detail ?? event.toolName,
          collapsed: false,
          tools: [
            ...existing.tools.filter((item) => item.id !== event.toolCallId),
            {
              id: event.toolCallId,
              toolName: event.toolName,
              status,
              detail: event.detail,
              createdAt: event.createdAt
            }
          ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        };
        return next;
      }

      if (event.type === "tool.failed") {
        next[event.runId] = {
          ...existing,
          status: "running",
          phase: "using_tool",
          label: "Herramienta con error",
          detail: event.detail ?? event.toolName,
          collapsed: false,
          tools: [
            ...existing.tools.filter((item) => item.id !== event.toolCallId),
            {
              id: event.toolCallId,
              toolName: event.toolName,
              status: "failed" as ToolActivityViewModel["status"],
              detail: event.detail,
              createdAt: event.createdAt
            }
          ].sort((left, right) => left.createdAt.localeCompare(right.createdAt))
        };
        return next;
      }

      if (event.type === "run.completed") {
        next[event.runId] = {
          ...existing,
          status: "completed",
          phase: "completed",
          label: "Respuesta lista",
          detail: event.provider && event.model ? `${event.provider} / ${event.model}` : existing.detail,
          provider: event.provider,
          model: event.model,
          collapsed: true
        };
        return next;
      }

      if (event.type === "run.error") {
        next[event.runId] = {
          ...existing,
          status: "error",
          phase: "error",
          label: "Error en la respuesta",
          detail: event.error,
          collapsed: false
        };
        return next;
      }

      if (event.type === "run.cancelled") {
        next[event.runId] = {
          ...existing,
          status: "cancelled",
          phase: "cancelled",
          label: "Respuesta cancelada",
          detail: "La generacion se detuvo antes de completarse.",
          collapsed: true
        };
        return next;
      }

      return current;
    });
  }, []);

  const clearRun = useCallback((runId: string) => {
    setStatuses((current) => {
      const next = { ...current };
      delete next[runId];
      return next;
    });
  }, []);

  const setCollapsed = useCallback((runId: string, collapsed: boolean) => {
    setStatuses((current) => (current[runId] ? { ...current, [runId]: { ...current[runId], collapsed } } : current));
  }, []);

  const statusesByConversation = useMemo(() => {
    const next: Record<string, RunStatusViewModel> = {};
    for (const item of Object.values(statuses)) {
      next[item.conversationId] = item;
    }
    return next;
  }, [statuses]);

  return {
    statuses,
    statusesByConversation,
    applyEvent,
    clearRun,
    setCollapsed
  };
}
