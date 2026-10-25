# Arabic (ar), the first-class script

Read this whenever a page contains Arabic, whatever the page's main language. Persian shares the script and adds its own rules (see [persian.md](persian.md)). Bidirectional mechanics are covered in [bidi.md](bidi.md), numbers and dates in [numerals-dates.md](numerals-dates.md).

## 1. Declare the language and direction

```html
<html lang="ar" dir="rtl">
```

- `lang` is not decoration. It selects the font fallback, the screen-reader voice, the quote style, hyphenation, and the `:lang(ar)` rules below. Mark every passage in another language: `<span lang="en" dir="ltr">`.
- Scope every script rule with `:lang(ar)` (and `fa`, `ur`), so that the Latin rules in the same stylesheet do not leak into Arabic, and the reverse.

## 2. Choose the typeface first

Arabic type comes in styles with different jobs. Pick the style for the role, then the family.

| Style | Job | Never use it for |
|---|---|---|
| **Naskh** | reading: body, long text, forms | nothing; it is the safe base |
| **Kufi (geometric)** | interface, display, short labels, signage | long reading at small sizes |
| **Ruqaa** | informal display, handwritten warmth | body, UI |
| **Thuluth / Diwani** | ceremonial display, one word | anything that must be read quickly |
| **Nastaliq** | Persian poetry and literary display | Arabic-language UI, body text |

**Families that work (open licences, on Google Fonts, all including Latin):**

| Role | Family | Notes |
|---|---|---|
| UI sans | IBM Plex Sans Arabic | pairs with IBM Plex Sans and Serif; 7 weights |
| UI sans | Noto Sans Arabic / Noto Kufi Arabic | the widest coverage; pairs with Noto Sans |
| UI sans, bilingual | Readex Pro, Alexandria, Rubik | Arabic and Latin designed together |
| UI sans | Tajawal, Cairo, Almarai, Mada, Changa | popular in the Gulf; check the weights you need |
| Persian-first sans | Vazirmatn | also strong for Arabic UI |
| Reading Naskh | Noto Naskh Arabic, Scheherazade New, Markazi Text | Scheherazade places marks best; Markazi reads like a book face |
| Classical Naskh | Amiri | book and literary feel, marks included |
| Display | Reem Kufi, El Messiri, Lemonada, Qahiri, Kufam, Aref Ruqaa | display only |

**Commercial and regional families** (29LT, TypeTogether's Greta Arabic, Thmanyah's families, the Dubai font…): use them only with a licence that covers web embedding, and check the weights and the Latin partner.

**Rules.**
- **Arabic appears smaller.** At the same `font-size`, many Arabic faces look 10 to 20% smaller than their Latin partner. Measure, then fix with `size-adjust` in the Arabic `@font-face`, or with a `:lang(ar)` size step. Never guess.
- **Weights under 400 break down** at interface sizes, because the thin strokes disappear. Keep 400 to 700 for UI and body text.
- **Display faces stay large.** Geometric Kufi display faces simplify or drop dots at small sizes: in Kufam, a final ن at 16px reads as ر. Use display faces at 24px and up, and set labels, buttons, navigation and prices in the UI or body face (TY-24).
- **Load the Arabic subset.** Use `unicode-range` for U+0600–06FF, U+0750–077F, U+08A0–08FF and U+FB50–FDFF, U+FE70–FEFF, and preload only the body weight.
- **Check real coverage** of what you set: Arabic-Indic digits, «٪», «ﷺ» (U+FDFA), and the Saudi riyal sign (U+20C1, encoded in 2025; many fonts still lack it, so fall back to «ر.س» or an SVG).

## 3. Size, line height and measure

| Role | Size | Line height |
|---|---|---|
| Body (reading) | 17 to 20px | 1.7 to 1.9 |
| Body (UI) | 16 to 17px minimum | 1.6 |
| Headings | scale ratio ≥ 1.25 | 1.25 to 1.4 |
| Single-line controls | ≥ 16px | ≥ 1.5, or padding-driven height |

- Measure: 50 to 70 characters per line for reading.
- Marks and descenders need space. Never clamp Arabic lines with `line-height: 1` or fixed control heights (SC-15).
- `text-wrap: balance` works for Arabic headings; `text-wrap: pretty` for paragraphs.

