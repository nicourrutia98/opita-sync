import test from "node:test";
import assert from "node:assert/strict";
import { exists, readText, toAbsolute } from "../../scripts/lib/repo-utils.mjs";
import { makeRequestId, slugify } from "../../scripts/lib/request-registry.mjs";

test("toAbsolute resolves repo-relative paths", () => {
  const value = toAbsolute("README.md");
  assert.match(value, /opita-sync[\\/]+README\.md$/);
});

test("exists detects known release files", () => {
  assert.equal(exists("AGENTS.md"), true);
  assert.equal(exists("docs/compliance-matrix.md"), true);
});

test("readText returns UTF-8 text for markdown files", () => {
  const content = readText("AGENTS.md");
  assert.match(content, /Working Method/);
});

test("slugify normalizes request titles", () => {
  assert.equal(slugify("Nueva solicitud técnica"), "nueva-solicitud-tecnica");
});

test("makeRequestId prefixes titles with an ISO-like date", () => {
  const value = makeRequestId("Nueva solicitud técnica", new Date(2026, 2, 24, 12, 0, 0));
  assert.equal(value, "2026-03-24-nueva-solicitud-tecnica");
});
