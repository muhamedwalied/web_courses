// Higgsfield bridge: environment check, cost estimate, and generation with a budget gate and provenance.
// Uses the official CLI (@higgsfield/cli). No API keys are read or printed: the CLI owns authentication.
import { spawnSync, execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, dirname, extname, resolve } from 'node:path'

export function resolveCli() {
  if (process.env.HIGGSFIELD_BIN && existsSync(process.env.HIGGSFIELD_BIN)) return { cmd: process.env.HIGGSFIELD_BIN, pre: [] }
  const candidates = []
  try { candidates.push(join(execSync('npm root -g', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(), '@higgsfield', 'cli', 'bin', 'higgsfield.js')) } catch {}
  candidates.push(resolve('node_modules', '@higgsfield', 'cli', 'bin', 'higgsfield.js'))
  for (const c of candidates) if (existsSync(c)) return { cmd: process.execPath, pre: [c] }
  if (process.platform !== 'win32') {
    const r = spawnSync('higgsfield', ['version'], { encoding: 'utf8' })
    if (r.status === 0) return { cmd: 'higgsfield', pre: [] }
  }
  return null
}

function run(cli, args) {
  const r = spawnSync(cli.cmd, [...cli.pre, ...args, '--json', '--no-color'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  const text = (r.stdout || '').trim()
  let json = null
  try { json = JSON.parse(text) } catch { const m = text.match(/[[{][\s\S]*[\]}]\s*$/); if (m) try { json = JSON.parse(m[0]) } catch {} }
  return { ok: r.status === 0, json, stderr: (r.stderr || '').trim(), stdout: text }
}

const PARAM_ALIASES = { aspect: 'aspect_ratio', ratio: 'aspect_ratio', res: 'resolution', bg: 'background', type: 'model_type' }
function paramArgs(params) {
  const out = []
  for (let [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === false) continue
    k = PARAM_ALIASES[k] || k
    out.push(`--${k}`, Array.isArray(v) ? JSON.stringify(v) : String(v))
  }
  return out
}

export function doctor() {
  const cli = resolveCli()
  if (!cli) return { ok: false, installed: false, help: 'Install: npm install -g @higgsfield/cli ; then: higgsfield auth login' }
  const acc = run(cli, ['account', 'status'])
  const credits = acc.json && (acc.json.credits ?? acc.json.available_credits ?? acc.json.balance ?? acc.json?.account?.credits)
  const signedIn = acc.ok && acc.json != null
  return { ok: signedIn, installed: true, signedIn, credits: credits ?? null, plan: acc.json?.plan ?? acc.json?.subscription ?? null, help: signedIn ? null : 'Sign in: higgsfield auth login' }
}

export function cost({ model, prompt, params = {}, refs = [] }) {
  const cli = resolveCli()
  if (!cli) throw new Error('Higgsfield CLI not found (npm install -g @higgsfield/cli)')
  const args = ['generate', 'cost', model, '--prompt', prompt, ...paramArgs(params)]
  for (const r of refs) args.push('--image-references', r)
  const res = run(cli, args)
  if (!res.ok || !res.json) throw new Error(`cost failed: ${res.stderr || res.stdout}`)
  return Number(res.json.credits ?? res.json.cost ?? NaN)
}

export async function generate({ model, prompt, params = {}, refs = [], out, budget, yes = false, region, count = 1 }) {
  if (!out) throw new Error('--out is required')
  const cli = resolveCli()
  if (!cli) throw new Error('Higgsfield CLI not found (npm install -g @higgsfield/cli)')
  const each = cost({ model, prompt, params, refs })
  const total = each * count
  if (!yes && (budget === undefined || budget === null)) return { ok: false, gated: true, credits: total, message: `Needs approval: ${count} × ${model} = ${total} credits. Re-run with --budget ${Math.ceil(total)} (or --yes) once the user approves.` }
  if (budget !== undefined && budget !== null && total > Number(budget)) return { ok: false, gated: true, credits: total, message: `Refused: ${total} credits exceeds the budget of ${budget}.` }
  const results = []
  for (let i = 0; i < count; i++) {
    const args = ['generate', 'create', model, '--prompt', prompt, ...paramArgs(params)]
    for (const r of refs) args.push('--image-references', r)
    args.push('--wait')
    const started = Date.now()
    let res = run(cli, args)
    if (!res.ok || !res.json) {
      // A gateway error can arrive after the job was accepted and charged: recover it instead of paying twice.
      const recovered = recoverJob(cli, model, prompt, started)
      if (!recovered) throw new Error(`generation failed (no matching job found in 'generate list'): ${res.stderr || res.stdout}`)
      res = { ok: true, json: recovered }
    }
    const jobs = Array.isArray(res.json) ? res.json : [res.json]
    for (const job of jobs) {
      let j = job
      if (!j.result_url && j.id) { const g = run(cli, ['generate', 'get', j.id]); if (g.json) j = g.json }
      const urls = [j.result_url, ...(j.results || []).map((x) => x.url || x.result_url)].filter(Boolean)
      if (!urls.length) throw new Error(`job ${j.id || '?'} finished without a result (status: ${j.status})`)
      const url = urls[0]
      const bytes = Buffer.from(await (await fetch(url)).arrayBuffer())
      const srcExt = (extname(new URL(url).pathname) || '.png').toLowerCase()
      let target = count > 1 || jobs.length > 1 ? out.replace(/(\.\w+)?$/, `-${results.length + 1}$1`) : out
      if (extname(target).toLowerCase() !== srcExt) target = target.replace(/(\.\w+)?$/, srcExt)
      mkdirSync(dirname(resolve(target)), { recursive: true })
      writeFileSync(target, bytes)
      const sidecar = {
        kind: 'generated', tool: 'tasmeem higgs', model, params, prompt, references: refs,
        job_id: j.id || null, credits: each, created: new Date().toISOString(), region: region || null,
        width: j.params?.width ?? null, height: j.params?.height ?? null,
      }
      writeFileSync(`${target}.json`, JSON.stringify(sidecar, null, 2) + '\n')
      results.push({ file: target, job_id: j.id, credits: each })
    }
  }
  return { ok: true, credits: total, files: results }
}

function recoverJob(cli, model, prompt, since) {
  const deadline = Date.now() + 10 * 60 * 1000
  while (Date.now() < deadline) {
    const list = run(cli, ['generate', 'list'])
    const jobs = Array.isArray(list.json) ? list.json : list.json?.items || []
    const job = jobs.find((j) => j.job_type === model && j.params?.prompt === prompt && Date.parse(j.created_at) >= since - 60_000)
    if (!job) return null
    if (job.status === 'completed' && job.result_url) return job
    if (/fail|error|cancel/i.test(job.status || '')) return null
    const w = run(cli, ['generate', 'wait', job.id])        // blocks until the job settles
    if (w.json && (w.json.result_url || w.json.status === 'completed')) return w.json.result_url ? w.json : { ...job, ...w.json }
  }
  return null
}

export function readPrompt(args) {
  if (args['prompt-file']) return readFileSync(args['prompt-file'], 'utf8').trim()
  if (args.prompt) return String(args.prompt)
  throw new Error('--prompt or --prompt-file is required')
}
