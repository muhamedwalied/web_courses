# English and the Latin script

Most design advice was written for English. What is still easy to miss:

- **Coverage.** "Supports Latin" often means Basic Latin only. If the product shows names or places from other languages, check the accents (é, ñ, ü, ç) in every weight you load.
- **Case.** `text-transform: uppercase` is for short labels only (TY-11). Set `lang="en"` so the transforms and hyphenation follow English rules.
- **Hyphenation.** `hyphens: auto` needs `lang`. Use it in narrow columns and with justified text (TY-16).
- **Tracking:**
  - caps labels take +0.04 to +0.08em;
  - lower-case body text takes none;
  - display type goes no tighter than −0.03em (TY-09, TY-10).
- **Line height:** 1.45 to 1.6 for body text, 1.05 to 1.2 for display. Line length 60 to 75 characters (TY-15).
- **Punctuation:**
  - curly quotes “ ” (US) or ‘ ’ (UK);
  - an en dash for ranges;
  - the ellipsis character «…»;
  - no dash sprinkle in interface copy (CP-05). See `punctuation.md`.
- **Numbers:** tabular figures in tables and prices (TY-20). Use `Intl.NumberFormat('en-US' | 'en-GB')` for separators and currency.
- **Case style of headings and buttons:** sentence case by default, unless the brand's style guide says otherwise (CP-11).
- **Next to Arabic or Persian:** the Latin partner face must match the Arabic face in x-height and colour (SC-11). In a bilingual page, English passages carry `lang="en" dir="ltr"`.
- **Reflexes to avoid:** the whole AI default set in `tells/`: Inter everywhere, purple gradients, cream and serif.
