# The delivery gate

No work is delivered until the gate has run and its result is shown. The gate is evidence, not a promise.

## 1. Measure

Run what the environment allows, strongest first:

```sh
node <skill>/scripts/tasmeem.mjs render <url> --widths 360,768,1024,1440 --json   # needs Playwright
node <skill>/scripts/tasmeem.mjs built <dir-of-html> --json                       # a static build
node <skill>/scripts/tasmeem.mjs scan <src-paths> --json                          # always possible
```

The `render` check is the only one that sees computed styles, real fonts, contrast on real backgrounds, overflow and console errors. When it cannot run, say so, and mark the render-only tells as **unverified**.

## 2. Look

Capture screenshots at 360 and 1440 at least (plus 768 and 1024 for layouts that change there), in every theme shipped, with and without reduced motion for motion work. Review them yourself against:

- the direction (does the first screen show the signature?);
- the `eye` tells in `tells/` (sameness, the silhouette, reflex choices);
- the writing systems present (the checklist of the script guide).

## 3. Report

```
GATE · ‹target› · ‹date›
Measured: render ✓ (4 widths) · built ✓ · scan ✓
P0: 0 · P1: 2 · P2: 5 · brand exceptions: 1 (DESIGN.md §Colour: sand ground)
Open:
  P1 TY-05 eyebrow above section titles, src/components/Section.tsx:14
  P1 SC-10 phone number not isolated in the Arabic footer, src/components/Footer.tsx:31
Judged (eye): no sameness findings; the signature (woven band) is present at 360 and 1440.
Verdict: PASS with 2 P1 listed | FAIL
```

- **FAIL** if any P0 remains, any `QA-` or `SC-01`…`SC-10` P1 remains, or render could not run on a surface that has motion or non-Latin text and no one accepted that risk.
- **PASS with list** otherwise. List every open item. Never hide a finding by relabelling it.
- **Brand exceptions** are listed with the `DESIGN.md` or `PRODUCT.md` line that grants them.

## 4. Bounded verification

Build fully, measure once, fix everything the measurement shows in one batch, and measure once more. Then stop and report. Open-ended self-polishing burns the user's money and drifts away from the direction. If the second measurement still shows P0s, report them and ask how to proceed.
