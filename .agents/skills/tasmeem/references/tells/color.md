# Colour tells (`CO-`)

### CO-01 · Purple-to-blue gradient · P0 · scan render
An indigo or violet fill sliding into blue or cyan on the hero, the main button or the cards.
**Why:** it is the most recognisable colour move of generated interfaces; nobody chose it for this product.
**Fix:** one committed brand hue, applied solid. If the brand owns a gradient, keep it to one place and give it the brand's own stops.
**Allowed:** a documented brand gradient.
**Sources:** IM AD GS HM AS TS FD

### CO-02 · Unchosen indigo accent · P1 · scan
Framework indigo or violet (`#6366f1`, `#4f46e5`, `#7c3aed`, `#8b5cf6`, `indigo-500/600`, `violet-500`) as the button, link and focus colour.
**Why:** it is the untouched default of popular kits, so it signals "nobody picked a colour".
**Fix:** derive the accent from the subject's own world (a material, a place, a product) and name it in the tokens.
**Allowed:** the brand's documented primary is in that range.
**Sources:** GS AD TS

### CO-03 · Cream ground by default · P1 · scan render
A warm off-white or beige body (roughly OKLCH L 0.84 to 0.97, C < 0.06, hue 40 to 100), usually with a serif display and a terracotta, clay or brass accent.
**Why:** it became the "tasteful" escape from purple, and so it is now the new default.
**Fix:** a saturated brand colour as the ground, a true neutral, or a mid-tone clearly owned by the brand. Warmth can come from the accent, the type and the imagery instead.
**Allowed:** the brand's own palette (common for heritage, craft and book brands whose materials really are paper, sand or linen). Record the `DESIGN.md` line.
**Sources:** IM GS AD FD TS

### CO-04 · Near-black with one acid accent · P1 · scan render
A near-black page, a single neon green, lime or vermilion accent, and glowing edges.
**Why:** it is the "developer tool" default and the second escape route.
**Fix:** decide dark or light from a real scene (who uses it, where, in what light); if dark, tint the neutrals toward the brand hue and drop the glow.
**Allowed:** the brand's documented identity.
**Sources:** AD IM FD HM

### CO-05 · Gradient text · P0 · scan
A heading filled with a gradient through `background-clip: text`.
**Why:** it decorates without meaning, and it breaks contrast checks and forced-colours mode.
**Fix:** one solid colour. Emphasise with weight, size or position.
**Sources:** IM GS AD HM AS TS FD

### CO-06 · Glow shadows · P1 · scan
A coloured `box-shadow` or `drop-shadow` with a large blur, used as a halo around cards or buttons, mostly on dark grounds.
**Why:** it borrows neon atmosphere instead of building hierarchy.
**Fix:** elevation from a tinted, low-alpha shadow in the ground's own hue, or from a border. No glow.
**Sources:** GS AD HM IM AS

### CO-07 · Halos, spotlights and blobs · P1 · scan render
Radial-gradient halos behind the hero, soft spotlights behind content, blurred aurora blobs and floating orbs.
**Why:** they fill emptiness with light, and they appear on almost every generated dark page.
**Fix:** remove them. If the page feels empty, the page needs content, an authored image or a stronger type composition (see `assets/pipeline.md`).
**Allowed:** a documented atmospheric genre, where it is used once and on purpose.
**Sources:** IM HM AD

### CO-08 · Timid palette · P1 · eye
Four or five colours used in equal amounts, none of them dominant, none committed.
**Why:** a real identity has a dominant colour and a sharp accent. An even spread signals "palette generator".
**Fix:** pick a colour strategy first (restrained, committed, full palette or drenched; see `craft/color.md`), then give one colour most of the surface.
**Sources:** AD FD IM

### CO-09 · Pure black and pure white · P2 · scan
`#000` text on `#fff`, or a `#000` page.
**Why:** pure extremes vibrate on screens and look unconsidered next to tinted neutrals.
**Fix:** neutrals tinted 0.005 to 0.015 chroma toward the brand hue.
**Allowed:** a deliberate brutalist or print-mimicking system.
**Sources:** HM

### CO-10 · Grey text on a coloured surface · P1 · render
Neutral grey text placed on a saturated or tinted band.
**Why:** it looks washed out and usually fails contrast.
**Fix:** use a darker or lighter shade of the surface's own hue, or the surface's own foreground token.
**Sources:** IM

### CO-11 · Two hues pretending to be one · P2 · scan
Two accents so close in hue and lightness (ΔE < 10) that they read as a mistake.
**Fix:** merge them into one token, or separate them clearly.
**Sources:** AD

### CO-12 · Gradient borders and multicolour fills · P1 · scan
Rainbow or multi-stop gradients on borders, cards and icons; `conic-gradient` rings used as decoration.
**Why:** they decorate edges that should carry structure.
**Fix:** solid borders from the neutral ramp. A gradient belongs to a brand asset, not to chrome.
**Sources:** GS IM

### CO-13 · Repeating stripes as filler · P2 · scan
`repeating-linear-gradient` stripes filling empty panels.
**Fix:** remove them, or replace them with a real texture from the brand's material world.
**Allowed:** a documented brand pattern (for example, a weave that the brand owns).
**Sources:** GS IM

### CO-14 · Dark mode by reflex · P1 · eye
A dark theme chosen because tools "look cool dark", or a dark mode that no one asked for and that is half-finished.
**Fix:** decide from the use scene. Ship one theme well before shipping two; every theme you ship must pass the same checks (see SY-06).
**Sources:** AD IM AS

### CO-15 · Default status colours as the brand · P2 · scan
The kit's success green, warning amber and error red used as brand colours, or a status colour carrying no status.
**Fix:** reserve status hues for status; always pair them with text or an icon.
**Sources:** GS

### CO-16 · Raw colour outside the tokens · P1 · scan
Hex, `rgb()` or `oklch()` literals in components while a token system exists.
**Why:** improvised values drift, and drift is how a system stops being one.
**Fix:** lift the value into the token file with a name, then reference it.
**Sources:** HM IM UI T
