# Honesty: truthful content and states

A beautiful page with invented facts is still slop, and it is worse than an ugly page, because it misleads.

## Never invent

- metrics, growth numbers, ratings, customer counts, uptime;
- testimonials, quotes, names or photos of real-seeming people;
- client logos, press mentions, awards;
- prices, delivery times, stock levels;
- capabilities the product does not have.

When a design needs a fact that does not exist yet:
- **show a labelled gap** («يُعلن قريباً», "Price to be announced", "Metric to confirm") styled as part of the design, not as a broken slot;
- **or choose a structure that does not need it** (a statement instead of a stat strip);
- **and hand the user the list of every missing fact.**

**Illustrative material is allowed in greenfield work** (sample data in a dashboard mock, a demo account), provided it is plausible, clearly synthetic wherever a visitor could mistake it for the real thing, and listed for replacement.

## Truthful states

- **No placeholder sections.** An empty "Coming soon" block that exists only to fill the layout is CP-08. Either the content exists, or the section does not ship.
- **No fake interactivity.** A form without a backend must not pretend to submit. Leave it out, or connect it, or turn it into a link to the real channel.
- **Loading, empty and error states tell the truth:** what is happening, what was kept, what to do next.

## The owner's words

- Content supplied by the owner (their writing, poems, product descriptions, quotes) is used verbatim: typeset correctly, never rewritten, never "improved".
- Typesetting is allowed: punctuation spacing, no-break spaces, line breaks the author wrote, the language's own quote marks.
- If the owner's text contains a tell, mention it once and leave the decision to them.

## Provenance

- Every generated raster keeps its prompt, model, date and source references in a sidecar file (see `assets/provenance.md`).
- Stock or third-party images record their source and licence.
- AI-generated images of people are never presented as real customers, staff or authors.
