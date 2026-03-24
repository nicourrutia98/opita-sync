# Tools del MCP

## 1. `normalize_requirements`

Input:
- source text
- optional context
- optional profile: `skill | mcp | app | api`

Output:
- atomic requirements
- constraints
- non-goals
- assumptions
- prioritized open questions

## 2. `validate_spec`

Input:
- structured spec
- optional profile

Output:
- errors
- warnings
- missing fields
- completeness score
- preliminary readiness

## 3. `check_doc_fidelity`

Input:
- normalized source requirements
- generated documentation
- optional structured spec

Output:
- traceability matrix
- omissions
- inventions
- distortions
- ambiguities
- blockers
- verdict
- suggested corrections

## 4. `diff_revision`

Input:
- base version
- candidate version
- optional profile

Output:
- semantic changes
- lost coverage
- breaking changes
- new risks

## 5. `ground_with_repo`

Input:
- repo path
- target spec or module

Output:
- matching modules
- nearby contracts
- useful naming
- conflicts against the proposed documentation

## 6. `export_spec`

Input:
- structured spec
- format: `markdown | json | yaml`

Output:
- artifact text
- metadata
- export warnings
