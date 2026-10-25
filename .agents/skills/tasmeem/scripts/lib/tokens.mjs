// Token inventory: custom properties, their uses, raw values outside token files, font families, radii.
import { parseCss, styleBlocks } from './css.mjs'
import { COLOR_RE } from './color.mjs'
import { read, rel, STYLE_EXT, MARKUP_EXT } from './util.mjs'
import { extname } from 'node:path'

export function inventory(files, { root = process.cwd() } = {}) {
  const defs = new Map() // --name -> [{file, line, value, selector}]
  const uses = new Map()
  const raw = [] // raw colours outside token definitions
  const fonts = new Map()
  const radii = new Map()
  const sizes = new Map()
  for (const f of files) {
    const ext = extname(f).toLowerCase()
    const text = read(f)
    const chunks = STYLE_EXT.has(ext) ? [{ css: text, line: 1 }] : MARKUP_EXT.has(ext) ? styleBlocks(text) : []
    for (const m of text.matchAll(/var\((--[\w-]+)/g)) uses.set(m[1], (uses.get(m[1]) || 0) + 1)
    for (const c of chunks) {
      const { rules } = parseCss(c.css, c.line)
      for (const r of rules) for (const d of r.decls) {
        const where = { file: rel(f, root), line: d.line, selector: r.selector }
        if (d.prop.startsWith('--')) { if (!defs.has(d.prop)) defs.set(d.prop, []); defs.get(d.prop).push({ ...where, value: d.value }); continue }
        if (/font-family/.test(d.prop)) bump(fonts, d.value.split(',')[0].trim().replace(/^["']|["']$/g, ''))
        if (d.prop === 'border-radius' && !/var\(/.test(d.value)) bump(radii, d.value)
        if (d.prop === 'font-size' && !/var\(/.test(d.value)) bump(sizes, d.value)
        const colors = d.value.match(COLOR_RE)
        if (colors && !/var\(/.test(d.value)) raw.push({ ...where, prop: d.prop, value: d.value })
      }
    }
  }
  const unused = [...defs.keys()].filter((k) => !uses.has(k))
  return {
    tool: 'tokens',
    tokens: Object.fromEntries([...defs].map(([k, v]) => [k, { value: v[0].value, definedIn: v.map((x) => `${x.file}:${x.line}`), uses: uses.get(k) || 0 }])),
    unusedTokens: unused,
    rawColours: raw.slice(0, 300),
    fonts: Object.fromEntries(fonts), radii: Object.fromEntries(radii), fontSizes: Object.fromEntries(sizes),
  }
}
const bump = (m, k) => m.set(k, (m.get(k) || 0) + 1)
