# Layout tells (`LA-`)

### LA-01 · The centred hero template · P0 · render eye
A badge, a centred H1, a grey sub-line, two buttons side by side and a screenshot below, all on the centre axis, filling the first viewport.
**Why:** it is the median of generated landing pages. The silhouette alone gives it away.
**Fix:** open with the subject's most characteristic thing (an image, an object, a working demo, a strong typographic statement) and build an asymmetric composition around it.
**Allowed:** a manifesto or announcement page where the sentence itself is the design.
**Sources:** AD HM TS IM FD

### LA-02 · Three identical icon cards · P0 · scan render
Three (or four, or six) equal cards, each an icon tile over a heading over two lines of text.
**Why:** it gives every point the same weight and looks the same on every product.
**Fix:** rank the points. Give the main one space, an image or a demonstration; set the others as a list, a table or prose.
**Sources:** IM GS AD HM AS TS

### LA-03 · The stat strip · P1 · scan render
A row of huge numbers with small labels ("10×", "99.9%", "50k+").
**Why:** it is a template and usually carries invented numbers (see CP-07).
**Fix:** use real, sourced numbers inside a sentence that explains them, or remove the row.
**Sources:** IM AD HM

### LA-04 · Numbered sections as scaffolding · P1 · scan
"01 / 02 / 03" markers above sections that are not a sequence.
**Fix:** number only real sequences, such as steps a reader follows in order.
**Sources:** IM GS AD FD

### LA-05 · The stock section order · P1 · eye
Hero, logo wall, features, testimonials, pricing, FAQ, call to action, footer, in that order.
**Fix:** order the sections by the reader's questions for this product. Merge, cut or invert sections.
**Sources:** AD HM

### LA-06 · The generated navigation and footer · P1 · render
A logo on the left, four centred links and a button on the right; a four-column footer of link lists over a copyright line.
**Fix:** design navigation from the site's real structure (rooms, chapters, a single action) and a footer that says something true about the owner.
**Sources:** AD HM

### LA-07 · Three pricing tiers with a "most popular" ring · P1 · render
**Fix:** show the real offer. If there are tiers, compare them in a table with honest differences.
**Sources:** AD

### LA-08 · Bento grid by default · P2 · eye
A mosaic of rounded tiles used because it is fashionable, not because the content has mixed sizes.
**Fix:** use a bento only when the items really differ in weight.
**Sources:** AD TS

### LA-09 · Monotonous spacing · P2 · render
The same padding on every section and the same gap in every grid.
**Fix:** spacing that encodes grouping. Tight inside a group, generous between groups; a rhythm, not a constant.
**Sources:** IM AD HM

### LA-10 · Cards inside cards · P1 · scan render
A bordered or shadowed box nested inside another.
**Fix:** one container level. Group inner items with space or dividers.
**Sources:** IM GS AD HM

### LA-11 · Everything centred · P1 · render
Headings, paragraphs and buttons centred on every section.
**Fix:** align to the reading start (the left edge in LTR, the right in RTL). Centre only short, standalone moments.
**Sources:** HM TS

### LA-12 · A heading hugging the wrong block · P2 · render
A heading that sits closer to the previous section than to its own content.
**Fix:** more space above a heading than below it.
**Sources:** IM

### LA-13 · Unbalanced opening columns · P2 · render
A two-column opening where one column runs far below the other, leaving a hole.
**Sources:** IM

### LA-14 · Horizontal overflow · P0 · render
The page scrolls sideways at any width from 320px up, or content spills out of its container.
**Fix:** find the element wider than the viewport. Use `overflow-x: clip` on `html` and `body` only as a safety net, never as the fix.
**Sources:** IM HM GS

### LA-15 · Clipped menus and popovers · P1 · render
A dropdown or tooltip cut off by an `overflow: hidden` ancestor.
**Fix:** use `<dialog>`, the Popover API, `position: fixed` or a portal.
**Sources:** IM

### LA-16 · Content covered by another layer · P0 · render
A sticky header, banner or opaque overlay covering text or the focused element, or a sticky element at `top: 0` sliding under a sticky navigation bar.
**Fix:** offset with `scroll-padding-top` and the header height; stack sticky elements below the bar.
**Sources:** IM HM WG

### LA-17 · Cramped edges · P1 · render
Body text touching the viewport edge on phones, or text pressed against the edge of a button or card.
**Fix:** at least 16px side gutters on phones; padding scaled to the type size inside controls.
**Sources:** IM

### LA-18 · Scrollers without gutters · P2 · render
Horizontal card rails whose cards touch the scroller edge, or snap points that hide the first card's start.
**Fix:** `scroll-padding-inline` and matching inline padding.
**Sources:** IM GS

### LA-19 · Image grids that blow out · P1 · scan
Grid tracks set to `1fr` holding images or long words, so a track grows beyond its share.
**Fix:** `minmax(0, 1fr)` and `min-width: 0` on grid and flex children.
**Sources:** HM

### LA-20 · Viewport units that jump · P1 · scan
`100vh` heroes that jump under mobile browser bars, and `100vw` widths that cause horizontal scroll next to a scrollbar.
**Fix:** `100svh` or `100dvh` for heights, and `100%` instead of `100vw`.
**Sources:** TS HM

### LA-21 · Decorative grid-paper backgrounds · P2 · scan
Graph-paper lines or dot grids behind content, with no function.
**Allowed:** a brand whose world really is drafting, maps or engineering, used once.
**Sources:** IM

### LA-22 · Buttons that wrap · P1 · render
Button, navigation or breadcrumb labels breaking onto two lines at any tested width.
**Fix:** shorten the label, widen the control, or restack the group. Test the longest language, since Arabic and Persian labels often run wider than English.
**Sources:** HM TS T

### LA-23 · Generated layout bugs · P1 · built
`body { display: contents }`, empty grid tracks left as spacers, and padding that collides when flex items wrap.
**Sources:** GS
