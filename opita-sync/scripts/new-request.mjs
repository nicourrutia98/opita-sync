import fs from "node:fs";
import { assert, ensureDirectory, readText, toAbsolute } from "./lib/repo-utils.mjs";
import { loadRequestIndex, makeRequestId, requestArtifactNames, requestPath } from "./lib/request-registry.mjs";

function usage() {
  console.log("Usage: npm run request:new -- [--activate] \"Request title\"");
}

const rawArgs = process.argv.slice(2);
const activate = rawArgs.includes("--activate");
const title = rawArgs.filter((arg) => arg !== "--activate").join(" ").trim();

if (!title) {
  usage();
  process.exit(1);
}

const requestId = makeRequestId(title);
const requestDir = requestPath(requestId);
const indexPath = "docs/requests/index.md";

assert(!fs.existsSync(toAbsolute(requestDir)), `Request already exists: ${requestId}`);

const requests = loadRequestIndex().map((request) => ({
  ...request,
  active: activate ? "no" : request.active
}));

requests.push({
  id: requestId,
  title,
  status: "interpreting",
  active: activate ? "yes" : "no",
  path: requestDir
});

ensureDirectory(requestDir);

/** @type {Record<string, string>} */
const scaffold = {
  "interpreted-request.md": `# Interpreted Request

## Request Summary

${title}

## Primary Objective

## Expected User-Visible Behavior

## Likely Affected Surfaces

## Immediate Ambiguities

## Suspected Missing Constraints
`,
  "gap-matrix.md": `# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Developer Questions for Major Gaps
`,
  "technical-language.md": `# Normalized Technical Language

## Original Intent Translation

## Objective

## In Scope

## Out of Scope

## Confirmed Decisions

## Assumptions Accepted by Context

## Primary Behavior

## Alternate and Failure Behavior

## UI/Content Requirements

## Non-Functional Constraints

## Acceptance Criteria

## Risks and Unresolved Non-Blockers
`,
  "technical-language-audit.md": `# Technical Language Audit

## Semantic Fidelity

## Functional Completeness

## Testability

## Implementation Readiness

## Overall Decision
`,
  "spec.md": `# Request Specification

## Summary

## Objective

## Business Context

## Scope

## Out of Scope

## Confirmed Decisions

## Accepted Assumptions

## Affected Systems and Layers

## Functional Behavior

## Alternate Behavior and Failure Handling

## UI/Content Behavior

## Localization Rules

## Accessibility Expectations

## Observability or Analytics Expectations

## Non-Functional Constraints

## Risks and Regressions

## Acceptance Criteria

## Test Strategy

## Rollout and Rollback

## Documentation Updates Required
`,
  "implementation-recommendation.md": `# Implementation Recommendation

## Decision

## Why This Is The Best Path

## Immediate Execution Path

## Recommended Next Step After This Task
`
};

for (const artifactName of requestArtifactNames) {
  fs.writeFileSync(toAbsolute(`${requestDir}/${artifactName}`), scaffold[artifactName]);
}

const indexContent = `# Request Index

| Request ID | Title | Status | Active | Path |
| --- | --- | --- | --- | --- |
${requests.map((request) => `| ${request.id} | ${request.title} | ${request.status} | ${request.active} | ${request.path} |`).join("\n")}
`;

fs.writeFileSync(toAbsolute(indexPath), indexContent);

console.log(`Created request scaffold: ${requestId}${activate ? " (active)" : ""}`);
