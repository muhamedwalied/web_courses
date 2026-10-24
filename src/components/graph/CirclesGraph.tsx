import { useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export interface GraphCircle {
  id: string;
  name: string;
  icon: string;
  color: string;
  status: 'structured' | 'raw';
  topics: number;
  prereqs?: string[];
}

interface CircleNodeData extends Record<string, unknown> {
  circle: GraphCircle;
}

function CircleNode({ data }: NodeProps) {
  const c = (data as CircleNodeData).circle;
  const [structured, accent, label] =
    c.status === 'structured'
      ? [true, c.color, `${c.topics} موضوع`]
      : [false, c.color, 'قيد الإعداد'];
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = `/circles/${c.id}`;
      }}
      className="group w-48 cursor-pointer rounded-xl border bg-panel/95 p-3 text-start shadow-lg backdrop-blur transition hover:scale-[1.03] hover:shadow-xl"
      style={{ borderColor: `${c.color}55` }}
    >
      <Handle type="target" position={Position.Right} className="!bg-transparent !border-0 !w-1 !h-1 !min-h-0 !min-w-0" />
      <Handle type="source" position={Position.Left} className="!bg-transparent !border-0 !w-1 !h-1 !min-h-0 !min-w-0" />
      <div className="flex items-center gap-2.5">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg text-lg"
          style={{ background: `${c.color}1f`, boxShadow: `inset 0 0 0 1px ${c.color}40` }}
        >
          {c.icon}
        </span>
        <span className="min-w-0">
          <span dir="ltr" className="block truncate text-sm font-bold text-ink group-hover:text-white">
            {c.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 font-mono text-[10px]">
            <span className={`size-1.5 rounded-full ${structured ? '' : 'opacity-40'}`} style={{ background: structured ? accent : '#8b98a9' }} />
            <span className={structured ? 'text-accent' : 'text-muted/70'}>{label}</span>
          </span>
        </span>
      </div>
    </button>
  );
}

const nodeTypes = { circle: CircleNode };

function layout(circles: GraphCircle[]): Node[] {
  // layers from prereq depth (longest path); zero-edge sets fall back to a grid
  const layerOf = new Map<string, number>();
  const byId = new Map(circles.map((c) => [c.id, c]));
  const depth = (id: string, seen: Set<string>): number => {
    const c = byId.get(id);
    if (!c || seen.has(id)) return 0;
    seen.add(id);
    const prereqs = c.prereqs ?? [];
    if (!prereqs.length) return 0;
    return 1 + Math.max(...prereqs.map((p) => depth(p, seen)));
  };
  for (const c of circles) layerOf.set(c.id, depth(c.id, new Set()));
  const maxLayer = Math.max(...[...layerOf.values()]);

  const nodes: Node[] = [];
  if (maxLayer === 0) {
    const cols = Math.min(4, Math.ceil(Math.sqrt(circles.length)));
    circles.forEach((c, i) => {
      nodes.push({
        id: c.id,
        type: 'circle',
        position: { x: (i % cols) * 230, y: Math.floor(i / cols) * 110 },
        data: { circle: c },
      });
    });
  } else {
    const rows = new Map<number, string[]>();
    for (const c of circles) {
      const l = layerOf.get(c.id) ?? 0;
      if (!rows.has(l)) rows.set(l, []);
      rows.get(l)!.push(c.id);
    }
    for (const [l, ids] of rows) {
      ids.forEach((id, i) => {
        const c = byId.get(id)!;
        nodes.push({ id, type: 'circle', position: { x: l * 300, y: i * 110 }, data: { circle: c } });
      });
    }
  }
  return nodes;
}

export default function CirclesGraph({ circles, dir = 'rtl' }: { circles: GraphCircle[]; dir?: string }) {
  const nodes = useMemo(() => layout(circles), [circles]);
  const edges = useMemo<Edge[]>(
    () =>
      circles.flatMap((c) =>
        (c.prereqs ?? []).map((p) => ({
          id: `${p}->${c.id}`,
          source: p,
          target: c.id,
          animated: true,
          style: { stroke: 'var(--color-accent-2)', strokeWidth: 1.5, opacity: 0.7 },
        })),
      ),
    [circles],
  );
  return (
    <div className="relative h-[540px] overflow-hidden rounded-2xl border border-edge" dir="ltr">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15, maxZoom: 1 }}
        minZoom={0.5}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.4} color="#2a3750" />
        <Controls showInteractive={false} className="!mb-3" />
      </ReactFlow>
      <div dir={dir} className="pointer-events-none absolute inset-x-0 top-3 z-10 flex justify-center">
        <p className="rounded-full border border-edge bg-bg/70 px-3 py-1 font-mono text-[11px] text-muted backdrop-blur">
          الدوائر المرتبطة بأسهم = متطلبات مسبقة — دوس أي دايرة لتفتح مسارها
        </p>
      </div>
    </div>
  );
}
