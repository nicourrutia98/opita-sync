import fs from "node:fs";
import path from "node:path";
import { contextCoreDir, contextStorageDir } from "./paths.js";
import type { ContextArtifact } from "./types.js";
import { slugify } from "./utils.js";

export function readManifest(): unknown {
  const manifestPath = path.join(contextCoreDir, "manifest.json");
  return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
}

export function storeArtifact(
  kind: ContextArtifact["kind"],
  payload: unknown,
  sourceRefs: string[] = [],
  id = `${kind}-${slugify(new Date().toISOString())}`
): ContextArtifact {
  const now = new Date().toISOString();
  const artifact: ContextArtifact = {
    id,
    kind,
    createdAt: now,
    updatedAt: now,
    sourceRefs,
    payload
  };

  const dir = path.join(contextStorageDir, kind);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(artifact, null, 2));
  return artifact;
}

export function queryArtifacts(kind?: ContextArtifact["kind"], text?: string, limit = 5): ContextArtifact[] {
  const baseDirs = kind ? [path.join(contextStorageDir, kind)] : listStorageDirectories();
  const artifacts: ContextArtifact[] = [];

  for (const dir of baseDirs) {
    if (!fs.existsSync(dir)) {
      continue;
    }

    for (const entry of fs.readdirSync(dir)) {
      if (!entry.endsWith(".json")) {
        continue;
      }
      const artifact = JSON.parse(fs.readFileSync(path.join(dir, entry), "utf8")) as ContextArtifact;
      const haystack = JSON.stringify(artifact).toLowerCase();
      if (!text || haystack.includes(text.toLowerCase())) {
        artifacts.push(artifact);
      }
    }
  }

  return artifacts
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .slice(0, limit);
}

export function loadSessionState(sessionId = "default"): ContextArtifact | null {
  const filePath = path.join(contextStorageDir, "session_state", `${sessionId}.json`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as ContextArtifact;
}

export function writeSessionState(sessionId: string, payload: unknown): ContextArtifact {
  return storeArtifact("session_state", payload, [], sessionId);
}

function listStorageDirectories(): string[] {
  if (!fs.existsSync(contextStorageDir)) {
    return [];
  }

  return fs
    .readdirSync(contextStorageDir)
    .map((entry) => path.join(contextStorageDir, entry))
    .filter((entry) => fs.existsSync(entry) && fs.statSync(entry).isDirectory());
}
