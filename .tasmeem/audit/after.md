# tasmeem report

Measured: scan ✓ · built ✓
Totals: P0 0 · P1 4 · P2 0 · brand exceptions 26
Verdict: **FAIL** (a P0, or a P1 accessibility/script/honesty finding, is open)

| # | ID | Sev | Where | Finding | Count | Evidence |
|---|---|---|---|---|---|---|
| 1 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical left in an RTL project (use the logical property) | 8 | .react-flow__handle-bottom |
| 2 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical border-right in an RTL project (use the logical property) | 2 | .react-flow__controls.horizontal .react-flow__controls-button |
| 3 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical border-left-width in an RTL project (use the logical property) | 1 | .react-flow__resize-control.line.left |
| 4 | SC-05 | P1 | dist/index.html:5 | Missing direction, or physical CSS in RTL: physical border-right-width in an RTL project (use the logical property) | 1 | .react-flow__resize-control.line.right |

## Brand exceptions

| ID | Where | Finding | Granted by |
|---|---|---|---|
| CM-03 | src/components/graph/CirclesGraph.tsx | backdrop blur (Tailwind) | DESIGN.md: backdrop-blur on the sticky header only — functional legibility while content scrolls under it, not decorative glass (graph node cards may shed their |
| IG-11 | src/layouts/Layout.astro | generator fingerprint | DESIGN.md: Astro generator meta kept — honest statement of the stack. |
| CM-03 | src/layouts/Layout.astro | backdrop blur (Tailwind) | DESIGN.md: backdrop-blur on the sticky header only — functional legibility while content scrolls under it, not decorative glass (graph node cards may shed their |
| TY-04 | src/pages/index.astro | one word styled differently inside the headline | DESIGN.md: the same hero phrase carries the one accented colour span; no other heading uses an accented word. |
| CO-05 | src/pages/index.astro | gradient text (Tailwind) | DESIGN.md: the gradient-clipped phrase is the home hero signature — exactly one instance site-wide, accent→accent-2 clip in the RTL linear direction. |
| CP-05 | src/pages/index.astro | 3 em dashes in interface strings | DESIGN.md: inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten. |
| CO-07 | src/styles/global.css | radial halo or spotlight background | DESIGN.md: two fixed ambient radial radials on the body ground at 7%/6% — depth cue for the technical-dark aesthetic, far below ornament strength. |
| IG-11 | dist/circles/flutter/index.html | generator fingerprint | DESIGN.md: Astro generator meta kept — honest statement of the stack. |
| CM-03 | dist/circles/flutter/index.html | backdrop blur (Tailwind) | DESIGN.md: backdrop-blur on the sticky header only — functional legibility while content scrolls under it, not decorative glass (graph node cards may shed their |
| CP-05 | dist/circles/flutter/index.html | 4 em dashes in interface strings | DESIGN.md: inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten. |
| IG-11 | dist/circles/front-end/index.html | generator fingerprint | DESIGN.md: Astro generator meta kept — honest statement of the stack. |
| CP-10 | dist/circles/front-end/index.html | right-pointing arrow in Arabic text (forward is ←) | DESIGN.md: literal `→` separators inside owner-supplied `tagline` strings (e.g. «Phase 1 → Core Engineering → …») rendered verbatim from content JSON — owner wo |
| CP-05 | dist/circles/front-end/index.html | 9 em dashes in interface strings | DESIGN.md: inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten. |
| SY-04 | dist/index.html | z-index 1001 | DESIGN.md: z-index 1001 on the connection line lives inside @xyflow/react's own CSS — third-party internals, outside this repo's control without a fork. |
| IG-11 | dist/index.html | generator fingerprint | DESIGN.md: Astro generator meta kept — honest statement of the stack. |
| TY-04 | dist/index.html | one word styled differently inside the headline | DESIGN.md: the same hero phrase carries the one accented colour span; no other heading uses an accented word. |
| CO-05 | dist/index.html | gradient text (Tailwind) | DESIGN.md: the gradient-clipped phrase is the home hero signature — exactly one instance site-wide, accent→accent-2 clip in the RTL linear direction. |
| CP-10 | dist/index.html | right-pointing arrow in Arabic text (forward is ←) | DESIGN.md: literal `→` separators inside owner-supplied `tagline` strings (e.g. «Phase 1 → Core Engineering → …») rendered verbatim from content JSON — owner wo |
| CP-05 | dist/index.html | 6 em dashes in interface strings | DESIGN.md: inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten. |
| IG-11 | dist/start-flutter/index.html | generator fingerprint | DESIGN.md: Astro generator meta kept — honest statement of the stack. |
| CP-09 | dist/start-flutter/index.html | "oops" | DESIGN.md: scanner's "oops" match lands inside the English word **lo**ops in an owner course description — substring false positive, no apologetic copy exists. |
| CP-05 | dist/start-flutter/index.html | 3 em dashes in interface strings | DESIGN.md: inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten. |
| IG-11 | dist/start-front-end/index.html | generator fingerprint | DESIGN.md: Astro generator meta kept — honest statement of the stack. |
| CP-02 | dist/start-front-end/index.html | "the ultimate" | DESIGN.md: upstream course titles (e.g. "The Ultimate React Course") are owner content — typeset verbatim. |
| CP-05 | dist/start-front-end/index.html | 101 em dashes in interface strings | DESIGN.md: inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten. |
| CO-16 |  | 6 non-token file(s) with many raw colour literals | DESIGN.md: raw colour literals in CirclesGraph are data-driven per circle (circle.color from content JSON) — data tokens, not token escapes. |

Judged findings (eye) are added by the reviewer below this line and labelled as judgment.
