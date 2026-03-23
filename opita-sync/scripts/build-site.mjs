import path from "node:path";
import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const vitePackageJson = require.resolve("vite/package.json");
const viteBin = path.resolve(path.dirname(vitePackageJson), "bin", "vite.js");

const result = spawnSync(process.execPath, [viteBin, "build"], {
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log("Built Opita Sync frontend into site/");
