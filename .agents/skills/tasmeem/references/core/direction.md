# Direction: deciding what the design is before building it

Most generated design is bad for one reason: the model jumps to its default look instead of reading the brief. This protocol makes the choice deliberate. Run it before any new surface, and in the shortened form (steps 1, 2 and 8) before any change to an existing one.

## 1. Read what exists

- `PRODUCT.md` (who, why, voice, constraints) and `DESIGN.md` (tokens, type, components, rules), if present.
- The code: token files, global CSS, a representative component, the fonts actually loaded.
- The brand assets: logo, palette, photography, the owner's own words.

**Identity lock.** If a brand system exists, it wins. You extend it, and you do not replace it unless the user asks for a redesign. Record every inherited decision; the taste rules in `tells/` bend to it (see `tells/README.md` § Brand exceptions).

## 2. State the design read

One line, before any code:

> Reading this as: **‹surface›** for **‹audience›**, in **‹language / script›**, with a **‹register›** voice, leaning toward **‹direction›**.

Example: *Reading this as: a booking page for a Riyadh barber collective, for men aged 20–40 on phones, in Arabic (Gulf register), leaning toward a committed charcoal-and-brass shop-sign language drawn from the shop's own signage.*

If two readings are equally plausible and would lead to different designs, ask one question. Otherwise proceed and state the assumption.

## 3. Write the scene sentence

Who uses it, where, under what light, in what mood. The sentence must force the choice between dark and light, and it must set the density.

- *"A barber checks tomorrow's bookings on his phone between clients, in a bright shop, hands busy."* → light, high contrast, big targets, few words.
- *"A reader opens an essay at night in bed."* → dark or dim, a comfortable measure, no motion.

If the sentence does not decide the theme, it is not concrete enough. Add detail until it does.

## 4. Inventory the subject's world

List at least eight concrete nouns from the subject's own world: materials, tools, artifacts, places, marks, vernacular words. Distinctive choices come from here, not from a style menu.

A barbershop has razors, hot towels, a striped pole, receipt pads, chair leather, neighbourhood names, hand-painted prices. A tax firm has stamps, carbon forms, ledger rules, deadlines, a street address.

**Culture without costume.** Include the place and the language, but not the tourist clichés (see `scripts-lang/arabic.md` §10). What does this product's street actually look like?

## 5. Set the dials

| Dial | 1 | 10 |
|---|---|---|
| **Variance** | strict symmetry and grid | art-directed asymmetry |
| **Motion** | static | cinematic |
| **Density** | gallery-sparse | cockpit-dense |

Presets:

| Surface | Variance | Motion | Density |
|---|---|---|---|
| Brand or landing, premium | 7 | 5 | 3 |
| Brand, creative or agency | 9 | 7 | 3 |
| Portfolio | 8 | 6 | 3 |
| Editorial, long-form | 6 | 3 | 3 |
| Product UI, dashboard | 4 | 3 | 7 |
| Public service, trust-first | 3 | 2 | 5 |

## 6. Pick a colour strategy, then the colours

- **Restrained:** tinted neutrals and one accent under 10% of the surface. Product default.
- **Committed:** one saturated colour carries 30 to 60% of the surface. Brand default.
- **Full palette:** three or four named roles, each used deliberately.
- **Drenched:** the surface is the colour. For heroes and campaigns.

Then name four to six colours in OKLCH with roles (ground, ink, accent, muted, surface, signal), and check the contrast of every text pair before building (see `craft/color.md`).

## 7. Plan the type, layout and signature

- **Type:** a display face used with restraint, a body face, and a utility face if data needs one. For each script present: its face, its line height, its size step. Pair the faces on a contrast axis (serif with sans, geometric with humanist), or use one superfamily.
- **Layout:** one sentence and one ASCII wireframe of the first screen. Compare two alternatives, and choose one.
- **Signature:** the single element the page will be remembered by. Spend the boldness there and keep everything around it quiet.

## 8. Check the plan for reflexes

Before writing code, test the plan:

1. **First order.** Could someone guess this palette and type from the category alone? If yes, rework it.
2. **Second order.** Could someone guess it from the category plus "not the usual" ("AI tool, but not SaaS-purple, so editorial serif")? If yes, that is the next default: rework it.
3. **Saturated lanes.** Is the plan one of these? If so, the brief must require it explicitly:
   - cream, serif and terracotta;
   - near-black with a neon accent;
   - broadsheet hairlines, italic serif and mono labels;
   - purple gradients with Inter;
   - glassy aurora;
   - a SaaS bento;
   - brutalist mono-yellow;
   - the cultural costume.
4. **Silhouette.** Shrink the planned first screen to a small grey block diagram. Is it the centred hero over three cards? Then change the structure, not only the colours.
5. **Honesty.** List every fact the design needs (numbers, names, quotes, prices, logos). Mark each as *supplied* or *missing*. Missing facts become labelled gaps, never inventions (see `honesty.md`).

Say what you changed and why, in one line per change.

## 9. Choose the build path

- **Code-led:** build directly from the plan. The ambition lives in the plan's first-screen description and its signature interaction.
- **Comp-led:** generate a full-fidelity mockup first, then build to match it. Recommended for brand surfaces when image generation is available (Higgsfield or a native image tool), because a picture holds a composition more faithfully than prose does. See `assets/pipeline.md`.

Record the direction (steps 2 to 8) at the top of the work, or in `DESIGN.md` for a multi-page project. Every later page is built from it.
