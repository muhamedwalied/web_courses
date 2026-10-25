/**
 * Language annotator: fills/fixes `lang` ("ar" | "en") on every resource in
 * content/circles/*.json — title language is NOT video language: titles like
 * "HTML Playlist — Elzero Web School" are Latin but ARABIC content.
 *
 * Rules (in order):
 *   1. explicit Arabic markers in the title → ar
 *   2. known Arabic producers (Elzero, verified lecturer names) → ar
 *   3. explicit (English) marker / known English producers → en
 *   4. keep the authored value if we still can't tell
 *   5. default en (downstream docs/English-first upstreams)
 *
 * Keep in sync with langOf() in scripts/convert.ts (same rules, both ways).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIR = join(ROOT, 'content', 'circles');

const AR = /[\u0600-\u06FF]/;
const AR_TITLE = /(\(arabic\)|in arabic|arabic playlist|بالعربي|شرح)/i;
const AR_AUTHORS = ['elzero', 'wael abo hamza', 'omar ahmed', 'mohamed fathy taha', 'rabee omran', 'mohamed waleed', 'abdelrahman gamal'];
const EN_TITLE = /\(english\)/i;
const EN_PRODUCERS = ['freecodecamp', 'net ninja', 'traversy media', 'kevin powell', 'web dev simplified', 'fireship', 'javascript mastery', 'monsterlessons', 'pluralsight'];

function decide(title, current) {
  const t = title.toLowerCase();
  if (AR_TITLE.test(title) || AR.test(title)) return 'ar';
  if (AR_AUTHORS.some((a) => t.includes(a))) return 'ar';
  if (EN_TITLE.test(title) || EN_PRODUCERS.some((a) => t.includes(a))) return 'en';
  return current ?? 'en';
}

let changed = 0;
let ar = 0;
let en = 0;

for (const f of readdirSync(DIR)) {
  if (!f.endsWith('.json')) continue;
  const path = join(DIR, f);
  const circle = JSON.parse(readFileSync(path, 'utf8'));
  let fileChanged = false;

  const handle = (r) => {
    const next = decide(r.title, r.lang);
    if (next !== r.lang) {
      console.log(`  [${circle.id}] ${next}  ${r.title.slice(0, 64)}`);
      r.lang = next;
      changed++;
      fileChanged = true;
    }
    if (r.lang === 'ar') ar++;
    else en++;
  };

  for (const l of circle.levels || []) {
    for (const m of l.modules || []) {
      (m.resources || []).forEach(handle);
      for (const t of m.topics || []) (t.resources || []).forEach(handle);
    }
  }
  if (fileChanged) writeFileSync(path, JSON.stringify(circle, null, 2) + '\n');
}

console.log(`\nupdated ${changed} resources — ar ${ar} · en ${en}`);
