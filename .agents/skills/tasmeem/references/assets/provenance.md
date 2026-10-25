# Provenance

Every raster the build ships must answer: where did this come from?

## Sidecar format

For `public/plates/hero.webp`, write `public/plates/hero.webp.json` (or keep all sidecars in `.tasmeem/provenance/`, if the public folder must stay clean):

```json
{
  "kind": "generated",
  "model": "gpt_image_2_5",
  "params": { "aspect_ratio": "3:2", "resolution": "2k", "quality": "high", "background": "opaque" },
  "prompt": "Recreate the scene in the first image as a standalone photograph…",
  "references": [".tasmeem/crops/hero.png"],
  "job_id": "…",
  "credits": 2.75,
  "created": "2026-09-28T14:02:00Z",
  "region": "hero-art",
  "post": ["cropped 3:2 → 16:9 for desktop", "converted to webp q82"]
}
```

For images that were not generated:
- `"kind": "owner"`: the owner's own media; add who supplied it.
- `"kind": "stock"`: add the source URL and the licence.
- `"kind": "drawn"`: made by a designer; add the author.

## Rules

- `tasmeem.mjs higgs gen` writes the sidecar automatically.
- `tasmeem.mjs scan --provenance <dir>` lists the rasters without a sidecar.
- Never strip provenance to make an image look original.
- Never present generated people as real people.
- Keep the prompts. They are how the next session regenerates a plate in the same style.
