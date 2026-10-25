import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, extname, relative, resolve, sep } from 'node:path'

export const SKIP_DIRS = new Set([
  'node_modules', '.git', '.next', '.nuxt', '.svelte-kit', '.astro', '.output', '.vercel', '.turbo', '.cache',
  'dist', 'build', 'out', 'coverage', 'vendor', '.tasmeem', '__pycache__', 'playwright-report', 'test-results',
])

export const STYLE_EXT = new Set(['.css', '.scss', '.sass', '.less', '.pcss'])
export const MARKUP_EXT = new Set(['.html', '.htm', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.mdx'])
export const SCRIPT_EXT = new Set(['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'])
export const CONTENT_EXT = new Set(['.json', '.md', '.yaml', '.yml'])

/** Walk paths and return files with known extensions. */
export function collectFiles(paths, { includeContent = false, skip = SKIP_DIRS, root = process.cwd() } = {}) {
  const out = []
  const seen = new Set()
  const want = (f) => {
    const e = extname(f).toLowerCase()
    return STYLE_EXT.has(e) || MARKUP_EXT.has(e) || SCRIPT_EXT.has(e) || (includeContent && CONTENT_EXT.has(e))
  }
  const walk = (p) => {
    let st
    try { st = statSync(p) } catch { return }
    if (st.isDirectory()) {
      const base = p.split(/[\\/]/).pop()
      if (skip.has(base)) return
      for (const name of readdirSync(p)) walk(join(p, name))
    } else if (st.isFile() && want(p) && st.size < 2_000_000) {
      const abs = resolve(p)
      if (!seen.has(abs)) { seen.add(abs); out.push(abs) }
    }
  }
  for (const p of paths) walk(resolve(root, p))
  return out
}

export const read = (f) => readFileSync(f, 'utf8')
export const rel = (f, root = process.cwd()) => relative(root, f).split(sep).join('/')
export const exists = existsSync

// Unicode script detection for the supported languages: Arabic and Persian (Arabic script) and English (Latin).
export const SCRIPTS = {
  arabic: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/u,
  persian: /[\u067E\u0686\u0698\u06AF\u06CC\u06A9\u06F0-\u06F9]/u, // \u067E \u0686 \u0698 \u06AF \u06CC \u06A9 and Persian digits
}

export function scriptsIn(text) {
  const found = []
  for (const [name, re] of Object.entries(SCRIPTS)) if (re.test(text)) found.push(name)
  return found
}

/** A finding factory. */
export function finding(id, severity, where, message, extra = {}) {
  return { id, severity, ...where, message, ...extra }
}

/** `tasmeem-allow ID reason` on the same or previous line suppresses a finding. */
export function allowedAt(lines, line, id) {
  for (const l of [line - 1, line - 2]) {
    const s = lines[l]
    if (s && /tasmeem-allow/.test(s) && new RegExp(`tasmeem-allow[^\\n]*\\b${id}\\b`).test(s)) return true
  }
  return false
}
export function allowedInFile(text, id) {
  return new RegExp(`tasmeem-allow-file[^\\n]*\\b${id}\\b`).test(text)
}

export function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=')
      if (v !== undefined) args[k] = v
      else if (argv[i + 1] && !argv[i + 1].startsWith('--')) args[k] = argv[++i]
      else args[k] = true
    } else args._.push(a)
  }
  return args
}

export const SEV_ORDER = { P0: 0, P1: 1, P2: 2 }
export function sortFindings(fs) {
  return fs.sort((a, b) => (SEV_ORDER[a.severity] - SEV_ORDER[b.severity]) || String(a.id).localeCompare(b.id) || String(a.file || '').localeCompare(b.file || '') || (a.line || 0) - (b.line || 0))
}

export function printHuman(result, { max = 400 } = {}) {
  const fs = sortFindings([...result.findings])
  const byFile = new Map()
  for (const f of fs.slice(0, max)) {
    const k = f.file || f.url || '(project)'
    if (!byFile.has(k)) byFile.set(k, [])
    byFile.get(k).push(f)
  }
  const lines = [`tasmeem ${result.tool} · ${result.scanned ?? ''} ${result.tool === 'render' ? 'widths' : 'files'} · ${fs.length} findings`]
  for (const [file, list] of byFile) {
    lines.push('', file)
    for (const f of list) {
      const loc = f.line ? `L${f.line}` : f.width ? `@${f.width}` : ''
      const count = f.count > 1 ? ` ×${f.count}` : ''
      lines.push(`  ${f.severity}  ${f.id.padEnd(6)} ${loc.padEnd(6)} ${f.message}${count}${f.evidence ? `  · ${truncate(f.evidence, 70)}` : ''}`)
    }
  }
  if (fs.length > max) lines.push('', `… ${fs.length - max} more (use --json)`)
  const t = totals(fs)
  lines.push('', `P0 ${t.P0} · P1 ${t.P1} · P2 ${t.P2}`)
  return lines.join('\n')
}

export function totals(fs) {
  const t = { P0: 0, P1: 0, P2: 0 }
  for (const f of fs) t[f.severity] = (t[f.severity] || 0) + 1
  return t
}

export const truncate = (s, n) => { s = String(s).replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1) + '…' : s }
