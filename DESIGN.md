# DESIGN.md: مسارات CAT Reloaded (cat-roadmaps)

The design system of record for the courses site. Every page is built from it; tasmeem audits against it (findings matching «Brand exceptions» below are reported as exceptions, not defects).

## Direction

- **Design read:** a dark, technical study companion (web) for CAT Reloaded community learners, in Arabic (RTL) with English technical nouns inline.
- **Scene:**深夜 desk, terminal-and-blueprint mood, quiet surfaces, one cyan signal colour.
- **Subject world:** roadmaps, levels, modules, topics, playlists, resources, progress, circles, GitHub, Pagefind search, prerendered pages.
- **Dials:** variance low · motion low · density medium.
- **Signature:** the gradient-clipped phrase inside the home hero headline (accent→accent-2, RTL gradient direction); everything else stays quiet.
- **Not this:** no purple-to-blue marketing gradients, no glass dashboards, no three-icon-card rows, no invented metrics.

## Colour

Strategy: restrained — near-black ground (#0a0e14), one cyan accent (#22d3ee), one violet secondary (#a78bfa), semantic surfaces only.

| Token | Value | Role |
|---|---|---|
| `--color-bg` | #0a0e14 | page ground |
| `--color-surface` | (css) | inset surfaces (code, table heads) |
| `--color-panel` | #141c28 | raised panels (cards, sidebar) |
| `--color-edge` | #202b3b | hairlines, borders |
| `--color-ink` | #e6edf3 | primary text |
| `--color-muted` | #8b98a9 | secondary text |
| `--color-accent` | #22d3ee | one accent (CTA, focus ring, links) |
| `--color-accent-2` | #a78bfa | secondary accent (checkmarks, small highlights) |

Contrast pairs verified by the palette (ink on bg ≈ 15:1, muted on bg ≈ 7:1, bg on accent ≈ 13:1).

## Type

| Role | Script | Family | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| display/body | Arabic | Noto Sans Arabic | 400–700 | ≥ 1.6 body, ≥ 1.7 prose | **0 — never tracked** |
| mono labels | Latin | JetBrains Mono | 400–700 | any | `tracking-wide/widest` allowed on pure-Latin lockups only (`circles roadmaps`, `CAT RELOADED · CIRCLES ROADMAPS`) |

Arabic text is never letter-spaced, italicised or case-transformed (SC-01/SC-02).

## Layout

Container `max-w-7xl px-4 sm:px-6`; grid `gap-8` on the watch page; watch sidebar 20rem docked right (dvh-based); radius scale rounded-lg/2xl; z-scale: header 40, drawer 50, YT patch/bar 20.

## Components

Circle card, intro grid (article + sticky box), levels accordion, watch player (facade → plain YouTube iframe), content drawer, search modal (Pagefind). States: hover everywhere, focus-visible global, aria-disabled for edge nav.

## Motion

One page-enter fade (0.4s ease, `translateY(6px)`, `prefers-reduced-motion` honoured); progress bars animate `width` only with `transition-[width]`; no bounce, no layout animation.

## Voice

Egyptian colloquial Arabic for UI copy («اشغل», «انسخ اللينك»); upstream English titles/names are owner content — typeset verbatim, never rewritten; digits follow the source text as-is.

## Brand exceptions

Deliberate matches to tasmeem catalog tells — report as exceptions, not findings:

- CO-05: the gradient-clipped phrase is the home hero signature — exactly one instance site-wide, accent→accent-2 clip in the RTL linear direction.
- TY-04: the same hero phrase carries the one accented colour span; no other heading uses an accented word.
- CO-07: two fixed ambient radial radials on the body ground at 7%/6% — depth cue for the technical-dark aesthetic, far below ornament strength.
- CM-03: backdrop-blur on the sticky header only — functional legibility while content scrolls under it, not decorative glass (graph node cards may shed theirs over time).
- SC-05: physical properties inside @xyflow/react's own CSS (handles, controls) — third-party internals, outside this repo's control without a fork.
- CO-16: raw colour literals in CirclesGraph are data-driven per circle (circle.color from content JSON) — data tokens, not token escapes.
- IG-11: Astro generator meta kept — honest statement of the stack.
- SC-01: tracking-wide/widest on two PURE-LATIN mono lockups only (`circles roadmaps`, `CAT RELOADED · CIRCLES ROADMAPS`) — Latin display tracking is legitimate typography; Arabic text is never tracked anywhere.
- CP-10: literal `→` separators inside owner-supplied `tagline` strings (e.g. «Phase 1 → Core Engineering → …») rendered verbatim from content JSON — owner words are typeset, never rewritten; our own composed UI uses RTL-correct separators (CircleIntro renders ←).
- CP-02: upstream course titles (e.g. "The Ultimate React Course") are owner content — typeset verbatim.
- CP-05: em/standalone dashes inside owner titles and resource names are content, not interface copy.
- CP-09: scanner's "oops" match lands inside the English word **lo**ops in an owner course description — substring false positive, no apologetic copy exists.
- SY-04: z-index 1001 on the connection line lives inside @xyflow/react's own CSS — third-party internals, outside this repo's control without a fork.
- **SC-01 (tracking-wide/widest on two pure-Latin mono lockups):** letter-spacing on Latin display/mono is legitimate typography; the no-tracking rule is enforced on all Arabic text (and there is none on it).
- **CP-02/CP-05 inside content:** upstream course titles and their dash conventions are owner content — typeset, not rewritten.
