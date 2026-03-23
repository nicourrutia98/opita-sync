import { spawnSync } from "node:child_process";
import { buildCodexCommand, listCodexProfiles, routeCodexLaunch } from "./lib/codex-launch-router/router.mjs";

function usage() {
  console.log(`Usage:
  node scripts/codex-route.mjs [--prompt "text"] [--task-type coding] [--risk low|medium|high] [--needs-tools] [--file-count 3]
  node scripts/codex-route.mjs --exec [--dry-run] --prompt "Fix the failing test"
  node scripts/codex-route.mjs --chat [--dry-run] --prompt "Review the current repo structure"

Options:
  --prompt <text>         Prompt to route and optionally send to Codex
  --task-type <type>      chat|docs|summarization|coding|debug|review|analysis|architecture|migration|security
  --risk <level>          low|medium|high
  --needs-tools           Increase score for tool-heavy tasks
  --file-count <n>        Hint for affected file count
  --force-profile <name>  codex_fast|codex_balanced|codex_deep
  --exec                  Launch codex exec through the selected profile
  --chat                  Launch a new interactive Codex session through the selected profile
  --dry-run               Print the command without launching Codex
  --json                  Print machine-readable output
  --list-profiles         Print available profiles
  --                     Pass remaining arguments through to Codex
`);
}

/**
 * @param {string} message
 */
function fail(message) {
  console.error(message);
  process.exit(1);
}

/**
 * @param {string[]} argv
 */
function parseArgs(argv) {
  /** @type {Record<string, unknown>} */
  const options = {
    prompt: "",
    task_type: "coding",
    risk_level: "low",
    needs_tools: false,
    file_count: 0,
    passthrough: []
  };

  let passthroughMode = false;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (passthroughMode) {
      /** @type {string[]} */ (options.passthrough).push(arg);
      continue;
    }

    if (arg === "--") {
      passthroughMode = true;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }

    if (arg === "--exec") {
      options.mode = "exec";
      continue;
    }

    if (arg === "--chat") {
      options.mode = "chat";
      continue;
    }

    if (arg === "--dry-run") {
      options.dry_run = true;
      continue;
    }

    if (arg === "--json") {
      options.json = true;
      continue;
    }

    if (arg === "--needs-tools") {
      options.needs_tools = true;
      continue;
    }

    if (arg === "--list-profiles") {
      options.list_profiles = true;
      continue;
    }

    if (["--prompt", "--task-type", "--risk", "--file-count", "--force-profile"].includes(arg)) {
      const next = argv[index + 1];
      if (!next) {
        fail(`Missing value for ${arg}`);
      }

      if (arg === "--prompt") {
        options.prompt = next;
      }

      if (arg === "--task-type") {
        options.task_type = next;
      }

      if (arg === "--risk") {
        options.risk_level = next;
      }

      if (arg === "--file-count") {
        options.file_count = Number.parseInt(next, 10);
      }

      if (arg === "--force-profile") {
        options.force_profile = next;
      }

      index += 1;
      continue;
    }

    if (!arg.startsWith("--") && !options.prompt) {
      options.prompt = arg;
      continue;
    }

    /** @type {string[]} */ (options.passthrough).push(arg);
  }

  return options;
}

const options = parseArgs(process.argv.slice(2));

if (options.help) {
  usage();
  process.exit(0);
}

if (options.list_profiles) {
  const payload = listCodexProfiles();
  if (options.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    for (const profile of payload) {
      console.log(`${profile.profile}: ${profile.model} (${profile.reasoning_effort}, ${profile.service_tier})`);
    }
  }
  process.exit(0);
}

if (options.force_profile && !listCodexProfiles().some((profile) => profile.profile === options.force_profile)) {
  fail(`Unknown profile "${options.force_profile}". Use --list-profiles to inspect valid values.`);
}

const decision = routeCodexLaunch({
  prompt: /** @type {string} */ (options.prompt),
  task_type: /** @type {string} */ (options.task_type),
  risk_level: /** @type {string} */ (options.risk_level),
  needs_tools: Boolean(options.needs_tools),
  file_count: /** @type {number} */ (options.file_count),
  force_profile: /** @type {string | undefined} */ (options.force_profile)
});

const mode = /** @type {"chat" | "exec" | undefined} */ (options.mode);
const passthrough = /** @type {string[]} */ (options.passthrough);
const command = mode ? buildCodexCommand(mode, passthrough, decision, /** @type {string} */ (options.prompt)) : null;
const output = {
  prompt: options.prompt,
  mode: mode ?? "recommendation",
  decision,
  command_preview: command?.join(" ") ?? null
};

if (!mode || options.dry_run) {
  if (options.json) {
    console.log(JSON.stringify(output, null, 2));
  } else {
    console.log(`Recommended profile: ${decision.selected_profile}`);
    console.log(`Model: ${decision.selected_model}`);
    console.log(`Reasoning: ${decision.reasoning_effort}`);
    console.log(`Score: ${decision.score}`);
    console.log(`Rationale: ${decision.rationale_codes.join(", ")}`);
    if (command) {
      console.log(`Command: ${command.join(" ")}`);
    }
  }

  process.exit(0);
}

const probe = spawnSync("codex", ["--version"], {
  encoding: "utf8",
  shell: process.platform === "win32"
});

if (probe.status !== 0) {
  fail(`Unable to execute codex from this workspace.\n${probe.stderr || probe.stdout}`.trim());
}

if (!command) {
  throw new Error("Launch mode expected a command preview, but none was produced.");
}

const launchCommand = /** @type {string[]} */ (command);
const result = spawnSync(launchCommand[0], launchCommand.slice(1), {
  stdio: "inherit",
  shell: process.platform === "win32"
});

if (typeof result.status === "number") {
  process.exit(result.status);
}

process.exit(1);
