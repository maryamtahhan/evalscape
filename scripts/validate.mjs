#!/usr/bin/env node
'use strict';

/**
 * Extract LANDSCAPE from data.js and validate against schema/landscape.schema.json
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const dataJs = readFileSync(join(root, 'data.js'), 'utf8');
const schema = JSON.parse(readFileSync(join(root, 'schema/landscape.schema.json'), 'utf8'));

// Evaluate data.js in a sandboxed context
const fn = new Function(`${dataJs}; return LANDSCAPE;`);
const landscape = fn();

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validate = ajv.compile(schema);

if (!validate(landscape)) {
  console.error('Validation failed:');
  for (const err of validate.errors) {
    console.error(`  ${err.instancePath || '/'}: ${err.message}`);
  }
  process.exit(1);
}

// Cross-reference checks
const categoryIds = new Set(landscape.categories.map((c) => c.id));
const toolIds = new Set(landscape.tools.map((t) => t.id));

for (const tool of landscape.tools) {
  if (!categoryIds.has(tool.category)) {
    console.error(`Tool "${tool.id}" references unknown category "${tool.category}"`);
    process.exit(1);
  }
  for (const rel of tool.related || []) {
    if (!toolIds.has(rel)) {
      console.error(`Tool "${tool.id}" references unknown related tool "${rel}"`);
      process.exit(1);
    }
  }
}

const dupes = landscape.tools.map((t) => t.id).filter((id, i, arr) => arr.indexOf(id) !== i);
if (dupes.length) {
  console.error(`Duplicate tool ids: ${[...new Set(dupes)].join(', ')}`);
  process.exit(1);
}

console.log(`Validated ${landscape.tools.length} tools in ${landscape.categories.length} categories.`);
