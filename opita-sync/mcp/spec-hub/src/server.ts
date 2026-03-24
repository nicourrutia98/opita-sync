import { Buffer } from "node:buffer";
import process from "node:process";
import { readManifest, storeArtifact } from "./context-store.js";
import { diffRevision } from "./diff.js";
import { exportSpec } from "./exporters.js";
import { checkDocFidelity } from "./fidelity.js";
import { normalizeRequirements } from "./normalization.js";
import { repoRoot } from "./paths.js";
import { getPrompt, listPrompts, listResources, readResource } from "./resources.js";
import { groundWithRepo } from "./repo-grounding.js";
import { toolDefinitions } from "./tool-definitions.js";
import type { NormalizedRequirements, Profile, SpecDocument } from "./types.js";
import { validateSpec } from "./validation.js";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

let incoming = Buffer.alloc(0);

process.stdin.on("data", (chunk: Buffer) => {
  incoming = Buffer.concat([incoming, chunk]);
  drainMessages();
});

function drainMessages() {
  while (true) {
    const headerBoundary = incoming.indexOf("\r\n\r\n");
    if (headerBoundary === -1) {
      return;
    }

    const header = incoming.slice(0, headerBoundary).toString("utf8");
    const match = header.match(/Content-Length:\s*(\d+)/i);
    if (!match) {
      incoming = Buffer.alloc(0);
      return;
    }

    const contentLength = Number(match[1]);
    const totalLength = headerBoundary + 4 + contentLength;
    if (incoming.length < totalLength) {
      return;
    }

    const body = incoming.slice(headerBoundary + 4, totalLength).toString("utf8");
    incoming = incoming.slice(totalLength);
    const request = JSON.parse(body) as JsonRpcRequest;
    void handleRequest(request);
  }
}

async function handleRequest(request: JsonRpcRequest) {
  try {
    if (request.method === "notifications/initialized") {
      return;
    }

    let result: unknown;
    switch (request.method) {
      case "initialize":
        result = {
          protocolVersion: "2025-03-26",
          serverInfo: { name: "spec-hub", version: "0.1.0" },
          capabilities: {
            tools: {},
            resources: {},
            prompts: {}
          }
        };
        break;
      case "tools/list":
        result = { tools: toolDefinitions };
        break;
      case "tools/call":
        result = handleToolCall(request.params ?? {});
        break;
      case "resources/list":
        result = { resources: listResources() };
        break;
      case "resources/read":
        result = readResource(String(request.params?.uri ?? ""));
        break;
      case "prompts/list":
        result = { prompts: listPrompts() };
        break;
      case "prompts/get":
        result = getPrompt(String(request.params?.name ?? ""), (request.params?.arguments as Record<string, unknown>) ?? {});
        break;
      default:
        throw new Error(`unsupported method: ${request.method}`);
    }

    if (request.id !== undefined) {
      writeMessage({ jsonrpc: "2.0", id: request.id, result });
    }
  } catch (error) {
    if (request.id !== undefined) {
      writeMessage({
        jsonrpc: "2.0",
        id: request.id,
        error: {
          code: -32000,
          message: error instanceof Error ? error.message : String(error)
        }
      });
    }
  }
}

function handleToolCall(params: Record<string, unknown>) {
  const name = String(params.name ?? "");
  const args = (params.arguments as Record<string, unknown>) ?? {};
  let structuredContent: unknown;

  switch (name) {
    case "normalize_requirements": {
      const result = normalizeRequirements(String(args.source_text ?? ""), (args.profile as Profile | undefined) ?? "skill");
      structuredContent = result;
      storeArtifact("normalized_requirement", result, []);
      break;
    }
    case "validate_spec": {
      structuredContent = validateSpec(args.spec_json);
      break;
    }
    case "check_doc_fidelity": {
      const normalized = args.source_requirements as NormalizedRequirements;
      const result = checkDocFidelity(
        normalized,
        String(args.generated_documentation ?? ""),
        args.spec_json as SpecDocument | undefined
      );
      structuredContent = result;
      storeArtifact("fidelity_report", result, []);
      break;
    }
    case "diff_revision": {
      structuredContent = diffRevision(args.base_version as SpecDocument, args.candidate_version as SpecDocument);
      break;
    }
    case "ground_with_repo": {
      structuredContent = groundWithRepo(String(args.repo_path ?? repoRoot), String(args.target ?? ""));
      storeArtifact("repo_grounding", structuredContent, [String(args.repo_path ?? repoRoot)]);
      break;
    }
    case "export_spec": {
      structuredContent = exportSpec(args.spec_json as SpecDocument, (args.format as "markdown" | "json" | "yaml") ?? "markdown");
      storeArtifact("spec_snapshot", structuredContent, []);
      break;
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(structuredContent, null, 2)
      }
    ],
    structuredContent
  };
}

function writeMessage(message: unknown) {
  const body = JSON.stringify(message);
  process.stdout.write(`Content-Length: ${Buffer.byteLength(body, "utf8")}\r\n\r\n${body}`);
}

storeArtifact("architecture_decision", { server: "spec-hub", manifest: readManifest() }, ["context-core/manifest.json"], "spec-hub-bootstrap");
