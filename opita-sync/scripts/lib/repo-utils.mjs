import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/**
 * @param {string} relativePath
 */
export function toAbsolute(relativePath) {
  return path.join(repoRoot, relativePath);
}

/**
 * @param {string} relativePath
 */
export function readText(relativePath) {
  return fs.readFileSync(toAbsolute(relativePath), "utf8");
}

/**
 * @param {string} relativePath
 */
export function exists(relativePath) {
  return fs.existsSync(toAbsolute(relativePath));
}

/**
 * @param {unknown} condition
 * @param {string} message
 */
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * @param {string} relativePath
 */
export function ensureDirectory(relativePath) {
  fs.mkdirSync(toAbsolute(relativePath), { recursive: true });
}

/**
 * @param {string} relativePath
 */
export function listFiles(relativePath) {
  return fs.readdirSync(toAbsolute(relativePath));
}

/**
 * @param {string} relativePath
 * @returns {string[]}
 */
export function walk(relativePath) {
  const current = toAbsolute(relativePath);
  const entries = fs.readdirSync(current, { withFileTypes: true });
  /** @type {string[]} */
  const files = [];

  for (const entry of entries) {
    const child = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(child));
      continue;
    }

    files.push(child.replaceAll("\\", "/"));
  }

  return files;
}
