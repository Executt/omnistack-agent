import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  contentHash, assembleCore, assembleKnowledge, renderTarget, TARGETS,
} from './lib.mjs';

test('contentHash is deterministic and 12 hex chars', () => {
  assert.equal(contentHash('hello'), contentHash('hello'));
  assert.equal(contentHash('hello').length, 12);
  assert.match(contentHash('hello'), /^[0-9a-f]{12}$/);
  assert.notEqual(contentHash('hello'), contentHash('world'));
});

test('assembleCore joins trimmed files in order with separators', () => {
  const out = assembleCore([
    { name: '00-a.md', body: '  A  ' },
    { name: '01-b.md', body: 'B\n' },
  ]);
  assert.equal(out, 'A\n\n---\n\nB');
});

test('assembleKnowledge lean returns only the index body', () => {
  const out = assembleKnowledge(
    [{ path: 'knowledge/oop/x.md', body: 'X' }], 'INDEX', 'lean',
  );
  assert.equal(out, 'INDEX');
});

test('assembleKnowledge full = index then modules sorted by path', () => {
  const out = assembleKnowledge(
    [
      { path: 'knowledge/b.md', body: 'B' },
      { path: 'knowledge/a.md', body: 'A' },
    ], 'INDEX', 'full',
  );
  assert.equal(out, 'INDEX\n\n---\n\nA\n\n---\n\nB');
});

test('renderTarget with frontmatter: frontmatter first, then header, hash, body', () => {
  const target = { name: 't', outPath: 'x', mode: 'full', frontmatter: '---\nname: x\n---' };
  const out = renderTarget(target, 'CORE', 'KNOW');
  assert.match(out, /^---\nname: x\n---\n\n<!-- GENERATED from core\//);
  assert.match(out, /content-hash: [0-9a-f]{12}/);
  assert.match(out, /CORE\n\n---\n\nKNOW\n$/);
});

test('renderTarget without frontmatter starts with the header comment', () => {
  const target = { name: 't', outPath: 'x', mode: 'full', frontmatter: null };
  const out = renderTarget(target, 'CORE', 'KNOW');
  assert.match(out, /^<!-- GENERATED from core\//);
});

test('renderTarget is deterministic (no timestamps)', () => {
  const target = { name: 't', outPath: 'x', mode: 'full', frontmatter: null };
  assert.equal(renderTarget(target, 'C', 'K'), renderTarget(target, 'C', 'K'));
});

test('TARGETS covers all six platforms', () => {
  const p = TARGETS.map((t) => t.outPath);
  for (const dir of ['claude', 'chatgpt', 'copilot', 'gemini', 'cursor', 'generic']) {
    assert.ok(p.some((x) => x.startsWith(`adapters/${dir}/`)), `missing ${dir}`);
  }
  assert.equal(TARGETS.length, 9, 'expected exactly 9 adapter targets');
});
