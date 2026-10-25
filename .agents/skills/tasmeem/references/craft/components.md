# Components and states

## Every interactive component has eight states

| State | Selector / attribute | Rule |
|---|---|---|
| default | none | legible at rest; affordance visible without hover |
| hover | `:hover` (inside `@media (hover: hover)`) | a small, clear change; no layout shift |
| focus | `:focus-visible` | a ring with ≥ 3:1 contrast on every tone; never removed |
| active | `:active` | a 100 to 160ms press response (`scale: 0.97` or a 1px translate) |
| disabled | `:disabled`, `aria-disabled` | reduced contrast and `cursor: not-allowed`; the reason nearby when not obvious |
| loading | `aria-busy="true"` | keeps its width; the label says what is happening («جارٍ الحفظ…») |
| error | `aria-invalid="true"` | message tied with `aria-describedby`; says how to fix |
| success | a state attribute | brief, in place; the same verb as the action ("Publish" → "Published") |

Design them together, in one place (see CM-07).

## Buttons and links

- `<button>` acts; `<a href>` navigates. Never a clickable `div` (QA-09).
- Label the result, not the mechanism: «احجز الموعد», "Save changes".
- One primary action per view. Make the secondary actions quieter, not equal.
- Hit area ≥ 44×44 px. Extend it with padding or a pseudo-element when the visual is smaller.
- Directional arrows in labels mirror in RTL, or are removed (CP-10, SC-06).

## Cards

- Use a card only when the item is an object the reader opens or compares. Otherwise use a list, a table or prose.
- One container level (LA-10). Use space or dividers inside.
- Radius from the scale. For nested rounded shapes, inner radius = outer radius − gap (CM-18).
- Borders give structure; shadows give elevation, and only for floating things (CM-06).

## Menus, dialogs, popovers

- `<dialog>` with `showModal()` for modals: it brings a focus trap, Escape and the top layer. Return focus to the trigger on close.
- The Popover API for menus and tooltips; `position-anchor` where supported.
- Lock the page scroll while a modal is open (`html:has(dialog[open])`), and use `overscroll-behavior: contain` inside.
- Motion: origin-aware scale from 0.95 plus opacity, 150 to 250ms, ease-out (MO-10).

## Data display

- Tabular figures, aligned decimal places, units in the header.
- Show real data or no chart (CM-20). Label axes in the page language, and decide the RTL direction for time.
- Empty state: what this area will contain, and the one action that fills it.

## Icons

- One family, one stroke weight matched to the adjacent text (SY-05).
- Decorative icons get `aria-hidden="true"`; icon-only buttons get an accessible name (QA-11).
- Mirror by meaning in RTL (SC-06).
- Never draw icon paths by hand beyond the simplest shapes. Use a library, or the brand's own icon set.
