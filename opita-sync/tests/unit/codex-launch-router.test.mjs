import test from "node:test";
import assert from "node:assert/strict";
import { buildCodexCommand, routeCodexLaunch } from "../../scripts/lib/codex-launch-router/router.mjs";

test("routes small low-risk prompt to fast profile", () => {
  const decision = routeCodexLaunch({
    prompt: "Summarize this file.",
    task_type: "chat",
    risk_level: "low"
  });

  assert.equal(decision.selected_profile, "codex_fast");
  assert.equal(decision.selected_model, "gpt-5-mini");
});

test("routes security-heavy request to deep profile", () => {
  const decision = routeCodexLaunch({
    prompt: "Audit the auth migration and review secret rotation security risks before rollout.",
    task_type: "security",
    risk_level: "high",
    needs_tools: true,
    file_count: 12
  });

  assert.equal(decision.selected_profile, "codex_deep");
  assert.ok(decision.rationale_codes.includes("security_signal"));
  assert.ok(decision.score >= 8);
});

test("routes implementation with important gaps and safe improvement to deep profile", () => {
  const decision = routeCodexLaunch({
    prompt: "Implement the next migration with explicit rollback notes and acceptance coverage.",
    task_type: "migration",
    risk_level: "medium",
    needs_tools: true,
    file_count: 8,
    implementation_kind: "migration",
    gap_severity: "important",
    gap_count: 3,
    improvement_mode: "applied_safe_improvement",
    improvement_size: "small"
  });

  assert.equal(decision.selected_profile, "codex_deep");
  assert.equal(decision.implementation_kind, "migration");
  assert.equal(decision.gap_summary, "important:3");
  assert.equal(decision.improvement_summary, "applied_safe_improvement:small");
});

test("keeps small patch with one safe improvement in balanced or fast territory", () => {
  const decision = routeCodexLaunch({
    prompt: "Small UI patch plus explicit empty state copy.",
    task_type: "coding",
    risk_level: "low",
    file_count: 2,
    implementation_kind: "small_patch",
    gap_severity: "minor",
    gap_count: 1,
    improvement_mode: "applied_safe_improvement",
    improvement_size: "small"
  });

  assert.notEqual(decision.selected_profile, "codex_deep");
});

test("builds codex exec command with selected profile", () => {
  const decision = routeCodexLaunch({
    prompt: "Fix the failing test.",
    task_type: "debug",
    risk_level: "medium"
  });

  const command = buildCodexCommand("exec", ["--json"], decision, "Fix the failing test.");
  assert.deepEqual(command.slice(0, 4), ["codex", "exec", "--profile", decision.selected_profile]);
  assert.equal(command[4], "--json");
  assert.equal(command.at(-1), "Fix the failing test.");
});
