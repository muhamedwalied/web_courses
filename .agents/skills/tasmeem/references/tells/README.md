# The tells catalog

A *tell* is a visible habit that makes an interface read as generated rather than designed. The catalog merges the tells that twelve independent sources agree on, and adds a family none of them covers: tells that come from ignoring the writing system (`SC-`).

Read only the category files you need:

| File | IDs | What it covers |
|---|---|---|
| [color.md](color.md) | `CO-` | palettes, gradients, glow, contrast, tokens |
| [type.md](type.md) | `TY-` | families, hierarchy, tracking, line height, punctuation |
| [layout.md](layout.md) | `LA-` | page templates, section order, spacing, overflow |
| [components.md](components.md) | `CM-` | cards, chrome, states, buttons, data visuals |
| [motion.md](motion.md) | `MO-` | entrances, easing, duration, reduced motion |
| [copy.md](copy.md) | `CP-` | interface words, invented claims, per-language copy tells |
| [imagery.md](imagery.md) | `IG-` | stock looks, placeholders, generated-image defects |
| [system.md](system.md) | `SY-` | drift from the design system, sameness |
| [quality.md](quality.md) | `QA-` | accessibility and engineering failures |
| [scripts.md](scripts.md) | `SC-` | writing-system tells: Arabic, Persian, and English next to them |

## Entry format

```
### CO-01 · Purple-to-blue gradient · P0 · scan render
What it looks like, in one or two sentences.
**Why:** why it reads as generated.
**Fix:** the concrete move.
**Allowed:** when it is not a tell (brand-owned, genre, function).
**Sources:** the sources that flag it (see below).
```

**Severity.**
- **P0: ships as slop, or is broken.** It must be fixed before delivery.
- **P1: reads as generated.** Fix it, unless it is **Allowed** with evidence.
- **P2: taste or polish.** Fix it when you touch the area.

**Detection channels** (the scanner reports the same IDs):
- `scan`: the source files (CSS, SCSS, JSX/TSX, HTML, Vue, Svelte, Astro).
- `built`: the built HTML with its stylesheets inlined.
- `render`: a real browser, reading computed styles, geometry and console, at 360, 768, 1024 and 1440 px.
- `eye`: judgment from screenshots. The report must label these as judgment, not measurement.

**Consensus.** The more sources that flag a tell, the stronger the evidence that it reads as generated. A tell flagged by one source only is marked `(single)` and is never P0 unless it is an accessibility failure.

**Source keys.**
- `IM`: impeccable (Paul Bakaus)
- `HM`: Hallmark (Together AI)
- `GS`: Gesso anti-slop
- `AD`: avoid-ai-design
- `AS`: antislop
- `TS`: taste-skill (Leonxlnx)
- `FD`: Anthropic frontend-design
- `EK`: Emil Kowalski's skills
- `MF`: make-interfaces-feel-better
- `WG`: Vercel Web Interface Guidelines
- `UI`: ibelick ui-skills
- `AF`: designing-arabic-frontends
- `T`: tasmeem's own addition

## Brand exceptions

A tell is **Allowed** when the project's own `DESIGN.md` or `PRODUCT.md` names the choice. For example, a brand whose documented palette is sand and aubergine is not showing CO-03 "cream by default": it is using its own colour. Record every exception in the report with the line of `DESIGN.md` that grants it.

Exceptions never cover:
- accessibility (`QA-`);
- honesty (CP-07, CP-08);
- writing-system correctness (`SC-01` to `SC-10`).

A brand cannot make low contrast, invented numbers or letter-spaced Arabic acceptable.

## What not to over-flag

- **Popularity alone.** A popular font chosen and set with care is a decision, not a tell. Flag a font only when it is the unexamined default for the whole page.
- **One instance.** One gradient, one em dash, one centred section is not a pattern. Flag a pattern when it repeats, or when it defines the first screen.
- **Genre conventions.** A newspaper uses rules and columns; a trading desk is dense; a children's app is rounded. Judge against the genre, not against a neutral landing page.
- **The author's words.** Copy tells apply to interface text the agent wrote. Content the owner supplied (an author's prose, a poem, a quote) is never rewritten to satisfy a rule.
