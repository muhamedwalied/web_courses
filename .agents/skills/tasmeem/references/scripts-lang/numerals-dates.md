# Numbers, plurals, dates and local formats

## One formatter, one policy

Every number a user sees goes through `Intl`. Never concatenate digits, separators or currency symbols by hand.

```js
const locale = 'ar-SA'
const num = new Intl.NumberFormat(locale, { numberingSystem: 'latn' })  // or 'arab'
const money = new Intl.NumberFormat(locale, { style: 'currency', currency: 'SAR', numberingSystem: 'latn' })
const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', calendar: 'gregory', numberingSystem: 'latn' })
const plural = new Intl.PluralRules(locale)
```

- **Pin `numberingSystem` and `calendar`.** Defaults differ by locale and by ICU version: some Arabic locales resolve Arabic-Indic digits, others Western, and some engines resolve a Hijri calendar for `ar-SA`. Pinning makes the output deterministic across browsers and the server.
- **Digit policy:**
  - Both digit systems are correct Arabic.
  - Western digits are common in Gulf interfaces and finance; Arabic-Indic digits in publishing, Egypt and the Levant.
  - Choose one per product, and use it for prices, dates, validation messages and examples alike (SC-07).
- **Input:** accept both Arabic-Indic ranges, and normalise them before parsing:
  ```js
  const toLatinDigits = s => s
    .replace(/[٠-٩]/g, d => d.charCodeAt(0) - 0x0660)
    .replace(/[۰-۹]/g, d => d.charCodeAt(0) - 0x06f0)
  ```

## Plurals

`Intl.PluralRules` categories differ per language. Write a string for every category the language uses.

| Language | Categories |
|---|---|
| Arabic | zero, one, two, few (3 to 10), many (11 to 99), other |
| Persian | one, other (the noun stays singular after a number: «۳ کتاب») |
| English | one, other |

Arabic forms for "file": «لا ملفات» / «ملف واحد» / «ملفان» / «3 ملفات» / «11 ملفاً» / «100 ملف».

## Calendars and weeks

- Pin the calendar: `gregory`, `islamic-umalqura` (the Saudi civil Hijri) or `persian` (Solar Hijri, Iran and Afghanistan). Show both calendars where the audience expects it (Saudi government services often do).
- Month names depend on the locale, not only on the language. Arabic Gregorian months are «يناير، فبراير…» in the Gulf and Egypt, «كانون الثاني، شباط…» in the Levant and Iraq. `Intl` handles this when the locale includes the region.
- **Week start and weekend:**
  - Saturday starts the week in most Arab countries and in Iran; Sunday in the US; Monday in the UK and Europe.
  - Weekends are Friday–Saturday in most of the Gulf, and Saturday–Sunday in the UAE since 2022. Check the current rules for Iran.
  - Use `new Intl.Locale(tag).getWeekInfo?.()` (or `.weekInfo`) where available, with a table fallback.

## Currency

- Let `Intl` place the symbol. Arabic locales place it after the amount and add bidi marks.
- **Saudi riyal:** the new sign (U+20C1, encoded in 2025) has limited font support. Use `ر.س`, `SAR` or an SVG of the official mark until the chosen font covers it. Never draw it with an image model.
- Price display: tabular figures (TY-20); no fake precision (CP-07).

## Names, addresses, phone numbers

- **Names:** a single "full name" field unless the service needs the parts. Do not assume "first/last". Allow Arabic, Persian and Latin characters, spaces, hyphens and apostrophes.
- **Addresses:** follow the country format. Saudi national address: building number, street, district, city, postal code, additional number. UAE: often no postal code. Iran: province, city, street, alley (کوچه), plate number, 10-digit postal code.
- **Phone:** store E.164; accept the local form, `+` and `00` prefixes, spaces and dashes, and both digit systems.

## Sorting and search

- Sort with `Intl.Collator(locale)`, never with a code-point `sort()`.
- For Arabic search, normalise alef forms (أ إ آ → ا), taa marbuta and haa (ة/ه), alif maqsura and yaa (ى/ي), and strip tashkeel and tatweel before matching.
