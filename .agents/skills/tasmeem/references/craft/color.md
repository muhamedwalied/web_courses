# Colour craft

## Work in OKLCH

OKLCH separates lightness (L), chroma (C) and hue (H), so ramps stay perceptually even and contrast is predictable.

```css
:root {
  --brand-h: 32;                                  /* one hue anchors the system */
  --ground:  oklch(0.97 0.008 var(--brand-h));    /* tinted neutral, not pure white */
  --ink:     oklch(0.22 0.02  var(--brand-h));
  --muted:   oklch(0.48 0.02  var(--brand-h));    /* check 4.5:1 on --ground */
  --line:    oklch(0.88 0.01  var(--brand-h));
  --accent:  oklch(0.62 0.17  var(--brand-h));
  --accent-ink: oklch(0.98 0.01 var(--brand-h));  /* text on the accent */
}
```

- **Tint the neutrals** 0.005 to 0.015 chroma toward the brand hue, not toward "warm" or "cool" by habit.
- **Gamut:** high-chroma OKLCH values fall outside sRGB. Keep the accents where `@media (color-gamut: p3)` is not needed, or provide both.
- **Name by role, not by value:** `--ground`, `--ink`, `--accent`, never `--blue-500` in components.

## Tones: themed surfaces

For systems with coloured bands or sections, define each surface as a *tone* that sets all of its foreground roles at once:

```css
[data-tone="accent"] {
  --bg: var(--accent); --fg: var(--accent-ink);
  --muted: color-mix(in oklch, var(--accent-ink) 75%, var(--accent));
  --focus: var(--ink); --line: color-mix(in oklch, var(--accent-ink) 30%, transparent);
}
```

Components then use only `--bg`, `--fg`, `--muted`, `--focus` and `--line`, and they work on every tone. This prevents grey-on-colour (CO-10) and focus rings that vanish on coloured bands.

## Contrast

| What | Minimum (WCAG 2.2) |
|---|---|
| Body text | 4.5:1 |
| Large text (≥ 24px, or ≥ 18.66px bold) | 3:1 |
| Placeholder text | 4.5:1 (it is text) |
| Focus indicator, control borders, meaningful icons | 3:1 against their neighbours |

- **Measure on the rendered background,** including images, gradients and tone surfaces. `tasmeem.mjs contrast "#fg" "#bg"` checks a pair; `render` checks every text node.
- APCA (`Lc`) is a useful second opinion for dark themes and thin type, but WCAG 2.2 remains the compliance bar.
- Never communicate by colour alone. Pair status colour with a word or an icon.

## Strategy recap

Pick restrained, committed, full palette or drenched first (see `core/direction.md` §6), then the colours. A committed or drenched brand surface still needs a restrained product surface for forms and data.

## Dark themes

- Decide dark or light from the scene, not by default (CO-14).
- In a dark theme, raise surfaces with lightness, not with shadows. Lower the chroma of the accents slightly, and avoid pure black grounds (CO-09).
- Set `color-scheme: dark` and `<meta name="theme-color">`, and theme the native controls.
- Every theme passes the gate independently (SY-06).
