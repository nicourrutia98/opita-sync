import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { spawnSync } from "node:child_process";
import { getActiveRequest } from "../../scripts/lib/request-registry.mjs";
import { toAbsolute } from "../../scripts/lib/repo-utils.mjs";

test("router benchmark/report/calibrate scripts produce request artifacts", () => {
  const active = getActiveRequest();
  const benchmarkPath = toAbsolute(`docs/requests/${active.id}/router-benchmark-results.json`);
  const reportPath = toAbsolute(`docs/requests/${active.id}/router-benchmark-report.md`);
  const calibrationPath = toAbsolute(`docs/requests/${active.id}/router-calibration-log.md`);

  const benchmark = spawnSync("node", ["scripts/router-benchmark.mjs"], { cwd: toAbsolute("."), encoding: "utf8" });
  assert.equal(benchmark.status, 0, benchmark.stderr || benchmark.stdout);
  assert.equal(fs.existsSync(benchmarkPath), true, "Missing benchmark artifact");

  const report = spawnSync("node", ["scripts/router-report.mjs"], { cwd: toAbsolute("."), encoding: "utf8" });
  assert.equal(report.status, 0, report.stderr || report.stdout);
  assert.equal(fs.existsSync(reportPath), true, "Missing report artifact");

  const calibrate = spawnSync("node", ["scripts/router-calibrate.mjs"], { cwd: toAbsolute("."), encoding: "utf8" });
  assert.equal(calibrate.status, 0, calibrate.stderr || calibrate.stdout);
  assert.equal(fs.existsSync(calibrationPath), true, "Missing calibration artifact");

  const benchmarkContent = JSON.parse(fs.readFileSync(benchmarkPath, "utf8"));
  assert.ok(Array.isArray(benchmarkContent.records), "Benchmark records should be an array");
  assert.ok(benchmarkContent.records.length > 0, "Benchmark records should not be empty");
});
