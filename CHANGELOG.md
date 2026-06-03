# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-03

Initial public release.

### Added

- **Single-source `core/` brain** — numbered prompt files that define the agent's
  identity, reasoning approach, and software-engineering behavior from one canonical source.
- **v1 `knowledge/` modules** covering OOP, programming languages, frontend, backend,
  mobile, databases, architecture, devops, testing, security, and documentation.
- **Zero-dependency, tested build system** — `npm run build` generates the adapters and
  `node --test` exercises the pipeline using only Node.js built-ins (Node ≥ 18).
- **9 generated platform adapters** produced from `core/` + `knowledge/` and kept
  byte-for-byte in sync with the source via `npm run validate`.
- **Bilingual README** (English and Portuguese) with banner, usage, and contribution guidance.
- **Documentation guides** under `docs/` covering the architecture, adding knowledge,
  and the platform adapters.
