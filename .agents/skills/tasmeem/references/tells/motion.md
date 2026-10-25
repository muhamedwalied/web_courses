# Motion tells (`MO-`)

Principles, timing tokens and techniques live in `references/motion/`. The tells below are what to catch.

### MO-01 · One fade-up for everything · P1 · scan render
The same fade-and-rise-on-scroll applied to every section and card.
**Why:** it is the reflex. The uniformity, not the motion itself, is the tell.
**Fix:** decide per element whether it should move at all. Give each moving element the motion that fits what it reveals, and orchestrate one entrance moment instead of scattering many.
**Sources:** IM AD HM TS

### MO-02 · Bounce and elastic easing · P1 · scan
Overshooting curves (`cubic-bezier` with values outside 0 to 1, or springs with bounce) on routine UI.
**Fix:** a strong ease-out for entrances (for example `cubic-bezier(0.23, 1, 0.32, 1)`) and springs with zero bounce.
**Allowed:** a playful brand, used on a single delight moment.
**Sources:** IM GS AD HM EK

### MO-03 · `transition: all` · P1 · scan
**Fix:** list the properties (`transform`, `opacity`, `color`, `background-color`).
**Sources:** GS HM WG EK MF

### MO-04 · Animating layout · P1 · scan
Transitions or keyframes on `width`, `height`, `top`, `left`, `margin` or `padding`, which push the content around them.
**Fix:** animate `transform` and `opacity`. For size changes, use the FLIP technique, `grid-template-rows: 0fr → 1fr`, or View Transitions.
**Sources:** IM GS WG UI

### MO-05 · No reduced-motion path · P0 · scan render
Motion with no `prefers-reduced-motion: reduce` alternative, or autoplaying loops that keep running under it.
**Fix:** under reduce, remove movement and keep at most a short crossfade. Every loop stops.
**Sources:** AD HM WG IM

### MO-06 · Content hidden until an animation runs · P0 · render
Content starting at `opacity: 0` and waiting for JavaScript or an observer to reveal it. If the script fails, the tab is hidden or a crawler reads the page, the content never appears.
**Fix:** the visible state is the default. Motion only enhances it (for example, by adding the hidden starting state only when motion is allowed and the element is below the fold). Watch for the specificity trap: `html.js .reveal` beats `.reveal.in`.
**Sources:** IM GS T

### MO-07 · Images that zoom on hover · P2 · scan
`hover: scale(1.05)` on every image and card.
**Sources:** IM GS HM

### MO-08 · Ambient fidgets · P2 · scan
Pulsing status dots with no status change, blinking cursors on static text, auto-scrolling marquees, cursor-follower dots.
**Sources:** IM HM

### MO-09 · Slow or sluggish UI motion · P1 · scan
UI transitions longer than 300ms without a stated reason, or `ease-in` on entrances.
**Fix:** 100 to 160ms for press feedback, 150 to 250ms for menus, 200 to 300ms for dialogs (up to 500ms for large sheets), all with ease-out.
**Sources:** EK

### MO-10 · Popping from nothing · P2 · scan
Elements scaling up from `scale(0)`, and popovers growing from their centre instead of from their trigger.
**Fix:** start from `scale(0.95)` or higher together with opacity, and set `transform-origin` toward the trigger.
**Sources:** EK

### MO-11 · Count-up numbers · P2 · scan
Stats counting up from zero on scroll.
**Sources:** AD

### MO-12 · Permanent `will-change` · P2 · scan
`will-change` left on many elements at rest.
**Fix:** apply it just before an animation, or not at all.
**Sources:** GS MF UI

### MO-13 · Scattered micro-interactions · P2 · eye
Many small, unrelated animations with no shared timing and no orchestration.
**Fix:** one motion system (see `motion/tokens.md`) and one orchestrated moment per view.
**Sources:** AD FD

### MO-14 · Uninterruptible motion · P2 · scan
Keyframe animations used for state changes (open or close, hover) that cannot reverse midway.
**Fix:** CSS transitions or springs, which retarget when the state flips.
**Sources:** EK MF

### MO-15 · Motion on every load or keystroke · P2 · render
Entrance animations replayed on each navigation, or on frequent interactions such as typing and tab switching.
**Fix:** animate first appearances and rare events. Keep frequent actions instant or under 150ms.
**Sources:** MF EK

### MO-16 · Autoplay that will not stop · P1 · render
Loops longer than 5 seconds next to content with no pause control; video with sound that plays on its own.
**Sources:** WG HM

### MO-17 · Scroll work on the main thread · P1 · scan
Scroll listeners that read layout and set styles on every event.
**Fix:** CSS scroll-driven animations, `IntersectionObserver`, or a passive listener batched with `requestAnimationFrame`.
**Sources:** UI WG

### MO-18 · A heavy runtime for a still image · P2 · scan
A Lottie file or a Three.js scene rendering what is effectively a still image or a simple loop.
**Sources:** HM
