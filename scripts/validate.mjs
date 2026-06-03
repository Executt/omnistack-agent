import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './build.mjs';
import { normalizeEol } from './lib.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const results = await buildAll();
  const stale = [];
  for (const r of results) {
    let onDisk = null;
    try { onDisk = await readFile(join(ROOT, r.outPath), 'utf8'); }
    catch { stale.push(`${r.outPath} (missing)`); continue; }
    if (normalizeEol(onDisk) !== normalizeEol(r.content)) stale.push(r.outPath);
  }
  if (stale.length) {
    console.error('✗ Adapters out of sync with core/ + knowledge/:');
    for (const s of stale) console.error(`  - ${s}`);
    console.error('\nFix: run `npm run build` and commit the result.');
    process.exit(1);
  }
  console.log(`✓ All ${results.length} adapters in sync.`);
}

main().catch((err) => { console.error(err); process.exit(1); });
