# Motion principles

Motion explains change: where a thing came from, what it is attached to, what just happened. Motion that explains nothing is decoration, and uniform decoration is a tell (MO-01).

## Four questions before animating anything

1. **Should it move at all?**
   - Frequent actions (typing, tab switching, keyboard shortcuts, list filtering) stay instant or under 150ms.
   - Rare moments (first arrival, a completed booking, opening a room) can take more.
2. **What does it explain?** Spatial origin (a menu from its button), continuity (a card becoming a page), state (saved), attention (one new item). Name it. If you can't, don't animate.
3. **What curve?**
   - Entering and responding: a strong ease-out.
   - Moving on screen: ease-in-out.
   - Leaving: ease-in, shorter.
   - Never `ease-in` for something the user is waiting to see (MO-09).
4. **How long?** The fastest duration that still reads.

## Timing

| Motion | Duration |
|---|---|
| Press feedback | 100 to 160ms |
| Tooltip, small popover | 125 to 200ms |
| Menu, select, dropdown | 150 to 250ms |
| Dialog, sheet | 200 to 300ms (up to 500ms for large drawers) |
| Page or view transition | 250 to 400ms |
| Brand entrance (once per visit) | 400 to 900ms, staggered |

Exits run at about 60 to 70% of the entrance duration. Stagger lists by 30 to 80ms per item, capped (after 6 to 8 items, reveal the rest together).

## Curves

```css
:root {
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);       /* strong, responsive */
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);   /* on-screen movement */
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);    /* sheets, drawers */
  --ease-exit: cubic-bezier(0.4, 0, 1, 1);          /* leaving */
}
```

Springs (in a motion library, or `linear()` approximations in CSS) suit gestures and interruptible movement. Keep the bounce at 0 for UI (MO-02).

## Rules

- **Animate `transform` and `opacity`** (plus `filter` and `clip-path` when they are the effect). Never layout properties (MO-04).
- **Interruptible:** use transitions or springs for state changes, so that a reversed state retargets from where it is (MO-14).
- **Origin-aware:** popovers grow from their trigger (`transform-origin`), and never from `scale(0)`. Start at 0.95 or higher (MO-10).
- **One orchestrated moment per view** beats ten scattered micro-interactions (MO-13).
- **Motion follows the reading direction:** in RTL, "forward" is leftward. Slides, carousels and progress respect `dir` (see `scripts-lang/bidi.md`).
- **Blur can hide imperfection:** a small `filter: blur(2px → 0)` during a crossfade masks mismatched frames.
- **Enhance, never gate:** content is visible by default. Motion adds the hidden starting state only when motion is allowed (MO-06).
- **Reduced motion is a design,** not an off switch. Under `reduce`, movement becomes a short crossfade or an instant change, and every loop stops.
- **Premium materials** beyond transform and opacity (masks, clip-path wipes, blur, shadow depth, scroll-linked progress) are allowed when they make the effect better and stay smooth. Profile them.
