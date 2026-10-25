// Session context: project brief and design system, scripts present, tools available.
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { collectFiles, read, scriptsIn } from './util.mjs'
import { loadPlaywright } from './render.mjs'
import { doctor as higgsDoctor } from './higgs.mjs'

export async function context(target = '.') {
  const root = resolve(target)
  const out = []
  const find = (names) => names.map((n) => join(root, n)).find(existsSync)
  const product = find(['PRODUCT.md', 'product.md', 'docs/PRODUCT.md'])
  const design = find(['DESIGN.md', 'design.md', 'docs/DESIGN.md'])
  out.push(`# tasmeem context · ${root}`)
  for (const [label, file] of [['PRODUCT.md', product], ['DESIGN.md', design]]) {
    if (!file) { out.push('', `## ${label}: missing`, label === 'DESIGN.md' ? 'No design system on record. For multi-page work, write one from the direction (templates/DESIGN.template.md), or run `document` on existing code.' : 'No product brief. Run the direction protocol (core/direction.md) and ask only what the code cannot tell you.'); continue }
    const lines = readFileSync(file, 'utf8').split('\n')
    out.push('', `## ${label} (${lines.length} lines)`, '', ...lines.slice(0, 400))
    if (lines.length > 400) out.push(`… truncated; read ${file} for the rest`)
  }

  // Scripts in the source.
  const srcDirs = ['src', 'app', 'pages', 'components', 'content', 'messages', 'locales', 'public/locales'].map((d) => join(root, d)).filter(existsSync)
  const files = collectFiles(srcDirs.length ? srcDirs : [root], { includeContent: true, root }).slice(0, 3000)
  const scripts = new Set()
  let html = ''
  for (const f of files) { const t = read(f); for (const s of scriptsIn(t)) scripts.add(s); if (!html && /<html\b/.test(t)) html = (t.match(/<html\b[^>]*>/) || [''])[0] }
  out.push('', '## Writing systems found', `${[...scripts].join(', ') || 'latin only'} ${html ? `· root: ${html}` : ''}`)
  const guide = { arabic: 'arabic.md (+ bidi.md, numerals-dates.md, punctuation.md)', persian: 'persian.md' }
  for (const s of scripts) if (guide[s]) out.push(`- read references/scripts-lang/${guide[s]}`)
  out.push('- read references/scripts-lang/english.md for English text (and for the Latin partner of an Arabic or Persian face)')

  // Tools.
  const pw = await loadPlaywright(root)
  const hf = higgsDoctor()
  const skillDirs = [join(homedir(), '.claude', 'skills'), join(homedir(), '.agents', 'skills'), join(root, '.claude', 'skills')]
  const has = (name) => skillDirs.some((d) => existsSync(join(d, name)))
  const remotion = skillDirs.some((d) => existsSync(d) && readdirSync(d).some((n) => n.startsWith('remotion'))) || existsSync(join(homedir(), '.claude', 'plugins', 'cache', 'remotion'))
  out.push('', '## Tools',
    `- Node ${process.version}`,
    `- Playwright: ${pw ? 'available: render checks can run' : 'missing: render checks unverified (npm i -D playwright && npx playwright install chromium)'}`,
    `- Higgsfield CLI: ${!hf.installed ? 'not installed: assets run code-led (npm i -g @higgsfield/cli; higgsfield auth login)' : hf.signedIn ? `signed in${hf.credits != null ? `, ${hf.credits} credits` : ''}: comp-led builds and plates available (cost gate applies)` : 'installed, not signed in (higgsfield auth login)'}`,
    `- /rasm: ${has('rasm') ? 'installed: hand image prompts to it (assets/rasm.md)' : 'not installed: use assets/prompts.md'}`,
    `- Remotion skills: ${remotion ? 'installed: produced motion via motion/video.md' : 'not installed'}`,
  )
  const others = ['impeccable', 'hallmark', 'design-taste-frontend', 'frontend-design', 'antislop', 'avoid-ai-design'].filter(has)
  if (others.length) out.push(`- Other design skills installed: ${others.join(', ')}. Do not run two design skills on one task; tasmeem's catalog already merges them.`)
  out.push('', '## Next', '- Route the request (SKILL.md table), load only the references it needs, end with the gate (core/gate.md).')
  return out.join('\n')
}
