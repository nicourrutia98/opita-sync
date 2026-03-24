# Compliance Matrix

| Requirement | Status | Evidence |
| --- | --- | --- |
| Real new chat | implemented | explicit backend route + frontend CTA + adapter methods |
| Archive first | implemented | `archivedAt` model + archive update flow + filtered list |
| Inherit selected case | implemented | create conversation flow sends current `caseId` |
| Tool visibility without chain-of-thought | implemented | run status stores and renders tool activity events |
| Retry last turn | implemented | explicit retry primitive in backend and adapters |
| Minimum validation | partial | lint/typecheck/targeted compile checks passed; worker tests blocked by EPERM |
