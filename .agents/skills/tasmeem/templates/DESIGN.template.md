# DESIGN.md: ‹product name›

The design system of record. Every page is built from it; tasmeem audits against it.

## Direction

- **Design read:** Reading this as ‹surface› for ‹audience›, in ‹language/script›, with a ‹register› voice, leaning toward ‹direction›.
- **Scene:** ‹who, where, light, mood›
- **Subject world:** ‹eight or more concrete nouns›
- **Dials:** variance ‹n› · motion ‹n› · density ‹n›
- **Signature:** ‹the one element this product is remembered by›
- **Not this:** ‹anti-references and the lanes this deliberately avoids›

## Colour

Strategy: ‹restrained | committed | full palette | drenched›

| Token | Value (OKLCH) | Role | Contrast pairs |
|---|---|---|---|
| `--ground` | | page ground | ink on ground ‹ratio› |
| `--ink` | | body text | |
| `--muted` | | secondary text | ‹ratio› on ground |
| `--accent` | | one accent | accent-ink on accent ‹ratio› |

Tones (coloured surfaces): ‹name → bg, fg, muted, focus, line›

## Type

| Role | Script | Family | Size (clamp) | Weight | Line height | Tracking |
|---|---|---|---|---|---|---|
| display | Arabic | | | | ≥ 1.25 | 0 |
| body | Arabic | | | 400 | ≥ 1.6 | 0 |
| display | Latin | | | | | |
| body | Latin | | | 400 | | 0 |

Loading: ‹subsets, preloads, fallback metrics›

## Layout

Spacing scale, gutter, measure, breakpoints, z-index scale.

## Components

For each: purpose, variants, the eight states, tokens used.

## Motion

Tokens (durations, curves, stagger), the signature motion, reduced-motion behaviour.

## Imagery and assets

Medium, light, subjects, what is never shown; the plates list with provenance; the marks (SVG).

## Voice

Register, address form, verbs for actions, words used and never used; plural and number policy.

## Brand exceptions

Decisions that deliberately match a tell in tasmeem's catalog. tasmeem reports them as exceptions, not findings.

- CO-03: ‹why the ground is this colour›
