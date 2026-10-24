import { z } from 'zod';

/**
 * Canonical content schema — single source of truth.
 * Consumed by:
 *  - src/lib/content.ts   (site loader, validated at build time)
 *  - scripts/convert.ts   (converter that drafts circle JSON from upstream)
 *  - scripts/generate-schema.ts  (emits content/circles.schema.json for editors)
 */

export const RESOURCE_KINDS = ['playlist', 'video', 'docs', 'article', 'book', 'repo', 'interactive', 'other'] as const;
export const LANGS = ['ar', 'en'] as const;
export const CIRCLE_STATUSES = ['structured', 'raw'] as const;

export const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'kebab-case id');
export const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, '#RRGGBB');

export const ResourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  kind: z.enum(RESOURCE_KINDS),
  lang: z.enum(LANGS),
  note: z.string().optional(),
});

export const TopicSchema = z.object({
  id: slug,
  title: z.string().min(1),
  resources: z.array(ResourceSchema).default([]),
  note: z.string().optional(),
  /** optional topics are excluded from required-progress rollups but still checkable */
  optional: z.boolean().default(false),
});

export const ModuleSchema = z.object({
  id: slug,
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  goal: z.string().optional(),
  objectives: z.array(z.string()).default([]),
  practice: z.array(z.string()).default([]),
  topics: z.array(TopicSchema).default([]),
  /** module-level resources that are not tied to a single topic */
  resources: z.array(ResourceSchema).default([]),
  optional: z.boolean().default(false),
});

export const LevelSchema = z.object({
  id: slug,
  name: z.string().min(1),
  order: z.number().int().nonnegative(),
  durationText: z.string().optional(),
  goal: z.string().optional(),
  modules: z.array(ModuleSchema).default([]),
});

export const CircleSchema = z.object({
  id: slug,
  name: z.string().min(1),
  tagline: z.string().optional(),
  description: z.string().default(''),
  color: hexColor,
  /** short emoji glyph shown next to the name */
  icon: z.string().optional(),
  /** ids of circles that should be studied first — feeds the home graph edges */
  prereqs: z.array(z.string()).default([]),
  status: z.enum(CIRCLE_STATUSES),
  /** upstream paths this content was derived from (provenance) */
  upstreamPaths: z.array(z.string()).default([]),
  /** cover/thumbnail path under /public (optional) */
  cover: z.string().optional(),
  /** intro copy for the circle page hero (optional — legacy JSONs omit it) */
  overview: z
    .object({
      paragraphs: z.array(z.string()).default([]),
      highlights: z.array(z.string()).default([]),
    })
    .optional(),
  levels: z.array(LevelSchema).default([]),
});

export type Resource = z.infer<typeof ResourceSchema>;
export type Topic = z.infer<typeof TopicSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Level = z.infer<typeof LevelSchema>;
export type Circle = z.infer<typeof CircleSchema>;

/** stable progress key for a topic — never changes if the order changes */
export function topicKey(circleId: string, levelId: string, moduleId: string, topicId: string): string {
  return `${circleId}/${levelId}/${moduleId}/${topicId}`;
}
