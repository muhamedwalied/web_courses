// Built-output check: HTML files with their local stylesheets inlined, then the source rules plus
// document-level checks that only make sense on a whole page.
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, resolve, dirname, extname } from 'node:path'
import { scanDocs } from './scan.mjs'
import { rel, finding } from './util.mjs'

export function checkBuilt(dir, { root = process.cwd(), max = 200 } = {}) {
  const base = resolve(root, dir)
  const pages = []
  const walk = (p) => {
    for (const name of readdirSync(p)) {
      const f = join(p, name)
      const st = statSync(f)
      if (st.isDirectory()) { if (!/^(node_modules|\.git|_next\/static\/chunks)$/.test(name)) walk(f) }
      else if (extname(f).toLowerCase() === '.html') pages.push(f)
    }
  }
  walk(base)
  const docs = []
  const extra = []
  const cssCache = new Map()
  for (const page of pages.slice(0, max)) {
    let html = readFileSync(page, 'utf8')
    let missing = 0
    html = html.replace(/<link\b[^>]*rel=["']?stylesheet["']?[^>]*>/gi, (tag) => {
      const href = (tag.match(/href=["']([^"']+)["']/) || [])[1]
      if (!href || /^https?:|^\/\//.test(href)) { missing++; return tag }
      const file = href.startsWith('/') ? join(base, href.split('?')[0]) : resolve(dirname(page), href.split('?')[0])
      if (!existsSync(file)) { missing++; return tag }
      if (!cssCache.has(file)) cssCache.set(file, readFileSync(file, 'utf8'))
      return `<style data-from="${href}">\n${cssCache.get(file)}\n</style>`
    })
    const r = rel(page, root)
    docs.push({ file: page, rel: r, text: html, ext: '.html' })
    extra.push(...pageChecks(html, r, missing))
  }
  const res = scanDocs(docs)
  // Findings inside inlined stylesheets repeat on every page: keep one per id+message.
  const seen = new Set()
  const findings = [...res.findings, ...extra].filter((f) => {
    const k = `${f.id}|${f.message}|${f.evidence || ''}`
    if (/^(CO|TY|MO|CM|LA|SY)-/.test(f.id) && seen.has(k)) return false
    seen.add(k)
    return true
  }).map((f) => ({ ...f, channel: 'built' }))
  return { tool: 'built', scanned: docs.length, findings, meta: { pages: docs.length, ...res.meta } }
}

function pageChecks(html, file, missingCss) {
  const out = []
  const add = (id, sev, msg, evidence) => out.push(finding(id, sev, { file }, msg, { channel: 'built', ...(evidence ? { evidence } : {}) }))
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '')
  const h1 = (body.match(/<h1\b/gi) || []).length
  if (h1 === 0) add('QA-03', 'P1', 'no <h1>')
  if (h1 > 1) add('QA-03', 'P1', `${h1} <h1> elements`)
  const levels = [...body.matchAll(/<h([1-6])\b/gi)].map((m) => +m[1])
  for (let i = 1; i < levels.length; i++) if (levels[i] > levels[i - 1] + 1) { add('QA-03', 'P2', `heading level jumps h${levels[i - 1]} → h${levels[i]}`); break }
  if (!/<a\b[^>]*href=["']#(main|content|main-content)["']/i.test(body)) add('QA-12', 'P2', 'no skip link to the main content')
  if (!/<title>[^<]{2,}<\/title>/i.test(html)) add('QA-14', 'P2', 'missing <title>')
  if (!/name=["']theme-color["']/i.test(html)) add('QA-14', 'P2', 'no <meta name="theme-color">')
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0])
  const firstImg = imgs[0]
  if (firstImg && /loading=["']lazy["']/i.test(firstImg) && !/aria-hidden|role=["']presentation/.test(firstImg)) add('IG-09', 'P1', 'first image is lazy-loaded (a likely LCP image)', firstImg.slice(0, 100))
  const noDims = imgs.filter((t) => !(/\bwidth=/.test(t) && /\bheight=/.test(t)) && !/style=["'][^"']*aspect-ratio/.test(t))
  if (noDims.length) add('IG-09', 'P2', `${noDims.length} <img> without width/height`, noDims[0].slice(0, 100))
  if (/body\s*\{[^}]*display\s*:\s*contents/i.test(html)) add('LA-23', 'P1', 'body { display: contents }')
  if (missingCss) add('QA-13', 'P2', `${missingCss} stylesheet(s) could not be inlined (external): style checks are a lower bound`)
  return out
}
