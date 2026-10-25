# Working with /rasm

`/rasm` («رسم», "drawing") is an Arabic-first image-prompt skill with specialists for Arabic typography, social, posters, menus, brand, product and edits, and a large corpus of proven prompts. When it is installed, tasmeem hands it the prompt writing for its image jobs, and keeps the design decisions and the checks.

## Division of work

| tasmeem decides | /rasm does |
|---|---|
| what the page needs (the region map) | the prompt for each image |
| the direction: palette, materials, mood, the brand board | model routing, and prompt structure grounded in its corpus |
| sizes, aspect, transparency, where the image goes | Arabic prompt rules (RTL clause, letter shaping) when text is truly needed |
| the cost gate and provenance | the specialist for the job (`/rasm-brand`, `/rasm-product`, `/rasm-poster`…) |
| checking the result against the comp | |

## Hand-off format

Give `/rasm` a spec, not a vibe:

```
job: plate
region: hero-art (right two-thirds of the desktop comp)
subject: a Riyadh side street at dusk, barber shop with a lit striped pole, light traffic
medium: photographic, 35mm, shallow depth, warm sodium light
palette: charcoal #23211f, brass #b08a4a, sodium orange, cool shadow blue
references: .tasmeem/crops/hero.png (composition and light only)
text: none (every word is set in code)
output: 2k, 3:2, opaque; target public/plates/hero.webp
```

- **No text in the image** is the default for every plate. When an image truly needs lettering (a book cover mockup, packaging), `/rasm` routes to its Arabic-typography rules. tasmeem still compares every text crop against the source string before use (IG-08).
- **Model:** follow `/rasm`'s routing when it runs, or the owner's standing preference (the newest GPT Image first, top quality, 2k). Record the model in the sidecar.

## Without /rasm

tasmeem's own templates in `prompts.md` cover the common jobs. For Arabic-heavy, poster, menu and product work, install `/rasm` from its repository (github.com/Ekka-Barber/higgsfield-prompt-master) as that repository's README describes. `tasmeem.mjs doctor` reports whether it is present.
