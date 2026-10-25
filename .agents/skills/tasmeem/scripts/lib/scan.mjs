// Source scanner: code-certain tells, reported with catalog IDs (references/tells/).
import { extname, dirname, join } from 'node:path'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { parseCss, styleBlocks, lineIndex, toPx, trackingEm } from './css.mjs'
import { parseColor, rgbToOklch, hueFamily, isCream, COLOR_RE } from './color.mjs'
import {
  read, rel, STYLE_EXT, MARKUP_EXT, SCRIPT_EXT, CONTENT_EXT, SCRIPTS,
  finding, allowedAt, allowedInFile,
} from './util.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const DATA = JSON.parse(readFileSync(join(HERE, '..', 'data', 'copy-tells.json'), 'utf8'))

const HEADING_SEL = /(^|[\s,>+~])(h[1-3]|\.?[\w-]*(title|headline|heading|hero|display)[\w-]*)(?=$|[\s,:.[>+~])/i
const BODY_SEL = /(^|[\s,>+~])(body|p|html|:root|main|article|\.?[\w-]*(body|prose|text|lead|copy|paragraph)[\w-]*)(?=$|[\s,:.[>+~])/i
const GROUND_SEL = /^(\s*(html|body|:root|main|#root|#__next|\.app|\.page|\.site))\s*$/i
const GROUND_VAR = /^--(bg|background|ground|page|paper|canvas|surface-0|base|body-bg|color-bg|color-background)(-|$)/i
const REVEAL_SEL = /(reveal|fade-?in|fade-?up|slide-?up|animate-on-scroll|aos|scroll-anim|appear|inview|in-view)/i
// Faces drawn for display sizes: letter distinctions (dots, counters) disappear at text sizes.
export const DISPLAY_FACE = /^(kufam|reem kufi( fun| ink)?|lemonada|aref ruqaa( ink)?|rakkas|jomhuria|lalezar|katibeh|mirza|blaka( hollow| ink)?|marhey|qahiri|ruwudu|badeen display|oi|vibes|handjet|[\w -]*\bdisplay\b[\w -]*)$/i
const LAYOUT_PROPS = /^(width|height|top|left|right|bottom|margin|margin-\w+|padding|padding-\w+|inset|inset-\w+|max-height|max-width|min-height|flex-basis)$/
const PHYSICAL_PROPS = /^(margin-left|margin-right|padding-left|padding-right|border-left|border-right|border-left-\w+|border-right-\w+|left|right)$/
const TW_PHYSICAL = /^-?(?:(?:m[lr]|p[lr]|border-[lr]|rounded-[lr]|rounded-[tb][lr]|left|right|space-x)-[\w./[\]-]+|text-left|text-right|float-left|float-right|border-[lr]|rounded-[lr])$/

/**
 * Scan source files.
 * @param {string[]} files absolute paths
 * @param {{root: string}} opts
 */
export function scanFiles(files, { root = process.cwd() } = {}) {
  return scanDocs(files.map((f) => ({ file: f, rel: rel(f, root), text: read(f) })))
}

/** Scan in-memory documents: [{ file, rel, text, ext? }]. */
export function scanDocs(input) {
  const docs = input.map((d) => {
    const ext = d.ext || extname(d.file).toLowerCase()
    return { ...d, ext, lines: d.text.split('\n'), lineOf: lineIndex(d.text), code: blankComments(d.text, ext) }
  })

  // ---- Project signals ----------------------------------------------------
  const all = docs.map((d) => d.text).join('\n')
  const sig = {
    arabic: SCRIPTS.arabic.test(stripCode(all)) || /\blang=["'](ar|fa)/.test(all),
    rtl: /\bdir=["']rtl["']/.test(all) || /\blang=["'](ar|fa)/.test(all),
    reducedMotion: /prefers-reduced-motion|useReducedMotion|reducedMotion|motion-reduce:/.test(all),
    focusVisible: /focus-visible/.test(all),
    motion: /@keyframes|animation(-name)?\s*:|animation-timeline|framer-motion|motion\/react|\bgsap\b|\banimate-(?!none)[\w-]+|view-transition|\.animate\(\s*\[/.test(all),
    tokens: /(^|[\s{;])--[\w-]+\s*:/.test(all),
    langScopedReset: /:lang\((ar|fa)[^)]*\)[^{]*\{[^}]*letter-spacing\s*:\s*(0|normal)/s.test(all),
  }
  sig.rtl = sig.rtl || sig.arabic

  const out = []
  const push = (doc, id, severity, line, message, evidence, extra) => {
    if (doc && (allowedInFile(doc.text, id) || (line && allowedAt(doc.lines, line, id)))) return
    out.push(finding(id, severity, { file: doc ? doc.rel : undefined, line }, message, { channel: 'scan', ...(evidence ? { evidence } : {}), ...extra }))
  }

  const fontFamiliesUsed = new Map() // first family -> count
  const fontFacesDeclared = new Set()
  const iconLibs = new Set()
  const revealCounts = new Map()
  let colorLiteralFiles = 0

  for (const doc of docs) {
    const isStyle = STYLE_EXT.has(doc.ext)
    const isMarkup = MARKUP_EXT.has(doc.ext)
    const isScript = SCRIPT_EXT.has(doc.ext)
    const isContent = CONTENT_EXT.has(doc.ext)

    // ---- CSS ---------------------------------------------------------------
    const chunks = []
    if (isStyle) chunks.push({ css: doc.text, line: 1 })
    if (isMarkup) chunks.push(...styleBlocks(doc.text))
    if (isMarkup || isScript) for (const m of doc.text.matchAll(/css`([\s\S]*?)`/g)) chunks.push({ css: m[1], line: doc.lineOf(m.index) })
    for (const chunk of chunks) {
      let parsed
      try { parsed = parseCss(chunk.css, chunk.line) } catch { continue }
      cssRules(doc, parsed, sig, push, { fontFamiliesUsed, fontFacesDeclared })
      if (!/tokens?|theme|variables|globals?/i.test(doc.rel)) {
        const lits = (chunk.css.match(COLOR_RE) || []).length
        if (lits > 12) colorLiteralFiles++
      }
    }

    // ---- Markup and class strings -----------------------------------------
    if (isMarkup || isScript) {
      markupRules(doc, sig, push, { iconLibs, revealCounts })
      tailwindRules(doc, sig, push)
    }
    if (isMarkup || isScript) jsRules(doc, sig, push)

    // ---- Words ---------------------------------------------------------------
    copyRules(doc, sig, push, { isContent })

    for (const m of doc.text.matchAll(/next\/font\/google['"][\s\S]{0,5}|import\s*\{([^}]+)\}\s*from\s*['"]next\/font\/google['"]/g)) {
      if (m[1]) for (const name of m[1].split(',')) fontFacesDeclared.add(name.trim().replace(/_/g, ' ').toLowerCase())
    }
    for (const m of doc.text.matchAll(/fonts\.googleapis\.com\/css2?\?family=([^"'&]+)/g)) fontFacesDeclared.add(decodeURIComponent(m[1]).split(':')[0].replace(/\+/g, ' ').toLowerCase())
  }

  // ---- Project-level ---------------------------------------------------------
  if (sig.motion && !sig.reducedMotion) push(null, 'MO-05', 'P0', undefined, 'motion exists but no prefers-reduced-motion path anywhere')
  if (/outline\s*:\s*(none|0)\b|\boutline-none\b/.test(all) && !sig.focusVisible) push(null, 'QA-02', 'P0', undefined, 'outline removed and no :focus-visible replacement anywhere')
  if (iconLibs.size > 1) push(null, 'SY-05', 'P2', undefined, `several icon families: ${[...iconLibs].join(', ')}`)
  for (const [cls, n] of revealCounts) if (n >= 6) push(null, 'MO-01', 'P1', undefined, `the same entrance "${cls}" on ${n} elements`)
  const families = [...fontFamiliesUsed.keys()].filter((f) => !/^(var|inherit|initial|unset|serif|sans-serif|monospace|ui-|system)/.test(f))
  const overused = families.filter((f) => DATA.overusedFonts.includes(f))
  if (families.length && families.length === overused.length) push(null, 'TY-01', 'P1', undefined, `only overused families in use: ${families.join(', ')}`)
  const cluster = families.filter((f) => DATA.tastefulCluster.includes(f))
  if (cluster.length) push(null, 'TY-02', 'P1', undefined, `tasteful-default families: ${cluster.join(', ')} (keep only with a written reason)`)
  if (fontFacesDeclared.size || /@font-face/.test(all)) {
    const system = /^(serif|sans-serif|monospace|cursive|system-ui|ui-[\w-]+|-apple-system|blinkmacsystemfont|segoe ui|roboto|arial|helvetica|helvetica neue|georgia|times new roman|courier new|menlo|consolas|tahoma|noto color emoji|apple color emoji|segoe ui emoji)$/
    const faces = new Set([...fontFacesDeclared, ...[...all.matchAll(/font-family\s*:\s*["']?([^"';,}]+)["']?\s*;[^}]*src\s*:/g)].map((m) => m[1].trim().toLowerCase())])
    for (const f of families) if (!system.test(f) && !faces.has(f) && ![...faces].some((x) => x.includes(f) || f.includes(x))) push(null, 'TY-17', 'P1', undefined, `"${f}" is named in CSS but never loaded here (verify with render)`)
  }
  if (sig.tokens && colorLiteralFiles > 0) push(null, 'CO-16', 'P1', undefined, `${colorLiteralFiles} non-token file(s) with many raw colour literals`)

  return { findings: aggregate(out), meta: { signals: sig, fontFamilies: families } }
}

// ---------------------------------------------------------------------------
function cssRules(doc, parsed, sig, push, acc) {
  for (const rule of parsed.rules) {
    const sel = rule.selector
    const inReduce = rule.at.some((a) => /prefers-reduced-motion\s*:\s*reduce/.test(a))
    if (rule.at.some((a) => /@media\s+print/.test(a))) continue
    const inKeyframes = rule.at.some((a) => /^@(-webkit-)?keyframes/.test(a))
    const langScoped = /:lang\(|\[lang|\[dir=|:dir\(/.test(sel)
    const decl = Object.fromEntries(rule.decls.map((d) => [d.prop, d.value]))
    for (const d of rule.decls) {
      const v = d.value
      const vl = v.toLowerCase()
      const L = d.line

      // Colour
      if (/gradient\(/.test(vl) && !/repeating-/.test(vl)) {
        const fams = colorFamilies(v)
        if (fams.has('violet') && (fams.has('blue') || fams.has('cyan'))) push(doc, 'CO-01', 'P0', L, 'purple-to-blue gradient', v)
      }
      if (/^(-webkit-)?background-clip$/.test(d.prop) && vl.includes('text')) push(doc, 'CO-05', 'P0', L, 'gradient text (background-clip: text)', sel)
      if ((d.prop === 'box-shadow' || d.prop === 'filter') && glowShadow(v)) push(doc, 'CO-06', 'P1', L, 'coloured glow shadow', v)
      if (/radial-gradient\(/.test(vl) && /background/.test(d.prop) && /(circle|ellipse)?[^,]*at /.test(vl) && !/repeating/.test(vl)) push(doc, 'CO-07', 'P2', L, 'radial halo or spotlight background', v)
      if (d.prop === 'filter' && /blur\((\d+)px\)/.test(vl) && parseInt(vl.match(/blur\((\d+)px\)/)[1]) >= 40) push(doc, 'CO-07', 'P1', L, 'large blurred shape (blob/orb)', v)
      if (/^repeating-(linear|radial)-gradient/.test(vl) || /repeating-linear-gradient\(/.test(vl)) push(doc, 'CO-13', 'P2', L, 'repeating stripes', sel)
      if (/border-image/.test(d.prop) && /gradient\(/.test(vl)) push(doc, 'CO-12', 'P1', L, 'gradient border', v)
      if ((GROUND_SEL.test(sel) && /^background(-color)?$/.test(d.prop)) || (GROUND_VAR.test(d.prop))) {
        const c = firstColor(v)
        if (c && isCream(rgbToOklch(c))) push(doc, 'CO-03', 'P1', L, 'cream/sand ground (allowed if DESIGN.md owns it)', `${d.prop}: ${v}`)
      }
      if (/^(color|background(-color)?)$/.test(d.prop) && /^(#000|#000000|black)$/.test(vl.trim())) push(doc, 'CO-09', 'P2', L, 'pure black', sel)
      if (/^(color|background(-color)?|border(-color)?|outline-color|fill|stroke|--[\w-]+)$/.test(d.prop)) {
        const c = firstColor(v)
        if (c && ['#6366f1', '#4f46e5', '#4338ca', '#7c3aed', '#8b5cf6', '#a855f7', '#6d28d9', '#818cf8'].includes(toHex6(c))) push(doc, 'CO-02', 'P1', L, 'framework indigo/violet as a colour', v)
      }

      // Type
      if (d.prop === 'letter-spacing') {
        const em = trackingEm(v, toPx(decl['font-size']) || 16)
        if (em !== null && em < -0.04 && HEADING_SEL.test(sel)) push(doc, 'TY-09', 'P1', L, `crushed tracking ${v}`, sel)
        if (em !== null && em > 0.05 && BODY_SEL.test(sel) && !/uppercase/.test(decl['text-transform'] || '')) push(doc, 'TY-10', 'P1', L, `wide tracking on body text ${v}`, sel)
        if (sig.arabic && em !== null && em !== 0 && !langScoped) push(doc, 'SC-01', 'P1', L, `letter-spacing ${v} can reach Arabic text (confirm with render; reset under :lang(ar))`, sel, { confirm: 'render' })
        if (/:lang\((ar|fa)|\[lang[|^]?=["']?(ar|fa)/.test(sel) && em !== null && em !== 0) push(doc, 'SC-01', 'P0', L, `letter-spacing ${v} set on Arabic`, sel)
      }
      if (d.prop === 'font-style' && /italic|oblique/.test(vl)) {
        if (HEADING_SEL.test(sel)) push(doc, 'TY-03', 'P1', L, 'italic display type', sel)
        if (/:lang\((ar|fa)/.test(sel)) push(doc, 'SC-02', 'P1', L, 'italic on a script without italics', sel)
        else if (sig.arabic && !/:lang\(en/.test(sel) && !/\b(em|i|cite|blockquote)\b/.test(sel)) push(doc, 'SC-02', 'P1', L, 'italic can reach Arabic text (confirm with render)', sel, { confirm: 'render' })
      }
      if (d.prop === 'text-transform' && vl === 'uppercase' && /(^|[\s,])(p|body|\.?[\w-]*(body|prose|paragraph|copy))(?=$|[\s,:.])/i.test(sel)) push(doc, 'TY-11', 'P1', L, 'uppercase body text', sel)
      if (d.prop === 'font-family' || (/^--font/.test(d.prop) && /["',]/.test(v))) {
        const first = v.split(',')[0].trim().replace(/^["']|["']$/g, '').toLowerCase()
        if (sel.startsWith('@font-face')) { acc.fontFacesDeclared.add(first); continue }
        acc.fontFamiliesUsed.set(first, (acc.fontFamiliesUsed.get(first) || 0) + 1)
        if (/monospace|mono\b|courier|consolas|menlo/.test(vl) && BODY_SEL.test(sel) && !/code|pre|kbd|samp/.test(sel)) push(doc, 'TY-14', 'P1', L, 'monospace body text', sel)
        const size = toPx(decl['font-size'] || '')
        if (DISPLAY_FACE.test(first) && size !== null && size < 20) push(doc, 'TY-24', 'P1', L, `display face "${first}" at ${size}px (keep display faces at 24px and up)`, sel)
      }
      if (d.prop === 'line-height') {
        const n = parseFloat(v)
        const unitless = /^[\d.]+$/.test(v.trim())
        if (unitless && n < 1.35 && BODY_SEL.test(sel) && !HEADING_SEL.test(sel)) push(doc, 'TY-12', 'P0', L, `body line-height ${v}`, sel)
        if (unitless && sig.arabic && /:lang\((ar|fa)/.test(sel) && n < 1.5 && !HEADING_SEL.test(sel)) push(doc, 'SC-03', 'P0', L, `Arabic line-height ${v} (floor 1.6 for body)`, sel)
      }
      if (d.prop === 'text-align' && vl === 'justify') push(doc, 'TY-16', 'P2', L, sig.arabic ? 'justified text (Arabic without kashida support leaves rivers)' : 'justified text', sel)
      if (/text-stroke/.test(d.prop) && /transparent/.test(decl.color || decl['-webkit-text-fill-color'] || '')) push(doc, 'TY-23', 'P2', L, 'hollow text', sel)

      // Layout
      if ((d.prop === 'height' || d.prop === 'min-height') && /\b100vh\b/.test(vl)) push(doc, 'LA-20', 'P1', L, '100vh (use svh/dvh)', sel)
      if (d.prop === 'width' && /\b100vw\b/.test(vl)) push(doc, 'LA-20', 'P1', L, '100vw width (causes horizontal scroll next to a scrollbar)', sel)
      if (d.prop === 'grid-template-columns' && /repeat\(\s*\d+\s*,\s*1fr\s*\)/.test(vl)) push(doc, 'LA-19', 'P2', L, 'bare 1fr tracks (use minmax(0, 1fr))', sel)
      if (/background(-image)?/.test(d.prop) && /linear-gradient\([^)]*1px[^)]*transparent 1px/.test(vl)) push(doc, 'LA-21', 'P2', L, 'grid-paper background', sel)
      if (d.prop === 'z-index' && parseInt(v) >= 999) push(doc, 'SY-04', 'P2', L, `z-index ${v}`, sel)

      // Components
      if (d.prop === 'backdrop-filter' || d.prop === '-webkit-backdrop-filter') if (/blur/.test(vl)) push(doc, 'CM-03', 'P1', L, 'backdrop blur', sel)
      if (/^border-(left|right|inline-start|inline-end)(-width)?$/.test(d.prop) || /^border-(left|right|inline-start|inline-end)$/.test(d.prop)) {
        const w = parseFloat((vl.match(/(\d*\.?\d+)px/) || [])[1])
        const c = firstColor(v) || firstColor(decl[`${d.prop.replace(/-width$/, '')}-color`] || '')
        if (w >= 2 && c && rgbToOklch(c).C > 0.05 && !/table|td|th|blockquote|quote/.test(sel)) push(doc, 'CM-04', 'P1', L, `side-stripe accent ${v}`, sel)
      }
      if (d.prop === 'border-radius') { const px = toPx(v.split(/\s+/)[0]); if (px !== null && px >= 24 && px < 999 && /card|panel|box|tile|section|container/.test(sel)) push(doc, 'CM-02', 'P2', L, `radius ${v} on a content box`, sel) }
      if (d.prop === 'box-shadow' && /\b1px solid\b/.test(decl.border || '') && maxBlur(v) >= 24) push(doc, 'CM-06', 'P2', L, 'hairline border plus wide shadow', sel)
      if (d.prop === 'will-change' && !/auto/.test(vl)) push(doc, 'MO-12', 'P2', L, 'will-change left on at rest', sel)

      // Motion
      if (/^transition(-property)?$/.test(d.prop) && /(^|[\s,])all\b/.test(vl)) push(doc, 'MO-03', 'P1', L, 'transition: all', sel)
      if (/^(transition|animation)(-timing-function)?$/.test(d.prop) && bounceCurve(vl)) push(doc, 'MO-02', 'P1', L, 'overshooting easing', v)
      if (/^transition(-property)?$/.test(d.prop)) {
        for (const p of vl.split(',').map((s) => s.trim().split(/\s+/)[0])) if (LAYOUT_PROPS.test(p)) { push(doc, 'MO-04', 'P1', L, `transition on layout property ${p}`, sel); break }
        const ms = durationsMs(vl)
        if (ms.some((x) => x > 400) && !inReduce) push(doc, 'MO-09', 'P2', L, `UI transition ${Math.max(...ms)}ms`, sel)
        if (/\bease-in\b(?!-)/.test(vl)) push(doc, 'MO-09', 'P2', L, 'ease-in on a transition (use ease-out for responses)', sel)
      }
      if (inKeyframes && LAYOUT_PROPS.test(d.prop)) push(doc, 'MO-04', 'P1', L, `keyframes animate ${d.prop}`, rule.at.find((a) => /keyframes/.test(a)))
      if (inKeyframes && d.prop === 'transform' && /scale\(\s*0\s*\)/.test(vl)) push(doc, 'MO-10', 'P2', L, 'animates from scale(0)', rule.at.find((a) => /keyframes/.test(a)))
      if (d.prop === 'opacity' && parseFloat(v) === 0 && REVEAL_SEL.test(sel) && !/:not\(|\[data-motion|\.motion-ok|\.js-motion|:hover|:focus/.test(sel) && !inReduce) push(doc, 'MO-06', 'P0', L, 'content hidden by default until a reveal runs', sel)

      // Writing systems (RTL projects)
      if (sig.rtl && PHYSICAL_PROPS.test(d.prop) && !/^(0|auto|0px)$/.test(vl.trim()) && !langScoped) push(doc, 'SC-05', 'P1', L, `physical ${d.prop} in an RTL project (use the logical property)`, sel)
      if (sig.rtl && d.prop === 'text-align' && /^(left|right)$/.test(vl) && !langScoped) push(doc, 'SC-05', 'P1', L, `text-align: ${vl} in an RTL project (use start/end)`, sel)
      if (sig.rtl && d.prop === 'float' && /^(left|right)$/.test(vl)) push(doc, 'SC-05', 'P1', L, `float: ${vl} in an RTL project`, sel)
      if (sig.arabic && d.prop === 'text-transform' && /uppercase|capitalize/.test(vl) && !/:lang\(en/.test(sel)) push(doc, 'SC-08', 'P2', L, `text-transform: ${vl} may reach Arabic labels`, sel)
    }
  }
}

function markupRules(doc, sig, push, acc) {
  const t = doc.code
  const L = (i) => doc.lineOf(i)
  for (const m of t.matchAll(/<meta[^>]+name=["']viewport["'][^>]*>/gi)) if (/user-scalable\s*=\s*(no|0)|maximum-scale\s*=\s*1(\.0)?\b/i.test(m[0])) push(doc, 'QA-06', 'P0', L(m.index), 'zoom disabled in the viewport meta', m[0])
  for (const m of t.matchAll(/<html\b[^>]*>/gi)) {
    if (!/\blang\s*=/.test(m[0])) push(doc, 'QA-04', 'P0', L(m.index), '<html> without lang', m[0])
    else if (/\blang\s*=\s*\{?["'`]?(ar|fa)/.test(m[0]) && !/\bdir\s*=/.test(m[0])) push(doc, 'SC-05', 'P1', L(m.index), 'RTL language without dir="rtl" on <html>', m[0])
  }
  for (const m of t.matchAll(/<(img|Image)\b(?![^>]*\balt\s*=)[^>]*>/g)) push(doc, 'IG-05', 'P0', L(m.index), `<${m[1]}> without alt`, m[0])
  for (const m of t.matchAll(/<img\b[^>]*\bsrc\s*=\s*["']\s*["'][^>]*>/g)) push(doc, 'IG-04', 'P0', L(m.index), 'image with empty src', m[0])
  for (const host of DATA.placeholderHosts) for (const m of t.matchAll(new RegExp(host.replace(/\./g, '\\.'), 'g'))) push(doc, 'IG-04', 'P0', L(m.index), `placeholder image host ${host}`)
  for (const m of t.matchAll(/\bsrc\s*=\s*["'][^"']+\.gif["']/gi)) push(doc, 'IG-12', 'P2', L(m.index), 'animated GIF (use a muted looping video)', m[0])
  for (const m of t.matchAll(/<meta[^>]+name=["']generator["'][^>]*>|(made|built) with (v0|lovable|bolt|framer|webflow|wix)/gi)) push(doc, 'IG-11', 'P1', L(m.index), 'generator fingerprint', m[0])
  for (const m of t.matchAll(/<(div|span|li|p)\b[^>]*\bonClick\s*=/g)) push(doc, 'QA-09', 'P1', L(m.index), `clickable <${m[1]}> (use <button> or <a>)`)
  for (const m of t.matchAll(/onPaste\s*=\s*\{[^}]*preventDefault/g)) push(doc, 'QA-15', 'P1', L(m.index), 'paste blocked')
  // Headline with one accented word (SD5 / TY-04)
  for (const m of t.matchAll(/<h([1-2])\b[^>]*>((?:(?!<\/h\1>)[\s\S]){0,400})<\/h\1>/g)) {
    const inner = m[2]
    if (!/\.map\(/.test(inner) && (/<(span|strong|b)\b[^>]*(class(Name)?|style)=/.test(inner) || /<(em|mark|i)\b/.test(inner)) && inner.replace(/<[^>]+>/g, '').trim().split(/\s+/).length > 1) push(doc, 'TY-04', 'P1', L(m.index), 'one word styled differently inside the headline', inner.replace(/\s+/g, ' ').slice(0, 90))
    if (/\bitalic\b/.test(m[0])) push(doc, 'TY-03', 'P1', L(m.index), 'italic headline', m[0].slice(0, 90))
  }
  // Eyebrow directly before a heading
  for (const m of t.matchAll(/<(p|span|div|small)\b[^>]*(class|className)=["'`{][^>]*(eyebrow|kicker|overline|pre-?title|subheading|tagline|label)[^>]*>[^<]{1,40}<\/\1>\s*<h[1-3]\b/gi)) push(doc, 'TY-05', 'P1', L(m.index), 'eyebrow label above a heading', m[0].slice(0, 90))
  // Pill badge right before the H1
  for (const m of t.matchAll(/<(span|div|a|p)\b[^>]*(class|className)=["'`{][^>]*\b(badge|pill|chip|announcement)\b[^>]*>[^<]{1,60}<\/\1>\s*(<[^h][^>]*>[^<]*<\/[^>]+>\s*){0,2}<h1\b/gi)) push(doc, 'TY-06', 'P1', L(m.index), 'pill badge above the H1', m[0].slice(0, 90))
  // Numbered section markers
  for (const m of t.matchAll(/>\s*(0[1-9])\s*(?:[·/—–-]|<\/)/g)) push(doc, 'LA-04', 'P1', L(m.index), `numbered marker "${m[1]}" (only for real sequences)`)
  // Fake window chrome (traffic lights)
  if (/#ff5f5[67]|#febc2e|#ffbd2e|#28c840|#27c93f/i.test(t) || /(bg-red-(400|500)[^"'`]*rounded-full[\s\S]{0,200}bg-yellow-(400|500)[\s\S]{0,200}bg-green-(400|500))/.test(t)) push(doc, 'CM-13', 'P1', undefined, 'redrawn window chrome (traffic-light dots)')
  // Effect libraries and icon libraries
  for (const lib of DATA.effectLibraries) { const i = t.indexOf(lib); if (i >= 0 && /import|<[A-Z]/.test(t.slice(Math.max(0, i - 80), i + lib.length))) push(doc, 'CM-10', 'P1', L(i), `effect-library component ${lib}`) }
  for (const m of t.matchAll(/from\s+["']([^"']+)["']/g)) { const lib = DATA.iconLibraries.find((x) => m[1] === x || m[1].startsWith(x + '/')); if (lib) acc.iconLibs.add(lib) }
  // Icon cards: a .map that renders an icon then a heading
  for (const m of t.matchAll(/\.map\(\s*\(?[^)]*\)?\s*=>\s*\(?\s*<[\s\S]{0,600}?<\/(h3|h4)>/g)) {
    const block = m[0]
    if (/(Icon|<svg|icon)/.test(block) && /<h[34]/.test(block) && /<p\b/.test(t.slice(m.index, m.index + 900))) push(doc, 'LA-02', 'P1', L(m.index), 'repeated icon + heading + text cards (check they are not equal-weight boilerplate)')
  }
  // Reveal classes
  // Same declared entrance repeated (an empty data-reveal says nothing about the effect, so it is not counted).
  for (const m of t.matchAll(/(data-aos=["'][\w-]+["']|data-animate=["'][\w-]+["']|whileInView=\{\{[^}]*\}\}|\banimate-fade-?(?:in|up)[\w-]*|className=["'][^"']*\b(?:reveal|fade-?up|fade-?in)\b)/g)) {
    const k = m[1].startsWith('className') ? m[1].match(/\b(reveal|fade-?up|fade-?in)\b/)[1] : m[1]
    acc.revealCounts.set(k, (acc.revealCounts.get(k) || 0) + 1)
  }
  // Directional icons in RTL projects
  if (sig.rtl) for (const m of t.matchAll(/<(ArrowRight|ArrowLeft|ChevronRight|ChevronLeft|MoveRight|ArrowForward|ArrowBack)\w*\b([^>]*)>/g)) if (!/rtl:|scale-x|flip|mirror|dir/.test(m[2])) push(doc, 'SC-06', 'P1', L(m.index), `<${m[1]}> without an RTL mirror`, m[0])
  // Autoplay carousels
  for (const m of t.matchAll(/autoplay\s*[:=]\s*(\{|true|\d)|Autoplay\(/g)) if (!/video|audio/i.test(t.slice(Math.max(0, m.index - 60), m.index))) push(doc, 'CM-17', 'P1', L(m.index), 'auto-advancing carousel (needs pause and reduced-motion stop)')
}

function tailwindRules(doc, sig, push) {
  const t = doc.code
  for (const m of t.matchAll(/(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*`([^`]*)`\s*\}|\{\s*(?:cn|clsx|cx|classNames|twMerge)\(([\s\S]*?)\)\s*\})/g)) {
    const cls = (m[1] ?? m[2] ?? m[3] ?? m[4] ?? '').replace(/["'`]/g, ' ')
    if (!cls.trim()) continue
    const line = doc.lineOf(m.index)
    const has = (re) => re.test(cls)
    if (has(/\b(from|via)-(indigo|violet|purple|fuchsia)-\d/) && has(/\b(to|via)-(blue|sky|cyan)-\d/)) push(doc, 'CO-01', 'P0', line, 'purple-to-blue gradient (Tailwind)', cls)
    if (has(/\bbg-clip-text\b/) && has(/\bbg-gradient-to-|\bbg-linear-/)) push(doc, 'CO-05', 'P0', line, 'gradient text (Tailwind)', cls)
    if (has(/\b(bg|text|ring|border)-(indigo|violet)-(500|600)\b/)) push(doc, 'CO-02', 'P1', line, 'framework indigo/violet', cls)
    if (has(/\bshadow-(\w+)-(400|500|600)\/\d+/) || has(/\bshadow-\[0_0_\d{2,}px/)) push(doc, 'CO-06', 'P1', line, 'coloured glow shadow (Tailwind)', cls)
    if (has(/\bblur-(2xl|3xl)\b/) && has(/\brounded-full\b/)) push(doc, 'CO-07', 'P1', line, 'blurred orb (Tailwind)', cls)
    if (has(/\buppercase\b/) && has(/\btracking-(wide|wider|widest|\[0\.[1-9])/) && has(/\btext-(xs|sm)\b/)) push(doc, 'TY-05', 'P1', line, 'eyebrow style (small tracked caps)', cls)
    if (has(/\brounded-full\b/) && has(/\b(px-3|px-4)\b/) && has(/\b(text-xs|text-sm)\b/) && /<h1\b/.test(t.slice(m.index, m.index + 700))) push(doc, 'TY-06', 'P1', line, 'pill badge above the H1', cls)
    if (has(/\bh-screen\b/) || has(/\bmin-h-screen\b/)) push(doc, 'LA-20', 'P1', line, 'h-screen (use svh/dvh)', cls)
    if (has(/\bw-screen\b/)) push(doc, 'LA-20', 'P1', line, 'w-screen width', cls)
    if (has(/\bbackdrop-blur/)) push(doc, 'CM-03', 'P1', line, 'backdrop blur (Tailwind)', cls)
    if (has(/\bborder-[lrse]-(2|4|8)\b/) && has(/\bborder-[lrse]?-?(\w+)-(300|400|500|600)\b/)) push(doc, 'CM-04', 'P1', line, 'side-stripe accent (Tailwind)', cls)
    if (has(/\brounded-(lg|xl|2xl)\b/) && has(/\bbg-\w+-(50|100)\b|\bbg-\w+-500\/10\b/) && has(/\b(p-2|p-2\.5|p-3)\b/) && has(/\b(w|h|size)-(8|10|12)\b/)) push(doc, 'CM-05', 'P1', line, 'icon in a tinted chip', cls)
    if (has(/\brounded-(2xl|3xl)\b/) && has(/\bshadow-(lg|xl|2xl)\b/)) push(doc, 'CM-02', 'P2', line, 'rounded-2xl + shadow-lg', cls)
    if (has(/\btransition-all\b/)) push(doc, 'MO-03', 'P1', line, 'transition-all', cls)
    if (has(/\bhover:scale-1(05|10)\b/)) push(doc, 'MO-07', 'P2', line, 'hover scale', cls)
    if (has(/\banimate-(pulse|ping)\b/) && has(/\brounded-full\b/) && has(/\b(w|h|size)-(1|1\.5|2|2\.5|3)\b/)) push(doc, 'MO-08', 'P2', line, 'pulsing dot', cls)
    if (has(/\banimate-bounce\b/)) push(doc, 'MO-02', 'P2', line, 'bounce animation', cls)
    if (has(/\boutline-none\b/) && !has(/focus-visible:/)) push(doc, 'QA-02', 'P1', line, 'outline-none without focus-visible here', cls)
    if (has(/\bz-\[?(999|9999|99999)\]?/)) push(doc, 'SY-04', 'P2', line, 'z-index 999+', cls)
    if (sig.arabic && has(/\btracking-(tight|tighter|wide|wider|widest|\[)/) && SCRIPTS.arabic.test(t.slice(m.index, m.index + 400))) push(doc, 'SC-01', 'P0', line, 'tracking utility next to Arabic text', cls)
    if (sig.arabic && has(/(^|\s)italic\b/) && SCRIPTS.arabic.test(t.slice(m.index, m.index + 300))) push(doc, 'SC-02', 'P1', line, 'italic next to Arabic text', cls)
    if (sig.rtl) {
      const phys = cls.split(/\s+/).filter((tok) => {
        const parts = tok.split(':')
        if (parts.slice(0, -1).some((v) => v === 'rtl' || v === 'ltr')) return false
        return TW_PHYSICAL.test(parts[parts.length - 1])
      })
      if (phys.length) push(doc, 'SC-05', 'P1', line, `physical utilities in an RTL project: ${[...new Set(phys)].slice(0, 4).join(' ')}`, cls)
    }
  }
}

function jsRules(doc, sig, push) {
  const t = doc.code
  const L = (i) => doc.lineOf(i)
  for (const m of t.matchAll(/initial=\{\{[^}]*opacity:\s*0[\s\S]{0,200}?whileInView/g)) push(doc, 'MO-06', 'P0', L(m.index), 'opacity 0 until whileInView: server HTML ships invisible content')
  for (const m of t.matchAll(/bounce:\s*0?\.[1-9]|type:\s*["']spring["'][^}]*damping:\s*[1-9]\b(?!\d)|ease:\s*["'](backOut|backInOut|anticipate)["']|elastic\.|back\.out|bounce\.out/g)) push(doc, 'MO-02', 'P1', L(m.index), 'overshooting motion', m[0])
  for (const m of t.matchAll(/addEventListener\(\s*["']scroll["'][^)]*\)/g)) if (!/passive\s*:\s*true/.test(m[0]) || /getBoundingClientRect|offsetTop|scrollTop/.test(t.slice(m.index, m.index + 600))) push(doc, 'MO-17', 'P1', L(m.index), 'scroll listener doing work on the main thread (prefer CSS scroll timelines or IntersectionObserver)')
  for (const m of t.matchAll(/getMonth\(\)\s*\+\s*1|["'`]\s*\$\s*["'`]\s*\+|\+\s*["'`]\s*(SAR|\u0631\.\u0633|USD|EUR)\s*["'`]/g)) push(doc, 'QA-10', 'P1', L(m.index), 'hand-built date or currency (use Intl)', m[0])
  for (const m of t.matchAll(/\b(react-countup|CountUp|useCountUp)\b/g)) push(doc, 'MO-11', 'P2', L(m.index), 'count-up numbers')
}

function copyRules(doc, sig, push, { isContent }) {
  const strings = extractStrings(doc)
  const owner = isContent || /(^|\/)(content|data|messages|locales|i18n|posts|copy)\//.test(doc.rel)
  const sev = (s) => (owner && s !== 'P0' ? 'P2' : s)
  const tag = owner ? ' (content file: if the owner wrote it, leave it)' : ''
  const faDoc = /\blang=["']fa/.test(doc.text)
  let dashes = 0
  let firstDash = 0
  for (const s of strings) {
    const text = s.text
    const isAr = SCRIPTS.arabic.test(text)
    const norm = isAr ? stripTashkeel(text) : text.toLowerCase()
    for (const [lang, lists] of Object.entries(DATA)) {
      if (lang.length !== 2) continue
      if ((lang === 'ar' || lang === 'fa') !== isAr) continue
      for (const [id, phrases] of Object.entries(lists)) {
        for (const p of phrases) {
          const hit = p.includes('.*') ? new RegExp(p, 'i').test(norm) : norm.includes(isAr ? stripTashkeel(p) : p)
          if (!hit) continue
          const base = id === 'CP-08' ? 'P0' : id === 'CP-06' || id === 'CP-09' || id === 'CP-16' ? 'P2' : 'P1'
          push(doc, id, sev(base), s.line, `"${p}"${tag}`, text.slice(0, 80))
          break
        }
      }
    }
    if (/—/.test(text)) { dashes += (text.match(/—/g) || []).length; firstDash ||= s.line }
    if (/\p{Extended_Pictographic}/u.test(text) && !/[©®™]/.test(text)) push(doc, 'CP-13', sev('P1'), s.line, `emoji in interface text${tag}`, text.slice(0, 60))
    if (sig.rtl && isAr && /[a-z\u0600-\u06FF]\s*→|→\s*$/.test(text)) push(doc, 'CP-10', 'P1', s.line, 'right-pointing arrow in Arabic text (forward is ←)', text.slice(0, 60))
    if (isAr && arabicShare(text) > 0.6 && /[\u0600-\u06FF]\s?[?;,](\s|$)/.test(text)) push(doc, 'SC-09', 'P2', s.line, 'Latin punctuation in Arabic text (use \u061F \u060C \u061B)', text.slice(0, 60))
    if (isAr && /[\u064a\u0643]/.test(text) && (faDoc ? true : count(text, /[\u067e\u0686\u0698\u06af\u06cc\u06a9]/g) > count(text, /[\u064a\u0643]/g))) push(doc, 'SC-09', 'P2', s.line, 'Arabic \u064a/\u0643 inside Persian text (use \u06cc/\u06a9)', text.slice(0, 60))
    if (isAr && (/\u0640{2,}/.test(text) || /[\u0621-\u064a]\u0640+[\u0621-\u064a]/.test(text))) push(doc, 'SC-16', 'P2', s.line, 'tatweel used for stretching', text.slice(0, 60))
    if (/[0-9]/.test(text) && /[\u0660-\u0669\u06F0-\u06F9]/.test(text)) push(doc, 'SC-07', 'P1', s.line, 'Western and Arabic-Indic digits in one string', text.slice(0, 60))
    if (/\b(\d{1,3}(,\d{3})+|\d+(\.\d+)?[kKmM]\+?)\s+(users|customers|teams|companies|downloads|clients)\b|\b99\.9+%|\b\d+(\.\d)?\/5\b|\btrusted by\b|\u0623\u0643\u062B\u0631 \u0645\u0646\s+[\d\u0660-\u0669]+\s+(\u0639\u0645\u064A\u0644|\u0645\u0633\u062A\u062E\u062F\u0645)/i.test(text)) push(doc, 'CP-07', owner ? 'P2' : 'P1', s.line, 'a metric or social proof: confirm the owner supplied it', text.slice(0, 80))
  }
  if (dashes >= 3 && !owner) push(doc, 'CP-05', 'P1', firstDash, `${dashes} em dashes in interface strings`)
}

// ---- helpers ---------------------------------------------------------------
function extractStrings(doc) {
  const out = []
  const t = doc.text
  const add = (text, index) => { text = text.replace(/\s+/g, ' ').trim(); if (text.length >= 3 && /\p{L}/u.test(text)) out.push({ text, line: doc.lineOf(index) }) }
  if (CONTENT_EXT.has(doc.ext)) {
    if (doc.ext === '.json') for (const m of t.matchAll(/:\s*"((?:[^"\\]|\\.){3,})"/g)) { if (/\s/.test(m[1])) add(m[1], m.index) }
    else for (const m of t.matchAll(/^(?!\s*(```|#!|import|export))(.{3,})$/gm)) add(m[2], m.index)
    return out
  }
  const code = doc.code || t
  if (MARKUP_EXT.has(doc.ext)) {
    const isJsx = doc.ext !== '.html' && doc.ext !== '.htm'
    const noStyle = code.replace(/<(style|script)\b[\s\S]*?<\/\1>/gi, (m) => m.replace(/[^\n]/g, ' '))
    for (const m of noStyle.matchAll(/>([^<>{}]{3,})</g)) {
      // In JSX/TS, `>…<` also spans generics and comparisons; skip anything that reads as code.
      if (isJsx && (/[=;[\]]|=>|&&|\|\||\b(const|let|return|import|export|function)\b/.test(m[1]) || /^\s*\(/.test(m[1]))) continue
      add(m[1], m.index)
    }
    for (const m of noStyle.matchAll(/\b(alt|title|aria-label|placeholder|content|label)\s*=\s*["']([^"']{3,})["']/g)) add(m[2], m.index)
  }
  if (SCRIPT_EXT.has(doc.ext) || MARKUP_EXT.has(doc.ext)) {
    for (const m of code.matchAll(/(["'`])((?:(?!\1)[^\\\n$]|\\.){6,})\1/g)) {
      const s = m[2]
      if (/^(\.|\/|@|#|https?:|[\w-]+\/|[\w.-]+\.(js|ts|css|png|svg|webp|jpg|json)$)/.test(s)) continue
      if (/^[\w-]+(\s[\w:/[\]().-]+)*$/.test(s) && !/\s\w+\s/.test(s) && !SCRIPTS.arabic.test(s)) continue // class lists, identifiers
      if (/[{}<>;=]/.test(s)) continue
      if (!/\s/.test(s) && !SCRIPTS.arabic.test(s)) continue
      add(s, m.index)
    }
  }
  return out
}

/** Replace comments with spaces, keeping offsets and line numbers. */
function blankComments(text, ext) {
  const blank = (m) => m.replace(/[^\n]/g, ' ')
  let out = text.replace(/<!--[\s\S]*?-->/g, blank)
  if (ext !== '.html' && ext !== '.htm' && !CONTENT_EXT.has(ext)) {
    out = out.replace(/\{\/\*[\s\S]*?\*\/\}/g, blank).replace(/\/\*[\s\S]*?\*\//g, blank)
    out = out.replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length))
  }
  return out
}

const count = (s, re) => (s.match(re) || []).length

function arabicShare(s) {
  const ar = (s.match(/[\u0600-\u06FF]/g) || []).length
  const lat = (s.match(/[A-Za-z]/g) || []).length
  return ar / Math.max(1, ar + lat)
}

const stripTashkeel = (s) => s.replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[\u0623\u0625\u0622]/g, '\u0627')
const stripCode = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')

function colorFamilies(v) {
  const fams = new Set()
  for (const m of v.matchAll(COLOR_RE)) { const c = parseColor(m[0]); if (c && c.a > 0.2) fams.add(hueFamily(rgbToOklch(c))) }
  for (const w of v.toLowerCase().matchAll(/\b(indigo|violet|purple|blue|cyan)\b/g)) fams.add(w[1] === 'indigo' || w[1] === 'purple' ? 'violet' : w[1])
  return fams
}
function firstColor(v) { const m = String(v).match(COLOR_RE); return m ? parseColor(m[0]) : null }
function toHex6(c) { return '#' + [c.r, c.g, c.b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('') }
function maxBlur(v) { let max = 0; for (const part of v.split(/,(?![^(]*\))/)) { const nums = part.match(/-?\d*\.?\d+px/g) || []; if (nums[2]) max = Math.max(max, parseFloat(nums[2])) } return max }
function glowShadow(v) {
  for (const part of v.split(/,(?![^(]*\))/)) {
    const nums = part.match(/-?\d*\.?\d+px/g) || []
    const blur = nums[2] ? parseFloat(nums[2]) : nums.length === 1 ? parseFloat(nums[0]) : 0
    const c = firstColor(part)
    if (blur >= 16 && c && c.a >= 0.25 && rgbToOklch(c).C >= 0.1) return true
  }
  return false
}
function bounceCurve(v) {
  for (const m of v.matchAll(/cubic-bezier\(([^)]+)\)/g)) { const p = m[1].split(',').map(parseFloat); if (p[1] < -0.05 || p[1] > 1.05 || p[3] < -0.05 || p[3] > 1.05) return true }
  return false
}
function durationsMs(v) { return [...v.matchAll(/(\d*\.?\d+)(ms|s)\b/g)].map((m) => (m[2] === 's' ? parseFloat(m[1]) * 1000 : parseFloat(m[1]))) }

/** Collapse repeated findings of one ID in one file into a single entry with a count. */
function aggregate(list) {
  const map = new Map()
  const out = []
  for (const f of list) {
    const key = `${f.id}|${f.file || ''}|${f.message.replace(/[\d.]+(px|em|ms|%)?/g, '#')}`
    const prev = map.get(key)
    if (prev) { prev.count = (prev.count || 1) + 1; if (prev.lines.length < 8 && f.line) prev.lines.push(f.line); continue }
    const g = { ...f, count: 1, lines: f.line ? [f.line] : [] }
    map.set(key, g)
    out.push(g)
  }
  return out
}
