import { forbiddenPlaceholders } from "./lib/opita-release-data.mjs";
import { assert, readText, walk } from "./lib/repo-utils.mjs";

const files = walk(".").filter((/** @type {string} */ file) => {
  if (
    file.startsWith("node_modules/") ||
    file.startsWith("backend/node_modules/") ||
    file.startsWith("backend/dist/") ||
    file.startsWith(".git/") ||
    file.startsWith("storybook-static/") ||
    file.startsWith("site/")
  ) {
    return false;
  }

  return [".md", ".mjs", ".ts", ".json", ".toml", ".yml", ".yaml", ".css", ".html", ".gitignore"].some((suffix) => file.endsWith(suffix));
});

for (const file of files) {
  const content = readText(file);
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    assert(!/\t/.test(line), `${file}:${index + 1} contains a tab character`);
    assert(!/[ \t]+$/.test(line), `${file}:${index + 1} contains trailing whitespace`);
  });

  if (file === "scripts/lib/opita-release-data.mjs") {
    continue;
  }

  for (const placeholder of forbiddenPlaceholders) {
    const pattern = placeholder.includes(" ")
      ? new RegExp(placeholder, "i")
      : new RegExp(`\\b${placeholder}\\b`);
    assert(!pattern.test(content), `${file} contains forbidden placeholder "${placeholder}"`);
  }
}

console.log(`Lint passed for ${files.length} files.`);
