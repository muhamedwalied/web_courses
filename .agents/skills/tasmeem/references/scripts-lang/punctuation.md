# Punctuation and spacing

| Language | Quotes | Nested | Question / comma / semicolon | Spacing |
|---|---|---|---|---|
| Arabic | «…» | "…" | ؟ ، ؛ | no space before marks; one space after «،» |
| Persian | «…» | "…" | ؟ ، ؛ | as Arabic; ZWNJ inside words (see persian.md) |
| English (US) | “…” | ‘…’ | ? , ; | none before marks |
| English (UK) | ‘…’ | “…” | ? , ; | none before marks |

## Shared rules

- **Ellipsis** «…» (U+2026), not three dots. Loading states end with it: "Saving…", «جارٍ الحفظ…», «در حال ذخیره…».
- **Dashes:**
  - an en dash (–) for ranges;
  - an em dash (—) only where the author uses it, and never sprinkled through interface copy (CP-05);
  - Arabic and Persian rarely use the em dash.
- **No-break spaces** between a number and its unit (`10 MB`, «٥ كم»), and before a closing mark that follows a space.
- **In right-to-left text,** the browser mirrors brackets and parentheses. Type them in logical order, never reversed.
- **Fonts:** check that the chosen fonts include «» ؟ ، ؛ and the curly quotes.
