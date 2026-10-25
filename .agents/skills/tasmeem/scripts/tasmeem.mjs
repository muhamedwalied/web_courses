#!/usr/bin/env node
// tasmeem CLI: measure design tells, check scripts and contrast, bridge to Higgsfield. Node 18+, no dependencies.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { parseArgs, collectFiles, printHuman } from './lib/util.mjs'
import { scanFiles } from './lib/scan.mjs'
import { checkBuilt } from './lib/built.mjs'
import { checkRender } from './lib/render.mjs'
import { buildReport, toMarkdown } from './lib/report.mjs'
import { inventory } from './lib/tokens.mjs'
import { paletteOf } from './lib/palette.mjs'
import { parseColor, contrast, rgbToOklch, fmtOklch } from './lib/color.mjs'
import { context } from './lib/context.mjs'
import * as higgs from './lib/higgs.mjs'

const HELP = `tasmeem · design tells, writing systems, contrast, assets

  context [--target dir]                 project brief, scripts present, tools available
  scan <paths…> [--json] [--content]     source tells (CSS, JSX/TSX, HTML, Vue, Svelte, Astro)
  built <dir> [--json]                   built HTML with local stylesheets inlined
  render <url> [--widths 360,768,1024,1440] [--motion] [--out dir] [--json]
  contrast <fg> <bg>                     WCAG ratio (hex, rgb(), hsl(), oklch())
  tokens <paths…>                        custom properties, raw values, fonts, radii (JSON)
  palette <image.png> [--k 6]            dominant colours in OKLCH
  report <result.json…> [--design DESIGN.md] [--product PRODUCT.md] [--out file.md] [--json]
  higgs doctor | cost | gen              Higgsfield bridge (cost gate, provenance sidecars)
      cost --model gpt_image_2_5 --prompt-file p.txt [--aspect 16:9 --resolution 2k --quality high]
      gen  --model … --prompt-file … --out public/plates/x.png [--ref crop.png] [--background transparent]
           --budget <credits> | --yes    (refuses to spend without one of them)

Exit codes: 0 clean · 1 findings at P0 (scan/built/render/report) · 2 usage or environment error.`

async function main() {
  const [cmd, ...rest] = process.argv.slice(2)
  const a = parseArgs(rest)
  const emit = (res) => {
    const text = a.json ? JSON.stringify(res, null, 2) : printHuman(res)
    if (a.out && cmd !== 'render') { mkdirSync(dirname(resolve(a.out)), { recursive: true }); writeFileSync(a.out, text + '\n') }
    else console.log(text)
    return res.findings && res.findings.some((f) => f.severity === 'P0') ? 1 : 0
  }
  switch (cmd) {
    case 'context': console.log(await context(a.target || a._[0] || '.')); return 0
    case 'scan': {
      if (!a._.length) return usage('scan needs paths')
      const files = collectFiles(a._, { includeContent: !!a.content })
      const res = scanFiles(files)
      return emit({ tool: 'scan', scanned: files.length, ...res })
    }
    case 'built': {
      if (!a._[0]) return usage('built needs a directory')
      return emit(checkBuilt(a._[0]))
    }
    case 'render': {
      if (!a._[0]) return usage('render needs a URL')
      const widths = String(a.widths || '360,768,1024,1440').split(',').map(Number).filter(Boolean)
      const res = await checkRender(a._[0], { widths, motion: !!a.motion, out: a.out || '.tasmeem/render', screenshots: a.screenshots !== 'false', from: a.from })
      if (res.error) { console.error(res.message); if (a.json) console.log(JSON.stringify(res, null, 2)); return 2 }
      console.log(a.json ? JSON.stringify(res, null, 2) : printHuman(res))
      return res.findings.some((f) => f.severity === 'P0') ? 1 : 0
    }
    case 'contrast': {
      const [f, b] = a._.map(parseColor)
      if (!f || !b) return usage('contrast needs two colours')
      const r = contrast(f, b)
      console.log(`${r.toFixed(2)}:1 · normal text ${r >= 4.5 ? 'PASS' : 'FAIL'} (4.5) · large text ${r >= 3 ? 'PASS' : 'FAIL'} (3.0) · ${fmtOklch(rgbToOklch(f))} on ${fmtOklch(rgbToOklch(b))}`)
      return r >= 4.5 ? 0 : 1
    }
    case 'tokens': {
      if (!a._.length) return usage('tokens needs paths')
      console.log(JSON.stringify(inventory(collectFiles(a._)), null, 2)); return 0
    }
    case 'palette': {
      if (!a._[0]) return usage('palette needs a PNG')
      const p = paletteOf(a._[0], Number(a.k) || 6)
      if (a.json) console.log(JSON.stringify(p, null, 2))
      else for (const c of p) console.log(`${c.hex}  ${c.oklch}  ${(c.share * 100).toFixed(1)}%`)
      return 0
    }
    case 'report': {
      if (!a._.length) return usage('report needs result JSON files')
      const results = a._.map((f) => JSON.parse(readFileSync(f, 'utf8')))
      const rep = buildReport(results, { design: a.design, product: a.product })
      const text = a.json ? JSON.stringify(rep, null, 2) : toMarkdown(rep, { title: a.title || 'tasmeem report' })
      if (a.out) { mkdirSync(dirname(resolve(a.out)), { recursive: true }); writeFileSync(a.out, text + '\n'); console.log(`${rep.verdict} · P0 ${rep.totals.P0} · P1 ${rep.totals.P1} · P2 ${rep.totals.P2} → ${a.out}`) }
      else console.log(text)
      return rep.verdict === 'FAIL' ? 1 : 0
    }
    case 'higgs': return higgsCmd(a)
    case undefined: case 'help': case '--help': case '-h': console.log(HELP); return 0
    default: return usage(`unknown command: ${cmd}`)
  }
}

async function higgsCmd(a) {
  const sub = a._[0]
  const params = { aspect_ratio: a.aspect, resolution: a.resolution, quality: a.quality, background: a.background, model_type: a['model-type'], colors: a.colors ? String(a.colors).split(',') : undefined }
  const refs = [a.ref, ...(a.refs ? String(a.refs).split(',') : [])].filter(Boolean)
  if (sub === 'doctor') { const d = higgs.doctor(); console.log(JSON.stringify(d, null, 2)); return d.ok ? 0 : 2 }
  if (sub === 'cost') {
    const credits = higgs.cost({ model: a.model || 'gpt_image_2_5', prompt: higgs.readPrompt(a), params, refs })
    console.log(`${a.model || 'gpt_image_2_5'}: ${credits} credits per image`); return 0
  }
  if (sub === 'gen') {
    const r = await higgs.generate({ model: a.model || 'gpt_image_2_5', prompt: higgs.readPrompt(a), params, refs, out: a.out, budget: a.budget, yes: !!a.yes, region: a.region, count: Number(a.count) || 1 })
    console.log(JSON.stringify(r, null, 2)); return r.ok ? 0 : 2
  }
  return usage('higgs doctor | cost | gen')
}

function usage(msg) { console.error(`tasmeem: ${msg}\n\n${HELP}`); return 2 }

main().then((code) => process.exit(code ?? 0), (e) => { console.error(`tasmeem: ${e.message}`); process.exit(2) })
