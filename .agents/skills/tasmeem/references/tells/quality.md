# Quality tells (`QA-`)

These are failures, not matters of taste. No brand exception applies.

### QA-01 · Low contrast · P0 · render
Text below 4.5:1 against its actual background (3:1 for text 24px and up, or 18.66px bold and up); placeholders below 4.5:1; focus indicators and control borders below 3:1.
**Fix:** move toward the ink end of the ramp. Measure against the rendered background, including images and gradients under the text.
**Sources:** all

### QA-02 · No visible focus · P0 · scan render
`outline: none` without a `:focus-visible` replacement; focus rings hidden by overflow or covered by sticky layers.
**Sources:** WG UI HM

### QA-03 · Broken heading outline · P1 · render
No `<h1>`, several `<h1>`s, or skipped levels.
**Sources:** IM WG

### QA-04 · Missing language and direction · P0 · built
`<html>` without `lang`; RTL content without `dir="rtl"`; mixed-language passages without their own `lang`.
**Why:** `lang` drives font fallback, hyphenation, screen-reader voice and quote style.
**Sources:** GS AF T

### QA-05 · Small targets · P1 · render
Tap targets below 44×44 px, or adjacent targets with less than 8px between them.
**Sources:** HM UI T

### QA-06 · Zoom disabled · P0 · scan
`user-scalable=no` or `maximum-scale=1` in the viewport meta tag.
**Sources:** WG

### QA-07 · Script errors · P0 · render
Uncaught errors or failed resources on load.
**Sources:** IM

### QA-08 · Unlabelled fields · P0 · scan render
Inputs without a `<label>` or accessible name; placeholder used as the label; errors not tied to the field (`aria-describedby`) and not announced.
**Sources:** WG UI AS

### QA-09 · Wrong elements for actions · P1 · scan
Clickable `div`/`span`; `<a>` without `href` used as a button; buttons that navigate.
**Sources:** WG

### QA-10 · Hard-coded formats · P1 · scan
Dates, numbers and currency built by string concatenation instead of `Intl.DateTimeFormat`, `Intl.NumberFormat` and `Intl.PluralRules`.
**Sources:** WG AF

### QA-11 · Unnamed icon buttons · P0 · render
Icon-only buttons and links without an accessible name.
**Sources:** WG UI

### QA-12 · No skip link · P2 · built
**Sources:** WG

### QA-13 · Slow first paint · P1 · render
- a lazy-loaded LCP image;
- unpreloaded critical fonts;
- `font-display` missing;
- layout shift from late fonts (use `size-adjust` fallbacks);
- render-blocking third parties.
**Sources:** WG HM T

### QA-14 · Theme metadata mismatch · P2 · built
`color-scheme` not declared; `<meta name="theme-color">` not matching the ground; native controls unreadable in dark mode.
**Sources:** WG

### QA-15 · Hostile forms · P1 · scan
- blocked paste;
- missing `autocomplete`, `type` or `inputmode`;
- spellcheck on codes and emails;
- submit disabled before the request starts;
- no guard for unsaved changes.
**Sources:** WG

### QA-16 · Motion safety · P0 · render
Flashing more than three times a second; parallax or large movement with no reduced-motion path (see MO-05).
**Sources:** WG T
