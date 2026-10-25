# Persian (fa)

Everything in [arabic.md](arabic.md) applies: direction, no tracking, no italics, no case, bidi, logical CSS, images without text. These are the Persian differences.

## Letters and spacing

- **Persian letters:** ی (U+06CC) and ک (U+06A9), never Arabic ي (U+064A) and ك (U+0643). Mixed forms break search and look wrong to readers. Normalise all input and content:
  ```js
  const toPersian = (s) => s.replace(/ي/g, 'ی').replace(/ك/g, 'ک')
  ```
- **ZWNJ (نیم‌فاصله, U+200C)** joins prefixes and suffixes without connecting the letters: «می‌شود»، «کتاب‌ها»، «خانه‌ای». A normal space, or none at all, is a spelling error. Check that editors, CMSs and copy pipelines keep U+200C. Never strip it as "invisible whitespace".
- The letters پ چ ژ گ must exist in the chosen font. Check them before choosing it.

## Type

- **Families (open licences):** Vazirmatn (Persian-first, UI and body), Noto Naskh Arabic and Noto Sans Arabic (Persian forms included), Sahel and Shabnam (UI), Estedad and Parastoo (display).
- **Commercial:** the Iranian foundries (IRANSans, Yekan Bakh, Peyda…), with a web licence.
- **Line height, sizes and the ban on tracking and italics:** as in Arabic (≥ 1.6 for body text).
- **Display faces stay large** (TY-24). Many Persian display faces simplify dots at small sizes.
- **Nastaliq** is the traditional style for poetry and literary display. It needs a line height of about 2.2 and generous padding. Keep it to display and poetry; UI and body text use a Naskh-style face.

## Numbers and dates

- **Digits:** Extended Arabic-Indic ۰۱۲۳۴۵۶۷۸۹ (U+06F0–06F9). The shapes of ۴ ۵ ۶ differ from the Arabic forms.
  - Use `numberingSystem: 'arabext'` with `Intl`.
  - Accept both Arabic-Indic ranges and Western digits on input, then normalise them.
- **Calendar:** Solar Hijri, with `calendar: 'persian'`. Show the Gregorian date as well where the audience expects it.
- **Week:** starts on Saturday; the weekend is Friday.
- **Plurals:** Persian uses `one` and `other` in `Intl.PluralRules`. After numbers the noun stays singular («۳ کتاب»).
- **Decimal and thousands separators:** «٫» and «٬» in the `arabext` numbering system. Let `Intl` insert them.

## Punctuation

- «،» comma, «؛» semicolon, «؟» question mark, guillemets «» for quotes. The full stop is shared.
- No space before punctuation; one space after «،».

## Voice

- Formal «شما» for interfaces, unless the brand is deliberately informal.
- Direct verbs on buttons: «ثبت»، «ارسال»، «خرید»; or the imperative: «ثبت کنید». Choose one convention and keep it.
- **Machine-copy tells** (CP-02, CP-03):
  - «راهکارهای نوآورانه»;
  - «تجربه‌ای بی‌نظیر»;
  - «به سادگی»;
  - «انقلابی»;
  - «نسل جدید»;
  - «فقط با یک کلیک»;
  - staged contrast «نه تنها… بلکه…»;
  - literal English calques.

## The cultural costume

Persian design has its own reflex: Persepolis columns, arabesque tiles and turquoise domes, miniature-painting pastiche. Use them only when they are the subject. Build from the product's real world instead.
