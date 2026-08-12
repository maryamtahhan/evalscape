#!/usr/bin/env node
'use strict';

/**
 * Refresh GitHub star/fork counts in data.js from the GitHub API.
 * Requires GITHUB_TOKEN for higher rate limits (optional).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = join(__dirname, '..', 'data.js');
let source = readFileSync(dataPath, 'utf8');

const fn = new Function(`${source}; return LANDSCAPE;`);
const landscape = fn();

const githubUrlRe = /https?:\/\/github\.com\/([^/]+\/[^/]+)/;

const extractRepo = (url) => {
  if (!url) return null;
  const m = url.match(githubUrlRe);
  if (!m) return null;
  let repo = m[1].replace(/\.git$/, '');
  // Strip paths like /blob/main/...
  repo = repo.split('/').slice(0, 2).join('/');
  return repo;
};

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'evalscape-refresh-stars',
};
if (process.env.GITHUB_TOKEN) {
  headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let updated = 0;
const repos = new Map();

for (const tool of landscape.tools) {
  const repo = extractRepo(tool.url);
  if (!repo) continue;
  if (!repos.has(repo)) repos.set(repo, []);
  repos.get(repo).push(tool.id);
}

for (const [repo, toolIds] of repos) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, { headers });
    if (!res.ok) {
      console.warn(`  skip ${repo}: HTTP ${res.status}`);
      await sleep(res.status === 403 ? 60000 : 500);
      continue;
    }
    const data = await res.json();
    const stars = data.stargazers_count ?? 0;
    const forks = data.forks_count ?? 0;

    for (const id of toolIds) {
      const starsRe = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?stars:\\s*)\\d+`);
      const forksRe = new RegExp(`(id:\\s*'${id}'[\\s\\S]*?forks:\\s*)\\d+`);
      if (starsRe.test(source)) {
        source = source.replace(starsRe, `$1${stars}`);
        updated++;
      }
      if (forksRe.test(source)) {
        source = source.replace(forksRe, `$1${forks}`);
      }
    }
    console.log(`  ${repo}: ${stars} stars, ${forks} forks (${toolIds.length} tool(s))`);
    await sleep(300);
  } catch (err) {
    console.warn(`  skip ${repo}: ${err.message}`);
  }
}

if (updated > 0) {
  writeFileSync(dataPath, source);
  console.log(`Updated star counts for ${updated} tool entries.`);
} else {
  console.log('No star counts updated.');
}
