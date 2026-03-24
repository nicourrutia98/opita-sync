import path from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const containerDir = path.resolve(moduleDir, "..");
const specHubDir =
  path.basename(containerDir) === "dist" ? path.resolve(moduleDir, "..", "..") : path.resolve(moduleDir, "..");

export const repoRoot = path.resolve(specHubDir, "../..");
export const contextCoreDir = path.join(repoRoot, "context-core");
export const contextStorageDir = path.join(contextCoreDir, "storage");
