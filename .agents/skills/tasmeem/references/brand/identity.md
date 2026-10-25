# Brand identity

Use this when there is no brand yet, when the user asks for one, or when a product outgrows its placeholder look. A brand is a set of decisions the whole product can follow. It is not a logo alone.

## 1. Ground it in the subject

Run `core/direction.md` steps 1 to 4 (context, read, scene, subject inventory). Add:
- **Positioning:** one sentence on what this is and for whom, and one on what it is *not*.
- **Personality:** three adjectives, each with its opposite ("warm, not cute").
- **Anti-references:** two or three brands it must not resemble, and why.
- **The voice:** register (see `scripts-lang/arabic.md` §9 for Arabic), address form, verbs for actions, and a few phrases it would and would never say.

## 2. Decide the system

| Part | Decide | Output |
|---|---|---|
| Palette | strategy, then 4 to 6 roles in OKLCH, the tones for coloured surfaces | tokens + contrast table |
| Type | faces per script and role, the scale, line heights per script | tokens + specimen |
| Marks | wordmark, symbol, signature, favicon | vector (SVG) |
| Materials | 2 or 3 textures or surfaces from the subject's world | plates (see `assets/`) |
| Imagery | medium, light, subjects, framing, what is never shown | art-direction brief + sample plates |
| Motion | tempo (calm or brisk), curves, one signature motion | motion tokens |
| Pattern or ornament | optional; only from the subject's real world | vector or plate |

Write it all into `DESIGN.md` (template in `templates/DESIGN.template.md`), with a reason per decision.

## 3. Marks

- **Logos are vector, drawn with intent.** An image model can explore concepts (shapes, marks, compositions) for the user to choose from. The final mark is redrawn as clean SVG: by a designer, by hand, or with a vector model (`recraft_v4_1`, `model_type: vector`) and then corrected by hand.
- **Arabic wordmarks and calligraphy** are drawn or licensed, never generated. Models break letters (IG-08). Use the owner's own signature or calligraphy file when one exists.
- Check the mark at 16px (favicon), 32px (navigation), and in one colour.

## 4. Brand board

When image generation is available, generate a brand board (`assets/prompts.md` §2) from the decided system. Use it to judge coherence, not as the source of truth: tokens and SVGs are the truth. Show it to the user with the palette and type specimen built in HTML next to it.

## 5. Proof

Apply the brand to three real surfaces before calling it done:
- the product's main screen;
- one marketing surface;
- one small object (an email, a receipt, a social post).

If a surface fights the system, fix the system, not the surface.

## Reflexes to avoid

- the current AI lanes (see `core/direction.md` §8);
- the category's stock look (every coffee brand in kraft paper and a line-drawn bean);
- the cultural costume (`scripts-lang/arabic.md` §10).

The subject's real world is richer than any of them.
