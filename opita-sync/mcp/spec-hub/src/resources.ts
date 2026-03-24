import fs from "node:fs";
import path from "node:path";
import { repoRoot } from "./paths.js";

const resourceMap = new Map<string, string>([
  ["spec-hub://template/canonical-spec", path.join(repoRoot, "skills/traductor-tecnico/references/output-contract.md")],
  ["spec-hub://checklist/fidelity", path.join(repoRoot, "skills/traductor-tecnico/references/doc-fidelity-checker.md")],
  ["spec-hub://taxonomy/requirements", path.join(repoRoot, "mcp/spec-hub/TOOLS.md")],
  ["spec-hub://context/manifest", path.join(repoRoot, "context-core/manifest.json")]
]);

export function listResources() {
  return [...resourceMap.keys()].map((uri) => ({
    uri,
    name: uri.replace("spec-hub://", ""),
    mimeType: uri.endsWith(".json") ? "application/json" : "text/markdown"
  }));
}

export function readResource(uri: string) {
  const filePath = resourceMap.get(uri);
  if (!filePath) {
    throw new Error(`unknown resource: ${uri}`);
  }
  return {
    contents: [
      {
        uri,
        mimeType: filePath.endsWith(".json") ? "application/json" : "text/markdown",
        text: fs.readFileSync(filePath, "utf8")
      }
    ]
  };
}

export function listPrompts() {
  return [
    { name: "start_technical_translation", description: "Start a technical translation workflow from natural language." },
    { name: "review_existing_spec", description: "Review an existing spec for completeness and fidelity." },
    { name: "run_doc_fidelity", description: "Run a source-vs-documentation fidelity review." },
    { name: "adapt_to_skill_or_mcp", description: "Adapt a spec for a skill or MCP implementation target." },
    { name: "prepare_implementer_prompt", description: "Generate an implementation handoff prompt." }
  ];
}

export function getPrompt(name: string, args: Record<string, unknown> = {}) {
  const promptText: Record<string, string> = {
    start_technical_translation:
      "Normalize the source requirement, separate facts from assumptions, and draft a structured technical brief.",
    review_existing_spec:
      "Review the spec for gaps, contradictions, and missing acceptance criteria before implementation.",
    run_doc_fidelity:
      "Compare the normalized source with the generated documentation and return traceability plus verdict.",
    adapt_to_skill_or_mcp:
      "Adapt the spec into the minimal structure needed for either a skill package or an MCP server.",
    prepare_implementer_prompt:
      "Write an implementation-ready prompt with modules, contracts, tests, and acceptance criteria."
  };

  if (!promptText[name]) {
    throw new Error(`unknown prompt: ${name}`);
  }

  return {
    description: promptText[name],
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `${promptText[name]}\n\nArgs: ${JSON.stringify(args, null, 2)}`
        }
      }
    ]
  };
}
