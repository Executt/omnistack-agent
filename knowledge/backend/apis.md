# API Design

> The contract between your backend and everyone who calls it. A good API is predictable, versioned, validated, and forgiving to evolve — bad ones leak forever.

## Concepts

- **REST resource design:** model the domain as **nouns** (resources) at URLs (`/orders`,
  `/orders/42/items`), acted on by HTTP verbs. Plural collections, IDs for members; avoid verbs in
  paths.
- **HTTP verbs & status codes:** `GET` (read, safe), `POST` (create), `PUT`/`PATCH` (replace/update),
  `DELETE` (remove). Return meaningful status: `200/201/204` success, `400` bad input, `401`/`403`
  auth, `404` missing, `409` conflict, `422` validation, `500` server error.
- **Versioning:** never break a published contract. Version via URL (`/v1/...`) or header; add fields
  additively, deprecate before removing.
- **Validation:** reject malformed input at the edge with a clear, structured error — never trust the
  client.
- **Pagination:** never return unbounded lists; page with `limit`/`offset` or cursors.
- **Error envelopes:** return errors in a consistent, machine-readable shape across every endpoint.
- **Idempotency:** the same `PUT`/`DELETE` (or a `POST` with an idempotency key) applied twice yields
  the same result — essential for safe retries.

## Best Practices

- Use nouns and HTTP verbs; let the method convey the action, not the URL.
- Validate every input and return `422` with field-level messages, not a bare `400`.
- Page all collection endpoints and document the limits.
- Keep one error envelope for the whole API; include a stable error `code`, a human `message`, and
  details.
- Make writes idempotent so clients can retry safely on network failure.

## Patterns & Examples

```http
GET /v1/orders?limit=20&cursor=eyJpZCI6NDJ9   →  200 OK
{
  "data": [ { "id": 43, "status": "paid", "totalCents": 4497 } ],
  "page": { "nextCursor": "eyJpZCI6NDN9", "limit": 20 }
}

POST /v1/orders        (Idempotency-Key: 9f1c…)   →  201 Created
DELETE /v1/orders/43                              →  204 No Content
```

```json
// One consistent error envelope, returned on every failure (here: 422 validation).
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Request body is invalid.",
    "details": [
      { "field": "email", "issue": "must be a valid email address" }
    ]
  }
}
```

**Auth (one paragraph):** *token-based* auth (a bearer JWT/opaque token sent per request) is stateless
and scales horizontally — ideal for APIs and SPAs/mobile; *session-based* auth keeps state server-side
behind a cookie — simpler for classic server-rendered web apps. Either way: HTTPS only, short-lived
access tokens, and never put secrets in the URL.

**REST vs GraphQL — pick when:** REST fits resource-shaped CRUD with cacheable endpoints and simple
tooling. GraphQL fits clients that need flexible, nested selections and want to avoid over/under-
fetching across many entities — at the cost of more server complexity and harder caching.

## Common Pitfalls / Anti-patterns

- **Verbs in URLs:** `/getOrders`, `/createOrder` — re-implements HTTP in the path. Use `GET /orders`.
- **Wrong/uniform status codes:** returning `200` with `{"error": ...}` breaks clients that rely on
  status. Use the right code.
- **Unversioned breaking changes:** removing or renaming a field with no version bump shatters every
  consumer.
- **Unbounded responses:** returning every row; the first big tenant takes the service down.

## References

- MDN HTTP methods & status codes — https://developer.mozilla.org/docs/Web/HTTP
- Microsoft REST API design guidelines — https://github.com/microsoft/api-guidelines
- GraphQL — https://graphql.org/learn/

<!-- level: intermediate -->
