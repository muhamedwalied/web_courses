# Typography tells (`TY-`)

Script-specific typography (letter-spacing on Arabic, Persian ZWNJ, Arabic-script line height…) lives in [scripts.md](scripts.md). The tells below apply to Arabic, Persian and English unless an entry says otherwise.

### TY-01 · One overused family for everything · P1 · scan render
Inter, Roboto, Arial, Helvetica, Open Sans or the system stack for every role on the page; Geist untouched on a Next.js site.
**Why:** the default font makes unrelated products look identical.
**Fix:** a display face with character, used with restraint, and a body face that complements it on a contrast axis. For non-Latin scripts, choose the script's face first (see `scripts-lang/`).
**Allowed:** a neutral brief (public sector, dense tools) that states why neutrality serves the reader.
**Sources:** IM GS AD HM FD TS

### TY-02 · The "tasteful free font" cluster · P1 · scan
Fraunces, Instrument Serif, Playfair Display italics, Space Grotesk, DM Sans, Manrope and Plus Jakarta: the second wave of defaults.
**Why:** these escaped Inter and became the next default.
**Fix:** choose from the subject's world and the script's own tradition. If one of these truly fits, write down why.
**Sources:** AD TS FD

### TY-03 · Italic display headlines · P1 · scan
An italic serif headline, or one italic serif word inside a sans headline.
**Why:** it is the most repeated "editorial" move of generated pages.
**Fix:** keep display type upright. Emphasise with weight, size or position. Italic belongs to running text.
**Allowed:** a typeface whose italic is its identity (a documented brand choice). It is never allowed on scripts without an italic tradition (SC-02).
**Sources:** IM HM AD GS TS

### TY-04 · One accented word in the headline · P1 · scan
A single headline word coloured, highlighted, underlined or set in another family.
**Why:** it appears on most generated heroes, whatever the product.
**Fix:** let the whole line carry the message. If one word matters most, restructure the sentence so that word ends it.
**Allowed:** a device the brand uses consistently and documents, such as a name set in the brand colour on every page.
**Sources:** AD GS

### TY-05 · Eyebrow above every heading · P1 · scan render
Small, tracked, uppercase kickers ("ABOUT", "FEATURES", "PROCESS") above each section title.
**Why:** it is the scaffold of generated landing pages.
**Fix:** delete them. If a label carries real information (a date, a category), set it in the reading flow, not as a kicker.
**Allowed:** one kicker used as a named brand device.
**Sources:** IM GS AD HM FD

### TY-06 · Pill badge above the H1 · P1 · scan
"New · v2.0", "Now in beta", "Backed by…" chips sitting above the main headline.
**Why:** the badge repeats the headline and lands in the same spot on every generated page.
**Fix:** remove it, or move real news into the body with a date.
**Sources:** IM AD AS GS

### TY-07 · Flat hierarchy · P2 · render eye
One family, one weight, and sizes within 1.2× of each other.
**Fix:** a real type scale (ratio at least 1.25 at the top end), distinct weights for each role, and more space around headings than inside them.
**Sources:** IM AD

### TY-08 · Hero headline filling the screen · P2 · render
A display headline so large that it fills the first viewport, or a `clamp()` maximum above about 6rem.
**Fix:** cap the display size at roughly 6rem. If the line is long, shorten the copy before shrinking the type.
**Allowed:** a poster-like brand where the name is the image, with the rest of the first screen still readable.
**Sources:** IM

### TY-09 · Crushed tracking · P1 · scan
`letter-spacing` tighter than −0.04em on display type, so that letters touch.
**Fix:** −0.02em to −0.03em is the floor for Latin display. Scripts that join or stack must never be tracked (SC-01).
**Sources:** IM GS

### TY-10 · Wide tracking on body text · P1 · scan
Letter-spacing above about 0.05em on paragraphs.
**Fix:** use `0` for body text. Tracking belongs to short Latin caps labels only.
**Sources:** IM GS

### TY-11 · All-caps paragraphs · P1 · scan
Uppercase applied to sentences or paragraphs.
**Fix:** use sentence case. Caps are for short labels in scripts that have case.
**Sources:** IM GS

