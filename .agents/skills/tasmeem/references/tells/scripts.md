# Writing-system tells (`SC-`)

Generated interfaces are built for English text and then filled with Arabic or Persian. These tells catch what breaks when that happens. The language guides are in `references/scripts-lang/` (Arabic, Persian, English). Scope every rule with `:lang()` or the detected script: never apply an English rule to Arabic, or an Arabic rule to English.

IDs are stable. SC-13 and SC-14 covered scripts outside the current scope (CJK line breaking, and Southeast Asian scripts without word spaces) and are retired for now.

### SC-01 · Tracking on Arabic or Persian · P0 · render scan
Any non-zero `letter-spacing` on Arabic-script text, including through inherited rules: a global `h1 { letter-spacing: -0.02em }`, or an uppercase-label style reused on an Arabic label.
**Why:** it tears the joins between letters. Readers see a broken word, not a style.
**Fix:** `:lang(ar), :lang(fa) { letter-spacing: 0 }` at the root of the type system, and no tracking tokens on those roles.
**Sources:** AF T

### SC-02 · Italic where none exists · P1 · render scan
`font-style: italic` or `oblique` on Arabic or Persian text. The browser slants the glyphs artificially.
**Fix:** emphasise with weight, colour or size.
**Sources:** AF HM T

### SC-03 · Line height below the script's floor · P0 · render
Body `line-height` below what the script needs, so marks collide or are clipped:

| Text | Body minimum | Display minimum |
|---|---|---|
| Arabic, Persian (Naskh-style faces) | 1.6 | 1.25 |
| Persian Nastaliq (display, poetry) | 2.2 | 1.6 |
| English | 1.35 | 1.0 |

**Fix:** set the line height per `:lang()`, not one global value.
**Sources:** AF T

### SC-04 · Fallback fonts and missing glyphs · P0/P1 · render
Glyphs drawn by a system fallback because the chosen family lacks them (P1), or tofu boxes, □, for characters no font covers (P0). This is common for Arabic-Indic and Persian digits, the Persian letters پ چ ژ گ, «ﷺ», and the Saudi riyal sign.
**Detect:** in the render check, Chrome DevTools `CSS.getPlatformFontsForNode` names the fonts actually used for each text node.
**Fix:** a family that covers everything shown, with the right `unicode-range` subsets loaded and a tested fallback stack.
**Sources:** AF T

### SC-05 · Missing direction, or physical CSS in RTL · P1 · scan built
An Arabic or Persian page without `dir="rtl"` on `<html>`, or CSS that pins sides physically: `margin-left`, `padding-right`, `left:`, `text-align: left`, `float: right`, `border-left`, `translateX()` for "forward" movement.
**Fix:** logical properties throughout (`margin-inline-start`, `inset-inline-end`, `text-align: start`, `border-inline-start`). For transforms, pair the values with `:dir(rtl)` or a direction variable.
**Allowed:** physical sides that are truly physical: a map pin, a scrollbar gutter, a crop focus point.
**Sources:** AF T

### SC-06 · Direction-blind icons · P1 · scan render
In RTL:
- arrows, chevrons, back and forward, send, reply, undo and redo, and list indentation left unmirrored;
- or icons mirrored that must not be: clocks, media play, checkmarks, logos, anything containing letters or digits.

**Fix:** mirror by meaning with `:dir(rtl) .icon-directional { transform: scaleX(-1) }`. In Arabic and Persian, "next" points left (`←`).
**Sources:** AF T

### SC-07 · Mixed digit systems · P1 · render
Arabic-Indic (٠١٢٣), Persian (۰۱۲۳) and Western (0123) digits mixed in one view: prices in one, dates in another, validation messages in a third.
**Fix:**
- One numbering policy per product, applied through one formatter: `Intl.NumberFormat(locale, { numberingSystem })`, with `latn`, `arab` or `arabext`.
- Normalise both Arabic-Indic ranges (U+0660–0669 and U+06F0–06F9) on input.
**Sources:** AF T