## 4. Never do this to Arabic

| Never | Because | Instead |
|---|---|---|
| `letter-spacing` of any value | it tears the joins (SC-01) | weight, size, colour |
| `font-style: italic` | Arabic has no italic; the browser slants it (SC-02) | weight or colour |
| `text-transform` | the script has no case (SC-08) | nothing |
| faux bold | the strokes smear | load real weights; `font-synthesis: none` |
| tatweel stretching (ـــ) | it breaks search and screen readers (SC-16) | the font's justification alternates, or nothing |
| `text-align: justify` on UI text | rivers of space without kashida support | `start` |
| generated images containing Arabic text | image models break letters (IG-08) | text in HTML or SVG |

Put this reset at the base of every multilingual stylesheet:

```css
:is(:lang(ar), :lang(fa)) {
  letter-spacing: 0;
  font-style: normal;
  text-transform: none;
  font-synthesis: none;
}
```

## 5. Emphasis and decoration

- Emphasis comes from weight, colour and size. For underlines, use `text-underline-offset: 0.35em` and `text-decoration-skip-ink: auto`, so the line clears the descenders.
- **Tashkeel (diacritics)** only where a reader could misread a word, and on names; never scattered for ornament. Check that the font positions the marks and that the line height leaves them room.
- **Numbers inside headings** follow the product's digit policy (see numerals-dates.md).

## 6. Punctuation and typesetting

