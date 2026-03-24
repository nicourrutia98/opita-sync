# Residual Risk Summary

## Residual Risks

- The MCP server implements the required `stdio` surfaces directly instead of using an external MCP SDK. That keeps v1 small, but future protocol changes may require manual updates.
- Repo grounding is text-based through `rg`, not AST-aware. It is useful for local evidence, but it is not a semantic code model.
- Skill packaging currently prefers `tar` and falls back to PowerShell `Compress-Archive`. Cross-platform archive behavior should be rechecked if the repo moves to a non-Windows primary environment.

## Accepted Defaults

- Filesystem storage is sufficient for v1.
- `stdio` is the only committed transport.
- The MCP remains read-only against the repo.
