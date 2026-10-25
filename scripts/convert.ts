/**
 * Converter: upstream Markdown → content/circles/*.json drafts.
 *
 * Reads the vendored upstream clone (.roadmap-repo), converts the two
 * flagship circles (Flutter week-files, Front End phase-files) plus 12 raw
 * stubs, validates against the shared Zod schema, and writes JSON files
 * with an editor $schema reference.
 *
 * The generated drafts are meant to be hand-tuned afterwards — that is the
 * agreed workflow (converter drafts, human refines).
 *
 * Run: npm run convert
 */
import { readFileSync, existsSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CircleSchema,
  type Circle,
  type Level,
  type Module,
  type Resource,
  type ResourceKind,
  type Topic,
} from '../src/schemas/roadmap';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(ROOT, '.roadmap-repo');
const OUT = join(ROOT, 'content', 'circles');

if (!existsSync(REPO)) throw new Error(`upstream clone missing: ${REPO} (clone CATReloaded/CATReloaded-Circles-Roadmaps first)`);

// ---------- generic helpers ----------

const clean = (s: string) =>
  s
    .replace(/\uFFFD/g, '') // upstream mojibake (destroyed emoji)
    .replace(/[\u0085\u2028\u2029]/g, ' ') // NEL & unicode line separators
    .replace(/[ \t]+/g, ' ')
    .trim();