### TY-12 · Tight line height · P0 · render
Body `line-height` below 1.4 for English, or below the Arabic-script floor (Arabic and Persian 1.6, Nastaliq 2.2).
**Fix:** set line height per script with `:lang()` selectors (see `scripts-lang/`).
**Sources:** IM GS AF T

### TY-13 · Tiny text · P1 · render
Body text below 16px on phones, or controls and navigation below 13px.
**Fix:** 16px minimum for body text, 14px minimum for UI text. Arabic and Persian need one step larger than English at the same role.
**Sources:** IM GS T

### TY-14 · Monospace chrome · P1 · scan
Monospace used for body text, or all-caps mono labels on every element.
**Why:** it is the "technical" costume of generated pages.
**Fix:** reserve mono for code, data and identifiers.
**Allowed:** a developer brand that documents it.
**Sources:** GS AD FD

### TY-15 · Line length out of range · P1 · render
Paragraph lines longer than about 75 characters (Latin), or measures that ignore the script (Arabic and Persian read comfortably at 50 to 70 characters).
**Fix:** a `max-inline-size` in `ch`, or per-script measures.
**Sources:** IM T

### TY-16 · Justified text without support · P2 · scan
`text-align: justify` on Latin without `hyphens: auto`, or on Arabic where the browser cannot stretch with kashida, leaving rivers of space.
**Fix:** use start alignment. Justify only where the script and the renderer support it well.
**Sources:** IM GS T

### TY-17 · Font declared, never shipped · P1 · scan render
A family named in CSS but never loaded, so a fallback font ships.
**Fix:** load it (`@font-face` or the framework's font loader), subset it for the scripts in use, and verify it with `document.fonts`.
**Sources:** AD T

### TY-18 · Typing-machine punctuation · P2 · scan
Straight quotes, `...` instead of `…`, `--` instead of a dash, and the wrong quote style for the language: Arabic and Persian use «», English uses curly quotes.
**Fix:** use the language's own punctuation (see `scripts-lang/punctuation.md`).
**Sources:** HM WG T

### TY-19 · Widows and ragged headings · P2 · scan
A headline breaking with one word on its last line.
**Fix:** `text-wrap: balance` on headings and `text-wrap: pretty` on paragraphs, or restructure the copy.
**Sources:** GS WG IM

### TY-20 · Proportional figures in data · P2 · scan
Prices, tables and counters without tabular figures, so digits jitter as values change.
**Fix:** `font-variant-numeric: tabular-nums` where numbers align or update.
**Sources:** HM MF WG

### TY-21 · Cap collision · P2 · render
All-caps display type with `line-height` below 1, so wrapped lines touch.
**Fix:** a line height of at least 1.0 for caps display, 1.1 for mixed case. For scripts with tall marks, use the script's floor.
**Sources:** HM

### TY-22 · Headlines that overflow · P1 · render
Long words at display sizes that overflow on phones and tablets.
**Fix:** `overflow-wrap: anywhere; min-width: 0` on display headings, a smaller `clamp()` minimum, or shorter copy.
**Sources:** HM IM

### TY-24 · Display face at text size · P1 · scan render
A face drawn for display (Kufam, Reem Kufi, Lemonada, Aref Ruqaa, Rakkas, anything named "Display") used for labels, buttons, navigation or small text, below about 20px.
**Why:** display faces trade letter distinctions for character. At text size those distinctions vanish: in Kufam, the dot of a final ن drops out, so «العنوان» reads as «العنوار». Found in tasmeem's own eval of an Arabic roastery page.
**Fix:** display faces at 24px and up. Labels, buttons, navigation and prices use the UI or body face.
**Sources:** T

### TY-23 · Hollow, underlined or synthetic text · P2 · scan
Outlined (hollow) headlines, underlines on things that are not links, and faux bold or italic synthesised by the browser.
**Fix:** solid text; underline links only; `font-synthesis: none` with the real weights loaded.
**Sources:** GS T
