export const toolDefinitions = [
  {
    name: "normalize_requirements",
    description: "Convert free-form source text into atomic requirements, constraints, non-goals, assumptions, and open questions.",
    inputSchema: {
      type: "object",
      properties: {
        source_text: { type: "string" },
        profile: { type: "string", enum: ["skill", "mcp", "app", "api"] }
      },
      required: ["source_text"]
    }
  },
  {
    name: "validate_spec",
    description: "Validate the minimum completeness of a structured technical specification.",
    inputSchema: {
      type: "object",
      properties: {
        spec_json: { type: "object" }
      },
      required: ["spec_json"]
    }
  },
  {
    name: "check_doc_fidelity",
    description: "Compare source requirements and generated documentation, returning traceability and a fidelity verdict.",
    inputSchema: {
      type: "object",
      properties: {
        source_requirements: { type: "object" },
        generated_documentation: { type: "string" },
        spec_json: { type: "object" }
      },
      required: ["source_requirements", "generated_documentation"]
    }
  },
  {
    name: "diff_revision",
    description: "Compare a base spec and a candidate revision for semantic drift and lost coverage.",
    inputSchema: {
      type: "object",
      properties: {
        base_version: { type: "object" },
        candidate_version: { type: "object" }
      },
      required: ["base_version", "candidate_version"]
    }
  },
  {
    name: "ground_with_repo",
    description: "Search the local repo for evidence and naming that align or conflict with a proposed spec.",
    inputSchema: {
      type: "object",
      properties: {
        repo_path: { type: "string" },
        target: { type: "string" }
      },
      required: ["repo_path", "target"]
    }
  },
  {
    name: "export_spec",
    description: "Export a structured spec into markdown, json, or yaml.",
    inputSchema: {
      type: "object",
      properties: {
        spec_json: { type: "object" },
        format: { type: "string", enum: ["markdown", "json", "yaml"] }
      },
      required: ["spec_json", "format"]
    }
  }
] as const;
