# System tells (`SY-`)

### SY-01 · Drift from the design system · P0 · scan render
Fonts, colours, radii or font sizes that are not in `DESIGN.md` or the token files; a page that looks like a different product from its siblings.
**Fix:** use the documented tokens. If a new value is needed, add it to the system first, with a reason.
**Sources:** IM AD HM

### SY-02 · Improvised values · P1 · scan
Raw hex, px or `font-family` values in components where tokens exist (see CO-16); magic numbers repeated across files.
**Sources:** HM IM T

### SY-03 · Default-attractor sameness · P1 · eye
A page that could belong to any product. It fails the silhouette test: shrunk to a small black-and-white block diagram, it matches every other generated page in the category.
**Fix:** re-open the direction (see `core/direction.md`). Answer "what would only this product do here?"
**Sources:** HM AD FD IM

### SY-04 · No layering scale · P2 · scan
`z-index: 9999` and friends, with no named scale.
**Fix:** named z-index tokens, in this order: base, raised, sticky, overlay, modal, toast, tooltip.
**Sources:** HM IM

### SY-05 · Mixed icon families · P2 · scan
Two or more icon sets, or icon stroke weights that do not match the adjacent text weight.
**Fix:** one family; stroke matched to text (1.5px icons next to regular text, 2px next to semibold).
**Sources:** HM MF TS

### SY-06 · A theme that does not work · P1 · render
A second theme (dark, high contrast, a seasonal skin) shipped with broken contrast, missing states or unthemed third-party parts.
**Fix:** every shipped theme passes the same gate. Otherwise, ship one theme.
**Sources:** AS

### SY-07 · Reflex over reason · P1 · eye
Design choices with no stated reason in the direction or `DESIGN.md`: a style picked from a menu, a trend applied everywhere.
**Fix:** each major choice (palette, type, layout idea, signature element) gets one sentence tying it to the subject, the audience or the use scene.
**Sources:** FD IM TS AS
