# Gap Matrix

| ID | Gap | Category | Severity | Why It Matters | Options | Recommendation | Owner | Status | Final Decision | Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| FG-01 | No existing frontend framework or component system | implementation baseline | Minor | Affects stack choice and migration cost | Keep static HTML or introduce React-based foundation | Introduce React + Vite + Tailwind + Storybook | Codex | Closed | Web React baseline selected | Enables scalable component architecture |
| FG-02 | No Penpot files or design source are present | design grounding | Minor | Prevents visual inspection from a source design tool | Wait for design tool or derive visual system from specs | Derive the visual system in-repo from product specs | Codex | Closed | In-repo visual system becomes source of truth | Unblocks implementation |
| FG-03 | No backend contracts exist for live product data | data integration | Minor | Screens cannot rely on real APIs yet | Delay UI or use mock state contracts | Use typed mock contracts aligned to docs | Codex | Closed | Mock-driven UI foundation | Safe for frontend groundwork |
| FG-04 | Current tests target the legacy control-plane page | QA scope | Minor | Existing tests would fail after replacing the surface | Keep legacy page or migrate tests | Migrate tests to Opita Sync frontend baseline | Codex | Closed | QA updates included in the same batch | Preserves validation discipline |
| FG-05 | Branding inputs existed but lacked a runtime usage rule | visual identity | Minor | Risked mixing mark, app icon, and decorative usage inconsistently | Ignore branding or define runtime rules now | Define runtime rules and integrate only production-safe assets | Codex | Closed | Flow Grid v3 lockup used in shell and app icon proposed from scratch | Keeps identity professional and implementable |
| FG-06 | The first frontend batch had no light/dark theme system | visual system | Minor | A later retrofit would fragment tokens and stories | Delay theming or add semantic tokens now | Add theme tokens now at shell and primitive level | Codex | Closed | Light and dark themes added to baseline | Reduces rework and improves sustainability |
| FG-07 | Supervisor flow lacked a dedicated workspace | role workflow | Minor | The role needed a distinct operational surface, not only shared screens | Keep shared home or add a supervisor workspace | Add a dedicated supervisor home before admin expansion | Codex | Closed | Supervisor workspace implemented as next priority view | Aligns UI with role-specific behavior |

## Developer Questions for Major Gaps

No major product gaps block the current frontend batch. Remaining uncertainty is backend and content detail, which does not prevent UI system work.
