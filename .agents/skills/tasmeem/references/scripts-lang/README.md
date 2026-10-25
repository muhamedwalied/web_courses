# Languages: Arabic, Persian, English

tasmeem currently supports three languages and two scripts: Arabic and Persian (Arabic script, right to left) and English (Latin script, left to right). Detect what the page contains (the `context` and `render` checks list it), then read the guides that apply.

| Guide | Covers |
|---|---|
| [arabic.md](arabic.md) | Arabic, the first-class language: type, layout, forms, voice, images |
| [persian.md](persian.md) | Persian: ی and ک, ZWNJ, Persian digits, the Solar Hijri calendar, Nastaliq for display |
| [english.md](english.md) | English and the Latin script, and pairing Latin with Arabic |
| [bidi.md](bidi.md) | mixing right-to-left and left-to-right: isolation, marks, inputs, icons |
| [numerals-dates.md](numerals-dates.md) | digits, plurals, calendars, currency, weeks, names, addresses |
| [punctuation.md](punctuation.md) | quotes, spacing and marks for the three languages |

## Rules for every page

1. **`lang` on the root and on every passage in another language;** `dir` where the direction differs.
2. **Scope typography with `:lang()`.** One stylesheet, both scripts:
   ```css
   :root { --leading-body: 1.5; --track-label: 0.04em; }
   :lang(ar), :lang(fa) { --leading-body: 1.7; --track-label: 0; }
   ```
3. **A face per script, designed to pair.** Choose the Arabic-script face first, then a Latin partner that matches its x-height and colour, or a superfamily that covers both.
4. **Load only the subsets you use** (`unicode-range`), preload the body weight, and verify coverage in the browser. A fallback font is a defect; tofu (□) is a failure.
5. **Test the longest and the tallest strings:** Arabic with tashkeel for height, and long English or Persian labels for length.
6. **Never trust an image model with text,** in Arabic or Persian above all. Set text in code.
7. **Avoid the cultural costume** (see `arabic.md` §10 and `persian.md`). Build from the subject's real world.
