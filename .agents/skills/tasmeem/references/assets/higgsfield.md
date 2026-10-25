# Higgsfield: setup, models and the cost gate

tasmeem generates images and video through the official Higgsfield CLI (`@higgsfield/cli`, MIT). The CLI needs no API key: it uses the Higgsfield account and its plan credits.

## One-time setup (for any user)

```sh
npm install -g @higgsfield/cli     # Node 18+; provides `higgsfield` (aliases: higgs, hf)
higgsfield auth login              # opens the browser (OAuth); stores a local token
higgsfield account status          # shows the plan and the credits available
```

Then check that tasmeem can see it:

```sh
node <skill>/scripts/tasmeem.mjs doctor
```

- **Teams and billing:** `higgsfield workspace` selects which workspace pays.
- **CI and headless machines:** run `higgsfield auth login` once on a machine with a browser. Treat the stored credential like a password; never commit it, print it or pass it in prompts.
- **Chat agents without a shell** (claude.ai, ChatGPT) can use the hosted Higgsfield MCP server instead. See higgsfield.ai/mcp. The CLI is cheaper in tokens for coding agents.
- **Official Higgsfield skills** (`npx skills add higgsfield-ai/skills`: generate, product photoshoot, brand kit…) work alongside tasmeem. tasmeem decides *what* to generate and checks the result; those skills can run the generation.

## Models tasmeem uses

Run `higgsfield model list --image` and `higgsfield model get <id>` for the current list and parameters. As of 2026-09:

| Job | Model (`job_type`) | Key parameters |
|---|---|---|
| Comps, plates, textures, cutouts | `gpt_image_2_5` | `aspect_ratio`, `resolution` 1k/2k/4k, `quality` low…max, `background` opaque/transparent, `image_references` |
| Reference-led, mood-led, character consistency | `nano_banana_pro` | `aspect_ratio`, `resolution`, `image_references` |
| Vector icon sets, patterns, flat illustration | `recraft_v4_1` | `model_type` vector/utility_vector, `colors` (the brand palette), `background_color` |
| Cutting out a subject | `image_background_remover` | `image_references` |
| Upscaling a photo (never one with text) | `topaz_image` | see `model get` |

**Routing.**
- **Comps are references,** so generate them at 1k and `medium` quality: 0.5 credits each, against 2.75 for a 2k high plate. Only plates that ship get 2k and `high`.
- The default is `gpt_image_2_5`, at 2k resolution and `high` quality, which follows specifications literally.
- Use `nano_banana_pro` when the brief is a mood or rests on reference images.
- Use `recraft_v4_1` in vector mode for icons and patterns that must stay consistent and scalable.
- Use 4k only for final print assets.
- If `/rasm` is installed, let it route and write the prompt (see `rasm.md`).

## The cost gate (mandatory)

Every generation costs credits. tasmeem never spends without showing the cost first.

```sh
node <skill>/scripts/tasmeem.mjs higgs cost  --model gpt_image_2_5 --prompt-file p.txt --aspect 16:9 --resolution 2k --quality high
node <skill>/scripts/tasmeem.mjs higgs gen   --model gpt_image_2_5 --prompt-file p.txt --aspect 16:9 --resolution 2k --quality high \
     --ref .tasmeem/crops/hero.png --background opaque --out public/plates/hero.webp --budget 20
```

- `cost` runs `higgsfield generate cost` (free) and prints the credits.
- `gen` estimates first and refuses when the total would exceed `--budget` (credits for this call). Then it runs `generate create --wait`, downloads the result to `--out`, and writes the provenance sidecar.
- In an interactive session, show the user the plan (the count, model and credits per image, the total) and get a yes before the first `gen` of a batch. A stated budget ("up to 60 credits for this page") covers the batch.
- Never loop regenerations silently. After two failed attempts at a plate, stop and show the attempts.

## Raw CLI reference

```sh
higgsfield generate cost   gpt_image_2_5 --prompt "…" --aspect_ratio 16:9 --resolution 2k --quality high --json
higgsfield generate create gpt_image_2_5 --prompt "…" --aspect_ratio 16:9 --resolution 2k --quality high \
          --background transparent --image-references ./crop.png --wait --json
higgsfield generate get  <job_id> --json
higgsfield upload ./reference.png            # returns an upload id (local paths are auto-uploaded by create)
```

Parameters are passed as `--name value`, using the names from `model get`. Media flags take a local path (auto-uploaded) or an upload/job id.

## Quality checks for every result

- **Text:** no text should appear. If some does, regenerate, or remove it before use (IG-08). Never trust generated Arabic.
- **Alpha:** "transparent" results have real alpha. Check the edges on light and dark grounds, and never chroma-key a fake transparency.
- **Size:** at least 1.5× the largest display size.
- **Fit:** the medium, palette and light match the comp and the brand board. Compare side by side.
- **People:** no identifiable real people. Generated people are never presented as real customers or staff.
