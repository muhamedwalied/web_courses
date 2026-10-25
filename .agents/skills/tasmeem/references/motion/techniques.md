# Motion techniques

## 1. Tokens

```css
:root {
  --dur-press: 140ms; --dur-small: 180ms; --dur-menu: 220ms; --dur-dialog: 280ms; --dur-page: 360ms;
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1); --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --stagger: 60ms;
}
@media (prefers-reduced-motion: reduce) {
  :root { --dur-press: 0ms; --dur-small: 0ms; --dur-menu: 0ms; --dur-dialog: 0ms; --dur-page: 0ms; --stagger: 0ms; }
}
```

Every animation uses the tokens, so one media query governs them all.

## 2. Entrance that never hides content

The visible state is the default. JavaScript adds the hidden starting state only when motion is allowed, and only to elements below the fold:

```js
// motion.js: an enhancement only; the page is complete without it
const ok = matchMedia('(prefers-reduced-motion: no-preference)').matches
if (ok && 'IntersectionObserver' in window) {
  const held = new Map()
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue
      held.get(e.target)?.play()
      held.delete(e.target)
      io.unobserve(e.target)
    }
  }, { rootMargin: '0px 0px -8% 0px' })
  for (const el of document.querySelectorAll('[data-reveal]')) {
    if (el.getBoundingClientRect().top < innerHeight) continue       // on screen now: leave it still
    const a = el.animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 500, easing: 'cubic-bezier(0.23,1,0.32,1)', fill: 'backwards' })
    a.pause()                                                        // held at frame 0 while off screen
    held.set(el, a)
    io.observe(el)
  }
  addEventListener('beforeprint', () => { for (const a of held.values()) a.finish() })
}
```

Only elements that are off screen are held at the first keyframe, so the reader never sees a flash. If the script never runs, nothing is ever hidden. When printing, every held animation finishes.

## 3. Scroll-driven animations (CSS)

Progress bars, parallax-lite and reveals tied to scroll, off the main thread:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .scrub { animation: rise linear both; animation-timeline: view(); animation-range: entry 0% cover 40%; }
  }
}
@keyframes rise { from { opacity: 0.2; translate: 0 24px; } to { opacity: 1; translate: 0 0; } }
.reading-progress { animation: grow linear; animation-timeline: scroll(root); transform-origin: 100% 50%; } /* RTL: grows from the right */
```

Always inside `@supports` and the reduced-motion query. Without support, the element simply shows its final state.

## 4. View Transitions

For state changes and page navigation, with shared elements:

```css
@view-transition { navigation: auto; }                         /* cross-document, same origin */
.card-image { view-transition-name: var(--vt-name); }          /* unique per element */
::view-transition-old(root), ::view-transition-new(root) { animation-duration: var(--dur-page); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none; } }
```

In frameworks, use their View Transition APIs (React `<ViewTransition>`, Astro and Next integrations) when available. Give every shared element a unique name.

## 5. Size changes without layout thrash

- Height auto: `interpolate-size: allow-keywords` (where supported), or `grid-template-rows: 0fr → 1fr` with a `min-height: 0` child.
- Reordering: FLIP (First, Last, Invert, Play) with `transform`, or View Transitions.
- Accordions: `<details>` with `::details-content` transitions where supported.

## 6. Press and hover

```css
.button { transition: transform var(--dur-press) var(--ease-out), background-color var(--dur-small) var(--ease-out); }
.button:active { transform: scale(0.97); }
@media (hover: hover) { .button:hover { background-color: var(--accent-hover); } }
```

## 7. Performance

- Composited properties only for continuous motion. Check the Performance panel for layout and paint during the animation.
- `will-change` only just before an animation, and removed after it (MO-12).
- Scroll logic through CSS timelines or `IntersectionObserver`, never scroll listeners that read layout (MO-17).
- Large blurs and `backdrop-filter` are expensive on mobile. Test on a mid-range phone.

## 8. Testing motion

- Record at 60fps or read the Animations panel. Check both reduced-motion states (`emulateMedia({ reducedMotion: 'reduce' })` in Playwright).
- Scroll the whole page slowly with motion on, then assert that no element is still at opacity < 1 or in a held animation (see MO-06). `tasmeem.mjs render` does this.
