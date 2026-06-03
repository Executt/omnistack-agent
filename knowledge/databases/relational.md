# Relational Databases

> Tables, relationships, and SQL — the default, battle-tested choice when your data has structure and you need correctness guarantees.

## Concepts

- **Relational model:** data lives in **tables** (relations) of **rows** (records) and **columns**
  (attributes). Rows are linked by **keys** — a **primary key** uniquely identifies a row; a **foreign
  key** references another table's primary key.
- **Normalization:** organize columns to remove redundancy and update anomalies.
  - *1NF:* atomic values, no repeating groups (no comma-lists in a column).
  - *2NF:* 1NF + every non-key column depends on the **whole** primary key.
  - *3NF:* 2NF + no non-key column depends on another non-key column.
- **Indexes:** a sorted lookup structure (usually a B-tree) that turns a full table scan into a fast
  seek. They speed reads but cost storage and slow writes — every insert/update maintains them.
- **Transactions & ACID:** a transaction groups statements so they **A**ll succeed or **A**ll roll
  back — **A**tomicity, **C**onsistency, **I**solation, **D**urability. This is the relational
  superpower for money, inventory, and bookings.
- **Joins:** combine rows across tables on a key (`INNER`, `LEFT`, etc.).

## Best Practices

- Normalize to 3NF first; denormalize later, deliberately, only where reads prove it's needed.
- Index the columns you filter, join, and sort on — but only those; unused indexes are pure write cost.
- **Always parameterize queries** — never concatenate user input into SQL (SQL injection).
- Wrap multi-step writes in a transaction; keep transactions short to avoid lock contention.
- Select only the columns you need; let the database do filtering and aggregation, not the app.

## Patterns & Examples

```sql
-- A parameterized join with an index that makes the lookup fast.
CREATE INDEX idx_orders_customer ON orders (customer_id);

-- Parameterized: the driver sends @customerId separately — injection-proof.
SELECT o.id, o.total, c.name
FROM   orders o
JOIN   customers c ON c.id = o.customer_id
WHERE  o.customer_id = @customerId   -- never string-concatenate this value
ORDER  BY o.created_at DESC;

-- A transaction: both updates commit together, or neither does.
BEGIN TRANSACTION;
  UPDATE accounts SET balance = balance - 100 WHERE id = @from;
  UPDATE accounts SET balance = balance + 100 WHERE id = @to;
COMMIT;
```

| Engine | Pick when |
|---|---|
| **PostgreSQL** | Default open-source choice: rich types (JSONB), extensions, strict standards. |
| **SQL Server** | .NET/enterprise stacks, strong tooling, T-SQL, Windows shops. |
| **MySQL** | Ubiquitous web hosting, read-heavy apps, large ecosystem. |
| **MariaDB** | Drop-in MySQL fork, community-governed. |
| **Oracle** | Large enterprises with existing Oracle investment and support needs. |
| **SQLite** | Embedded/single-file: mobile apps, tests, small local tools — no server. |

## Common Pitfalls / Anti-patterns

- **N+1 queries:** one query for a list, then one more per row in a loop. Fix with a join or a single
  batched `IN (...)` query.
- **Missing indexes:** filtering or joining on an unindexed column forces full scans that get slower
  as the table grows.
- **`SELECT *`:** pulls columns you don't need, breaks when the schema changes, and defeats covering
  indexes. List the columns.
- **String-built SQL:** the classic SQL-injection hole. Parameterize, always.

## References

- PostgreSQL documentation — https://www.postgresql.org/docs/
- Use The Index, Luke! (indexing & performance) — https://use-the-index-luke.com/
- OWASP SQL Injection Prevention Cheat Sheet — https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html

<!-- level: intermediate -->
