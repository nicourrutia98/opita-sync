import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { commandSurface, requiredDirectories, requiredFiles } from "../../scripts/lib/opita-release-data.mjs";
import { readText, toAbsolute } from "../../scripts/lib/repo-utils.mjs";
import { getActiveRequest, requestArtifactNames, requestFile } from "../../scripts/lib/request-registry.mjs";

test("required files exist", () => {
  for (const file of requiredFiles) {
    assert.equal(fs.existsSync(toAbsolute(file)), true, `Missing file: ${file}`);
  }
});

test("required directories exist", () => {
  for (const directory of requiredDirectories) {
    assert.equal(fs.existsSync(toAbsolute(directory)), true, `Missing directory: ${directory}`);
  }
});

test("package scripts expose the full command surface", () => {
  const packageJson = JSON.parse(readText("package.json"));
  for (const command of commandSurface) {
    assert.ok(packageJson.scripts[command], `Missing npm script: ${command}`);
  }
  assert.ok(packageJson.scripts["request:new"], "Missing npm script: request:new");
});

test("request registry points to exactly one active request with a complete artifact set", () => {
  const active = getActiveRequest();
  assert.equal(active.active, "yes");

  for (const artifact of requestArtifactNames) {
    assert.equal(fs.existsSync(toAbsolute(requestFile(active.id, artifact))), true, `Missing active request artifact: ${artifact}`);
  }
});

