import fs from "node:fs";
import path from "node:path";
import { assert, readText, toAbsolute } from "./repo-utils.mjs";

export const requestArtifactNames = [
  "interpreted-request.md",
  "gap-matrix.md",
  "technical-language.md",
  "technical-language-audit.md",
  "spec.md",
  "implementation-recommendation.md"
];

export function loadRequestIndex() {
  const content = readText("docs/requests/index.md");
  const rows = content
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| 20"));

  return rows.map((row) => {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim());

    return {
      id: cells[0],
      title: cells[1],
      status: cells[2],
      active: cells[3],
      path: cells[4]
    };
  });
}

export function getActiveRequest() {
  const requests = loadRequestIndex();
  const active = requests.filter((request) => request.active === "yes");

  assert(active.length === 1, `Expected exactly one active request, found ${active.length}`);

  return active[0];
}

/**
 * @param {string} requestId
 */
export function requestPath(requestId) {
  return `docs/requests/${requestId}`;
}

/**
 * @param {string} requestId
 * @param {string} relativeFile
 */
export function requestFile(requestId, relativeFile) {
  return `${requestPath(requestId)}/${relativeFile}`;
}

/**
 * @param {string} requestId
 * @param {string} relativeFile
 */
export function requestExists(requestId, relativeFile) {
  return fs.existsSync(toAbsolute(path.join(requestPath(requestId), relativeFile)));
}

/**
 * @param {string} value
 */
export function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/**
 * @param {Date} [date]
 */
export function makeDatePrefix(date = new Date()) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * @param {string} title
 * @param {Date} [date]
 */
export function makeRequestId(title, date = new Date()) {
  return `${makeDatePrefix(date)}-${slugify(title)}`;
}
