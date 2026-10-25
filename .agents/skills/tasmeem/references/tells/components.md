# Component tells (`CM-`)

### CM-01 · Untouched kit defaults · P1 · scan
Component-library defaults shipped as the design: the kit's radius variable, button variants, card and input styles left as installed.
**Why:** a kit is a starting point. Unchanged, every product built on it looks the same.
**Fix:** restyle it through the project's tokens (radius, colour, type, density) before building pages.
**Sources:** AD TS

### CM-02 · Rounded and shadowed everything · P1 · scan
The same large radius and soft shadow on every box; radii above about 24px on content cards.
**Fix:** one documented radius scale. Use shadow only for real elevation (menus, dialogs), and borders for structure.
**Sources:** AD IM GS HM AS

### CM-03 · Glass by reflex · P1 · scan
`backdrop-filter: blur()` on cards and panels that are not layered over moving content.
**Fix:** use blur only where it explains layering (a sheet over content), with a solid fallback for `prefers-reduced-transparency`.
**Sources:** IM AD HM AS TS

### CM-04 · Side-stripe accent · P1 · scan
A coloured `border-left` or `border-right` wider than 1px on cards, list items or callouts (`border-inline-start` in RTL-aware code).
**Why:** it imitates an alert without any status meaning.
**Fix:** a full border, a background tint, a leading icon or label, or nothing.
**Allowed:** a real status callout whose colour means something, together with text.
**Sources:** IM GS AD HM

### CM-05 · Icon in a tinted chip · P1 · scan
An icon inside a pale rounded square in the accent colour, stacked above a heading.
**Fix:** place the icon inline with its label at text size, or drop it.
**Sources:** IM AD GS

### CM-06 · Doubled edges · P2 · scan
A hairline border and a wide shadow on the same box; stacked multi-layer "puffy" shadows.
**Fix:** one edge per box. If it needs a shadow, keep it tight and tinted to the ground.
**Sources:** IM GS MF

### CM-07 · Missing states · P1 · scan render
Interactive elements without hover, `:focus-visible`, active, disabled, loading, error, empty and success states.
**Fix:** design all eight states for every interactive component (see `craft/components.md`).
**Sources:** AD HM TS UI

### CM-08 · Status-chip soup · P2 · eye
Many coloured chips per row, most carrying no decision.
**Fix:** one chip per row at most, for the state a reader acts on.
**Sources:** AD IM

### CM-09 · The default dark card · P1 · scan
A `#111` card with a `#222` border, grey text and a small glowing icon.
**Sources:** AD

### CM-10 · Effect-library components · P1 · scan
Spotlight cards, border beams, meteors, particles and shimmer buttons copied from effect libraries.
**Why:** they are recognisable at a glance and say nothing about the product.
**Fix:** use motion that explains something (see `motion/`).
**Sources:** AD

### CM-11 · Floating decorations over the hero · P1 · built
A badge card floated over the hero image, or an empty "ghost" card used as decoration.
**Sources:** GS

### CM-12 · Rows dressed as cards · P2 · built
List rows boxed like cards, rows overstuffed with metadata, or metadata wrapping onto several lines.
**Fix:** use real list styling: aligned columns, one line of metadata, and dividers.
**Allowed:** a feed where every row is an object the reader opens.
**Sources:** GS

### CM-13 · Redrawn chrome · P1 · scan
Fake browser bars with traffic-light dots, fake phone frames, fake terminal windows around code, and fake IDE panels.
**Why:** the reader's device already has chrome. Drawing it again is costume.
**Fix:** show real screenshots in a plain `<figure>`, or the real thing working.
**Sources:** HM AD

### CM-14 · Hover-only affordances · P1 · render
Actions or information that appear only on hover.
**Fix:** make them visible at rest, or reachable by tap and focus.
**Sources:** HM TS UI

### CM-15 · Buttons without substance · P1 · scan
Clickable `div`s, links used as buttons (and buttons as links), no press feedback, generic labels.
**Fix:** `<button>` for actions and `<a>` for navigation, a label naming the result, and a 100 to 160ms press response.
**Sources:** WG MF EK

### CM-16 · Noisy feedback · P2 · render
Toasts that shift the layout, celebratory success toasts, and confirmation dialogs for reversible actions.
**Fix:** feedback in place, undo instead of confirm, and a toast only for background results.
**Sources:** HM WG

### CM-17 · Auto-rotating carousels · P1 · render
Carousels that advance on their own with no pause control.
**Fix:** reader-controlled carousels, or a grid. Anything auto-advancing needs a pause control and must stop under reduced motion.
**Sources:** HM WG

### CM-18 · Non-concentric corners · P2 · render
An inner element with the same radius as its container, so the gap between them bulges at the corners.
**Fix:** inner radius = outer radius − padding.
**Sources:** MF

### CM-19 · Decorative dividers · P2 · built
Ornamental rules, bare `<hr>` lines between every section, and borders that repeat an edge already made by space.
**Sources:** GS

### CM-20 · Fake data visuals · P1 · built
Rows of equal dots posing as charts, gauges covered in tick marks, icons on metrics and redundant scales.
**Fix:** draw the real data, or show the number in a sentence.
**Sources:** GS
