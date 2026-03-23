/** @typedef {"codex_fast" | "codex_balanced" | "codex_deep"} CodexProfileName */

/** @type {Record<CodexProfileName, {profile: CodexProfileName, model: string, reasoning_effort: string, service_tier: string}>} */
const profileCatalog = {
  codex_fast: {
    profile: "codex_fast",
    model: "gpt-5-mini",
    reasoning_effort: "low",
    service_tier: "fast"
  },
  codex_balanced: {
    profile: "codex_balanced",
    model: "gpt-5.4",
    reasoning_effort: "medium",
    service_tier: "fast"
  },
  codex_deep: {
    profile: "codex_deep",
    model: "gpt-5.4",
    reasoning_effort: "high",
    service_tier: "fast"
  }
};

/** @type {Record<string, number>} */
const taskTypeWeights = {
  chat: 0,
  docs: 1,
  summarization: 1,
  coding: 2,
  debug: 3,
  review: 3,
  analysis: 3,
  architecture: 4,
  migration: 4,
  security: 5
};

/** @type {Record<string, number>} */
const riskWeights = {
  low: 0,
  medium: 2,
  high: 4
};

const keywordSignals = [
  { pattern: /\bsecurity|auth|permission|credential|secret|compliance\b/i, score: 3, code: "security_signal" },
  { pattern: /\brefactor|migration|schema|incident|postmortem|rollback\b/i, score: 2, code: "complex_change_signal" },
  { pattern: /\bdebug|failing test|failure|regression|broken\b/i, score: 2, code: "debug_signal" },
  { pattern: /\bsimple|small|tiny|one[- ]line|quick\b/i, score: -1, code: "simple_signal" }
];

/**
 * @param {string} prompt
 */
function estimatePromptScore(prompt) {
  const length = prompt.trim().length;

  if (length >= 2500) {
    return { score: 4, code: "prompt_xlarge" };
  }

  if (length >= 1200) {
    return { score: 3, code: "prompt_large" };
  }

  if (length >= 400) {
    return { score: 2, code: "prompt_medium" };
  }

  if (length >= 120) {
    return { score: 1, code: "prompt_small" };
  }

  return { score: 0, code: "prompt_tiny" };
}

/**
 * @param {{
 * prompt?: string,
 * task_type?: string,
 * risk_level?: string,
 * needs_tools?: boolean,
 * file_count?: number,
 * force_profile?: string
 * }} input
 */
export function routeCodexLaunch(input = {}) {
  const prompt = `${input.prompt ?? ""}`.trim();
  const forced = input.force_profile
    ? profileCatalog[/** @type {CodexProfileName} */ (input.force_profile)]
    : undefined;

  if (forced) {
    return {
      selected_profile: forced.profile,
      selected_model: forced.model,
      reasoning_effort: forced.reasoning_effort,
      service_tier: forced.service_tier,
      score: 0,
      rationale_codes: ["forced_profile"],
      command_mode_ready: true
    };
  }

  let score = 0;
  /** @type {string[]} */
  const rationale = [];
  const promptSignal = estimatePromptScore(prompt);
  score += promptSignal.score;
  rationale.push(promptSignal.code);

  const taskType = `${input.task_type ?? "coding"}`.toLowerCase();
  const taskScore = taskTypeWeights[taskType] ?? 2;
  score += taskScore;
  rationale.push(`task_${taskType}`);

  const riskLevel = `${input.risk_level ?? "low"}`.toLowerCase();
  const riskScore = riskWeights[riskLevel] ?? 0;
  score += riskScore;
  if (riskScore > 0) {
    rationale.push(`risk_${riskLevel}`);
  }

  if (input.needs_tools) {
    score += 2;
    rationale.push("needs_tools");
  }

  const fileCount = Number.isFinite(input.file_count) ? Number(input.file_count) : 0;
  if (fileCount >= 20) {
    score += 2;
    rationale.push("many_files");
  } else if (fileCount >= 5) {
    score += 1;
    rationale.push("few_files");
  }

  for (const signal of keywordSignals) {
    if (signal.pattern.test(prompt)) {
      score += signal.score;
      rationale.push(signal.code);
    }
  }

  const selectedProfile = score >= 8
    ? profileCatalog.codex_deep
    : score >= 3
      ? profileCatalog.codex_balanced
      : profileCatalog.codex_fast;

  return {
    selected_profile: selectedProfile.profile,
    selected_model: selectedProfile.model,
    reasoning_effort: selectedProfile.reasoning_effort,
    service_tier: selectedProfile.service_tier,
    score,
    rationale_codes: rationale,
    command_mode_ready: true
  };
}

/**
 * @param {"chat" | "exec"} launchMode
 * @param {string[]} passthroughArgs
 * @param {ReturnType<typeof routeCodexLaunch>} decision
 * @param {string} [prompt]
 */
export function buildCodexCommand(launchMode, passthroughArgs, decision, prompt) {
  const base = launchMode === "exec" ? ["exec"] : [];
  const command = ["codex", ...base, "--profile", decision.selected_profile, ...passthroughArgs];

  if (prompt) {
    command.push(prompt);
  }

  return command;
}

export function listCodexProfiles() {
  return Object.values(profileCatalog);
}
