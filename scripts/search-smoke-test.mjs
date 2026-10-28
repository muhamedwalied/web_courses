#!/usr/bin/env node
// Smoke-test لبلوجن البحث (Pagefind + SearchModal) على النسخة المبنيّة.
// الاستخدام:
//   npm run preview -- --port 4399 --host 127.0.0.1   # في تيرمنال منفصل
//   node scripts/search-smoke-test.mjs react flutter "واجهة" zzz
// لو مفيش queries هيجرب: react / flutter / واجهة / zzz-not-exist

const PORT = process.env.SEARCH_TEST_PORT ?? '4399';
const BASE = `http://127.0.0.1:${PORT}`;
const QUERIES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['react', 'flutter', 'واجهة', 'zzz-not-exist'];

const { spawn } = await import('node:child_process');
const { writeFileSync } = await import('node:fs');

// ── chromium headless + CDP ──────────────────────────────────────────
const chrome = spawn('/usr/bin/chromium', [
  '--headless=new',
  '--no-sandbox',
  '--disable-gpu',
  '--remote-debugging-port=9777',
  '--user-data-dir=/tmp/dsh-search-smoke-profile',
  'about:blank',
], { stdio: 'ignore' });
const cleanup = () => { chrome.kill(); };
process.on('exit', cleanup);

let ws;
try {
  let target;
  for (let i = 0; i < 50; i++) {
    await new Promise((r) => setTimeout(r, 200));
    try {
      const list = await (await fetch('http://127.0.0.1:9777/json/list')).json();
      target = list.find((t) => t.type === 'page');
      if (target) break;
    } catch { /* لسه مش جاهز */ }
  }
  if (!target) throw new Error('chromium remote debugging مش جاهز');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
} catch (err) {
  console.error('فشل تشغيل chromium:', err.message);
  process.exit(1);
}

let msgId = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { res, rej } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? rej(new Error(msg.error.message)) : res(msg.result);
  } else if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails?.exception?.description ?? 'exception');
  }
};
function cdp(method, params = {}) {
  const id = ++msgId;
  return new Promise((res, rej) => {
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const { result, exceptionDetails } = await cdp('Runtime.evaluate', {
    expression, awaitPromise: true, returnByValue: true,
  });
  if (exceptionDetails) throw new Error(exceptionDetails.exception?.description ?? 'evaluate فشل');
  return result.value;
}

await cdp('Runtime.enable');
await cdp('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });

// ── فتح الصفحة الرئيسية ──────────────────────────────────────────────
const nav = await cdp('Page.navigate', { url: `${BASE}/` }).catch(() => null);
if (!nav) { console.error('مش قادر أوصل للـ preview server — هو شغال؟'); process.exit(1); }
await new Promise((r) => setTimeout(r, 1500));

const pageOk = await evaluate(`document.title`);
console.log(`الصفحة: «${pageOk}»`);

// ── فتح المودال بزر البحث (نفس مسار المستخدم) ───────────────────────
const opened = await evaluate(`(() => {
  const btn = document.getElementById('search-trigger');
  if (!btn) return { ok: false, why: 'مفيش #search-trigger في الصفحة' };
  btn.click();
  const dlg = document.getElementById('search-dialog');
  return { ok: !!dlg.open, why: dlg.open ? null : 'open() ما نفذتش', placeholder: document.getElementById('search-input').placeholder };
})()`);
if (!opened.ok) {
  console.error(`المودال ما فتحش: ${opened.why}`);
  process.exit(1);
}
console.log(`المودال فتح ✅ (placeholder: «${opened.placeholder}»)`);

// ── حالة dev-level: نتأكد إن pagefind.js متحمّل من السيرفر ───────────
const pfLoaded = await evaluate(`(async () => {
  try { const pf = await import(new URL('/pagefind/pagefind.js', location.origin).href); return !!pf?.search; }
  catch (e) { return 'FAIL: ' + e.message; }
})()`);
if (pfLoaded !== true) {
  console.error(`❌ pagefind.js مش متحمّل: ${pfLoaded}`);
  process.exit(1);
}
console.log('pagefind.js اتحمّل و فيه search ✅');

// ── مفيش نتايج (اختبار الحالة الفاضية المعروضة للمستخدم) ────────────
const noResultsUi = await evaluate(`(async () => {
  const input = document.getElementById('search-input');
  input.value = 'zzz-not-exist';
  input.dispatchEvent(new Event('input'));
  await new Promise((r) => setTimeout(r, 600));
  return document.getElementById('search-results').textContent.trim();
})()`);
console.log(`مفيش نتايج (UI): «${noResultsUi}»`);

// ── الكويري للتجربة ─────────────────────────────────────────────────
for (const q of QUERIES) {
  const res = await evaluate(`(async () => {
    const input = document.getElementById('search-input');
    input.value = ${JSON.stringify(q)};
    input.dispatchEvent(new Event('input'));
    await new Promise((r) => setTimeout(r, 600));
    const links = [...document.querySelectorAll('#search-results a')];
    const out = [];
    for (const a of links.slice(0, 6)) {
      const href = a.getAttribute('href');
      const status = await fetch(href, { method: 'HEAD' }).then((r) => r.status).catch(() => 'ERR');
      out.push({ title: a.querySelector('div')?.textContent ?? '', href, status, excerpt: a.innerText.replace(/\\s+/g, ' ').slice(0, 140) });
    }
    return out;
  })()`);
  console.log(`\n— «${q}»: ${res.length} نتيجة`);
  for (const r of res) console.log(`   [${r.status}] ${r.title} → ${r.href}\n        ${r.excerpt}`);
}

// ── سكرينشوت للمودال والنتايج ───────────────────────────────────────
await evaluate(`(() => {
  const input = document.getElementById('search-input');
  input.value = 'flutter';
  input.dispatchEvent(new Event('input'));
  return new Promise((r) => setTimeout(r, 700));
})()`);
const shot = await cdp('Page.captureScreenshot', { format: 'png' });
const out = new URL('../search-modal-test.png', import.meta.url).pathname;
writeFileSync(out, Buffer.from(shot.data, 'base64'));
console.log(`\nسكرينشوت: ${out}`);

if (consoleErrors.length) {
  console.log(`\n⚠️  أخطاء console في الصفحة (${consoleErrors.length}):`);
  for (const e of consoleErrors.slice(0, 5)) console.log('   ' + e.split('\n')[0]);
} else {
  console.log('\nمفيش أخطاء console ✅');
}
await cdp('Browser.close').catch(() => {});
process.exit(0);