- Use Arabic punctuation: «،» comma, «؛» semicolon, «؟» question mark, «» quotes. The full stop is shared.
- No space before punctuation. When a closing mark must follow a space (for example after a Latin token), make that space a no-break space (U+00A0), so the mark never starts a line.
- Add a space after «،» and «؛» when source text glues them to the next word.
- In RTL, the browser mirrors parentheses and brackets automatically. Never type them reversed.
- Percent: follow the locale: «٪» with Arabic-Indic digits, `%` with Western digits.
- **Sacred text** (Qur'an, hadith, the shahada): never generate, paraphrase or restyle it. Use verified sources and a Qur'anic font (such as Amiri Quran), and keep it out of image generation entirely.

## 7. Direction and layout

- Use logical properties everywhere (`margin-inline-start`, `padding-inline`, `inset-inline-end`, `border-inline-start`, `text-align: start`). Flexbox and grid follow `dir` automatically.
- **Directional things follow the reading direction:**
  - progress bars and sliders fill from the right;
  - carousels start at the right and "next" moves left;
  - breadcrumbs run right to left;
  - drawers for navigation open from the right.
- **Transforms do not mirror.** `translateX(8px)` moves right in both directions. For a "forward" nudge:
  ```css
  .forward:hover { translate: calc(var(--dir, 1) * -4px) 0; }
  :dir(ltr) { --dir: -1; }
  ```
  (Or write the RTL value explicitly under `:dir(rtl)`.)
- **Mirror icons by meaning** (SC-06):
  - mirror arrows, chevrons, back and forward, send, reply, undo and redo, and indent;
  - never mirror clocks, play, checkmarks, logos, or icons containing letters or digits.
- **Tables:** in RTL, text columns align start (right). Numeric columns may align end for comparison; decide once.
- **Charts:** decide whether time runs right to left (natural for Arabic readers) or left to right (convention in finance), then document it. Never reverse an axis without reversing its data.

## 8. Forms

- Labels sit at the start (the right) and errors under the field, in Arabic.
- **LTR islands:** email, URL, phone, code and password inputs get `dir="ltr"`. Keep each input's icon or toggle inside the same direction context; otherwise logical properties resolve to opposite sides.
- Accept Arabic-Indic digits in every numeric input, and normalise both ranges (U+0660–0669 and U+06F0–06F9) before validation.
- Names: one "full name" field, unless the service truly needs parts. Addresses follow the country: in Saudi Arabia, the national address (building number, street, district, city, postal code, additional number) replaces "state/ZIP".
- Phone: accept `05xxxxxxxx`, `+9665…` and `009665…`. Test both pasting and typing character by character.

## 9. Voice and copy

- **Register.**
  - Choose Modern Standard Arabic, or a named dialect, per product, and write it down in `PRODUCT.md`.
  - Never mix registers in one sentence.
  - Gulf products often use light MSA with local warmth; keep the interface verbs in MSA.
- **Verbs.**
  - Direct imperatives: «احفظ»، «أرسل»، «احجز».
  - Or the masdar convention: «حفظ»، «إرسال».
  - Pick one convention for buttons and keep it everywhere.
- **Gender.**
  - Decide the address strategy once. Either the conventional masculine generic, or neutral constructions («تسجيل الدخول», «أهلاً»); only use both forms where the product serves a known audience.
  - Keep agreement consistent: «كلمة المرور مطلوبة» / «رقم الهاتف مطلوب».
- **Number and noun agreement.** Arabic has six plural categories: `zero`, `one`, `two`, `few` (3 to 10), `many` (11 to 99) and `other`. Use `Intl.PluralRules('ar')` and write every form:
  - «ملف واحد»
  - «ملفان»
  - «3 ملفات»
  - «11 ملفاً»
  - «100 ملف»
- **Calques to avoid** (CP-15):
  - «قم بـ» plus a masdar;
  - «يتم» plus a masdar;
  - «يلعب دوراً»;
  - «في نهاية اليوم»;
  - «على نفس الصفحة»;
  - «هل أنت مستعد لـ…؟».
- **Machine-copy tells** (CP-02, CP-03):
  - «في عالمٍ يتسارع…»;
  - «ليس مجرد… بل…»;
  - «حلول مبتكرة»;
  - «تجربة استثنائية»;
  - «نقلة نوعية»;
  - «بكل سهولة ويسر»;
  - «رحلة» for anything that is not a journey;
  - stacked «بالإضافة إلى ذلك / علاوة على ذلك»;
  - emoji bullets.
- **Spelling:** check hamza (إنشاء not انشاء), taa marbuta and alif maqsura. A spelling error in a heading reads as carelessness, not as a machine, but it is fixed the same way.

## 10. The "Arabic" category reflex

When the brief says "Arabic brand" or "Saudi product", generated design reaches for:
- lanterns, domes and crescents;
- eight-point stars, arabesque tiling, geometric lattices;
- gold on navy, the "Ramadan" look;
- dunes and camels.

This is the Arabic version of cream-and-serif. It is a costume, not an identity.

- Build from the subject's real world instead: the product, its city, its materials, its people, its trade. A roastery in Riyadh has beans, roast colours, packaging, a neighbourhood. A law firm has paper, seals, a street.
- Traditional pattern is **allowed** when it is the subject (a craft brand, a heritage institution) and is drawn with care from a real source, not taken from a stock pattern pack.
- The same reflex exists for every culture (Persian design has its own, see persian.md). The same fix applies.

## 11. Images and calligraphy

- Never let an image model write Arabic: it breaks joins, drops dots and invents letters. Generate text-free images and set the words in code.
- **Logos and calligraphic marks are vector** (SVG), drawn or licensed, never generated or upscaled.
- **If a product mockup must show Arabic** (packaging, a book cover), generate the object without text and composite the vector text; or compare every text crop letter by letter against the source string. Treat «ص», «ض», «ء» and dotted letters as high-risk.
- Upscalers alter glyphs: never upscale an image that contains Arabic text.

## 12. Checklist

- [ ] `<html lang="ar" dir="rtl">`; every foreign passage has its own `lang` and `dir`.
- [ ] One Arabic family per role, loaded with its Arabic subset; the fallback stack tested; no tofu.
- [ ] Arabic size and weight balanced against the Latin partner (measured).
- [ ] Line height ≥ 1.6 for body text; nothing clipped in controls.
- [ ] No letter-spacing, italic, text-transform or faux bold on Arabic (the reset is in place).
- [ ] Logical properties only; the directional icons mirrored and the others not.
- [ ] One digit policy; inputs normalised; `Intl` with explicit `numberingSystem` and `calendar`.
- [ ] Arabic punctuation; LTR tokens isolated; no reversed brackets.
- [ ] Plurals through `Intl.PluralRules('ar')` with all six forms.
- [ ] Copy free of calques and machine-copy tells; register consistent.
- [ ] No generated Arabic text in images; logos in vector.
