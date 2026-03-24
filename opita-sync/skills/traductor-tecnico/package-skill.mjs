import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname);
const distDir = path.join(root, "dist");
const artifactPath = path.join(distDir, "traductor-tecnico.zip");
const archiveItems = ["SKILL.md", "agents", "references"];

fs.mkdirSync(distDir, { recursive: true });
if (fs.existsSync(artifactPath)) {
  fs.rmSync(artifactPath, { force: true });
}

const tar = spawnSync("tar", ["-a", "-cf", artifactPath, ...archiveItems], {
  cwd: root,
  stdio: "inherit"
});

if (tar.status === 0) {
  console.log(`Packaged skill at ${artifactPath}`);
  process.exit(0);
}

const resolvedItems = archiveItems.map((item) => path.join(root, item));
const escapedItems = resolvedItems.map((item) => `'${item.replace(/'/g, "''")}'`).join(", ");
const powershell = spawnSync(
  "powershell",
  [
    "-NoProfile",
    "-Command",
    `Compress-Archive -Path ${escapedItems} -DestinationPath '${artifactPath.replace(/'/g, "''")}' -Force`
  ],
  { stdio: "inherit" }
);

if (powershell.status !== 0) {
  process.exit(powershell.status ?? 1);
}

console.log(`Packaged skill at ${artifactPath}`);