const stripMd = (s: string) => clean(s.replace(/\*\*/g, '').replace(/`/g, ''));

const AR = /[\u0600-\u06FF]/;
const langOf = (title: string): 'ar' | 'en' =>
  AR.test(title) || /arabic|بالعربي|عربي/i.test(title) ? 'ar' : 'en';

function kindOf(url: string, title: string): ResourceKind {
  const u = url.toLowerCase();
  if (/udemy\.com|coursera\.org|educative\.io/.test(u)) return 'book';
  if (/youtube\.com\/playlist/i.test(u)) return 'playlist';
  if (/youtube\.com|youtu\.be/.test(u)) return /list=/i.test(u) && /playlist/i.test(title) ? 'playlist' : 'video';
  if (/github\.com|gitlab\.com/.test(u)) return 'repo';
  if (/developer\.mozilla|\.dev\/|\/docs|docs\.|reference|introduction/i.test(u)) return 'docs';
  if (/leetcode|neetcode|jschallenger|codecademy|exercism|freecodecamp\.org\/learn|learnjavascript\.online|dartpad|playground|interview/i.test(u))
    return 'interactive';
  if (/elzero\.org|css-tricks|article|blog|\.com\/news|assignments/.test(u)) return 'article';
  return 'other';
}

function res(title: string, url: string, note?: string): Resource {
  const t = stripMd(title).replace(/[:：]\s*$/, '') || url;
  return { title: t, url, kind: kindOf(url, t), lang: langOf(t), ...(note ? { note } : {}) };
}

function mdLinks(text: string): { title: string; url: string }[] {
  const out: { title: string; url: string }[] = [];
  const re = /(!?)\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)[^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[1] === '!') continue;
    out.push({ title: clean(m[2].replace(/\*\*/g, '')), url: m[3].replace(/[).,]+$/, '') });
  }
  return out;
}

/** per-line label-aware link extraction: "**Label:** [T](u)" → "Label — T" */
function lineLinks(block: string): { title: string; url: string }[] {
  const out: { title: string; url: string }[] = [];
  for (const line of block.split('\n')) {
    const labelMatch = line.match(/\*\*(.+?)\*?\*\*/);
    const label = labelMatch ? stripMd(labelMatch[1]).replace(/:$/, '') : undefined;
    for (const l of mdLinks(line)) {
      out.push({
        title: label && label.length > 2 && label.length < 40 && !l.title.startsWith(label) ? `${label} — ${l.title}` : l.title,
        url: l.url,
      });
    }
  }
  return out;
}

/** table rows → resources (first markdown link in a row wins) */
function tableResources(text: string, note?: string): Resource[] {
  const out: Resource[] = [];
  for (const line of text.split('\n')) {
    if (!/^\s*\|/.test(line) || /^\s*\|[\s:|-]+\|\s*$/.test(line)) continue;
    const link = mdLinks(line)[0];
    if (!link) continue;
    const firstCell = line.split('|')[1]?.trim() ?? '';
    const cellLink = mdLinks(firstCell)[0];
    out.push(res(cellLink ? stripMd(firstCell) : link.title || firstCell, link.url, note));
  }
  return out;
}

/** non-link bullet lines (practice / drills / missions) */
function practiceLines(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (!m) continue;
    const raw = stripMd(m[1]);
    if (mdLinks(raw).length) continue;
    if (raw.length < 3 || /^[^A-Za-z\u0600-\u06FF]*$/.test(raw)) continue;
    if (/^(?:by the end|you will|https?:\/\/)/i.test(raw)) continue;
    out.push(raw.slice(0, 160));
  }
  return [...new Set(out)];
}

let slugSeen: Record<string, number> = {};
const resetSlugs = () => (slugSeen = {});
const slugify = (s: string): string => {
  // ids are ASCII kebab-case (URL- and progress-key-safe); Arabic stays in titles
  const base =
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48)
      .replace(/-+$/g, '') || 'item';
  const n = (slugSeen[base] = (slugSeen[base] ?? 0) + 1);
  return n > 1 ? `${base}-${n}` : base;
};

const topLevel = (text: string): string => {
  const m = text.match(/^#\s+(.+)$/m);
  return m ? clean(m[1].replace(/[*#]/g, '')) : '';
};

const dedupeRes = (list: Resource[]): Resource[] => {
  const seen = new Set<string>();
  return list.filter((r) => (seen.has(r.url) ? false : (seen.add(r.url), true)));
};
const dedupeTopics = (topics: Topic[]): Topic[] => {
  const seenId = new Set<string>();
  const seenTitle = new Set<string>();
  const out: Topic[] = [];
  for (const t of topics) {
    if (seenId.has(t.id) || seenTitle.has(t.title.toLowerCase())) continue;
    seenId.add(t.id);
    seenTitle.add(t.title.toLowerCase());
    out.push(t);
  }
  return out;
};

function safeText(p: string): string | null {
  try {
    if (!existsSync(p)) return null;
    return readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
  } catch {
    return null;
  }
}

/** generic heading-section splitter: returns {title, body} for each Hd match */
function sections(text: string, re: RegExp): { title: string; body: string }[] {
  const marks: { title: string; start: number; end: number }[] = [];
  const rx = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text))) marks.push({ title: clean(m[2] ?? m[1]), start: m.index, end: -1 });
  for (let i = 0; i < marks.length; i++) marks[i].end = marks[i + 1]?.start ?? text.length;
  return marks.map((mk) => ({ title: mk.title, body: text.slice(mk.start, mk.end) }));
}

const writeFile = (circle: Circle) => {
  const parsed = CircleSchema.safeParse(circle);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .slice(0, 5)
      .map((i) => `${i.path.join('.')} ${i.message}`)
      .join('; ');
    throw new Error(`[convert] schema violation in ${circle.id}: ${issues}`);
  }
  const body = JSON.stringify(parsed.data, null, 2) + '\n';
  writeFileSync(join(OUT, `${circle.id}.json`), `{\n  "$schema": "../circles.schema.json",\n${body.slice(1)}`);
  const t = circle.levels.reduce((a, l) => a + l.modules.reduce((b, m) => b + m.topics.length, 0), 0);
  console.log(`✓ ${circle.id} — levels=${circle.levels.length} topics=${t}`);
};

// ---------- Flutter ----------

interface WeekFile {
  num: number;
  text: string;
}

function flutter(): Circle {
  resetSlugs();
  const levelDefs = [
    { dir: '1 - Beginner', id: 'beginner', name: 'Beginner', duration: '5 أسابيع' },
    { dir: '2 - Intermediate', id: 'intermediate', name: 'Intermediate', duration: '8 أسابيع' },
    { dir: '3 - Advanced', id: 'advanced', name: 'Advanced', duration: '11 أسبوعًا' },
  ];
  const levels: Level[] = levelDefs.map((def, li) => {
    const dir = join(REPO, 'Flutter', def.dir);
    const weekFiles: WeekFile[] = existsSync(dir)
      ? readdirSync(dir)
          .map((name) => ({ name, m: name.match(/^week_(\d+)\.md$/) }))
          .filter((f) => f.m)
          .map((f) => ({ num: Number(f.m![1]), text: safeText(join(dir, f.name)) ?? '' }))
          .sort((a, b) => a.num - b.num)
      : [];
    const modules: Module[] = weekFiles.map((wf) => {
      const title = topLevel(wf.text).replace(/^Week\s+\d+:\s*/i, '');
      const objectives: string[] = [];
      const moduleRes: Resource[] = [];
      const topics: Topic[] = [];
      for (const sec of wf.text.split(/^##\s+/m).slice(1)) {
        const head = sec.split('\n')[0];
        const body = sec.split('\n').slice(1).join('\n');
        if (/🎯/.test(head)) {
          objectives.push(...practiceLines(body).filter((p) => p.length > 8));
        } else if (/📚|Content/i.test(head)) {
          for (const link of mdLinks(body)) {
            topics.push({ id: slugify(link.title), title: link.title, resources: [res(link.title, link.url)], optional: false });
          }
        } else if (/🧩|Optional/i.test(head)) {
          moduleRes.push(
            ...mdLinks(body)
              .filter((l) => !topics.some((t) => t.resources.some((r) => r.url === l.url)))
              .map((l) => res(l.title, l.url)),
          );
        }
      }
      return {
        id: `w${String(wf.num).padStart(2, '0')}`,
        name: title || `Week ${wf.num}`,
        order: wf.num,
        ...(objectives.length ? { objectives } : {}),
        topics: dedupeTopics(topics),
        resources: dedupeRes(moduleRes),
        optional: false,
      };
    });
    return { id: def.id, name: def.name, order: li, durationText: def.duration, modules };
  });

  const readme = safeText(join(REPO, 'Flutter', 'Readme.md')) ?? '';

  // Titan level from the Readme
  const titanBlock = readme.split(/##\s*🟪/)[1]?.split(/^##\s/m)[0] ?? '';
  const titanModules: Module[] = mdLinks(titanBlock).map((l, i) => ({
    id: slugify(l.title),
    name: l.title,
    order: i,
    topics: [{ id: 'dsa-playlist', title: l.title, resources: [res(l.title, l.url)], optional: false }],
    optional: false,
  }));
  if (titanModules.length) {
    levels.push({
      id: 'titan',
      name: 'Titan',
      order: 3,
      goal: 'مستوى إضافي بعد الـ Advanced — Data Structures & Algorithms.',
      modules: titanModules,
    });
  }

  // Arabic Git resources from the Readme → week 04 (Git & GitHub)
  const gitBlock = readme.split(/#\s*<img[^>]*git/i)[1]?.split(/^#\s/m)[0] ?? '';
  const w4 = levels[0]?.modules.find((m) => m.id === 'w04');
  if (w4) {
    const gitRes = mdLinks(gitBlock).map((l) => res(l.title, l.url, 'من Readme المسار'));
    w4.resources.push(...gitRes.filter((r) => !w4.resources.some((x) => x.url === r.url)));
  }

  return {
    id: 'flutter',
    name: 'Flutter',
    tagline: 'من أساسيات Dart لتطبيقات إنتاجية بـ Clean Architecture',
    description:
      'مسار Flutter في CAT Reloaded: رحلة منظمة أسبوعًا بأسبوع من Dart والموبايل حتى Firestore والمدفوعات والـ CI/CD، مع مشروع تطبيقي في كل مرحلة.',
    color: '#38bdf8',
    icon: '🐦',
    prereqs: [],
    status: 'structured',
    upstreamPaths: ['Flutter/Readme.md', 'Flutter/1 - Beginner/', 'Flutter/2 - Intermediate/', 'Flutter/3 - Advanced/'],
    levels,
  };
}

// ---------- Front End helpers ----------

function allWeekResources(block: string): { links: Resource[]; practice: string[] } {
  return {
    links: dedupeRes(lineLinks(block).map((l) => res(l.title, l.url))),
    practice: practiceLines(block)
      .filter((p) => /build|create|refactor|set up|finish|implement|start|drill|solve|clone|project|task|mission|leetcode/i.test(p))
      .slice(0, 6),
  };
}

// ---------- Front End: Phase 1 ----------

function fePhase1(): Level {
  resetSlugs();
  const text = safeText(join(REPO, 'Front End', 'roadmap-01-foundation.md')) ?? '';
  const modules: Module[] = [];

  const setupBlock = text.split(/^##\s+Prerequisites & Setup/m)[1]?.split(/^---$/m)[0] ?? '';
  if (setupBlock) {
    modules.push({
      id: 'setup',
      name: 'Prerequisites & Setup',
      order: 0,
      goal: 'الأدوات والحسابات المطلوبة قبل أول يوم في المسار.',
      topics: [],
      resources: dedupeRes(tableResources(setupBlock)),
      optional: true,
    });
  }

  const schedule = text.split(/^##\s+The 5-Week Schedule/m)[1] ?? '';
  const wkRe = /(?:^|\n)\s*###\s+\*\*Week\s+(\d+):\s*(.+?)\*\*\s*$/gm;
  const marks: { n: number; title: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = wkRe.exec(schedule))) marks.push({ n: Number(m[1]), title: clean(m[2]), start: m.index, end: -1 });
  for (let i = 0; i < marks.length; i++) marks[i].end = marks[i + 1]?.start ?? schedule.length;

  for (const wk of marks) {
    const block = schedule.slice(wk.start, wk.end);
    const goal = block.match(/\*\*Goal:\*\*\s*(.+)/)?.[1];
    const topics: Topic[] = [];
    const moduleRes: Resource[] = [];
    const lines = block.split('\n');
    let lastBold = '';
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // single-link study item: *   **[HTML Playlist — Elzero](url)**
      const studyLink = line.match(/^\s*\*\s+\*\*\[(.+?)\]\((https?:\/\/[^\s)]+)[^)]*\)\s*\*\*\s*$/);
      if (studyLink) {
        if (/reference|extra|article/i.test(lastBold)) moduleRes.push(res(studyLink[1], studyLink[2]));
        else topics.push({ id: slugify(studyLink[1]), title: studyLink[1], resources: [res(studyLink[1], studyLink[2])], optional: false });
        continue;
      }
      // bold group header with `> - [x](y)` children below
      const group = line.match(/^\s*\*\s+\*\*([^[\]*\n]+?)\*\*\s*$/);
      if (group) {
        lastBold = group[1];
        const sub: string[] = [];
        for (let j = i + 1; j < lines.length; j++) {
          const l = lines[j];
          if (/^\s*>\s*(?:[-*]\s*)?\[/.test(l)) sub.push(l);
          else if (sub.length || !/^\s*$/.test(l)) break;
        }
        if (sub.length) {
          topics.push({
            id: slugify(group[1]),
            title: group[1],
            resources: dedupeRes(sub.map((l) => res(mdLinks(l)[0].title, mdLinks(l)[0].url))),
            optional: false,
          });
        }
      }
    }
    for (const ab of block.split(/^####\s+/m).slice(1).filter((b) => /assignment/i.test(b.split('\n')[0]))) {
      moduleRes.push(...tableResources(ab, 'Assignments'));
    }
    for (const l of mdLinks(block)) {
      const used = topics.some((t) => t.resources.some((r) => r.url === l.url)) || moduleRes.some((r) => r.url === l.url);
      if (!used && /article|guide|reference|complete|crash/i.test(l.title)) moduleRes.push(res(l.title, l.url));
    }
    const practice = practiceLines(block)
      .filter((p) => /create|implement|use|build/i.test(p))
      .slice(0, 6);
    modules.push({
      id: `w${String(wk.n).padStart(2, '0')}`,
      name: wk.title,
      order: wk.n,
      ...(goal ? { goal: stripMd(goal) } : {}),
      ...(practice.length ? { practice } : {}),
      topics: dedupeTopics(topics),
      resources: dedupeRes(moduleRes),
      optional: false,
    });
  }

  return {
    id: 'phase-1-foundation',
    name: 'Phase 1 — The Foundation',
    order: 0,
    goal: 'صفحات static نضيفة بـ semantic HTML و CSS سليم.',
    durationText: '5 أسابيع',
    modules,
  };
}

// ---------- Front End: Phase 2 ----------

function fePhase2(): Level {
  resetSlugs();
  const text = safeText(join(REPO, 'Front End', 'roadmap-02-core.md')) ?? '';
  const modRe = /(?:^|\n)\s*##\s+(?:[^\w\n]*\s*)?Module\s+([A-D]):\s*(.+?)\s*$/gm;
  // all `##` heading starts (module or not) — module blocks end at the next one,
  // so trailing file sections (practice projects, problem-solving…) are not
  // swallowed into the last week
  const h2starts: number[] = [...text.matchAll(/(?:^|\n)##\s/g)].map((x) => x.index + (x[0].startsWith('\n') ? 1 : 0));
  const modMarks: { letter: string; title: string; start: number; end: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = modRe.exec(text))) {
    const start = m.index;
    const nextH = h2starts.find((h) => h > start + 4);
    modMarks.push({ letter: m[1], title: clean(m[2]), start, end: nextH ?? text.length });
  }

  const modules: Module[] = modMarks.map((mm, mi) => {
    const block = text.slice(mm.start, mm.end);
    const wkRe = /(?:^|\n)\s*###\s+(?:[^\w\n]*\s*)?Week\s+(\d+):\s*(.+?)\s*$/gm;
    const wkMarks: { n: number; title: string; start: number; end: number }[] = [];
    while ((m = wkRe.exec(block))) wkMarks.push({ n: Number(m[1]), title: clean(m[2]), start: m.index, end: -1 });
    for (let i = 0; i < wkMarks.length; i++) wkMarks[i].end = wkMarks[i + 1]?.start ?? block.length;

    const topics: Topic[] = [];
    const moduleRes: Resource[] = [];
    for (const wk of wkMarks) {
      const wb = block.slice(wk.start, wk.end);
      const wr = allWeekResources(wb);
      const practice = wr.practice;
      topics.push({
        id: `w${String(wk.n).padStart(2, '0')}`,
        title: `Week ${wk.n}: ${wk.title}`,
        resources: wr.links,
        ...(practice.length ? { note: practice.join(' • ') } : {}),
        optional: false,
      });
    }
    // non-week remainder of the module block (headers/tables outside weeks)
    let rest = '';
    let cursor = 0;
    for (const wk of wkMarks) {
      rest += block.slice(cursor, wk.start);
      cursor = wk.end;
    }
    rest += block.slice(cursor);
    for (const sec of rest.split(/\n(?=\s*###\s)/).slice(1)) {
      if (/week\s+\d+/i.test(sec)) continue;
      moduleRes.push(...tableResources(sec));
    }
    return {
      id: `module-${mm.letter.toLowerCase()}`,
      name: `Module ${mm.letter}: ${mm.title.replace(/\s*\(Weeks[^)]*\)/, '')}`,
      order: mi,
      topics,
      resources: dedupeRes(moduleRes),
      optional: false,
    };
  });

  // trailing standalone sections after the last module
  const tail = text.slice(modMarks.at(-1)?.end ?? text.length);
  const heads: { title: string; start: number; end: number }[] = [];
  const headRe = /(?:^|\n)##\s+(?:[^\w\n]*\s*)?(.+?)\s*$/gm;
  while ((m = headRe.exec(tail))) heads.push({ title: clean(m[1]), start: m.index, end: -1 });
  for (let i = 0; i < heads.length; i++) heads[i].end = heads[i + 1]?.start ?? tail.length;
  for (const h of heads) {
    if (/contribut|credit/i.test(h.title)) continue;
    const body = tail.slice(h.start, h.end);
    const resources = dedupeRes(tableResources(body));
    const practice = practiceLines(body).slice(0, 6);
    if (!resources.length && !practice.length) continue;
    modules.push({
      id: slugify(h.title),
      name: h.title,
      order: modules.length,
      topics: [],
      resources,
      ...(practice.length ? { practice } : {}),
      optional: true,
    });
  }

  return {
    id: 'phase-2-core',
    name: 'Phase 2 — Core Engineering',
    order: 1,
    goal: 'JavaScript عميق + Problem Solving + أدوات محترفة — سبرنت مكثف 13 أسبوع.',
    durationText: '13 أسبوعًا',
    modules,
  };
}

// ---------- Front End: Phase 3 (React / Angular / Vue) ----------

function feReactLevel(): Level {
  resetSlugs();
  const text = safeText(join(REPO, 'Front End', 'roadmap-03-react.md')) ?? '';
  const modules: Module[] = [];

  const preBlock = text.split(/✅ Prerequisites Checklist/m)[1]?.split(/^---$/m)[0] ?? '';
  if (preBlock) {
    const objectives = [...preBlock.matchAll(/^\|\s*\*\*(.+?)\*\*/gm)].map((x) => stripMd(x[1]));
    if (objectives.length) {
      modules.push({ id: 'prerequisites', name: 'React Prerequisites Checklist', order: modules.length, objectives, optional: true, topics: [] });
    }
  }

  // learning path sections → topics
  const lp = text.split(/The Learning Path/m)[1]?.split(/^##\s/m)[0] ?? '';
  const lpTopics: Topic[] = [];
  for (const sec of sections(lp, /(?:^|\n)\s*###\s+\*\*(\d+\.\s*.+?)\*\*\s*$/gm, 2)) {
    lpTopics.push({
      id: slugify(sec.title),
      title: sec.title,
      resources: dedupeRes(lineLinks(sec.body).map((l) => res(l.title, l.url))),
      optional: false,
    });
  }
  // ecosystem tables → topic per category
  const eco = text.split(/React Ecosystem Libraries/m)[1]?.split(/^##\s/m)[0] ?? '';
  const ecoTopics: Topic[] = [];
  for (const sec of sections(eco, /\s*###\s+\*\*(.+?)\*\*\s*$/gm
, 2)) {
    const rs = tableResources(sec.body);
    if (!rs.length) continue;
    ecoTopics.push({ id: slugify(sec.title), title: sec.title, resources: rs, optional: false });
  }
  modules.push({ id: 'learning-path', name: 'The React Learning Path', order: modules.length, goal: 'من Core React إلى Redux وTailwind وTypeScript وNext.js.', topics: lpTopics, optional: false });
  if (ecoTopics.length) modules.push({ id: 'ecosystem', name: 'React Ecosystem Libraries', order: modules.length, topics: ecoTopics, optional: true });

  // 8-week specialist schedule → Module A/B, topic per week
  const schedFull = text.split(/The 8-Week Specialist Schedule/m)[1] ?? '';
  // stop at the next `##` heading (Recommended Projects / Channels are separate modules)
  const schedCut = schedFull.match(/(?:^|\n)##\s/);
  const sched = schedCut ? schedFull.slice(0, schedCut.index) : schedFull;
  let m: RegExpExecArray | null = null;
  const modMarks = [...sched.matchAll(/(?:^|\n)\s*###\s+(?:[^\w\n]*\s*)?Module\s+([AB]):\s*(.+?)\s*$/gm)].map((x) => ({
    letter: x[1],
    title: clean(x[2]),
    index: x.index ?? 0,
  }));
  for (let i = 0; i < modMarks.length; i++) {
    const start = modMarks[i].index;
    const end = modMarks[i + 1]?.index ?? sched.length;
    const block = sched.slice(start, end);
    const topics: Topic[] = [];
    const wkRe = /(?:^|\n)\s*####\s+\*\*Week\s+(\d+):\s*(.+?)\*\*\s*$/gm;
    const wkMarks: { n: number; title: string; start: number; end: number }[] = [];
    while ((m = wkRe.exec(block))) wkMarks.push({ n: Number(m[1]), title: clean(m[2]), start: m.index, end: -1 });
    for (let j = 0; j < wkMarks.length; j++) wkMarks[j].end = wkMarks[j + 1]?.start ?? block.length;
    for (const wk of wkMarks) {
      const wb = block.slice(wk.start, wk.end);
      const wr = allWeekResources(wb);
      const concepts = wb.match(/\*\*Concepts:\*\*\s*(.+)/)?.[1];
      const notes = [concepts ? stripMd(concepts).slice(0, 200) : undefined, wr.practice.join(' • ') || undefined].filter(Boolean);
      topics.push({
        id: `w${String(wk.n).padStart(2, '0')}`,
        title: `Week ${wk.n}: ${wk.title}`,
        resources: wr.links,
        ...(notes.length ? { note: notes.join(' — ') } : {}),
        optional: false,
      });
    }
    modules.push({
      id: `specialist-${modMarks[i].letter.toLowerCase()}`,
      name: `Module ${modMarks[i].letter}: ${modMarks[i].title.replace(/\s*\(Weeks[^)]*\)/, '')}`,
      order: modules.length,
      topics,
      optional: false,
    });
  }

  // recommended projects + channels
  const proj = text.split(/Recommended Projects/m)[1]?.split(/^##\s/m)[0] ?? '';
  const projTopics: Topic[] = [];
  for (const sec of sections(proj, /(?:^|\n)\s*###\s+\*\*(Beginner|Intermediate|Advanced)\*\*\s*$/gm, 2)) {
    const rs = tableResources(sec.body);
    if (rs.length) projTopics.push({ id: slugify(sec.title), title: sec.title, resources: rs, optional: true });
  }
  if (projTopics.length) modules.push({ id: 'recommended-projects', name: 'Recommended Projects', order: modules.length, topics: projTopics, optional: true });

  const chan = text.split(/YouTube Channels/m)[1] ?? '';
  const chanRes = tableResources(chan);
  if (chanRes.length) modules.push({ id: 'channels', name: 'YouTube Channels', order: modules.length, resources: chanRes, topics: [], optional: true });

  return {
    id: 'phase-3-react',
    name: 'Phase 3 — React & Next.js',
    order: 2,
    goal: 'المسار المفصّل الرسمي: React → Redux → Tailwind → TypeScript → Next.js + جدول تخصصي 8 أسابيع.',
    durationText: '8 أسابيع تخصصية',
    modules,
  };
}

function feGenericTrack(file: string, trackId: string, name: string, goal: string): Module {
  const text = safeText(join(REPO, 'Front End', file)) ?? '';
  const topics: Topic[] = [];
  const practice: string[] = [];

  const numbered = sections(text, /(?:^|\n)\s*###\s+\*\*(\d+\.\s*.+?)\*\*\s*$/gm, 2);
  if (numbered.length) {
    for (const sec of numbered) {
      topics.push({
        id: slugify(sec.title),
        title: sec.title,
        resources: dedupeRes(lineLinks(sec.body).map((l) => res(l.title, l.url))),
        optional: false,
      });
    }
  } else {
    for (const sec of sections(text, /(?:^|\n)\s*###\s+\*\*?([^*\n]+?)\*\*?\s*$/gm, 2)) {
      if (/credit|contribut/i.test(sec.title)) continue;
      const rs = dedupeRes([...tableResources(sec.body), ...lineLinks(sec.body).map((l) => res(l.title, l.url))]);
      if (!rs.length) continue;
      topics.push({ id: slugify(sec.title), title: sec.title, resources: rs, optional: false });
    }
  }
  practice.push(...practiceLines(text).filter((p) => /project|app|clone|build/i.test(p)).slice(0, 8));

  return { id: trackId, name, goal, topics, practice, optional: true };
}

function frontEnd(): Circle {
  return {
    id: 'front-end',
    name: 'Front End',
    tagline: 'Phase 1 → Core Engineering → إطار عمل تخصصي',
    description:
      'مسار Front End في CAT Reloaded 2026: أساسيات HTML/CSS، بعدها سبرنت 13 أسبوع JavaScript حقيقي، وبعدها تختار مسارك (React / Angular / Vue) بجدول تخصصي 8 أسابيع.',
    color: '#f59e0b',
    icon: '⚛️',
    prereqs: [],
    status: 'structured',
    upstreamPaths: [
      'Front End/Readme.md',
      'Front End/roadmap-01-foundation.md',
      'Front End/roadmap-02-core.md',
      'Front End/roadmap-03-react.md',
      'Front End/roadmap-03-angular.md',
      'Front End/roadmap-03-vue.md',
    ],
    levels: [
      fePhase1(),
      fePhase2(),
      feReactLevel(),
      {
        id: 'alternative-tracks',
        name: 'Alternative Tracks (Angular / Vue)',
        order: 3,
        goal: 'الصفحة الرسمية بتسيبك تختار إطار العمل — React مساره مفصّل أعلاه، ودي بدائل Angular و Vue.',
        modules: [
          { ...feGenericTrack('roadmap-03-vue.md', 'vue-track', 'Vue.js Ecosystem', 'The Progressive JavaScript Framework — Nuxt للـ SSR/SSG.'), order: 0 },
          { ...feGenericTrack('roadmap-03-angular.md', 'angular-track', 'Angular Ecosystem', 'Enterprise framework — TypeScript-first.'), order: 1 },
        ],
      },
    ],
  };
}

// ---------- raw stubs ----------

const STUBS: {
  id: string;
  name: string;
  dir: string;
  readme: string;
  tagline: string;
  color: string;
  icon: string;
  note?: string;
}[] = [
  { id: 'android', name: 'Android', dir: 'Android', readme: 'README.md', tagline: 'تطبيقات أندرويد من الصفر', color: '#4ade80', icon: '📱' },
  { id: 'backend', name: 'Back End', dir: 'BackEnd', readme: 'README.md', tagline: 'Back-End بأربع تتبّعات: DotNet / Laravel / NodeJS / Spring', color: '#34d399', icon: '🛠️' },
  { id: 'cloud', name: 'Cloud Computing & DevOps', dir: 'Cloud Computing & DevOps', readme: 'README.md', tagline: 'الحوسبة السحابية و DevOps', color: '#93c5fd', icon: '☁️', note: 'submodule' },
  { id: 'computer-science', name: 'Computer Science', dir: 'Computer Science', readme: 'Readme.md', tagline: 'أساسيات علوم الحاسب', color: '#c084fc', icon: '🧮' },
  { id: 'cybersecurity', name: 'CyberSecurity', dir: 'CyberSecurity', readme: 'README.md', tagline: 'أمن سيبراني من الأساسيات للـ SOC', color: '#f87171', icon: '🔐' },
  { id: 'data-science', name: 'Data Science', dir: 'Data Science', readme: 'README.md', tagline: 'تحليل بيانات و ML', color: '#fb923c', icon: '📊' },
  { id: 'embedded', name: 'Embedded Systems', dir: 'Embedded Systems', readme: 'README.md', tagline: 'أنظمة مدمجة وميكروكنترولر', color: '#a3e635', icon: '🔩' },
  { id: 'english', name: 'English', dir: 'English', readme: 'README.md', tagline: 'إنجليزي خطوة بخطوة', color: '#f472b6', icon: '🔤' },
  { id: 'game-dev', name: 'Game Development', dir: 'Game Development', readme: 'Readme.md', tagline: 'تطوير ألعاب بـ Unity & C#', color: '#e879f9', icon: '🎮' },
  { id: 'ios', name: 'iOS', dir: 'IOS', readme: 'README.md', tagline: 'تطبيقات iOS بسويفيت', color: '#60a5fa', icon: '🍎' },
  { id: 'media', name: 'Media', dir: 'Media', readme: 'README.md', tagline: 'Content Writing / Motion Graphics / Photography', color: '#facc15', icon: '🎬' },
  { id: 'ui', name: 'UI/UX', dir: 'UI', readme: 'Readme.md', tagline: 'UI/UX من الأساسيات لمصمم واثق', color: '#2dd4bf', icon: '🖌️' },
];

function stubs(): Circle[] {
  return STUBS.map((s) => {
    const text = safeText(join(REPO, s.dir, s.readme)) ?? '';
    const description =
      text
        .split('\n')
        .map(clean)
        .filter(
          (line) =>
            line.length > 40 &&
            !line.startsWith('#') &&
            !line.startsWith('!') &&
            !line.startsWith('>') &&
            !/^https?:\/\//.test(line) &&
            !line.startsWith('|') &&
            !AR.test(line),
        )
        .slice(0, 2)
        .join(' ')
        .slice(0, 300) || s.tagline;
    return {
      id: s.id,
      name: s.name,
      tagline: s.tagline,
      description,
      color: s.color,
      icon: s.icon,
      prereqs: [] as string[],
      status: 'raw' as const,
      upstreamPaths: [
        `${s.dir}/`,
        ...(s.note ? ['submodule: KareemEl-Giushy/Cloud-Computing-RoadMap (MIT) — يُجلب يدويًا بأذن'] : []),
      ],
      levels: [],
    };
  });
}

// ---------- run ----------

const all: Circle[] = [flutter(), frontEnd(), ...stubs()];
for (const c of all) {
  // hand-authored fields survive regeneration: an existing JSON's github wins
  const prevPath = join(OUT, `${c.id}.json`);
  const prevGithub = existsSync(prevPath)
    ? (JSON.parse(readFileSync(prevPath, 'utf8')) as { github?: string }).github
    : undefined;
  writeFile({ ...c, github: prevGithub ?? c.github });
}
console.log(`\nwrote ${all.length} circles → content/circles/`);
