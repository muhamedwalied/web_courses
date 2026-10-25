// Merge scanner outputs into one numbered report, applying brand exceptions and the gate verdict.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { sortFindings, totals } from './util.mjs'

const HERE = dirname(fileURLToPath(import.meta.url))
const TELLS = join(HERE, '..', '..', 'references', 'tells')

export function catalog() {
  const map = {}
  if (!existsSync(TELLS)) return map
  for (const f of readdirSync(TELLS)) {
    if (!f.endsWith('.md')) continue
    for (const m of readFileSync(join(TELLS, f), 'utf8').matchAll(/^### ([A-Z]{2}-\d{2}) · ([^·\n]+) · (P[0-2](?:\/P[0-2])?)/gm)) map[m[1]] = { title: m[2].trim(), severity: m[3], file: f }
  }
  return map
}

/** Brand exceptions: `ID: reason` lines under a heading containing "exception", or `tasmeem-allow ID reason` anywhere. */
export function exceptionsFrom(...docs) {
  const ex = {}
  for (const path of docs) {
    if (!path || !existsSync(path)) continue
    const text = readFileSync(path, 'utf8')
    let inSection = false
    for (const line of text.split('\n')) {
      if (/^#{1,4}\s/.test(line)) inSection = /exception/i.test(line)
      const allow = line.match(/tasmeem-allow\s+([A-Z]{2}-\d{2})\s*(.*)/)
      if (allow) ex[allow[1]] = `${path.split(/[\\/]/).pop()}: ${allow[2].replace(/-->.*/, '').trim() || 'allowed'}`
      if (inSection) { const m = line.match(/\b([A-Z]{2}-\d{2})\b[:\s·-]+(.+)/); if (m) ex[m[1]] = `${path.split(/[\\/]/).pop()}: ${m[2].trim()}` }
    }
  }
  return ex
}

const NEVER_EXCEPT = /^(QA-|SC-(0[1-9]|10)|CP-0[78])/

export function buildReport(results, { design, product } = {}) {
  const cat = catalog()
  const ex = exceptionsFrom(design, product)
  const merged = []
  const seen = new Set()
  const tools = []
  for (const r of results) {
    tools.push(r.error ? `${r.tool} ✗ (${r.error})` : `${r.tool} ✓`)
    for (const f of r.findings || []) {
      const key = `${f.id}|${f.file || f.url || ''}|${f.line || f.width || ''}|${f.message}`
      if (seen.has(key)) continue
      seen.add(key)
      const exception = ex[f.id] && !NEVER_EXCEPT.test(f.id) ? ex[f.id] : null
      merged.push({ ...f, title: cat[f.id]?.title, exception })
    }
  }
  const open = merged.filter((f) => !f.exception)
  const t = totals(open)
  const blocking = open.filter((f) => f.severity === 'P0' || (f.severity === 'P1' && NEVER_EXCEPT.test(f.id)))
  return { tools, totals: t, exceptions: merged.filter((f) => f.exception).length, verdict: blocking.length ? 'FAIL' : 'PASS', findings: sortFindings(open), excepted: merged.filter((f) => f.exception) }
}

export function toMarkdown(rep, { title = 'tasmeem report' } = {}) {
  const L = []
  L.push(`# ${title}`, '')
  L.push(`Measured: ${rep.tools.join(' · ')}`)
  L.push(`Totals: P0 ${rep.totals.P0} · P1 ${rep.totals.P1} · P2 ${rep.totals.P2} · brand exceptions ${rep.exceptions}`)
  L.push(`Verdict: **${rep.verdict}**${rep.verdict === 'FAIL' ? ' (a P0, or a P1 accessibility/script/honesty finding, is open)' : ''}`, '')
  L.push('| # | ID | Sev | Where | Finding | Count | Evidence |', '|---|---|---|---|---|---|---|')
  rep.findings.forEach((f, i) => {
    const where = f.file ? `${f.file}${f.line ? ':' + f.line : ''}` : f.url ? `${f.url}${f.width ? ' @' + f.width : ''}` : '(project)'
    const name = f.title ? `${f.title}: ${f.message}` : f.message
    L.push(`| ${i + 1} | ${f.id} | ${f.severity} | ${esc(where)} | ${esc(name)} | ${f.count || 1} | ${esc(f.evidence || (f.lines && f.lines.length > 1 ? 'lines ' + f.lines.join(', ') : ''))} |`)
  })
  if (rep.excepted.length) {
    L.push('', '## Brand exceptions', '', '| ID | Where | Finding | Granted by |', '|---|---|---|---|')
    for (const f of rep.excepted) L.push(`| ${f.id} | ${esc(f.file || f.url || '')} | ${esc(f.message)} | ${esc(f.exception)} |`)
  }
  L.push('', 'Judged findings (eye) are added by the reviewer below this line and labelled as judgment.')
  return L.join('\n')
}

const esc = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 160)
