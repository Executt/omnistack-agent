# Adding a Knowledge Module

The knowledge base (`knowledge/`) is intentionally modular: one topic per Markdown file, grouped into domain folders, each file following the same fixed template. Adding knowledge is the most common way to contribute. This guide walks through it end to end.

## Before you start

- **Node ≥ 18**, zero npm dependencies.
- Golden rule: edit **`knowledge/`** (the source), never **`adapters/`** (generated output).

## Step 1 — Copy the module template

Every module MUST follow the same shape. Copy this template (it is also embedded in [`knowledge/_index.md`](../knowledge/_index.md)) into your new file:

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

Fill in each section:

- **Concepts** — the core ideas, defined plainly.
- **Best Practices** — what a senior engineer actually does.
- **Patterns & Examples** — real, commented code in fenced blocks with a language tag.
- **Common Pitfalls / Anti-patterns** — the traps and why they hurt.
- **References** — links to official docs or standards.
- **Level comment** — set `beginner`, `intermediate`, or `advanced`.

## Step 2 — Place the file under the right folder

Drop the file into the folder that matches its domain. The existing folders are:

```
knowledge/
├── oop/            # object-oriented design (the agent's primary focus)
├── languages/      # language-specific essentials
├── frontend/       # UI frameworks and patterns
├── backend/        # services and APIs
├── mobile/         # native vs cross-platform
├── databases/      # relational, non-relational, modeling
├── architecture/   # scalability and architectural patterns
├── devops/         # CI/CD, IaC, deployment
├── testing/        # automated testing and manual QA
├── security/       # secure-by-default practices
└── documentation/  # technical writing
```

Use a short, kebab-case filename that names the topic, e.g. `knowledge/languages/python.md` or `knowledge/architecture/event-driven.md`. If no existing folder fits, create a new domain folder — and then also add its category heading in the index (next step).

## Step 3 — Link it in `knowledge/_index.md`

Open [`knowledge/_index.md`](../knowledge/_index.md) and add a bullet under the matching `###` category heading, using a **relative link** and a one-line description that matches the style of the existing entries:

```markdown
- [Python Essentials](languages/python.md) — types, dataclasses, async, typing, the standard library.
```

This index is the single table of contents that both readers and the build rely on, so keep it ordered and consistent.

## Step 4 — Rebuild the adapters

Regenerate every adapter so they include your new module:

```bash
npm run build
```

Modules added to `knowledge/` are automatically picked up — the build walks the folder tree, so there is nothing else to register. `full`-mode adapters will now inline your module; `lean`-mode adapters pick up the new index link.

## Step 5 — Verify

```bash
node --test      # unit tests for the build logic still pass
npm run validate # ✓ All 9 adapters in sync.
```

`validate` will fail if you forgot to run `npm run build`, because the committed adapters would no longer match the source.

## Step 6 — Commit

Commit your **source** change and the **regenerated adapters** together:

```bash
git add knowledge/ adapters/
git commit -m "docs(knowledge): add <topic> module"
```

Then open a pull request. CI runs `npm run validate`, so the PR confirms your adapters are in sync. See [`../CONTRIBUTING.md`](../CONTRIBUTING.md) for the full contribution guide.
