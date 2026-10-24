import { useMemo, useState } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// ---------- shapes (mirrors the Zod schema, serialized) ----------

export interface SerResource {
  title: string;
  url: string;
  kind: string;
  lang: 'ar' | 'en';
}
export interface SerTopic {
  id: string;
  title: string;
  resources: SerResource[];
  note?: string;
}
export interface SerModule {
  id: string;
  name: string;
  order: number;
  goal?: string;
  objectives?: string[];
  topics: SerTopic[];
  resources: SerResource[];
  optional?: boolean;
}
export interface SerLevel {
  id: string;
  name: string;
  order: number;
  durationText?: string;
  goal?: string;
  modules: SerModule[];
}
export interface SerCircle {
  id: string;
  name: string;
  color: string;
  icon: string;
  levels: SerLevel[];
}

// ---------- url helpers ----------

function ytEmbed(url: string): { src: string; thumb: string } | null {
  const id = url.match(/(?:watch\?v=|youtu\.be\/)([\w-]{6,})/)?.[1];
  if (id) return { src: `https://www.youtube-nocookie.com/embed/${id}`, thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg` };
  const list = url.match(/list=([\w-]+)/)?.[1];
  if (list && url.includes('playlist')) return { src: `https://www.youtube-nocookie.com/embed/videoseries?list=${list}`, thumb: '' };
  return null;
}

const KIND_ICONS: Record<string, string> = {
  playlist: '🎞️',
  video: '🎬',
  docs: '📘',
  article: '📄',
  book: '📕',
  repo: '🐙',
  interactive: '🧪',
  other: '🔗',
};

// ---------- nodes ----------

function LevelNode({ data }: NodeProps) {
  const d = data as { label: string; sub?: string; color: string };
  return (
    <div className="w-56 rounded-xl border p-3 text-center" style={{ borderColor: `${d.color}66`, background: `${d.color}14` }}>
      <Handle type="source" position={Position.Bottom} className="!bg-transparent !border-0 !size-1.5 !min-h-0 !min-w-0" />
      <div className="text-sm font-bold text-ink">{d.label}</div>
      {d.sub && <div className="mt-1 font-mono text-[10px] text-muted">{d.sub}</div>}
    </div>
  );
}

function ModuleNode({ data, selected }: NodeProps) {
  const d = data as { label: string; sub?: string; color: string; optional?: boolean; mid: string; lid: string; onSelect: (lid: string, mid: string) => void };
  return (
    <button
      type="button"
      onClick={() => d.onSelect(d.lid, d.mid)}
      className={`w-52 cursor-pointer rounded-lg border p-2.5 text-start transition hover:scale-[1.02] ${selected ? 'ring-2' : ''}`}
      style={{
        borderColor: d.color + (selected ? '' : '44'),
        background: '#141c28',
        ...(selected ? ({ '--tw-ring-color': d.color } as React.CSSProperties) : {}),
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-transparent !border-0 !size-1.5 !min-h-0 !min-w-0" />
      <div className="truncate text-xs font-bold text-ink">{d.label}</div>
      {d.sub && <div className="mt-0.5 truncate font-mono text-[10px] text-muted">{d.sub}</div>}
    </button>
  );
}

const nodeTypes = { level: LevelNode, module: ModuleNode };

// ---------- resource chip + embed facade ----------

function ResourceChip({ r }: { r: SerResource }) {
  const [open, setOpen] = useState(false);
  const yt = r.kind === 'playlist' || r.kind === 'video' ? ytEmbed(r.url) : null;
  if (yt && open) {
    return (
      <span className="block overflow-hidden rounded-lg border border-edge">
        <iframe
          src={yt.src}
          title={r.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          className="aspect-video w-full"
        />
      </span>
    );
  }
  if (yt) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="group flex w-full items-center gap-2.5 rounded-lg border border-edge bg-bg/50 p-2 text-start transition hover:border-accent/50">
        <span className="relative w-24 shrink-0 overflow-hidden rounded-md bg-edge/60">
          {yt.thumb ? (
            <img src={yt.thumb} alt="" loading="lazy" className="aspect-video w-full object-cover opacity-80 transition group-hover:opacity-100" />
          ) : (
            <span className="grid aspect-video place-items-center text-xl">🎞️</span>
          )}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-7 place-items-center rounded-full bg-black/60 text-[10px] text-white">▶</span>
          </span>
        </span>
        <span className="min-w-0">
          <span dir="ltr" className="block truncate text-xs font-semibold text-ink">{r.title}</span>
          <span className="text-[10px] text-muted">{r.lang === 'ar' ? 'دوس للتشغيل هنا — عربي' : 'play here'}</span>
        </span>
      </button>
    );
  }
  return (
    <a
      href={r.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-edge bg-bg/50 px-2.5 py-1.5 text-xs transition hover:border-accent/50"
    >
      <span>{KIND_ICONS[r.kind] ?? '🔗'}</span>
      <span dir="auto" className="min-w-0 flex-1 truncate text-ink">{r.title}</span>
      {r.lang === 'ar' && <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[9px] text-accent">عربي</span>}
    </a>
  );
}

// ---------- main island ----------

export default function CircleMap({ circle }: { circle: SerCircle }) {
  const [sel, setSel] = useState<{ lid: string; mid: string } | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  const flat = useMemo(
    () => circle.levels.flatMap((l) => l.modules.map((m) => ({ l, m }))),
    [circle],
  );
  const current = useMemo(() => {
    if (sel) return flat.find((x) => x.l.id === sel.lid && x.m.id === sel.mid) ?? null;
    return flat[0] ?? null;
  }, [sel, flat]);

  const nodes = useMemo<Node[]>(() => {
    const nodes: Node[] = [];
    circle.levels.forEach((l, li) => {
      nodes.push({
        id: l.id,
        type: 'level',
        position: { x: li * 320, y: 0 },
        data: { label: l.name, sub: l.durationText, color: circle.color },
      });
      l.modules.forEach((m, mi) => {
        nodes.push({
          id: `${l.id}/${m.id}`,
          type: 'module',
          position: { x: li * 320 + 22, y: 110 + mi * 86 },
          data: {
            label: m.name,
            sub: m.topics.length ? `${m.topics.length} topic${m.topics.length > 1 ? 's' : ''}` : undefined,
            color: circle.color,
            optional: m.optional,
            mid: m.id,
            lid: l.id,
            onSelect: (lid: string, mid: string) => setSel({ lid, mid }),
          },
        });
      });
    });
    return nodes;
  }, [circle]);

  const edges = useMemo<Edge[]>(
    () =>
      circle.levels.flatMap((l) =>
        l.modules.map((m) => ({
          id: `${l.id}~${m.id}`,
          source: l.id,
          target: `${l.id}/${m.id}`,
          style: { stroke: circle.color, opacity: 0.35, strokeWidth: 1.2 },
        })),
      ),
    [circle],
  );

  const toggle = (lid: string, mid: string, tid: string) => {
    setDone((prev) => {
      const next = new Set(prev);
      const key = `${lid}/${mid}/${tid}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      {/* graph — hidden on small screens (module chips below act as fallback) */}
      <div className="hidden h-[620px] overflow-hidden rounded-2xl border border-edge lg:block" dir="ltr">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.12, maxZoom: 0.95 }}
          minZoom={0.35}
          proOptions={{ hideAttribution: true }}
          nodesDraggable={false}
          nodesConnectable={false}
        >
          <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#2a3750" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {/* details panel */}
      <div className="rounded-2xl border border-edge bg-panel/50">
        {/* mobile module picker */}
        <div className="flex gap-1.5 overflow-x-auto p-3 lg:hidden" dir="rtl">
          {flat.map(({ l, m }) => (
            <button
              key={`${l.id}/${m.id}`}
              type="button"
              onClick={() => setSel({ lid: l.id, mid: m.id })}
              className={`shrink-0 rounded-lg border px-2.5 py-1 text-xs ${current?.m.id === m.id && current?.l.id === l.id ? 'border-accent text-accent' : 'border-edge text-muted'}`}
            >
              {m.name}
            </button>
          ))}
        </div>
        {current ? (
          <div className="p-5 pt-0 lg:pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md px-2 py-0.5 font-mono text-[10px]" style={{ background: circle.color + '1f', color: circle.color }}>
                {current.l.name}
                {current.l.durationText ? ` · ${current.l.durationText}` : ''}
              </span>
              {current.m.optional && <span className="rounded-md bg-edge/50 px-2 py-0.5 font-mono text-[10px] text-muted">اختياري</span>}
            </div>
            <h3 dir="ltr" className="mt-3 text-start text-lg font-bold">{current.m.name}</h3>
            {current.m.goal && <p className="mt-1 text-sm text-muted">{current.m.goal}</p>}

            {current.m.objectives && current.m.objectives.length > 0 && (
              <ul dir="ltr" className="mt-4 space-y-1.5 border-s-2 border-edge ps-4 text-start text-sm text-muted">
                {current.m.objectives.map((o, i) => (
                  <li key={i}>{o}</li>
                ))}
              </ul>
            )}

            {current.m.topics.length > 0 && (
              <ul className="mt-5 space-y-3">
                {current.m.topics.map((t) => {
                  const key = `${current.l.id}/${current.m.id}/${t.id}`;
                  const isDone = done.has(key);
                  return (
                    <li key={t.id} className="rounded-xl border border-edge bg-bg/40 p-3">
                      <label className="flex cursor-pointer items-start gap-2.5">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggle(current.l.id, current.m.id, t.id)}
                          className="mt-0.5 size-4 accent-[var(--color-accent)]"
                        />
                        <span dir="auto" className={`text-sm font-semibold ${isDone ? 'text-muted line-through' : 'text-ink'}`}>{t.title}</span>
                      </label>
                      {t.note && <p dir="auto" className="mt-1.5 ps-7 text-xs leading-6 text-muted">{t.note}</p>}
                      {t.resources.length > 0 && (
                        <div dir="ltr" className="mt-2.5 space-y-1.5 ps-7 text-start">
                          {t.resources.map((r, i) => (
                            <ResourceChip key={i} r={r} />
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {current.m.resources.length > 0 && (
              <div dir="ltr" className="mt-4 space-y-1.5 text-start">
                <div dir="rtl" className="text-xs font-semibold text-muted">مصادر إضافية</div>
                {current.m.resources.map((r, i) => (
                  <ResourceChip key={i} r={r} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="p-6 text-sm text-muted">هذا المسار لسه مفيهوش تفاصيل منظّمة.</p>
        )}
      </div>
    </div>
  );
}
