# Prompt templates

Rules that hold for every image model:
- **Describe the positive state.** No model has a negative channel, and "no cars" summons cars. Write "an empty street, bare asphalt".
- **60 to 120 words.** Put the essentials first. The last sentence is the least reliable.
- **Name each reference's job:** "Use the first image for composition and light only; the subject comes from the text."
- **Literal text in quotes,** and only when the image truly needs it. By default, request none.
- **No booster tokens** ("masterpiece, 8k, trending"). Name the medium, the lens, the light, the materials and the era instead.

Fill the brackets from the direction (`core/direction.md`) and the region map.

## 1. Comp (first screen)

```
A high-fidelity website design screenshot of the first screen of [product name], [one-line what it is],
for [audience], shown flat and straight-on at [1440×900 desktop | 390×844 phone], the page filling the whole image edge to edge.
Layout: [one sentence + the structure: e.g. an asymmetric split, a full-bleed photograph on the start side,
a large display headline on the end side, a single primary action, a thin navigation row].
Reading direction: [right-to-left Arabic | left-to-right].
Visual language: [palette with roles and hex], [type character: e.g. a sturdy geometric Kufi display
with a quiet Naskh body], [materials and textures from the subject's world], [photography or illustration medium].
Text areas are simple neutral placeholder lines, not readable words.
Mood: [the scene sentence].
```

Generate at the surface's aspect ratio (16:10 or 16:9 desktop; 9:16 phone), 2k, `quality: high`.

## 2. Brand board

```
A brand identity board for [name], [what it is], laid out as a clean presentation sheet on [ground colour].
Show: a colour palette of [n] swatches ([hex list with roles]), a type specimen area with placeholder lines,
[3–4] material and texture swatches ([materials]), a photography mood strip of [subjects],
and [2] applications ([e.g. a paper bag, a shop sign, a phone screen]), all consistent in light and style.
Placeholder lines stand in for all lettering.
```

## 3. Illustration or scene plate (from a comp crop)

```
Recreate the scene in the first image as a standalone [photograph | illustration] at full resolution:
[subject], [composition: framing, what sits where], [light], [palette].
Use the first image for composition, palette and light only. Clean edges, with every surface free of lettering,
signage text and watermarks. [Aspect], suitable for a website [hero | section image].
```

## 4. Cutout object (transparent)

```
A single [object], [material and finish], [angle], studio-lit with soft [direction] light,
isolated on a fully transparent background with clean anti-aliased edges and a soft contact shadow
[omitted | included]. [Palette]. Plain, unmarked surfaces.
```

Set `background: transparent`. Verify the alpha on light and dark grounds.

## 5. Seamless texture

```
A seamless, tileable texture of [material: e.g. hand-made paper with visible fibres | glazed clay | woven palm frond],
evenly lit from straight on, flat and uniform across the whole frame, [colour range],
[fine | medium | coarse] grain, suitable for repeating as a website background at [size]px tiles.
```

Test by mirror-tiling it at 3×3 before use.

## 6. Ornament or divider

```
A horizontal decorative band of [motif from the subject's world: e.g. a braided palm-leaf strip],
[craft medium], [colours], centred on a fully transparent background, [length:height ratio],
edges that can repeat horizontally without a visible seam.
```

## 7. Icon set (vector, Recraft)

`recraft_v4_1` with `model_type: vector` and `colors: [brand hex list]`:

```
A consistent set of [n] icons for [product], [stroke | filled] style, [stroke width] strokes, [corner style],
drawn on a [24]px grid: [icon 1], [icon 2], [icon 3]…. Same visual weight across all icons, pictograms only.
```

Generate the set in one job for consistency. Check that it matches the text weight (SY-05), and hand-tune the SVG paths if needed.

## 8. Portrait or people (illustrative)

```
[An editorial portrait | an environmental photo] of [role, age range, attire from the subject's world],
[setting], [light], [lens and framing], natural skin texture, candid expression.
```

Illustrative only. Never present it as a real customer, staff member or author (see `core/honesty.md`).

## 9. Product in context

```
[Product: form, material, colour, exact details], placed [where] in [setting from the subject's world],
[time of day and light], [camera angle and lens], shallow depth of field, [palette].
The product surfaces are plain and unprinted.
```

Composite the real logo or label afterwards, in vector (IG-08).

## 10. Empty state or spot illustration

```
A small spot illustration for an empty [thing] screen in [product]: [a metaphor from the subject's world,
concrete, not abstract blobs], [medium matching the brand board], [2–3 colours from the palette],
generous empty space around it, transparent background.
```
