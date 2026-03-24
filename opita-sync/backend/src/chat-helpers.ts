export const DEFAULT_CHAT_TITLE = "Nuevo chat";

export function buildInitialConversationTitle(caseCode?: string | null) {
  return caseCode ? `${DEFAULT_CHAT_TITLE} · ${caseCode}` : DEFAULT_CHAT_TITLE;
}

export function buildInitialPromptDraft(caseCode?: string | null) {
  return caseCode ? `Necesito apoyo operativo sobre ${caseCode}.` : "";
}

export function isPlaceholderConversationTitle(title: string) {
  const normalized = title.trim();
  return (
    normalized === DEFAULT_CHAT_TITLE ||
    normalized.startsWith(`${DEFAULT_CHAT_TITLE} ·`) ||
    normalized === "Orquestador Opita Sync" ||
    normalized.startsWith("Caso ")
  );
}

export function buildConversationAutotitle(input: string, fallback = DEFAULT_CHAT_TITLE) {
  const normalized = input
    .replace(/\s+/g, " ")
    .replace(/[.?!,:;]+$/g, "")
    .trim();

  if (!normalized) {
    return fallback;
  }

  return normalized.slice(0, 64);
}

export function buildToolEventId(runId: string, toolName: string, step: string) {
  return `${runId}:${toolName}:${step}`;
}
