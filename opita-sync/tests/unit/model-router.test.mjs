import test from "node:test";
import assert from "node:assert/strict";
import { loadRoutingPolicy } from "../../scripts/lib/model-router/policy.mjs";
import { route } from "../../scripts/lib/model-router/router.mjs";
import { execute, estimateCostUsd } from "../../scripts/lib/model-router/executor.mjs";
import { createMockAdapter } from "../../scripts/lib/model-router/mock-adapter.mjs";

const policy = loadRoutingPolicy();

test("route avoids economy tier for high-risk strict request", () => {
  const decision = route({
    task_type: "analysis",
    input: "Analyze security risks for rotating service account keys every 12 hours.",
    quality_profile: "strict",
    risk_level: "high",
    requires_tools: false
  }, policy);

  assert.ok(["balanced", "robust"].includes(decision.selected_tier));
  assert.match(decision.selected_model, /gpt/);
  assert.ok(decision.rationale_codes.includes("high_risk"));
});

test("route supports forced tier override", () => {
  const decision = route({
    input: "Return a concise label.",
    force_tier: "economy"
  }, policy);

  assert.equal(decision.selected_tier, "economy");
  assert.ok(decision.rationale_codes.includes("forced_tier"));
});

test("execute returns success and telemetry using mock adapter", async () => {
  const result = await execute({
    task_type: "summarization",
    input: "Summarize incident details and mention two concrete follow-up actions.",
    quality_profile: "standard",
    max_latency_ms: 2000,
    expected_min_chars: 80
  }, policy, createMockAdapter());

  assert.equal(result.ok, true);
  assert.equal(typeof result.answer, "string");
  assert.ok(result.orchestration.telemetry.total_tokens > 0);
  assert.ok(result.orchestration.total_estimated_cost_usd >= 0);
});

test("estimateCostUsd handles undefined usage safely", () => {
  assert.equal(estimateCostUsd(undefined, undefined), 0);
});
