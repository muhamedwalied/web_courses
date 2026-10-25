# Imagery tells (`IG-`)

### IG-01 · Stock people at laptops · P1 · eye
Diverse-team-at-a-laptop stock photos, handshake photos and smiling-headset support agents.
**Fix:** the real product, real people from the owner, or authored images from the subject's world (see `assets/pipeline.md`).
**Sources:** AD

### IG-02 · The generated-illustration look · P1 · eye
Glossy 3D blobs, clay figures, isometric gradient scenes, and soft purple "AI" illustrations.
**Fix:** a documented art direction: medium, palette, era and subject matter from the brand's world. Generate against it with references, not with style words alone.
**Sources:** AD HM

### IG-03 · Corporate Memphis · P2 · eye
Flat people with tiny heads and long limbs, and blob shapes.
**Sources:** AD

### IG-04 · Placeholder or broken images · P0 · built render
Empty `src`, 404 images, grey boxes, placehold.co, Unsplash-random URLs and "image here" slots.
**Fix:** a real image, or a layout that does not need one yet. Never ship a hole.
**Sources:** IM GS AD

### IG-05 · Missing text alternatives · P0 · built
Meaningful images without `alt`; decorative images that are not hidden (`alt=""`, `aria-hidden`).
**Fix:** alt text that says what the image contributes, in the page's language.
**Sources:** GS WG

### IG-06 · Images buried under overlays · P2 · render
Photos covered by near-opaque colour or gradient overlays, so the image adds nothing.
**Sources:** IM

### IG-07 · Drawing where an asset belongs · P1 · scan eye
- hand-rolled SVG mascots and "quick approximation" illustrations;
- jagged `clip-path` polygons imitating torn paper;
- gradients, glass and icon tiles filling a slot that needed an image.
**Why:** it is the gap wearing chrome.
**Fix:** author the asset (see `assets/pipeline.md`). Icon-sized SVG (under 64px, a few paths) is fine; a chart drawn from data is a chart.
**Sources:** IM T

### IG-08 · Garbled text inside generated images · P0 · eye
Letters, logos or captions rendered by an image model, especially Arabic. Joining breaks, letters go missing (a model rendering the letter ص is a known failure), and upscalers alter glyphs (ء became ه on a product mock).
**Fix:** generate images without text and set every word in code or vector. When text must live in the image (a product mockup), compare the text crop against the source string and never upscale logos.
**Sources:** T

### IG-09 · Layout-shifting media · P1 · built
Images without `width`/`height` or `aspect-ratio`; a lazy-loaded first-screen (LCP) image; below-the-fold images loaded eagerly.
**Sources:** WG HM

### IG-10 · Edgeless light images · P2 · render
Light photos dissolving into a light ground with no edge.
**Fix:** a 1px inset outline at 5% black (or 5% white on dark), `outline-offset: -1px`.
**Sources:** MF GS

### IG-11 · Generator fingerprints · P1 · scan
"Made with …" badges, generator `<meta>` tags, template comments, stock favicons and default Open Graph images.
**Sources:** AD

### IG-12 · Animated GIF for motion · P2 · scan
**Fix:** a muted, looping `<video playsinline>` with a still poster and a reduced-motion fallback.
**Sources:** WG
