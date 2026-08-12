#!/usr/bin/env node
'use strict';

/**
 * Fetch missing logos for tools in data.js.
 *
 * For each tool:
 *  - If the logo file already exists on disk → skip.
 *  - If the logo field is missing → derive path as logos/<id>.png, add it to data.js.
 *  - Fetch from the GitHub org avatar (https://github.com/<org>.png?size=128).
 *
 * Requires GITHUB_TOKEN for higher rate limits (optional but recommended).
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const dataPath = join(rootDir, 'data.js');
const logosDir = join(rootDir, 'logos');

let source = readFileSync(dataPath, 'utf8');

const fn = new Function(`${source}; return LANDSCAPE;`);
const landscape = fn();

const githubUrlRe = /https?:\/\/github\.com\/([^/]+)/;

const extractOrg = (url) => {
  if (!url) return null;
  const m = url.match(githubUrlRe);
  return m ? m[1] : null;
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const headers = { 'User-Agent': 'evalscape-refresh-logos' };
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

let fetched = 0;
let skipped = 0;
let dataModified = false;

for (const tool of landscape.tools) {
  // Derive expected logo path
  const expectedLogoField = `logos/${tool.id}.png`;
  const logoField = tool.logo ?? expectedLogoField;
  const logoPath = join(rootDir, logoField);

  // If the file already exists, nothing to do
  if (existsSync(logoPath)) {
    // Still patch data.js if the logo field was missing
    if (!tool.logo) {
      source = source.replace(
        new RegExp(`(id:\\s*'${tool.id}'[\\s\\S]*?)(\\n\\s+stars:)`),
        `$1\n      logo: '${expectedLogoField}',$2`,
      );
      dataModified = true;
      console.log(`  ${tool.id}: logo file exists, added missing logo field`);
    }
    continue;
  }

  const org = extractOrg(tool.url);
  if (!org) {
    console.warn(`  ${tool.id}: cannot derive org from URL "${tool.url}", skipping`);
    skipped++;
    continue;
  }

  const avatarUrl = `https://github.com/${org}.png?size=128`;
  try {
    const res = await fetch(avatarUrl, { headers });
    if (!res.ok) {
      console.warn(`  ${tool.id}: HTTP ${res.status} fetching ${avatarUrl}, skipping`);
      skipped++;
      await sleep(res.status === 403 ? 60000 : 500);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(logoPath, buf);
    fetched++;
    console.log(`  ${tool.id}: saved ${logoField} (${buf.length} bytes) from ${org}`);

    // Patch data.js if the logo field was missing
    if (!tool.logo) {
      source = source.replace(
        new RegExp(`(id:\\s*'${tool.id}'[\\s\\S]*?)(\\n\\s+stars:)`),
        `$1\n      logo: '${expectedLogoField}',$2`,
      );
      dataModified = true;
    }
    await sleep(300);
  } catch (err) {
    console.warn(`  ${tool.id}: ${err.message}, skipping`);
    skipped++;
  }
}

if (dataModified) {
  writeFileSync(dataPath, source);
  console.log('Updated data.js with missing logo fields.');
}

console.log(`\nDone. Fetched: ${fetched}, skipped: ${skipped}.`);
