# Layout craft

## Structure from content

- Order sections by the reader's questions, not by the landing-page template (LA-05).
- Give the most important thing the most space. Rank, then size. Equal cards are for equal things (LA-02).
- Vary the composition between sections: full-bleed image, split, a column of text, a dense list, a single line. A page is a sequence of different rooms, not a stack of the same box.

## Spacing

```css
:root {
  --space-3xs: 0.25rem; --space-2xs: 0.5rem; --space-xs: 0.75rem; --space-s: 1rem;
  --space-m: 1.5rem;    --space-l: 2.5rem;   --space-xl: 4rem;    --space-2xl: 6.5rem;
  --gutter: clamp(1rem, 0.6rem + 2vw, 2.5rem);
}
```

- Use a scale, not arbitrary values. Keep space tight inside groups and generous between them (LA-09).
- Put more space above a heading than below it (LA-12).
- Phone gutters are at least 16px (LA-17).

## Grids and flow

- Flexbox for one dimension, grid for two. `repeat(auto-fit, minmax(min(18rem, 100%), 1fr))` for responsive grids without breakpoints.
- `minmax(0, 1fr)` and `min-width: 0` wherever images or long words live (LA-19).
- Logical properties for every side (`margin-inline`, `padding-block`, `inset-inline-start`), so RTL works for free (SC-05).
- Container queries (`@container`) for components that live in different widths.
- `100svh` or `100dvh`, never `100vh`, for tall sections; `100%`, never `100vw`, for widths (LA-20).

## Breakpoints

Test at 320, 360, 768, 1024 and 1440 (plus 1920 for brand pages). Common breaks sit near 640, 768, 1024 and 1280, but break where the content breaks, not at device widths.

## Layers

A named z-index scale:

```css
:root { --z-raised: 1; --z-sticky: 10; --z-overlay: 20; --z-modal: 30; --z-toast: 40; --z-tooltip: 50; }
```

Dialogs, popovers and menus use `<dialog>` and the Popover API, or they escape their clipping ancestors (LA-15).

## Asymmetry with purpose

For variance 6 and above:
- split screens;
- start-aligned headings with an offset image;
- hanging columns;
- text set against an edge;
- a grid broken once by the signature element.

Asymmetry follows the reading direction: in RTL, the "heavy" start is on the right.
