#!/usr/bin/env node
'use strict';

/**
 * Sync tool/leaderboard archived status from GitHub API and bump lastReviewed.
 * Archives tools when their canonical GitHub repo is read-only; archives
 * leaderboards when every related tool is archived.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dataPath = join(root, 'data.js');
const leaderboardsPath = join(root, 'leaderboards.js');

const today = new Date().toISOString().slice(0, 10);

const dataSource = readFileSync(dataPath, 'utf8');
const leaderboardsSource = readFileSync(leaderboardsPath, 'utf8');

const fn = new Function(`${dataSource}\n${leaderboardsSource}; return LANDSCAPE;`);
const landscape = fn();

const githubUrlRe = /https?:\/\/github\.com\/([^/]+\/[^/]+)/;

const extractRepo = (url) => {
  if (!url) return null;
  const m = url.match(githubUrlRe);
  if (!m) return null;
  return m[1].replace(/\.git$/, '').split('/').slice(0, 2).join('/');
};

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'evalscape-refresh-status',
};
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const upsertQuotedField = (source, id, field, value) => {
  const fieldRe = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?${field}:\\s*)'[^']*'`);
  if (fieldRe.test(source)) {
    return source.replace(fieldRe, `$1'${value}'`);
  }
  const insertRe = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?url:\\s*'[^']*',\\n)`);
  if (!insertRe.test(source)) return source;
  return source.replace(insertRe, `$1      ${field}: '${value}',\n`);
};

const upsertStatus = (source, id, status) => {
  const statusRe = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?status:\\s*)'?(active|experimental|archived)'?`);
  if (statusRe.test(source)) {
    return source.replace(statusRe, `$1'${status}'`);
  }
  const insertRe = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?url:\\s*'[^']*',\\n)`);
  if (!insertRe.test(source)) return source;
  return source.replace(insertRe, `$1      status: '${status}',\n`);
};

let dataJs = dataSource;
let leaderboardsJs = leaderboardsSource;
const archivedToolIds = new Set();
let toolUpdates = 0;
let leaderboardUpdates = 0;

for (const tool of landscape.tools) {
  const repo = extractRepo(tool.url);
  if (!repo) continue;

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!res.ok) {
      console.warn(`  skip ${repo} (${tool.id}): HTTP ${res.status}`);
      await sleep(res.status === 403 ? 60000 : 500);
      continue;
    }
    const meta = await res.json();
    const next = dataJs;

    if (meta.archived) {
      archivedToolIds.add(tool.id);
      if (tool.status !== 'archived') {
        dataJs = upsertStatus(dataJs, tool.id, 'archived');
        console.log(`  ${tool.id}: marked archived (${repo})`);
        toolUpdates++;
      }
    }

    dataJs = upsertQuotedField(dataJs, tool.id, 'lastReviewed', today);
    if (next !== dataJs && tool.status === 'archived' && meta.archived) {
      // lastReviewed only bump — don't double-count
    }

    console.log(`  ${tool.id}: checked ${repo} (archived=${meta.archived})`);
    await sleep(300);
  } catch (err) {
    console.warn(`  skip ${repo} (${tool.id}): ${err.message}`);
  }
}

for (const lb of landscape.leaderboards || []) {
  const related = lb.relatedTools || [];
  const baseToolId = lb.id.endsWith('-leaderboard') ? lb.id.slice(0, -'-leaderboard'.length) : null;
  const shouldArchive =
    (baseToolId && archivedToolIds.has(baseToolId)) ||
    (related.length > 0 && related.every((id) => archivedToolIds.has(id)));

  if (shouldArchive && lb.status !== 'archived') {
    leaderboardsJs = upsertStatus(leaderboardsJs, lb.id, 'archived');
    console.log(`  ${lb.id}: marked archived (related tools archived)`);
    leaderboardUpdates++;
  }

  leaderboardsJs = upsertQuotedField(leaderboardsJs, lb.id, 'lastReviewed', today);
}

if (dataJs !== dataSource) {
  writeFileSync(dataPath, dataJs);
  console.log(`Updated data.js (${toolUpdates} status change(s)).`);
} else {
  console.log('No data.js status changes.');
}

if (leaderboardsJs !== leaderboardsSource) {
  writeFileSync(leaderboardsPath, leaderboardsJs);
  console.log(`Updated leaderboards.js (${leaderboardUpdates} status change(s)).`);
} else {
  console.log('No leaderboards.js status changes.');
}
