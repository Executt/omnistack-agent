# omnistack-agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-platform-agnostic, open-source "Full Stack Software Engineering Specialist" agent, distributed as a modular repo where a single-source `core/` + `knowledge/` is compiled into per-platform adapters by a tested Node build script.

**Architecture:** Single source of truth (`core/` numbered prompt files + `knowledge/` modular markdown). A zero-dependency Node script (`scripts/build.mjs`) assembles those sources into ready-to-use adapter files under `adapters/` for each platform (Claude, ChatGPT, Copilot, Gemini, Cursor, generic). `scripts/validate.mjs` re-runs the build in memory and byte-compares to disk so CI rejects any drift. Adapters are committed so consumers just clone and copy.

**Tech Stack:** Markdown (content), Node.js ≥18 native ESM (`node:fs`, `node:crypto`, `node:test`) — **no npm dependencies**, GitHub Actions (CI), SVG (banner).

**Spec:** [docs/specs/2026-06-03-omnistack-agent-design.md](../specs/2026-06-03-omnistack-agent-design.md)

**Conventions for content files:** All repo content (`core/`, `knowledge/`, `adapters/`) is written in **English**. Docs/README are **bilingual** (EN + PT-BR). Prose files are authored against the concrete specs in each task (sections + required points + length target); the build/validate scripts have full code + tests.

---

## Phase 0 — Scaffolding

### Task 1: Repo scaffold (package.json, .gitignore, LICENSE, folder skeleton)

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `LICENSE`
- Create: `.gitkeep` files to materialize empty dirs: `core/.gitkeep`, `knowledge/.gitkeep`, `adapters/.gitkeep`, `scripts/.gitkeep`, `examples/.gitkeep`, `assets/.gitkeep`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "omnistack-agent",
  "version": "0.1.0",
  "description": "AI-platform-agnostic, open-source Full Stack Software Engineering Specialist agent.",
  "type": "module",
  "license": "MIT",
  "engines": { "node": ">=18" },
  "scripts": {
    "build": "node scripts/build.mjs",
    "validate": "node scripts/validate.mjs",
    "test": "node --test"
  },
  "keywords": [
    "ai-agent", "fullstack", "system-prompt", "prompt-engineering",
    "oop", "software-engineering", "platform-agnostic", "open-source"
  ]
}
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules/
*.log
.DS_Store
Thumbs.db
.idea/
.vscode/
```

- [ ] **Step 3: Create `LICENSE` (MIT)**

```text
MIT License

Copyright (c) 2026 Ricardo Moretti and omnistack-agent contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

- [ ] **Step 4: Create `.gitkeep` placeholders**

Create an empty file named `.gitkeep` in each of: `core/`, `knowledge/`, `adapters/`, `scripts/`, `examples/`, `assets/`.

- [ ] **Step 5: Commit**

```bash
git add package.json .gitignore LICENSE core/.gitkeep knowledge/.gitkeep adapters/.gitkeep scripts/.gitkeep examples/.gitkeep assets/.gitkeep
git commit -m "chore: scaffold repo (package.json, MIT license, folder skeleton)"
```

---

## Phase 1 — Build system (TDD, zero dependencies)

> Build the engine first with fixture-based tests, before authoring content. The pure transforms live in `scripts/lib.mjs`; IO lives in `build.mjs`/`validate.mjs`.

### Task 2: `scripts/lib.mjs` pure functions + tests

**Files:**
- Create: `scripts/lib.mjs`
- Test: `scripts/lib.test.mjs`

- [ ] **Step 1: Write the failing tests**

`scripts/lib.test.mjs`:

```js
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
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test`
Expected: FAIL — `Cannot find module './lib.mjs'` / exports undefined.

- [ ] **Step 3: Implement `scripts/lib.mjs`**

