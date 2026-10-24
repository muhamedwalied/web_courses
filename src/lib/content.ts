import { z } from 'zod';
import { CircleSchema, type Circle, type Level, type Module, type Topic, topicKey } from '../schemas/roadmap';

/**
 * Content loader — every JSON under content/circles/ is validated against the
 * Zod schema at build time. A malformed file fails `astro build` loudly
 * instead of silently rendering an empty page.
 */

const files = import.meta.glob('../../content/circles/*.json', { eager: true }) as Record<string, { default: unknown }>;

export const circles: Circle[] = Object.entries(files)
  .map(([path, mod]) => {
    const parsed = CircleSchema.safeParse(mod.default);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
      throw new Error(`[content] invalid circle JSON at ${path} → ${issues}`);
    }
    return parsed.data;
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export function getCircle(id: string): Circle | undefined {
  return circles.find((c) => c.id === id);
}

export const structuredCircles = circles.filter((c) => c.status === 'structured');
export const rawCircles = circles.filter((c) => c.status === 'raw');

export function circleModules(circle: Circle): { level: Level; module: Module }[] {
  const out: { level: Level; module: Module }[] = [];
  for (const level of [...circle.levels].sort((a, b) => a.order - b.order)) {
    for (const module of [...level.modules].sort((a, b) => a.order - b.order)) {
      out.push({ level, module });
    }
  }
  return out;
}

export function moduleTopics(module: Module): Topic[] {
  return [...module.topics].sort((a, b) => a.id.localeCompare(b.id));
}

/** all topics in the circle with their stable progress keys */
export function circleTopics(circle: Circle): { key: string; topic: Topic; module: Module; level: Level }[] {
  const out: { key: string; topic: Topic; module: Module; level: Level }[] = [];
  for (const level of circle.levels) {
    for (const module of level.modules) {
      for (const topic of module.topics) {
        out.push({ key: topicKey(circle.id, level.id, module.id, topic.id), topic, module, level });
      }
    }
  }
  return out;
}

export function countAllTopics(circle: Circle): { required: number; optional: number; resources: number } {
  const topics = circleTopics(circle);
  return {
    required: topics.filter((t) => !t.topic.optional).length,
    optional: topics.filter((t) => t.topic.optional).length,
    resources: circle.levels.reduce(
      (acc, l) =>
        acc +
        l.modules.reduce(
          (acc, m) => acc + m.resources.length + m.topics.reduce((acc, t) => acc + t.resources.length, 0),
          0,
        ),
      0,
    ),
  };
}

/** ensure unique topic keys per circle — fails the build on collisions */
export function assertCircleContent(circle: Circle): void {
  const keys = circleTopics(circle).map((t) => t.key);
  const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
  if (dupes.length) throw new Error(`[content] duplicate topic keys in "${circle.id}": ${[...new Set(dupes)].join(', ')}`);
}

for (const circle of circles) assertCircleContent(circle);

export { topicKey };
export const contentSchemaIssue = (data: unknown): z.SafeParseReturnType<unknown, unknown> => CircleSchema.safeParse(data);
