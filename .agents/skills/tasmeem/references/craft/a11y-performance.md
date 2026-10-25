# Accessibility and performance floor

These are not a separate phase. Build them in from the start, and prove them at the gate.

## Accessibility (WCAG 2.2 AA)

- **Semantics first:**
  - landmarks (`header`, `nav`, `main#main`, `footer`);
  - one `h1` and headings in order;
  - lists as lists, buttons as buttons;
  - a skip link to `#main`.
- **Language:** `lang` and `dir` on the root, and on foreign passages (QA-04).
- **Keyboard:** every action is reachable and operable; the focus order follows the visual order (and the reading direction); focus stays visible and is never covered by sticky layers; focus is trapped in modals and returned when they close.
- **Contrast:** see `color.md`. Measure on the rendered backgrounds.
- **Targets:** 44×44 px, with at least 8px between neighbours.
- **Motion:** respect `prefers-reduced-motion`; nothing flashes more than three times a second; autoplay can be paused (MO-05, MO-16).
- **Media:** meaningful images get alt text in the page language; decorative ones get `alt=""`. Video has captions when it has speech. Films play only when the user asks.
- **Announcements:** `aria-live="polite"` for async results; `role="alert"` for errors that block progress.
- **Zoom:** never disabled. The layout survives 200% text zoom and 400% page zoom (reflow at 320 CSS px).
- **Forced colours:** check `@media (forced-colors: active)`. Borders must exist where shadows or backgrounds carried the structure.

## Performance

- **Budgets:**
  - LCP under 2.5s;
  - INP under 200ms;
  - CLS under 0.1;
  - the initial JavaScript per route as small as the product allows. Measure it; don't guess.
- **Images:**
  - AVIF or WebP with `srcset` and `sizes`;
  - `width` and `height`, or `aspect-ratio`;
  - `fetchpriority="high"` on the LCP image and `loading="lazy"` below the fold (IG-09);
  - posters for video, `preload="none"` for films below the fold.
- **Fonts:** subset per script, preload one body weight, and use metric-matched fallbacks (see `typography.md`).
- **CSS over JavaScript** for layout, motion and state wherever possible: scroll-driven animations, `:has()`, container queries, `<details>`, `<dialog>`, the Popover API.
- **Hydration:** interactive islands only. Keep motion and scroll logic in small client leaves; server-render the rest.
- **Third parties:** load them after interaction or idle, and justify each one.
- **Static first:** static export and edge caching where the product allows it.