```js
import { createHash } from 'node:crypto';

const SEP = '\n\n---\n\n';

/** 12-char sha256 hex of a string. */
export function contentHash(str) {
  return createHash('sha256').update(str, 'utf8').digest('hex').slice(0, 12);
}

/** coreFiles: Array<{ name, body }> already sorted by name. */
export function assembleCore(coreFiles) {
  return coreFiles.map((f) => f.body.trim()).join(SEP);
}

/**
 * modules: Array<{ path, body }>; indexBody: string; mode: 'full' | 'lean'.
 * lean -> only the navigation index. full -> index + every module, path-sorted.
 */
export function assembleKnowledge(modules, indexBody, mode) {
  if (mode === 'lean') return indexBody.trim();
  const ordered = [...modules].sort((a, b) => a.path.localeCompare(b.path));
  return [indexBody.trim(), ...ordered.map((m) => m.body.trim())].join(SEP);
}

/** target: { name, outPath, mode, frontmatter: string|null }. */
export function renderTarget(target, coreStr, knowledgeStr) {
  const body = [coreStr, knowledgeStr].filter(Boolean).join(SEP);
  const header =
    '<!-- GENERATED from core/ + knowledge/ — DO NOT EDIT — run: npm run build -->\n' +
    `<!-- content-hash: ${contentHash(body)} -->`;
  const fm = target.frontmatter ? `${target.frontmatter.trim()}\n\n` : '';
  return `${fm}${header}\n\n${body}\n`;
}

const CLAUDE_DESC =
  'Full Stack Software Engineering Specialist — architecture, OOP, databases, ' +
  'DevOps, testing, and technical writing across the whole SDLC.';

/** Declarative adapter table. Add a platform = add a row here. */
export const TARGETS = [
  {
    name: 'claude-skill',
    outPath: 'adapters/claude/SKILL.md',
    mode: 'full',
    frontmatter: `---\nname: omnistack-agent\ndescription: ${CLAUDE_DESC}\nuser-invocable: true\n---`,
  },
  {
    name: 'claude-agent',
    outPath: 'adapters/claude/agent.md',
    mode: 'full',
    frontmatter: `---\nname: omnistack-agent\ndescription: ${CLAUDE_DESC}\nmodel: claude-sonnet-4-6\n---`,
  },
  { name: 'claude-agents-md', outPath: 'adapters/claude/AGENTS.md', mode: 'full', frontmatter: null },
  { name: 'chatgpt-gpt', outPath: 'adapters/chatgpt/custom-gpt-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'chatgpt-system', outPath: 'adapters/chatgpt/system-prompt.md', mode: 'full', frontmatter: null },
  { name: 'copilot', outPath: 'adapters/copilot/copilot-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'gemini', outPath: 'adapters/gemini/gem-instructions.md', mode: 'lean', frontmatter: null },
  { name: 'cursor', outPath: 'adapters/cursor/AGENTS.md', mode: 'full', frontmatter: null },
  { name: 'generic', outPath: 'adapters/generic/system-prompt.md', mode: 'full', frontmatter: null },
];
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test`
Expected: PASS — all 8 tests green.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib.mjs scripts/lib.test.mjs
git commit -m "feat(build): pure assembly lib + adapter table with tests"
```

### Task 3: `scripts/build.mjs` + `scripts/validate.mjs` (IO wrappers)

**Files:**
- Create: `scripts/build.mjs`
- Create: `scripts/validate.mjs`

- [ ] **Step 1: Implement `scripts/build.mjs`**

```js
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
```

- [ ] **Step 2: Implement `scripts/validate.mjs`**

```js
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildAll } from './build.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  const results = await buildAll();
  const stale = [];
  for (const r of results) {
    let onDisk = null;
    try { onDisk = await readFile(join(ROOT, r.outPath), 'utf8'); }
    catch { stale.push(`${r.outPath} (missing)`); continue; }
    if (onDisk !== r.content) stale.push(r.outPath);
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
```

- [ ] **Step 3: Smoke-test build fails gracefully before content exists**

Run: `node scripts/build.mjs`
Expected: it reads empty/near-empty `core/` and `knowledge/` and still writes adapter files (mostly headers). This confirms wiring. (Real content arrives in Phases 2–3; adapters get regenerated in Task 9.) If `core/` has only `.gitkeep`, `readCore()` returns `[]` and `assembleCore` yields `''` — acceptable.

- [ ] **Step 4: Run unit tests again to confirm no regression**

Run: `node --test`
Expected: PASS (Task 2 tests still green; importing build.mjs does not auto-run main).

- [ ] **Step 5: Commit**

```bash
git add scripts/build.mjs scripts/validate.mjs
git commit -m "feat(build): disk IO build + drift-detecting validate"
```

---

## Phase 2 — Core brain content (`core/`)

> Author the agent's "brain". English. Each file is focused. Quality bar: senior, precise, production-ready, no fluff. Replace the `.gitkeep` in `core/` (delete it once real files exist).

### Task 4: Write the six `core/` files

**Files:**
- Create: `core/00-identity.md`, `core/01-principles.md`, `core/02-capabilities.md`, `core/03-workflow.md`, `core/04-interaction-style.md`, `core/05-guardrails.md`
- Delete: `core/.gitkeep`

- [ ] **Step 1: Write `core/00-identity.md` (full content below — this anchors the voice)**

```markdown
# Identity & Mission

You are **omnistack-agent**, a Full Stack Software Engineering Specialist. You operate as a
single agent that fluidly takes on whichever engineering role the task needs: Software Architect,
Full Stack Developer, Mobile Developer, Backend Engineer, Frontend Engineer, Database Administrator,
DevOps Engineer, QA Engineer, Technical Writer, and Software Mentor.

## Mission
Help developers at every stage of the software development lifecycle — from gathering requirements
to designing, building, testing, documenting, deploying, and maintaining software — and always deliver
clear, maintainable, scalable, production-ready solutions.

## Primary focus
Object-Oriented design done well: classes, objects, attributes, encapsulation, and sound software
design principles are your default lens. When a problem can be modeled with clean objects and clear
responsibilities, you reach for that first.

## Stance
- Senior and direct. You explain trade-offs instead of hand-waving.
- You meet the developer at their level — patient with beginners, terse with experts.
- You never pretend. If something is uncertain or version-specific, you say so and point to the
  authoritative source.
- You leave nothing behind: an answer is not done until it is correct, complete, and usable.
```

- [ ] **Step 2: Write `core/01-principles.md`**

Content spec (author ~250–400 words, English, with short illustrative bullets):
- **Clean Code:** intention-revealing names, small functions, one responsibility, comments explain *why* not *what*.
- **SOLID:** one line each (SRP, OCP, LSP, ISP, DIP) with a one-line "smell it violates".
- **DRY / KISS / YAGNI:** when each applies and the failure mode of over-applying it.
- **OOP-first mindset:** model the domain with objects and clear boundaries; prefer composition over inheritance; encapsulate invariants.
- **Quality bar ("leaves nothing behind"):** correctness, edge cases, error handling, security, and tests are part of "done", not extras.
- End with a 5-item "definition of done" checklist.

- [ ] **Step 3: Write `core/02-capabilities.md`**

Content spec: a subsection per role (the 10 roles from Identity). For each: 1-sentence scope + 3–5 bullets of concrete deliverables. Roles: Software Architect, Full Stack Developer, Mobile Developer, Backend Engineer, Frontend Engineer, Database Administrator, DevOps Engineer, QA Engineer, Technical Writer, Software Mentor. Keep each role tight (~60–90 words).

- [ ] **Step 4: Write `core/03-workflow.md`**

Content spec: the 12-stage SDLC operating method as an ordered list, each stage = what the agent does + the artifact it produces:
1. Requirements gathering → clarified requirements / user stories
2. System design → architecture + component boundaries
3. Database design → schema / ER model
4. Backend development → services, domain model
5. Frontend development → UI + state
6. Mobile development → native/cross-platform UI
7. API development → contracts, versioning, docs
8. Cloud deployment → infra + environments
9. DevOps automation → CI/CD pipelines, IaC
10. Software testing → unit/integration/e2e + QA
11. Documentation → README, API docs, ADRs
12. Maintenance & scaling → monitoring, refactor, performance
Add a closing rule: "Pick the smallest subset of stages the task needs; don't ceremony-dump all twelve on a one-line question."

- [ ] **Step 5: Write `core/04-interaction-style.md`**

Content spec:
- Ask focused clarifying questions when the request is ambiguous — but don't interrogate; state sensible defaults and proceed when the path is obvious.
- Deliver **complete** code (full files/functions), not partial snippets, and cite file paths when relevant.
- Always explain key trade-offs and name the chosen approach.
- Progressive disclosure: give the direct answer first, then depth for those who want it.
- Mentor mode: when teaching, explain the *why*, link concepts, and show one runnable example.
- Output format guidance: fenced code blocks with language tags; tables for comparisons; short sections with headings.

- [ ] **Step 6: Write `core/05-guardrails.md`**

Content spec:
- **Honesty / anti-hallucination:** never invent APIs, flags, or library behavior; when unsure, say so and consult/cite official docs; prefer the latest stable, version-aware guidance.
- **Security by default:** validate input, parameterize queries, hash secrets, least privilege, no secrets in code; flag insecure requests instead of complying silently.
- **No destructive actions** without explicit confirmation; warn before irreversible operations.
- **Production-ready:** include error handling, edge cases, and at least a testing note with every non-trivial solution.
- **Scope discipline:** solve what's asked; suggest (don't sneak in) unrelated refactors.

- [ ] **Step 7: Verify and commit**

Run: `node scripts/build.mjs` (adapters now include real core content) then `node --test`
Expected: build prints 9 adapters; tests PASS.

```bash
git rm core/.gitkeep
git add core/00-identity.md core/01-principles.md core/02-capabilities.md core/03-workflow.md core/04-interaction-style.md core/05-guardrails.md
git commit -m "feat(core): author the agent brain (identity, principles, capabilities, workflow, style, guardrails)"
```

---

## Phase 3 — Knowledge base (`knowledge/`)

> Modular, expandable. Every module follows the same template. One module (`oop/classes-objects-attributes.md`) is written in full here to set the quality bar; siblings follow the same template with the listed required points.

### Task 5: `knowledge/_index.md` (navigation hub) + module template note

**Files:**
- Create: `knowledge/_index.md`
- Delete: `knowledge/.gitkeep`

- [ ] **Step 1: Write `knowledge/_index.md`**

Content spec: a single navigation hub. Include:
- A one-paragraph "How this knowledge base is organized."
- The **module template** (copy of the block below) so contributors see the required shape.
- A categorized list linking every v1 module (update as modules are added). Use relative links, grouped by folder: OOP, Languages, Frontend, Backend, Mobile, Databases, Architecture, DevOps, Testing, Security, Documentation.

Module template to embed:

```markdown
# <Topic>
> One-line summary + when this matters

## Concepts
## Best Practices
## Patterns & Examples   (real, commented code)
## Common Pitfalls / Anti-patterns
## References            (official docs / standards)

<!-- level: beginner | intermediate | advanced -->
```

- [ ] **Step 2: Commit**

```bash
git rm knowledge/.gitkeep
git add knowledge/_index.md
git commit -m "docs(knowledge): navigation hub + module template"
```

### Task 6: OOP modules (primary focus)

**Files:**
- Create: `knowledge/oop/classes-objects-attributes.md` (full content below)
- Create: `knowledge/oop/pillars.md`, `knowledge/oop/solid.md`, `knowledge/oop/design-patterns.md`

- [ ] **Step 1: Write `knowledge/oop/classes-objects-attributes.md` (full reference module)**

````markdown
# Classes, Objects & Attributes
> The atoms of OOP — what they are, how to model them well, and the traps. Read this before any other OOP module.

## Concepts
- **Class:** a blueprint that defines structure (attributes/fields) and behavior (methods).
- **Object (instance):** a concrete value created from a class, with its own state.
- **Attribute (field/property):** a named piece of state owned by an object. Prefer keeping
  attributes **private** and exposing behavior, not raw data.
- **Method:** behavior that operates on the object's state.
- **Identity vs. state vs. behavior:** two objects can hold equal state yet be distinct identities.

## Best Practices
- Keep attributes private; expose intent through methods (`account.deposit(x)`), not setters that
  let callers break invariants (`account.balance = -100`).
- Initialize objects into a **valid state** via the constructor; reject invalid input early.
- Give one class one responsibility. If you can't name it in a short phrase, it does too much.
- Prefer immutability for value-like objects (money, coordinates).

## Patterns & Examples

```csharp
// C#: an attribute kept consistent by behavior, not exposed as a raw setter.
public class BankAccount
{
    public string Owner { get; }
    public decimal Balance { get; private set; }   // attribute, write-protected

    public BankAccount(string owner, decimal opening)
    {
        if (string.IsNullOrWhiteSpace(owner)) throw new ArgumentException("owner required");
        if (opening < 0) throw new ArgumentException("opening must be >= 0");
        Owner = owner;
        Balance = opening;
    }

    public void Deposit(decimal amount)
    {
        if (amount <= 0) throw new ArgumentException("amount must be > 0");
        Balance += amount;              // invariant enforced here
    }
}
```

```javascript
// JavaScript: same idea with a private field (#).
class BankAccount {
  #balance;
  constructor(owner, opening = 0) {
    if (!owner) throw new Error('owner required');
    if (opening < 0) throw new Error('opening must be >= 0');
    this.owner = owner;
    this.#balance = opening;
  }
  get balance() { return this.#balance; }
  deposit(amount) {
    if (amount <= 0) throw new Error('amount must be > 0');
    this.#balance += amount;
  }
}
```

## Common Pitfalls / Anti-patterns
- **Anemic objects:** public getters/setters with all logic outside the class — that's a struct, not an object.
- **God object:** one class that knows/does everything.
- **Leaky invariants:** exposing a mutable internal (e.g., returning the internal list) so callers corrupt state.
- **Constructor that can build an invalid object** then "fix it" later.

## References
- C# docs: Classes and objects — https://learn.microsoft.com/dotnet/csharp/fundamentals/types/classes
- MDN: Working with objects — https://developer.mozilla.org/docs/Web/JavaScript/Guide/Working_with_objects
- Martin, *Clean Code*, ch. 6 (Objects and Data Structures)

<!-- level: beginner -->
````

- [ ] **Step 2: Write `knowledge/oop/pillars.md`**

Content spec (use the template). Required points: the four pillars — **Encapsulation** (hide state, expose behavior), **Abstraction** (model the essential, hide the rest), **Inheritance** (is-a; when to use, when it hurts), **Polymorphism** (subtype + parametric; program to interfaces). One short C# and one JS example for polymorphism. Pitfalls: deep inheritance trees, inheritance for code reuse instead of composition.

- [ ] **Step 3: Write `knowledge/oop/solid.md`**

Content spec: one section per SOLID principle with a "violation smell" + a "fix" mini-example (pseudocode or short C#). Close with "SOLID is a means to changeable code, not a checklist to worship."

- [ ] **Step 4: Write `knowledge/oop/design-patterns.md`**

Content spec: brief catalog grouped Creational / Structural / Behavioral. For 6 high-value patterns (Factory, Strategy, Observer, Adapter, Repository, Dependency Injection) give: intent (1 line), when to use, a 6–12 line example, and the over-use warning.

- [ ] **Step 5: Build, test, commit**

Run: `node scripts/build.mjs && node --test`
Expected: build OK, tests PASS.

```bash
git add knowledge/oop/
git commit -m "docs(knowledge): OOP modules (classes/objects, pillars, SOLID, patterns)"
```

### Task 7: Architecture, Databases, Testing modules

**Files:**
- Create: `knowledge/architecture/scalability.md`, `knowledge/architecture/patterns.md`
- Create: `knowledge/databases/relational.md`, `knowledge/databases/non-relational.md`, `knowledge/databases/modeling.md`
- Create: `knowledge/testing/automated.md`, `knowledge/testing/manual-qa.md`

- [ ] **Step 1: `architecture/scalability.md`**

Content spec (template): vertical vs horizontal scaling; statelessness; caching layers; load balancing; database scaling (read replicas, sharding); async/queues; the "scale only what's measured" rule. Pitfalls: premature scaling, distributed monolith.

- [ ] **Step 2: `architecture/patterns.md`**

Content spec: layered, hexagonal/ports-&-adapters, MVC, microservices vs modular monolith, event-driven. For each: 1-line intent + when it fits + main trade-off.

- [ ] **Step 3: `databases/relational.md`**

Content spec: relational model basics; normalization (1NF–3NF) with a tiny example; indexes (what/when, cost on writes); transactions & ACID; joins; parameterized queries (security). Mention SQL Server, PostgreSQL, MySQL, Oracle, MariaDB, SQLite with a one-line "pick when". Pitfalls: N+1, missing indexes, SELECT *.

- [ ] **Step 4: `databases/non-relational.md`**

Content spec: families — document (MongoDB), key-value (Redis), wide-column (Cassandra), managed (DynamoDB, Firebase). For each: data model, "pick when", consistency note. CAP theorem in one paragraph. Pitfall: using NoSQL to avoid modeling.

- [ ] **Step 5: `databases/modeling.md`**

Content spec: entities/attributes/relationships; ER/DER diagrams (notation); cardinality; primary/foreign keys; logical vs physical model; when to denormalize. Include a small textual ER example.

- [ ] **Step 6: `testing/automated.md`**

Content spec: test pyramid (unit/integration/e2e); what a good unit test looks like (Arrange-Act-Assert, one behavior per test, fast, deterministic); TDD loop (red-green-refactor); mocking sparingly; coverage as a signal not a goal. One xUnit (C#) and one JS (`node:test`) example.

- [ ] **Step 7: `testing/manual-qa.md`**

Content spec: when manual QA matters; exploratory testing; test cases & bug reports (repro steps, expected vs actual, severity); regression checklist; accessibility & cross-browser smoke. Pitfall: manual-testing things that should be automated.

- [ ] **Step 8: Build, test, commit**

Run: `node scripts/build.mjs && node --test`

```bash
git add knowledge/architecture/ knowledge/databases/ knowledge/testing/
git commit -m "docs(knowledge): architecture, databases, and testing modules"
```

### Task 8: Language seeds + remaining domain seeds

> Each remaining folder gets one representative "seed" module so the build has content and contributors have a pattern to follow. All use the standard template.

**Files:**
- Create: `knowledge/languages/csharp.md`, `knowledge/languages/javascript.md`, `knowledge/languages/html-css.md`
- Create: `knowledge/frontend/react.md`
- Create: `knowledge/backend/apis.md`
- Create: `knowledge/mobile/cross-platform.md`
- Create: `knowledge/devops/ci-cd.md`
- Create: `knowledge/security/best-practices.md`
- Create: `knowledge/documentation/technical-writing.md`

- [ ] **Step 1: `languages/csharp.md`**
Content spec: C# essentials for OOP-first dev — types/classes/records, properties, interfaces, generics, async/await, LINQ, null-safety. "Pick when" + one idiomatic example.

- [ ] **Step 2: `languages/javascript.md`**
Content spec: modern JS — let/const, modules (ESM), classes & private fields, promises/async, array methods, destructuring; common footguns (`==`, `this`, hoisting).

- [ ] **Step 3: `languages/html-css.md`**
Content spec: semantic HTML; the box model; Flexbox & Grid (when each); responsive units & media queries; accessibility basics (labels, contrast, alt). Pitfall: divitis, layout with floats.

- [ ] **Step 4: `frontend/react.md`**
Content spec: components, props/state, hooks (`useState`/`useEffect`), composition, lifting state, keys in lists, controlled inputs; one small component example. Pitfall: effect misuse, prop drilling.

- [ ] **Step 5: `backend/apis.md`**
Content spec: REST resource design, HTTP verbs/status codes, versioning, validation, pagination, error envelopes, auth (token vs session) in one paragraph, idempotency. Mention "REST vs GraphQL — pick when".

- [ ] **Step 6: `mobile/cross-platform.md`**
Content spec: native vs cross-platform trade-offs; React Native / Flutter / MAUI one-liners; shared concerns (navigation, state, offline, push, embedded DB like SQLite); when native wins.

- [ ] **Step 7: `devops/ci-cd.md`**
Content spec: CI vs CD; a pipeline's stages (lint→test→build→deploy); environments; IaC in one paragraph; rollbacks; secrets handling. Tiny GitHub Actions example.

- [ ] **Step 8: `security/best-practices.md`**
Content spec: OWASP Top 10 at a glance; input validation & output encoding; auth/session hygiene; secrets management; dependency/CVE hygiene; least privilege. Link to `core/05-guardrails.md` mindset.

- [ ] **Step 9: `documentation/technical-writing.md`**
Content spec: what good docs include (README, API reference, ADRs, runbooks); audience-first writing; structure (task-oriented); keep docs next to code; the "docs are done when a newcomer succeeds" test.

- [ ] **Step 10: Build, test, commit**

Run: `node scripts/build.mjs && node --test`

```bash
git add knowledge/languages/ knowledge/frontend/ knowledge/backend/ knowledge/mobile/ knowledge/devops/ knowledge/security/ knowledge/documentation/
git commit -m "docs(knowledge): language seeds + frontend/backend/mobile/devops/security/docs seeds"
```

---

## Phase 4 — Generate & commit adapters

### Task 9: Build all adapters and commit the generated output

**Files:**
- Generate (do not hand-edit): everything under `adapters/`
- Delete: `adapters/.gitkeep`

- [ ] **Step 1: Run the build**

Run: `npm run build`
Expected: prints `✓ adapters/...` for all 9 outputs and `Built 9 adapters.`

- [ ] **Step 2: Verify drift detection passes**

Run: `npm run validate`
Expected: `✓ All 9 adapters in sync.`

- [ ] **Step 3: Spot-check two outputs**

Open `adapters/claude/SKILL.md` — confirm it starts with YAML frontmatter (`name: omnistack-agent`, `user-invocable: true`), then the GENERATED header, then core content.
Open `adapters/copilot/copilot-instructions.md` — confirm it is the **lean** build (core + knowledge index only, not every module inlined).

- [ ] **Step 4: Commit generated adapters**

```bash
git rm adapters/.gitkeep
git add adapters/
git commit -m "build(adapters): generate platform adapters from core + knowledge"
```

---

## Phase 5 — Documentation, banner & open-source meta

### Task 10: Banner SVG

**Files:**
- Create: `assets/banner.svg`

- [ ] **Step 1: Write `assets/banner.svg` (dark-tech minimalist, 1280×320)**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="320" viewBox="0 0 1280 320" role="img" aria-label="omnistack-agent">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0b1020"/>
      <stop offset="1" stop-color="#111a33"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#38bdf8"/>
      <stop offset="1" stop-color="#a78bfa"/>
    </linearGradient>
  </defs>
  <rect width="1280" height="320" fill="url(#bg)"/>
  <g fill="none" stroke="#1e2a4a" stroke-width="1">
    <path d="M0 80 H1280 M0 160 H1280 M0 240 H1280"/>
  </g>
  <text x="80" y="150" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="72" font-weight="700" fill="#e2e8f0">omnistack<tspan fill="url(#accent)">-agent</tspan></text>
  <text x="82" y="205" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="28" fill="#94a3b8">The open-source Full Stack Software Engineering Specialist — for every AI platform.</text>
  <g font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="20" fill="#0b1020">
    <rect x="82" y="240" width="150" height="38" rx="19" fill="url(#accent)"/>
    <text x="100" y="265" font-weight="600">OOP-first</text>
    <rect x="248" y="240" width="190" height="38" rx="19" fill="#1e293b"/>
    <text x="268" y="265" fill="#cbd5e1">Platform-agnostic</text>
    <rect x="454" y="240" width="120" height="38" rx="19" fill="#1e293b"/>
    <text x="474" y="265" fill="#cbd5e1">MIT</text>
  </g>
</svg>
```

- [ ] **Step 2: Commit**

```bash
git add assets/banner.svg
git commit -m "docs: add SVG banner"
```

### Task 11: README (EN) + README.pt-BR

**Files:**
- Create: `README.md`
- Create: `README.pt-BR.md`

- [ ] **Step 1: Write `README.md`** with exactly these sections in order:
1. `![omnistack-agent](assets/banner.svg)` at the very top.
2. Badges line: `![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)` · `![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)` · platforms badge. Then: `**[🇧🇷 Ler em Português](README.pt-BR.md)**`.
3. **What is this** — 1 paragraph + a bullet list of the 10 roles.
4. **▶️ How to use** — a table: | Platform | File to copy | How to install |. Rows for ChatGPT (`adapters/chatgpt/custom-gpt-instructions.md`), Claude skill (`adapters/claude/SKILL.md`), Claude agent (`adapters/claude/agent.md`), GitHub Copilot (`adapters/copilot/copilot-instructions.md`), Gemini (`adapters/gemini/gem-instructions.md`), Cursor/Windsurf (`adapters/cursor/AGENTS.md`), Generic (`adapters/generic/system-prompt.md`). Each "How to install" cell = 1–2 concrete steps. Link `docs/platforms.md` for details.
5. **🤝 How to contribute** — explain the single-source rule: *edit `core/` or `knowledge/`, never `adapters/`* → run `npm run build` → open a PR (CI runs `npm run validate`). Link `CONTRIBUTING.md`.
6. **🗂️ Repository structure** — a fenced mini-map of top-level folders (core, knowledge, adapters, scripts, docs).
7. **🛣️ Roadmap** — bullets from spec §10.
8. **📄 License** — MIT, link `LICENSE`.

- [ ] **Step 2: Write `README.pt-BR.md`** — full Portuguese mirror of the same sections/links.

- [ ] **Step 3: Commit**

```bash
git add README.md README.pt-BR.md
git commit -m "docs: bilingual README with banner, usage, and contribution guide"
```

### Task 12: docs/ guides

**Files:**
- Create: `docs/architecture.md`, `docs/adding-knowledge.md`, `docs/platforms.md`

- [ ] **Step 1: `docs/architecture.md`** — explain single source → build → adapters; the `full` vs `lean` modes; the anti-drift hash + `validate`; how to add a new platform (add a row to `TARGETS` in `scripts/lib.mjs`).
- [ ] **Step 2: `docs/adding-knowledge.md`** — step-by-step to add a module: copy the template from `knowledge/_index.md`, place under the right folder, add a link in `_index.md`, run `npm run build`, commit. Include the template inline.
- [ ] **Step 3: `docs/platforms.md`** — per-platform install walkthrough (ChatGPT custom GPT, Claude skill/agent install path, Copilot `.github/copilot-instructions.md`, Gemini gem, Cursor/Windsurf `AGENTS.md`, generic system prompt). One short numbered list each.
- [ ] **Step 4: Commit**

```bash
git add docs/architecture.md docs/adding-knowledge.md docs/platforms.md
git commit -m "docs: architecture, adding-knowledge, and platforms guides"
```

### Task 13: CONTRIBUTING, CODE_OF_CONDUCT, CHANGELOG

**Files:**
- Create: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`

- [ ] **Step 1: `CONTRIBUTING.md`** (EN section + PT-BR section). Cover: prerequisites (Node ≥18, no deps), the golden rule (never edit `adapters/`), workflow (fork → branch → edit core/knowledge → `npm run build` → `node --test` → PR), the module template, commit style, that CI runs `npm run validate`.
- [ ] **Step 2: `CODE_OF_CONDUCT.md`** — Contributor Covenant v2.1 (standard text), contact = repo maintainer.
- [ ] **Step 3: `CHANGELOG.md`** — Keep a Changelog format; an `## [0.1.0] - 2026-06-03` entry listing the v1 scope (core, knowledge v1 modules, build system, 9 adapters, docs).
- [ ] **Step 4: Commit**

```bash
git add CONTRIBUTING.md CODE_OF_CONDUCT.md CHANGELOG.md
git commit -m "docs: contributing guide, code of conduct, changelog"
```

### Task 14: GitHub meta (CI + templates)

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.md`, `.github/ISSUE_TEMPLATE/knowledge_module.md`, `.github/ISSUE_TEMPLATE/improvement.md`
- Create: `.github/PULL_REQUEST_TEMPLATE.md`

- [ ] **Step 1: Write `.github/workflows/ci.yml`**

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Unit tests
        run: node --test
      - name: Validate adapters are in sync
        run: npm run validate
```

- [ ] **Step 2: Issue templates** — `bug_report.md` (what/expected/actual/platform), `knowledge_module.md` (proposed module, folder, why, sources), `improvement.md` (area, suggestion). Each with YAML front matter (`name`, `about`, `labels`).

- [ ] **Step 3: `PULL_REQUEST_TEMPLATE.md`** — checklist: edited `core/`/`knowledge/` only; ran `npm run build`; ran `node --test`; `npm run validate` passes; updated `_index.md` if a module was added.

- [ ] **Step 4: Commit**

```bash
git add .github/
git commit -m "ci: GitHub Actions validation + issue/PR templates"
```

---

## Phase 6 — Final verification

### Task 15: Full verification pass

- [ ] **Step 1: Tests**

Run: `node --test`
Expected: all tests PASS.

- [ ] **Step 2: Build is current**

Run: `npm run build && npm run validate`
Expected: builds 9 adapters; `✓ All 9 adapters in sync.`

- [ ] **Step 3: Cleanliness check**

Run: `git status`
Expected: clean working tree (all generated adapters committed; no stray `.gitkeep` where real files now exist).

- [ ] **Step 4: Spec coverage self-check**

Confirm against spec §9 success criteria: clone-and-copy works (adapters present), edit-core→rebuild consistent, validate catches drift, README has banner + usage + contribution in EN & PT-BR, `_index.md` lists all modules, core complete, CI file present.

- [ ] **Step 5: Tag v0.1.0**

```bash
git tag -a v0.1.0 -m "omnistack-agent v0.1.0 — initial release"
```

(Push to GitHub — `git remote add origin ...` then `git push -u origin main --tags` — is done by the maintainer when ready, per their account.)

---

## Self-Review (completed by plan author)

- **Spec coverage:** every spec section maps to a task — §3 structure → Tasks 1,4,5; §4 core → Task 4; §5 knowledge/template → Tasks 5–8; §6 build/validate/anti-drift → Tasks 2,3,9; §7 README/docs/banner → Tasks 10–12; §8 meta → Tasks 13,14; §9 success criteria → Task 15.
- **Placeholder scan:** scripts have full code + tests; prose modules have concrete section + required-point specs plus one fully-written reference module (`oop/classes-objects-attributes.md`) and full `core/00-identity.md`. No "TBD"/"add error handling" vagueness.
- **Type/name consistency:** `buildAll()`, `assembleCore`, `assembleKnowledge(modules, indexBody, mode)`, `renderTarget(target, coreStr, knowledgeStr)`, `contentHash`, and `TARGETS` names match across `lib.mjs`, `build.mjs`, `validate.mjs`, and the tests. Adapter count is **9** everywhere.
```
