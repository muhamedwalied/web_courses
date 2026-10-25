// A small, forgiving CSS/SCSS parser: enough structure for the scanner's rules.
// It returns flat rules with their selector, the at-rules they sit inside, and their declarations.

/**
 * @param {string} css
 * @param {number} baseLine line number (1-based) of the first character of `css` in its file
 * @returns {{ rules: Array<{selector: string, at: string[], line: number, decls: Array<{prop: string, value: string, line: number, important: boolean}>}>, atRules: Array<{name: string, prelude: string, line: number}> }}
 */
export function parseCss(css, baseLine = 1) {
  const src = stripComments(css)
  const rules = []
  const atRules = []
  const stack = [] // { kind: 'rule'|'at', selector?, at?, rule? }
  let buf = ''
  let line = baseLine
  let bufLine = baseLine
  let quote = null
  let paren = 0

  const contextAt = () => stack.filter((s) => s.kind === 'at').map((s) => s.at)
  const parentRule = () => { for (let i = stack.length - 1; i >= 0; i--) if (stack[i].kind === 'rule') return stack[i]; return null }

  const flushDecl = () => {
    const text = buf.trim()
    buf = ''
    if (!text) return
    const owner = parentRule()
    if (text.startsWith('@')) { atRules.push({ name: text.split(/[\s(]/)[0].slice(1), prelude: text, line: bufLine }); return }
    if (!owner) return
    const i = text.indexOf(':')
    if (i < 1) return
    const prop = text.slice(0, i).trim().toLowerCase()
    let value = text.slice(i + 1).trim()
    const important = /!important\s*$/i.test(value)
    if (important) value = value.replace(/!important\s*$/i, '').trim()
    owner.rule.decls.push({ prop, value, line: bufLine, important })
  }

  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (ch === '\n') line++
    if (quote) { buf += ch; if (ch === quote && src[i - 1] !== '\\') quote = null; continue }
    if (ch === '"' || ch === "'") { quote = ch; if (!buf.trim()) bufLine = line; buf += ch; continue }
    if (ch === '(') paren++
    if (ch === ')') paren = Math.max(0, paren - 1)
    if (paren > 0) { if (!buf.trim()) bufLine = line; buf += ch; continue }

    if (ch === '{') {
      const prelude = buf.trim()
      buf = ''
      const atName = prelude.startsWith('@') ? prelude.split(/[\s(]/)[0].slice(1).toLowerCase() : null
      if (atName && /^(font-face|property|page|counter-style|font-palette-values|view-transition)$/.test(atName)) {
        // Declaration-bearing at-rules behave like rules whose selector is the prelude.
        atRules.push({ name: atName, prelude, line: bufLine })
        const rule = { selector: prelude, at: contextAt(), line: bufLine, decls: [] }
        rules.push(rule)
        stack.push({ kind: 'rule', selector: prelude, rule })
      } else if (atName) {
        atRules.push({ name: atName, prelude, line: bufLine })
        stack.push({ kind: 'at', at: prelude })
      } else {
        const parent = parentRule()
        const selector = parent ? nestSelector(parent.selector, prelude) : prelude
        const rule = { selector, at: contextAt(), line: bufLine, decls: [] }
        rules.push(rule)
        stack.push({ kind: 'rule', selector, rule })
      }
      continue
    }
    if (ch === ';') { flushDecl(); continue }
    if (ch === '}') { flushDecl(); stack.pop(); continue }
    if (!buf.trim() && !/\s/.test(ch)) bufLine = line
    buf += ch
  }
  return { rules, atRules }
}

function nestSelector(parent, child) {
  const parents = parent.split(',').map((s) => s.trim())
  const children = child.split(',').map((s) => s.trim())
  const out = []
  for (const p of parents) for (const c of children) out.push(c.includes('&') ? c.replaceAll('&', p) : `${p} ${c}`)
  return out.join(', ')
}

function stripComments(css) {
  // Keep newlines so line numbers stay right.
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:"'(])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length))
}

/** Extract `<style>` blocks from markup with their starting line numbers. */
export function styleBlocks(text) {
  const out = []
  const re = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  let m
  while ((m = re.exec(text))) {
    const start = m.index + m[0].indexOf('>') + 1
    out.push({ css: m[1], line: lineAt(text, start) })
  }
  return out
}

export function lineAt(text, index) {
  let n = 1
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) n++
  return n
}

/** Build a fast index -> line lookup for a text. */
export function lineIndex(text) {
  const starts = [0]
  for (let i = 0; i < text.length; i++) if (text.charCodeAt(i) === 10) starts.push(i + 1)
  return (index) => {
    let lo = 0, hi = starts.length - 1
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (starts[mid] <= index) lo = mid; else hi = mid - 1 }
    return lo + 1
  }
}

/** Parse a CSS length into px when possible (em/rem relative to 16px). */
export function toPx(value, base = 16) {
  const m = String(value).trim().match(/^(-?[\d.]+)(px|rem|em|%)?$/)
  if (!m) return null
  const n = parseFloat(m[1])
  switch (m[2]) {
    case 'rem': case 'em': return n * base
    case '%': return null
    default: return n
  }
}

/** Letter-spacing in em when expressible. */
export function trackingEm(value, fontPx = 16) {
  const m = String(value).trim().match(/^(-?[\d.]+)(px|rem|em)?$/)
  if (!m) return null
  const n = parseFloat(m[1])
  if (m[2] === 'em') return n
  if (m[2] === 'rem') return (n * 16) / fontPx
  if (m[2] === 'px' || !m[2]) return n / fontPx
  return null
}
