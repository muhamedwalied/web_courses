# Other modes

## polish

A final pass inside an existing system, with no new direction.

1. Run the audit's measure step on the target.
2. Fix every P0 and P1 that is not a brand exception, plus the P2s in the touched files: states, focus, spacing rhythm, alignment, tabular figures, text wrapping, image outlines, concentric radii, press feedback.
3. Re-measure once, then report the before and after totals.

Keep the identity: polish never changes the palette, type or structure.

## redesign

Keep the content, information architecture, routes and brand; change the visual structure.

1. **Identity lock** (`core/direction.md` §1). Ask before replacing brand tokens.
2. Run the direction protocol with the current site as step 1's input. The reflex check must produce a different silhouette from the current one.
3. List the files to create, change and delete. Deletions need the user's explicit confirmation.
4. Build in place, through the existing routes and components, then gate.

## study ‹url | screenshot›

Extract the DNA of a design the user admires, not its pixels.

1. From a URL: read the HTML and CSS (the real fonts, colours, spacing, motion). From a screenshot: use `tasmeem.mjs palette <image>` for the colours; judge the type and structure by eye.
2. Report:
   - the macro-structure (the silhouette);
   - the type pairing and scale;
   - the colour strategy and anchors;
   - the density and rhythm;
   - the signature element;
   - the motion grammar.
3. Offer:
   - to build the user's own content with this DNA (hand-off to build);
   - or to write it as a `DESIGN.md` direction.
4. Never clone a live site's pixels, copy its assets or reproduce a paid template. Studying the principles is fine.

## brand

See `brand/identity.md`.

## assets

See `assets/pipeline.md`. It needs the Higgsfield CLI (or a native image tool) and the cost gate.

## motion

1. Measure: `tasmeem.mjs render <url> --motion` finds held reveals, layout-property animation, missing reduced-motion paths and long durations.
2. Judge against `motion/principles.md`: purpose, easing, duration, origin, orchestration.
3. For new motion, define the tokens first (`motion/techniques.md` §1), then one orchestrated moment per view.

## copy

Interface words in every language present.

1. List every interface string the agent owns: labels, buttons, errors, empty states, `alt`, metadata. Set aside the owner-supplied content.
2. Check them against `tells/copy.md` and the voice rules of the language guide (`scripts-lang/arabic.md` §9 for Arabic).
3. Rewrite the agent-owned strings, keeping each action's verb consistent through its flow. Plurals go through `Intl.PluralRules`.

## document

Write or refresh `DESIGN.md` from the code:
1. `tasmeem.mjs tokens <css paths>` lists the custom properties, raw values and font faces.
2. Fill in `templates/DESIGN.template.md`: tokens with roles, type per script, components and their states, motion tokens, rules and reasons, brand exceptions.
