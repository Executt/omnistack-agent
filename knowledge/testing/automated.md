# Automated Testing

> Tests that run on every change, fast and unattended, so you can refactor without fear. The safety net that lets a codebase keep moving.

## Concepts

- **The test pyramid:** many fast **unit** tests at the base, fewer **integration** tests in the
  middle, a thin layer of slow **end-to-end (e2e)** tests on top. Push verification down the pyramid
  — cheaper, faster, more precise feedback.
- **Unit test:** exercises one unit (a class/function) in isolation. Fast, deterministic, no I/O.
- **Integration test:** verifies that units work together across a real boundary (DB, HTTP, queue).
- **End-to-end test:** drives the whole system as a user would (browser, API surface). High
  confidence, high cost — keep them few.
- **Arrange-Act-Assert (AAA):** the shape of a good test — set up inputs, perform the one action,
  assert the one outcome.
- **TDD loop (red-green-refactor):** write a failing test (red), write the minimum code to pass it
  (green), then clean up with the test as a guard (refactor).

## Best Practices

- One behavior per test; name it after the behavior (`Deposit_RejectsNegativeAmount`).
- Keep unit tests **fast and deterministic** — no clock, network, or random unless injected/seeded.
- Mock sparingly — only true external boundaries (network, clock, filesystem). Over-mocking tests the
  mocks, not the code.
- Treat **coverage as a signal, not a goal.** 100% coverage of trivial getters proves nothing; cover
  the branches that carry risk.
- Make the test suite a precondition for merge (CI), not an afterthought.

## Patterns & Examples

```csharp
// C# with xUnit — Arrange-Act-Assert, one behavior per test.
public class BankAccountTests
{
    [Fact]
    public void Deposit_IncreasesBalance()
    {
        var account = new BankAccount("Ada", 100m);   // Arrange
        account.Deposit(50m);                          // Act
        Assert.Equal(150m, account.Balance);           // Assert
    }

    [Fact]
    public void Deposit_RejectsNonPositiveAmount()
    {
        var account = new BankAccount("Ada", 100m);
        Assert.Throws<ArgumentException>(() => account.Deposit(0m));
    }
}
```

```javascript
// JavaScript with the built-in node:test runner — zero dependencies.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BankAccount } from './bank-account.js';

test('deposit increases the balance', () => {
  const account = new BankAccount('Ada', 100);   // Arrange
  account.deposit(50);                            // Act
  assert.equal(account.balance, 150);             // Assert
});

test('deposit rejects a non-positive amount', () => {
  const account = new BankAccount('Ada', 100);
  assert.throws(() => account.deposit(0), /amount must be > 0/);
});
```

## Common Pitfalls / Anti-patterns

- **Ice-cream cone:** the pyramid inverted — lots of slow, flaky e2e tests and almost no unit tests.
  Slow feedback, hard to debug failures.
- **Testing implementation, not behavior:** asserting that a private method was called rather than
  that the outcome is correct; the tests break on every refactor.
- **Flaky tests:** dependence on timing, ordering, or shared state. A test that fails randomly trains
  the team to ignore red — quarantine and fix it.
- **Coverage worship:** writing assertion-free tests to hit a percentage. Cover behavior and risk.

## References

- Fowler — The Practical Test Pyramid — https://martinfowler.com/articles/practical-test-pyramid.html
- Node.js test runner docs — https://nodejs.org/api/test.html
- xUnit.net documentation — https://xunit.net/

<!-- level: intermediate -->
