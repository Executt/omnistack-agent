# Architecture

omnistack-agent is built on one idea: **author the agent once, ship it everywhere.** This document explains how the single source becomes per-platform adapters, how the two build modes differ, how drift is prevented, and how to add a new platform.

## Single source → build → adapters

There is exactly one place to author content, and one place where output lands:

```
core/  +  knowledge/      ──▶   scripts/build.mjs   ──▶   adapters/
(the authored source)            (assembles + renders)     (generated, committed)
```

- **`core/`** — the agent's brain, as numbered Markdown files (`00-identity.md`, `01-principles.md`, …). They are read in filename order and concatenated, so the numeric prefix controls sequence.
- **`knowledge/`** — a modular knowledge base, one topic per file, organized into domain folders. `knowledge/_index.md` is the navigation hub and is always treated specially (it is the "lean" payload — see below).
- **`scripts/build.mjs`** — reads the source from disk, calls the pure assembly functions in `scripts/lib.mjs`, and writes one file per platform under `adapters/`.
- **`adapters/`** — the **generated** output. These files are committed so consumers can clone-and-copy without running anything. They must never be hand-edited.

Run the build with:

```bash
npm run build
```

It prints one line per adapter and a final count (`Built 9 adapters.`).

### How a file is assembled

For each target, `build.mjs` produces content in three layers (see `renderTarget` in `scripts/lib.mjs`):

1. **Optional frontmatter** — a YAML block, used by the Claude skill/agent adapters (name, description, model). `null` for platforms that don't need it.
2. **A generated header** — a `DO NOT EDIT` comment plus a `content-hash`.
3. **The body** — the assembled `core/` content, then the knowledge payload, separated by `\n\n---\n\n`.

The `core/` portion is the same for every platform. What differs per platform is the **knowledge payload**, controlled by the target's `mode`.

## `full` vs `lean` modes

Each target declares a `mode`:

- **`full`** — the body includes the knowledge index **plus every knowledge module**, sorted by path. Use this where the platform has room for a large system prompt and benefits from the agent carrying its full reference (e.g. Claude skill/agent, ChatGPT system prompt, Cursor, generic).
- **`lean`** — the body includes **only `knowledge/_index.md`** (the navigation hub), not the individual modules. Use this where the instructions field is small or the platform reads files on demand (e.g. ChatGPT Custom GPT instructions, Copilot, Gemini gem).

Both modes always include the complete `core/` brain — only the knowledge depth changes. The logic lives in `assembleKnowledge(modules, indexBody, mode)`.

## Anti-drift: content hash + `validate`

Because adapters are committed, they can fall out of sync with the source if someone edits `core/`/`knowledge/` but forgets to rebuild — or edits an adapter by hand. Two mechanisms prevent that:

1. **Content hash.** Every generated file embeds a `content-hash` of its body. The build is **deterministic** — no timestamps, stable sort order, normalized separators — so the same source always yields the same bytes (and the same hash).
2. **`validate`.** Running

   ```bash
   npm run validate
   ```

   re-runs the entire build *in memory* and byte-compares the result against what's on disk. If anything differs (or a file is missing), it lists the stale adapters and exits non-zero with `✗ Adapters out of sync`. When everything matches it prints `✓ All 9 adapters in sync.`

CI runs `npm run validate` on every pull request, so a PR that changes the source without committing the regenerated adapters — or that tampers with an adapter directly — fails automatically. The fix is always the same: run `npm run build` and commit the result.

`node --test` runs the unit tests for the pure assembly functions (`scripts/lib.test.mjs`), guarding the build logic itself.

## How to add a new platform

Adding a platform is a one-row change — no new code paths:

1. Open `scripts/lib.mjs` and add a row to the **`TARGETS`** array:

   ```js
   { name: 'my-platform', outPath: 'adapters/my-platform/instructions.md', mode: 'full', frontmatter: null },
   ```

   - `name` — a unique identifier for the target.
   - `outPath` — where the generated file is written, relative to the repo root.
   - `mode` — `'full'` or `'lean'` (see above).
   - `frontmatter` — a YAML string if the platform needs one (as the Claude adapters do), otherwise `null`.

2. Run `npm run build`. The new adapter file is created automatically (its parent folder is created if needed).
3. The test `TARGETS covers all six platforms` enforces the six core platform folders exist; if you add a brand-new platform folder, extend that test's expectations to match.
4. Document the install steps in [`platforms.md`](platforms.md) and add a row to the usage table in the README.
5. Commit the source change **and** the newly generated adapter together.