### SC-08 · Case rules on caseless scripts · P2 · scan
`text-transform: uppercase` or `capitalize`, or small-caps styles, on labels that carry Arabic or Persian text.
**Fix:** transforms only through `:lang(en)` rules.
**Sources:** T

### SC-09 · Foreign punctuation and letterforms · P2 · scan render
- **Arabic:** Latin `,` `?` `;` instead of «، ؟ ؛»; English quotes instead of «»; the space before closing punctuation missing a no-break.
- **Persian:** Arabic ي and ك where Persian ی and ک belong; a missing ZWNJ (U+200C) in compounds such as «می‌شود».
- **English:** straight quotes and three dots (TY-18).
**Sources:** T

### SC-10 · Bidi scramble · P1 · render
English tokens inside Arabic or Persian text (phone numbers, emails, URLs, code, product names like "iPhone 17 Pro") left unisolated, so digits, parentheses and punctuation jump to the wrong side. A related defect: `dir="ltr"` put on a block element, which flips its alignment.
**Fix:**
- `<bdi>`, or `unicode-bidi: isolate` on inline spans with `dir="ltr"`;
- `dir="auto"` for user content;
- LTR inputs (email, phone, URL, code) marked `dir="ltr"`, with their adornments in the same direction context.
**Sources:** AF T

### SC-11 · Mismatched script partners · P2 · eye render
English words inside Arabic (or Arabic inside English) that look too big, too small, too light or too heavy, because the two families have different x-heights and colour.
**Fix:** a designed pair, meaning families built together (IBM Plex Sans Arabic with IBM Plex Sans, Vazirmatn with its own Latin, Noto Naskh Arabic with Noto Serif); or `size-adjust` and weight mapping on the partner face.
**Sources:** T

### SC-12 · Synthesised weights · P2 · render
Bold or italic faked by the browser because the Arabic or Persian font ships a single weight.
**Fix:** `font-synthesis: none`, a family with real weights, or hierarchy made with size and colour instead.
**Sources:** T

### SC-15 · Clipped marks · P1 · render
Arabic diacritics (tashkeel) and dots cut off by `overflow: hidden`, `line-clamp`, fixed-height buttons, or `line-height: 1` on single-line controls.
**Fix:** heights from padding plus line height; test with the tallest strings (full tashkeel).
**Sources:** AF T

### SC-16 · Decorative stretching · P2 · scan
Tatweel (ـ, U+0640) typed between letters to stretch a heading, and justification forced on Arabic without kashida support. A tatweel after a prefix before a number or English word («بـ 5») is correct and not flagged.
**Why:** it breaks search, copy and paste, and screen readers.
**Fix:** stretch through the font (OpenType justification alternates), or not at all.
**Sources:** T

### SC-17 · English-length layout · P1 · render
Fixed widths, truncation and one-line labels sized for English. Arabic and Persian words can be much wider at the same character count, and translated labels often run longer.
**Fix:** test with the longest language; let controls grow; prefer wrapping to truncation.
**Sources:** T

### SC-18 · Mirroring blindly · P2 · eye
Photographs, logos, brand marks and media timelines flipped for RTL; charts whose time axis was reversed without reversing the data.
**Fix:** mirror layout and direction-bearing icons only. Decide the chart direction on purpose and document it.
**Sources:** AF T

### SC-19 · Locale assumptions · P2 · eye
- the calendar not pinned: some engines resolve `ar-SA` to Hijri, others to Gregorian, and Persian needs `persian`;
- the week starting on Sunday where it starts on Saturday;
- name and address forms that assume "first name, last name, state, ZIP";
- phone fields that reject local formats.
**Fix:** `Intl` with explicit `calendar` and `numberingSystem`, and a form structure that fits the locale (see `scripts-lang/numerals-dates.md`).
**Sources:** AF T
