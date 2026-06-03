import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import { realpathSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import { assembleCore, assembleKnowledge, renderTarget, TARGETS } from './lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function readCore() {
  const dir = join(ROOT, 'core');
  const names = (await readdir(dir)).filter((n) => n.endsWith('.md')).sort();
  return Promise.all(
    names.map(async (name) => ({ name, body: await readFile(join(dir, name), 'utf8') })),
  );
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

async function readKnowledge() {
  const dir = join(ROOT, 'knowledge');
  const files = (await walk(dir)).sort();
  let indexBody = '';
  const modules = [];
  for (const f of files) {
    const rel = f.slice(ROOT.length + 1).split('\\').join('/');
    const body = await readFile(f, 'utf8');
    if (rel === 'knowledge/_index.md') indexBody = body;
    else modules.push({ path: rel, body });
  }
  return { indexBody, modules };
}

/** Returns Array<{ outPath, content }> — pure of disk writes, reused by validate. */
export async function buildAll() {
  const coreStr = assembleCore(await readCore());
  const { indexBody, modules } = await readKnowledge();
  return TARGETS.map((target) => ({
    outPath: target.outPath,
    content: renderTarget(target, coreStr, assembleKnowledge(modules, indexBody, target.mode)),
  }));
}

async function main() {
  const results = await buildAll();
  for (const r of results) {
    const abs = join(ROOT, r.outPath);
    await mkdir(dirname(abs), { recursive: true });
    await writeFile(abs, r.content, 'utf8');
    console.log(`✓ ${r.outPath}`);
  }
  console.log(`\nBuilt ${results.length} adapters.`);
}

// Only run main() when invoked directly (not when imported by validate.mjs).
if (realpathSync(argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => { console.error(err); process.exit(1); });
}
