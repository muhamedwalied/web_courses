# The asset pipeline: authored images, live text

The fastest way to make a page look generated is to leave its image slots to gradients, glass, blobs and icon tiles (IG-07). The fix is to author the assets. With an image model available, tasmeem builds pages the way a studio does: a mockup first, then the assets, then code that matches the mockup, with every word and control still live in code.

## The one rule

**Paint the material; code the meaning.**
- **Painted (generated plates):** illustrations, photographs, textures, objects, ornaments, backgrounds, the surfaces of things.
- **Coded:** every word, every control, every state, focus ring, number, link and piece of navigation.

A button can wear a painted surface (clay, enamel, woven palm, a paper stamp), but its label, focus ring and states stay in HTML and CSS. That keeps it accessible, translatable, themeable and sharp at every size.

## The flow

```
direction ─► comp ─► region map ─► plates ─► build ─► compare ─► gate
```

### 1. Direction
Run `core/direction.md` first. The comp visualises a decided direction; it does not replace the decision.

### 2. Comp (the north-star mockup)
Generate one full-fidelity image of the first screen, at the surface's real aspect ratio:
- desktop 16:9 or 16:10;
- mobile 9:16 at device viewport.

Use the real product name, the real structure and the real content outline, in the palette and type character of the direction. See the prompt template in `prompts.md` §1.
- For multi-page work, also generate a **brand board** (palette, type specimen, textures, marks, photography mood) as the system reference (`prompts.md` §2).
- **Text in the comp is a placeholder.** Models garble text, especially Arabic (IG-08). The comp carries composition, proportion, colour and material, never copy.
- Offer the user up to three compositional options, then lock one. The locked comp is the reference the build is judged against.

### 3. Region map
Mark every region of the locked comp as **coded** (text, control, chrome, data) or **painted** (plate: illustration, photo, texture, object, ornament). Anything painted that the build leaves out, or fakes in CSS, is a finding at the compare step.

```yaml
# .tasmeem/regions.yaml
comp: .tasmeem/comps/home-desktop.png
regions:
  - id: hero-art      kind: plate     note: dusk street scene, right two-thirds
  - id: hero-title    kind: text      note: product name, display face
  - id: cta           kind: control   note: primary action, clay texture surface
  - id: cta-surface   kind: texture   note: glazed clay, warm, tileable
  - id: divider       kind: plate     note: hand-woven palm band, transparent PNG, repeat-x
```

### 4. Plates
Generate each painted region as its own asset, at least 1.5× its largest displayed size (2k by default), with the comp crop as a reference image:

| Plate kind | Model hint | Background | Notes |
|---|---|---|---|
| Illustration, scene | `gpt_image_2_5` | opaque | reference: the comp crop; remove all text |
| Isolated object, ornament, cutout | `gpt_image_2_5` | **transparent** | verify real alpha on light and dark grounds |
| Texture (paper, cloth, clay, stone) | `gpt_image_2_5` | opaque | ask for a seamless tile; test it mirror-tiled |
| Icon set, pattern, flat illustration | `recraft_v4_1` with `model_type: vector` and brand `colors` | none | SVG output; keeps a set consistent |
| Photograph (people, product, place) | `gpt_image_2_5` or `nano_banana_pro` | opaque | never present as a real customer or staff member |
| Cutting out an existing photo | `image_background_remover` | transparent | check hair and fine edges |

- One plate per job. Never ship a crop of the comp itself: it carries the comp's grain and its neighbours' edges.
- Keep a prompt sidecar for every plate (see `provenance.md`).
- Check each plate at its display size on the real ground before using it.

### 5. Build
- Code draws all the text, controls and structure. Plates go in with `<img>` or `<picture>` (with art-directed crops per breakpoint), `background-image`, `mask-image` or `border-image`.
- **Skinning controls with plates:**
  ```css
  .cta {
    background: var(--accent) url(/plates/clay.webp) center / 240px repeat;  /* texture over a solid fallback */
    color: var(--accent-ink);                                                /* live text, contrast-checked */
    border-image: url(/plates/stitch-frame.png) 24 fill / 24px / 0 round;    /* stretchable painted frame (9-slice) */
  }
  .cta:focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; } /* the focus ring stays code */
  .badge { mask: url(/plates/wax-seal.svg) center / contain no-repeat; background: var(--accent); }
  ```
  - Keep a solid colour under every texture, so text contrast is measurable and survives image failure.
  - Put a scrim or tone layer between busy plates and text.
  - States change through filters, tone swaps or alternate plates, never by removing the focus ring.
- **Responsive:** plates get `srcset` and `sizes`; decorative plates get `alt=""`; the LCP plate gets `fetchpriority="high"`.
- **Themes:** plates that sit on the ground need a dark-theme variant, or transparent PNGs that work on both.

### 6. Compare
Screenshot the build at the comp's viewport and put it next to the comp. For every region:
- Does it exist?
- Is it in the right place, at the right scale?
- Is it made of the right medium?

Fix everything the comparison shows in one batch, then compare once more (the gate's bounded loop).

### 7. Gate
Run `core/gate.md`. Plates add three checks:
- no text inside plates (IG-08);
- alt text or `alt=""` set correctly (IG-05);
- every plate has its provenance sidecar.

## Without image generation

If there is no Higgsfield CLI or native image tool, tasmeem runs **code-led**:
- the ambition moves into the written direction (the first screen and the signature interaction);
- image slots are filled with the owner's real media, or left as clearly labelled art-direction briefs (`prompts.md` templates filled in) for the user to produce.

Never fill them with gradients or placeholder boxes.
