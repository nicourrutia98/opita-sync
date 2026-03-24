import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { tokenize, unique } from "./utils.js";

export function groundWithRepo(repoPath: string, target: string): {
  evidence_modules: string[];
  nearby_contracts: string[];
  useful_naming: string[];
  conflicts: string[];
} {
  const keywords = unique(tokenize(target)).slice(0, 6);
  const evidenceModules: string[] = [];
  const nearbyContracts: string[] = [];
  const usefulNaming: string[] = [];
  const conflicts: string[] = [];

  if (!fs.existsSync(repoPath)) {
    return {
      evidence_modules: [],
      nearby_contracts: [],
      useful_naming: [],
      conflicts: ["repo path does not exist"]
    };
  }

  if (keywords.length === 0) {
    return {
      evidence_modules: [],
      nearby_contracts: [],
      useful_naming: [],
      conflicts: ["no searchable keywords found in target"]
    };
  }

  const pattern = keywords.join("|");
  const search = spawnSync("rg", ["-n", pattern, repoPath], {
    encoding: "utf8"
  });

  const lines = search.status === 0 || search.status === 1 ? search.stdout.split(/\r?\n/).filter(Boolean) : [];
  for (const line of lines.slice(0, 20)) {
    const [filePath] = line.split(":");
    if (filePath) {
      evidenceModules.push(path.relative(repoPath, filePath));
      const baseName = path.basename(filePath, path.extname(filePath));
      usefulNaming.push(baseName);
      if (/contract|schema|types/i.test(filePath)) {
        nearbyContracts.push(path.relative(repoPath, filePath));
      }
    }
  }

  if (/graphql/i.test(target) && !lines.some((line) => /graphql/i.test(line))) {
    conflicts.push("target mentions GraphQL but no matching repo evidence was found");
  }

  return {
    evidence_modules: unique(evidenceModules),
    nearby_contracts: unique(nearbyContracts),
    useful_naming: unique(usefulNaming),
    conflicts
  };
}
