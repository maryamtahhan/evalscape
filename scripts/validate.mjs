#!/usr/bin/env node
'use strict';

/**
 * Extract LANDSCAPE from data.js + leaderboards.js + standards.js and validate against schema.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const dataJs = readFileSync(join(root, 'data.js'), 'utf8');
const leaderboardsJs = readFileSync(join(root, 'leaderboards.js'), 'utf8');
const standardsJs = readFileSync(join(root, 'standards.js'), 'utf8');
const schema = JSON.parse(readFileSync(join(root, 'schema/landscape.schema.json'), 'utf8'));

const fn = new Function(`${dataJs}\n${leaderboardsJs}\n${standardsJs}; return LANDSCAPE;`);
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

const categoryIds = new Set(landscape.categories.map((c) => c.id));
const toolIds = new Set(landscape.tools.map((t) => t.id));
const lbIds = new Set((landscape.leaderboards || []).map((lb) => lb.id));

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

for (const lb of landscape.leaderboards || []) {
  if (!categoryIds.has(lb.category)) {
    console.error(`Leaderboard "${lb.id}" references unknown category "${lb.category}"`);
    process.exit(1);
  }
  for (const rel of lb.relatedTools || []) {
    if (!toolIds.has(rel)) {
      console.error(`Leaderboard "${lb.id}" references unknown related tool "${rel}"`);
      process.exit(1);
    }
  }
}

for (const std of landscape.standards || []) {
  if (!categoryIds.has(std.category)) {
    console.error(`Standard "${std.id}" references unknown category "${std.category}"`);
    process.exit(1);
  }
  for (const rel of std.relatedTools || []) {
    if (!toolIds.has(rel)) {
      console.error(`Standard "${std.id}" references unknown related tool "${rel}"`);
      process.exit(1);
    }
  }
  for (const rel of std.relatedLeaderboards || []) {
    if (!lbIds.has(rel)) {
      console.error(`Standard "${std.id}" references unknown related leaderboard "${rel}"`);
      process.exit(1);
    }
  }
}

const dupes = landscape.tools.map((t) => t.id).filter((id, i, arr) => arr.indexOf(id) !== i);
if (dupes.length) {
  console.error(`Duplicate tool ids: ${[...new Set(dupes)].join(', ')}`);
  process.exit(1);
}

const lbDupes = (landscape.leaderboards || []).map((lb) => lb.id).filter((id, i, arr) => arr.indexOf(id) !== i);
if (lbDupes.length) {
  console.error(`Duplicate leaderboard ids: ${[...new Set(lbDupes)].join(', ')}`);
  process.exit(1);
}

const stdDupes = (landscape.standards || []).map((s) => s.id).filter((id, i, arr) => arr.indexOf(id) !== i);
if (stdDupes.length) {
  console.error(`Duplicate standard ids: ${[...new Set(stdDupes)].join(', ')}`);
  process.exit(1);
}

const lbCount = landscape.leaderboards?.length || 0;
const stdCount = landscape.standards?.length || 0;
console.log(`Validated ${landscape.tools.length} tools, ${lbCount} leaderboards, and ${stdCount} standards in ${landscape.categories.length} categories.`);
