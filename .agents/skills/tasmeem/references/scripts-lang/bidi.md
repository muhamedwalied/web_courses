# Bidirectional text

Most RTL bugs are bidi bugs: text in the right language, placed in the wrong order.

## The model in one paragraph

Every paragraph has a base direction (from `dir`). Strong characters (letters) have their own direction; neutral characters (spaces, punctuation, digits in some contexts) take the direction of their neighbours. When a neutral sits between an Arabic run and a Latin run, the base direction decides where it goes. That is why "(Beta)" loses a parenthesis to the other side and why a phone number's `+` jumps to the end.

## Isolation, the fix for almost everything

| Case | Markup |
|---|---|
| A known-LTR token inside RTL text (a product name, email, URL, code) | `<span dir="ltr">iPhone 17 Pro</span>` (the `dir` attribute isolates) |
| User content of unknown direction | `<bdi>{name}</bdi>`, or `dir="auto"` on the element |
| An inline span that must keep its own direction | `unicode-bidi: isolate` (implied by `dir` on the element) |
| A plain string with no markup possible (a `<title>`, a push notification) | U+2068 FSI … U+2069 PDI around the token, or an LRM (U+200E) / RLM (U+200F) mark next to the neutral |

- Put `dir="ltr"` on **inline** elements. On a block, it also flips the alignment.
- `Intl` output for Arabic locales already includes an RLM where needed. Do not wrap it in `dir="ltr"`: the wrapper fights the formatter.

## Inputs

- Email, URL, phone, code, IBAN and password inputs: `dir="ltr"`. Keep the placeholder direction consistent with the value.
- Free-text inputs: `dir="auto"`, so the field follows what the user types.
- An icon, button or prefix overlaid on an input must share the input's direction context, or be positioned with physical properties together with a comment explaining why. Logical properties resolve per element: an LTR input with `padding-inline-end` and an RTL-inherited toggle at `inset-inline-end` end up on opposite sides.

## Layout mirroring

**Mirror:**
- the reading flow, alignment and the navigation order;
- directional icons;
- progress and sliders;
- carousels and their controls;
- the breadcrumb separators;
- the drawer side;
- the position of "next" and "previous";
- asymmetric decorations that point "forward".

**Do not mirror:**
- photographs, logos and brand marks;
- media controls (play and pause, the timeline in some conventions: decide and document);
- clocks, checkmarks;
- icons containing letters or digits;
- keyboard shortcut glyphs;
- maps.

## Numbers inside RTL

- Digits are weak LTR runs: "٢٠٢٦/٠٩/٢٨" and "2026/09/28" both need care around slashes and dashes. Prefer `Intl.DateTimeFormat` output to hand-built strings.
- Ranges and units: «من ٣ إلى ٥ أيام», «250 كم». Keep a no-break space between a number and its unit.
- Phone numbers inside Arabic sentences: wrap them in `<span dir="ltr">`, or begin them with an LRM.

## Testing

- Test the whole UI with `dir="rtl"` on `<html>` and real Arabic strings (not reversed English).
- Include mixed strings: a brand name at the start and at the end of a sentence, a parenthesised Latin word, a phone number, a price with a currency, an email in an error message.
- Check the caret and selection behaviour in the inputs.
