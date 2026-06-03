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
