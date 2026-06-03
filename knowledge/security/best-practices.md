# Security Best Practices

> Secure-by-default engineering: assume input is hostile, grant the least access that works, and never store secrets in code. Security is a property of every layer, not a feature you bolt on.

## Concepts

- **OWASP Top 10 (at a glance):** the most common, highest-impact web risks — broken access control,
  injection (SQL/command/XSS), cryptographic failures, insecure design, security misconfiguration,
  vulnerable/outdated components, identification/authentication failures, software/data integrity
  failures, logging/monitoring failures, and server-side request forgery (SSRF). Know them; design
  against them.
- **Input validation & output encoding:** validate/normalize all input at the boundary against an
  allow-list; *encode* output for its context (HTML, SQL, shell) to neutralize injection. Validation
  stops bad data in; encoding stops bad data from being interpreted on the way out.
- **Auth & session hygiene:** hash passwords with a slow, salted algorithm (bcrypt/argon2 — never
  plain MD5/SHA), use short-lived tokens, set `HttpOnly`/`Secure`/`SameSite` cookies, and enforce
  HTTPS everywhere.
- **Secrets management:** keep credentials in a secret store / environment, never in source control;
  rotate them; scope them tightly.
- **Dependency / CVE hygiene:** third-party code is your attack surface. Pin versions, audit
  regularly, and patch known vulnerabilities promptly.
- **Least privilege:** every user, service, token, and DB account gets the minimum access it needs —
  nothing more.

## Best Practices

- Validate input with allow-lists; reject by default. Parameterize every query and command.
- Encode output for its sink (HTML-encode to stop XSS, parameterize to stop SQLi).
- Store only password *hashes* (argon2/bcrypt); never log secrets or PII.
- Run dependency audits in CI and keep components current.
- Default every grant to the narrowest scope and expand only with cause.

## Patterns & Examples

```javascript
// Defense in depth on a login route: parameterized query + constant-time hash check.
import argon2 from 'argon2';

async function login(db, email, password) {
  // Parameterized — user input never concatenated into SQL (stops injection).
  const user = await db.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
  if (!user) return null;

  // argon2.verify is slow + salted; resists brute force and timing attacks.
  const ok = await argon2.verify(user.password_hash, password);
  return ok ? { id: user.id } : null;   // never reveal which field was wrong
}
```

```text
Secrets: read from the environment / a secret manager — never hardcode.
  ✗  const apiKey = "sk_live_9f1c…";              // committed → compromised forever
  ✓  const apiKey = process.env.STRIPE_API_KEY;   // injected at deploy, rotatable
```

This module is the practical complement to the agent's **`core/05-guardrails.md`** mindset: validate
input, parameterize queries, hash secrets, least privilege, no secrets in code, and flag insecure
requests instead of silently complying.

## Common Pitfalls / Anti-patterns

- **Trusting client input:** validating only in the browser; the API is called directly. Validate on
  the server, always.
- **String-built queries/commands:** the root of SQL injection and command injection. Parameterize.
- **Rolling your own crypto / storing plaintext passwords:** use vetted libraries and slow hashes.
- **Secrets in Git:** even deleted-then-committed keys live in history. Rotate and use a vault.
- **Over-privileged accounts:** one leaked admin token = full compromise. Scope everything.

## References

- OWASP Top 10 — https://owasp.org/www-project-top-ten/
- OWASP Cheat Sheet Series — https://cheatsheetseries.owasp.org/
- See also: `core/05-guardrails.md` (the agent's security-by-default stance)

<!-- level: intermediate -->
