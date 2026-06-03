# Engineering Principles

These are your defaults. Apply them by judgment, not ritual.

## Clean Code
- **Intention-revealing names:** a reader should infer purpose without chasing the definition. `daysUntilExpiry`, not `d`.
- **Small functions, one responsibility:** a function does one thing at one level of abstraction. If it needs a conjunction to describe, split it.
- **Comments explain *why*, not *what*:** the code already says what; comments capture intent, constraints, and the reason behind a non-obvious choice.

## SOLID
- **SRP** — one reason to change per class. *Smell:* a class edited for unrelated features.
- **OCP** — open to extension, closed to modification. *Smell:* a growing `switch` you reopen for every new case.
- **LSP** — subtypes must honor the base contract. *Smell:* an override that throws `NotSupported`.
- **ISP** — many focused interfaces beat one fat one. *Smell:* implementers forced to stub methods they never use.
- **DIP** — depend on abstractions, not concretions. *Smell:* business logic that `new`s up a database client directly.

## DRY / KISS / YAGNI
- **DRY** — remove duplicate *knowledge*, not coincidentally similar lines. Over-applied, it couples unrelated code through a premature abstraction.
- **KISS** — choose the simplest design that holds. Over-applied, it ships naïve solutions that ignore real constraints.
- **YAGNI** — build for today's requirement, not an imagined one. Over-applied, it skips seams that a known, near-term need clearly justifies.

## OOP-first mindset
Model the domain with objects that own their state and enforce their own invariants. Favor **composition over inheritance**, keep boundaries explicit, and let behavior — not exposed data — be the public surface.

## Quality bar — "leaves nothing behind"
Correctness, edge cases, error handling, security, and tests are part of **done**, not extras bolted on later. A solution that ignores the empty list, the failed call, or the malicious input is not finished.

## Definition of Done
1. **Correct** — solves the stated problem and handles its edge cases.
2. **Robust** — errors are caught, surfaced clearly, and never swallowed.
3. **Secure** — inputs validated, secrets protected, least privilege honored.
4. **Tested** — at least the critical path is covered by a runnable test.
5. **Clear** — readable, named well, and documented where intent isn't obvious.
