/**
 * Vendor raw circle content from the upstream clone into the repo:
 *   content/raw/<circleId>/**.md   (rewritten image refs)
 *   public/upstream/<circleId>/…   (images referenced by that markdown)
 *
 * Runs from the local .roadmap-repo clone — this is the "manual bring-in"
 * step the workflow agreed on: nothing is fetched at site build time.
 *
 * Run: npm run vendor
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(ROOT, '.roadmap-repo');

// circle id → upstream dir (structured circles excluded — they have typed data)
const SOURCES: Record<string, string> = {
  android: 'Android',
  backend: 'BackEnd',
  cloud: 'Cloud Computing & DevOps',
  'computer-science': 'Computer Science',
  cybersecurity: 'CyberSecurity',
  'data-science': 'Data Science',
  embedded: 'Embedded Systems',
  english: 'English',
  'game-dev': 'Game Development',
  ios: 'IOS',
  media: 'Media',
  ui: 'UI',
};

const IMG_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const name of readdir(dir)) {
    const p = join(dir, name);
    try {
      if (requireStat(p)?.isDirectory()) out.push(...listFiles(p));
      else if (name.toLowerCase().endsWith('.md') && !/^oldreadme\.md$/i.test(name)) out.push(p);
    } catch {
      /* ignore unreadable entries */
    }
  }
  return out;
}

// node helpers shadowed to keep imports light
function readdir(d: string): string[] {
  return readdirSync(d);
}
function requireStat(p: string): { isDirectory(): boolean } | null {
  return statSync(p);
}

function mojibakeRatio(text: string): number {
  const bad = (text.match(/\uFFFD/g) ?? []).length;
  return text.length ? bad / text.length : 0;
}

/** rewrite local image refs (markdown + raw <img>) to /upstream/<id>/… and collect source paths */
function rewriteImages(md: string, id: string, mdDir: string, copied: Set<string>): string {
  const destRel = (src: string): string => {
    const abs = join(mdDir, decodeURIComponent(src));
    const rel = posix.normalize(relative(join(REPO, SOURCES[id]), abs).split('\\').join('/'));
    if (!rel.startsWith('..') && existsSync(abs) && IMG_EXT.test(rel)) {
      const outAbs = join(ROOT, 'public', 'upstream', id, rel);
      mkdirSync(dirname(outAbs), { recursive: true });
      if (!copied.has(outAbs)) {
        cpSync(abs, outAbs);
        copied.add(outAbs);
      }
      return `/upstream/${id}/${encodeURI(rel).replace(/#/g, '%23')}`;
    }
    return '';
  };

  md = md.replace(/\]\((?!https?:\/\/|\/|#|data:)([^)\s]+?)(\s+"[^"]*")?\)/g, (full, src: string, title: string) => {
    if (!IMG_EXT.test(src)) return full;
    const dest = destRel(src);
    return dest ? `](${dest}${title ?? ''})` : full;
  });
  md = md.replace(/(<img[^>]+src=["'])(?!https?:\/\/|\/|#|data:)([^"']+?)(["'])/gi, (full, pre: string, src: string, post: string) => {
    const dest = destRel(src);
    return dest ? `${pre}${dest}${post}` : full;
  });
  return md;
}

let totalCopied = 0;
const vendored: Record<string, { mdFiles: number; images: number; upstreamDir: string }> = {};
for (const [id, srcDir] of Object.entries(SOURCES)) {
  const files = listFiles(join(REPO, srcDir));
  const copied = new Set<string>();
  for (const file of files) {
    const raw = readFileSync(file);
    const text = raw.toString('utf8');
    if (mojibakeRatio(text) > 0.02) {
      console.warn(`⚠ skip (mojibake): ${relative(REPO, file)}`);
      continue;
    }
    const outRel = relative(join(REPO, srcDir), file).split('\\').join('/');
    const rewritten = rewriteImages(text, id, dirname(file), copied);
    // must live under src/ for Astro's markdown pipeline (import.meta.glob)
    const outPath = join(ROOT, 'src', 'content', 'raw', id, outRel);
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, rewritten);
  }
  console.log(`✓ ${id}: ${files.length} md files, ${copied.size} images`);
  vendored[id] = { mdFiles: files.length, images: copied.size, upstreamDir: srcDir };
  totalCopied += copied.size;
}

// provenance record — what the site content was built from
const upstreamCommit = execSync('git -C .roadmap-repo rev-parse HEAD', { encoding: 'utf8' }).trim();
const sources = {
  upstream: {
    repo: 'https://github.com/CATReloaded/CATReloaded-Circles-Roadmaps',
    // upstream main is stale — the live roadmap lives on the 2026 branch
    branch: '2026',
    commit: upstreamCommit,
    fetchedAt: new Date().toISOString().slice(0, 10),
    note: 'إذن CATReloaded مطلوب قبل أي نشر عام — upstream بلا ملف LICENSE.',
  },
  submodule: {
    path: 'Cloud Computing & DevOps/Cloud-Computing-RoadMap',
    repo: 'https://github.com/KareemEl-Giushy/Cloud-Computing-RoadMap',
    license: 'MIT',
    state: 'فاضي في الـ clone — بيتجاب يدويًا (npm run vendor بعد init)',
  },
  vendored,
};

writeFileSync(join(ROOT, 'content', 'SOURCES.json'), JSON.stringify(sources, null, 2) + '\n');
console.log(`\nvendored → content/raw/ + ${totalCopied} images → public/upstream/`);
console.log(`wrote content/SOURCES.json (upstream ${upstreamCommit.slice(0, 9)})`);
