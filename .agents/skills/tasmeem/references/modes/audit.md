# Mode: audit

A read-only review of an existing surface. Nothing is edited until the user picks findings to fix.

## 1. Scope and context

- The target: routes, files or the whole site. The scripts and languages present. The themes shipped.
- Read `PRODUCT.md` and `DESIGN.md`. Every decision they document is a candidate **brand exception** (see `tells/README.md`). Note the owner-supplied content, which is never rewritten.

## 2. Measure (evidence first)

```sh
node <skill>/scripts/tasmeem.mjs scan <src> --json > .tasmeem/audit/scan.json
node <skill>/scripts/tasmeem.mjs built <build-dir> --json > .tasmeem/audit/built.json          # if a static build exists
node <skill>/scripts/tasmeem.mjs render <url> --widths 360,768,1024,1440 --json > .tasmeem/audit/render.json
node <skill>/scripts/tasmeem.mjs report .tasmeem/audit/*.json --design DESIGN.md > .tasmeem/audit/measured.md
```

When a project keeps its own evidence folder, write the reports there instead of `.tasmeem/`.

## 3. Look (judgment, labelled as such)

With the render screenshots:
- **Direction:** is there one? Does the first screen carry a signature, or the silhouette of the template (LA-01, SY-03)?
- **The `eye` tells** in each `tells/` category.
- **Writing systems:** the checklist of each `scripts-lang/` guide for the scripts present.
- **Motion:** watch the entrance at 1440 and 390 with motion on, then again under reduced motion.
- **Copy:** interface text only (CP-). List the owner-supplied text separately and do not judge it.

## 4. Report

One numbered list, deduplicated across the measured and judged findings, with P0 first:

```
# Audit · ‹target› · ‹date›
Measured: scan ✓ · built ✓ · render ✓ (360/768/1024/1440, reduced-motion on/off)
Totals: P0 n · P1 n · P2 n · brand exceptions n

| # | ID | Sev | Where | Finding | Fix | Evidence | Brand exception? |
|---|----|-----|-------|---------|-----|----------|------------------|
| 1 | SC-01 | P0 | src/styles/globals.css:88 | h2 letter-spacing −0.02em reaches Arabic headings | reset tracking under :lang(ar) | render: 14 nodes | no |
| 2 | CO-03 | P1 | tokens.css:12 | sand ground | none | scan | yes: DESIGN.md §Colour |
```

- Group the findings by page when there are many. Give file and line where the scanner found them; route and selector for render findings.
- Mark judged findings `eye`. Never present judgment as measurement.
- End with the three highest-impact fixes, and what the page does well (to keep).

## 5. Fix (only after the user picks)

Fix the numbers the user chose, and only those, in one batch. Then re-run step 2 on the same scope and report the before and after totals.
