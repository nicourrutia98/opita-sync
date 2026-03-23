export const requiredFiles = [
  "AGENTS.md",
  "README.md",
  ".env.example",
  ".codex/config.toml",
  "docs/requests/index.md",
  "docs/specs/opita-sync/overview.md",
  "docs/specs/opita-sync/frontend-architecture.md",
  "docs/specs/opita-sync/frontend-visual-system.md",
  "docs/specs/opita-sync/frontend-screen-map.md",
  "docs/specs/opita-sync/frontend-branding.md",
  "docs/test-plans/opita-sync-module-test-plan.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "playwright.config.ts",
  "scripts/build-site.mjs",
  "scripts/serve-site.mjs",
  "scripts/lint.mjs",
  "scripts/content-check.mjs",
  "scripts/lib/request-registry.mjs",
  "tests/e2e/opita-sync.spec.ts",
  "tests/visual/opita-sync.visual.spec.ts",
  "tests/a11y/opita-sync.a11y.spec.ts",
  ".github/workflows/ci.yml"
];

export const requiredDirectories = [
  ".docs",
  ".codex",
  ".github",
  ".github/workflows",
  ".storybook",
  "docs",
  "docs/requests",
  "docs/specs",
  "docs/specs/opita-sync",
  "docs/test-plans",
  "playwright",
  "scripts",
  "site",
  "src",
  "public",
  "stories",
  "tests",
  "tests/unit",
  "tests/integration",
  "tests/content",
  "tests/e2e",
  "tests/visual",
  "tests/a11y"
];

export const commandSurface = [
  "orchestrator:serve",
  "codex:pick",
  "codex:exec:auto",
  "codex:chat:auto",
  "router:benchmark",
  "router:report",
  "router:calibrate",
  "lint",
  "typecheck",
  "unit",
  "integration",
  "content",
  "e2e",
  "visual",
  "a11y",
  "ci"
];

export const requiredReadmeCommands = commandSurface.map((command) => `npm run ${command}`);

export const requiredMarkers = [
  { file: "AGENTS.md", snippets: ["## Working Method", "## Gap Policy", "## Closure Policy"] },
  { file: "README.md", snippets: ["# Opita Sync", "## Variables de entorno", "## Router de modelo para Codex"] },
  { file: "docs/requests/index.md", snippets: ["# Request Index", "yes", "docs/requests/"] },
  { file: "docs/specs/opita-sync/overview.md", snippets: ["## Module Map", "## Fixed Product Decisions"] },
  { file: "docs/specs/opita-sync/frontend-architecture.md", snippets: ["## UI Layering", "## Runtime Data Strategy"] }
];

export const forbiddenPlaceholders = ["TODO", "TBD", "lorem ipsum", "changeme"];

export const siteFacts = {
  title: "Opita Sync",
  phases: ["Foundation", "Integration", "Validation", "Release"],
  mcp: ["playwright"]
};

