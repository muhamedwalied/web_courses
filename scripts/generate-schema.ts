import { writeFileSync } from 'node:fs';
import { z } from 'zod';
import { CircleSchema } from '../src/schemas/roadmap';

/**
 * Emits content/circles.schema.json (JSON Schema, draft 2020-12) so editors
 * give autocomplete + validation when hand-tuning circle JSON files.
 * Circle JSON files reference it via "$schema": "../circles.schema.json".
 */
const jsonSchema = z.toJSONSchema(CircleSchema, { io: 'output' });

const out = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'circles.schema.json',
  title: 'CAT Roadmaps — circle content',
  ...jsonSchema,
};

writeFileSync(new URL('../content/circles.schema.json', import.meta.url), JSON.stringify(out, null, 2) + '\n');
console.log('wrote content/circles.schema.json');
