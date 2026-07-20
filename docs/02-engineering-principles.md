# 02 — Engineering Principles

Engineering principles are lenses for comparing designs. They are not a scoring system and should not be applied mechanically. When two principles pull in different directions, prefer the option that protects current behavior and risks with the least justified complexity, then record the trade-off.

## Context and applicability

| Status | Typical use in this document |
|---|---|
| `Essential` | readable code, simple control flow, clear responsibilities, one authoritative source for important rules, and explicit decisions |
| `Conditional` | idempotency for repeatable operations, immutability where shared state is risky, dependency inversion at meaningful volatile boundaries, and defensive checks at untrusted boundaries |
| `Advanced` | elaborate abstraction frameworks, pervasive immutable models, or formalized ports for many infrastructure choices—only after their benefit is demonstrated |
| `Not applicable` | mechanisms whose triggering problem is absent; for example, idempotency handling in a pure calculation with no side effect |

The goal is not the maximum number of principles visible in the code. The goal is understandable behavior, safe change, and costs proportional to the project described in [Project classification](01-project-classification.md).

## Simplicity before generality

### KISS — Keep It Simple

**Objective:** make the path from input to behavior easy to follow and verify.

Prefer a direct function that validates an input, performs a calculation, and returns a result over a chain of factories and strategies when there is one known behavior. “Simple” does not mean ignoring error handling, authorization, or concurrency; those are part of the problem when the context requires them.

```text
Current need: calculate one shipping rate from weight and destination.
Coherent start: calculateShippingRate(input, tariffTable).
Unjustified start: ShippingRateFactory → ProviderResolver → StrategyRegistry
                   when no alternative provider or strategy exists.
```

A design is not simpler merely because it has fewer files. A 600-line handler mixing authorization, pricing, persistence, and notifications is cognitively complex even if it occupies one file.

### YAGNI — You Aren't Gonna Need It

**Objective:** avoid paying today for a speculative requirement.

Do not create plugin systems, multi-region failover, generic workflow engines, or provider interfaces solely because they might be needed. Preserve a reasonable path to change by keeping responsibilities clear and tests behavioral; do not implement the future path in advance.

Use evidence such as a committed roadmap item, a second real implementation, a measured limit, or a contractual requirement. “It could scale” is not evidence by itself.

### Explicit over implicit

**Objective:** make behavior, dependencies, and failure modes visible at the point where a reader needs them.

Pass a clock into a time-dependent rule rather than reading global time in hidden callbacks. Name a transaction boundary rather than relying on an undocumented framework side effect. Prefer an explicit status transition such as `approve(request, actor, now)` over mutating a status field from many places.

Explicitness can become noise. Repeating stable framework boilerplate everywhere is not useful if one conventional adapter makes the behavior equally discoverable. Document any convention that carries important implicit behavior in [Coding conventions](05-coding-conventions.md).

## Duplication and abstraction

### DRY — Don't Repeat Yourself

**Objective:** keep each important piece of knowledge in one authoritative place so a change cannot leave contradictory versions behind.

DRY is not an instruction to eliminate every repeated line. First identify what is duplicated:

| Kind | What is repeated | Risk | Response |
|---|---|---|---|
| Textual duplication | identical tokens or statements | often low; the code may change for different reasons | tolerate it until a shared concept is evident |
| Structural duplication | similar shape or algorithm | moderate only if evolution is coupled | compare purpose, owner, and change history before extracting |
| Knowledge duplication | the same business fact, schema, limit, or policy | high; copies can disagree silently | define an authoritative source and derive consumers when practical |

Examples:

- Two test fixtures containing `country: "BR"` are textual duplication and may be clearer left local.
- Two independent importers that parse a header/body/trailer format have structural duplication; they should share code only if the format and its evolution are the same concept.
- A cancellation cutoff encoded in backend validation, frontend logic, and a scheduled job is duplicated knowledge. The backend/domain policy should be authoritative; clients may present guidance but must not redefine the rule.

**Do not merge similar implementations when they represent different business rules.** A loyalty discount and a shipping promotion may both calculate ten percent today, but they have different names, owners, eligibility, audit needs, and reasons to change. A generic `PercentageRule` can couple them accidentally.

### Premature and useful abstraction

An abstraction is premature when its contract is based on guesses, has only one incidental caller, hides the domain language, or makes the current change harder. Common symptoms include empty interfaces mirroring concrete classes, generic repositories with dozens of optional filters, and components controlled by many unrelated Boolean properties.

An abstraction is useful when it names a stable concept and removes a volatile or repeated decision. Evidence can include:

- two or more consumers sharing the same knowledge and lifecycle;
- a boundary that needs controllable substitution in production, not only in tests;
- repeated changes that must remain consistent;
- a domain concept with enforceable invariants;
- an external contract whose instability should not spread inward.

Use the “rule of three” only as a prompt to inspect repetition, not as a mandatory count. One highly consequential duplicated rule can deserve immediate centralization; five similar but independent workflows may not.

### Abstraction

**Objective:** expose the capability a consumer needs while hiding irrelevant implementation detail.

An effective abstraction narrows choices. `ExchangeRates.rateFor(currency, at)` expresses the required capability; a generic `execute(operationName, payload, options)` often moves provider details into every caller. Keep an abstraction at the vocabulary level of its consumer, and remove it if it only forwards calls without adding policy, translation, or isolation.

## Responsibility and boundaries

### Separation of Concerns

**Objective:** keep concerns with different reasons to change independently understandable.

An HTTP handler can parse a request and map a response while a use case decides whether an order can be cancelled. This does not require one class per concern: a small CLI command can validate and execute a simple transformation in one function if the responsibilities remain clear.

Do not split a cohesive rule across “controller,” “service,” and “helper” files merely to satisfy a layer diagram. A boundary should add responsibility, protect a rule, or isolate change.

### Single Source of Truth

**Objective:** identify one authoritative representation for an important fact.

Examples include a database constraint for unique persisted identity, an OpenAPI schema for a public contract when code is generated from it, or a domain policy for an approval threshold. Other representations can exist as caches, views, or generated artifacts, but their derivation and conflict behavior must be explicit.

Single source does not mean one file for everything. Different bounded meanings may legitimately use different representations: “customer address at purchase time” and “customer's current address” are not the same fact.

### High cohesion

**Objective:** place behavior and data that implement one concept close together.

An `Invoice` module containing issue, cancel, tax, and invoice-number rules is cohesive. A generic `Utils` module containing date parsing, authorization, invoice formatting, and retries is not. A useful test is: “Would these items usually change for the same business reason?”

### Low coupling

**Objective:** limit how much one change forces unrelated consumers to know or change.

Expose a narrow module contract instead of allowing callers to query internal tables and reconstruct state. Avoid shared mutable globals and concrete provider models leaking into domain rules. Coupling is not eliminated by an interface if both sides still depend on the same unstable details.

Some coupling is intentional: a use case must depend on its domain rules. Optimize boundaries with independent change, ownership, or failure modes rather than trying to make every class independent.

### Encapsulation

**Objective:** protect valid state and hide operations that could violate it.

Instead of exposing `order.status = "shipped"`, offer `order.ship(at)` that checks payment and records the transition. At a simple CRUD boundary with no invariant, plain validated data may be sufficient; wrapping every field in accessors adds ceremony without protection.

### Composition over inheritance

**Objective:** assemble focused behavior without binding consumers to a rigid type hierarchy.

Compose `RetryingPaymentGateway(baseGateway, retryPolicy)` rather than subclassing a provider client and inheriting unrelated behavior. In UI code, compose content and controls instead of creating a deep base-component hierarchy.

Inheritance can remain appropriate for a genuine substitutable “is-a” relationship with a stable base contract, or when a framework requires it. Verify substitutability rather than using inheritance only to reuse code.

### Dependency inversion

**Objective:** keep high-value policy from depending directly on volatile technical details.

A settlement policy can depend on the capability `Ledger.record(entry)`, while an adapter translates it to a vendor API. Place the contract near the policy that consumes it, and make it as narrow as that consumer needs.

Do not create an interface for every class. Direct use of a stable library, framework type, or ORM can be clearer in a trivial application. Inversion becomes useful when the boundary changes independently, has multiple implementations, must protect domain vocabulary, or requires controlled failure behavior. It is not primarily a mocking technique.

## State, failure, and trust

### Idempotency

**Objective:** allow the same logical operation to be retried without applying its effect more than once.

It is `Essential` for a payment callback that can be redelivered and often `Conditional` for commands sent over an unreliable network. Use a stable operation key, persist the result or state transition atomically, and define whether a repeated request returns the first result or a conflict.

Idempotency is not “ignore every duplicate.” The scope, lifetime, payload comparison, concurrent-arrival behavior, and storage cleanup must be defined. It is usually `Not applicable` to a side-effect-free calculation because that operation is naturally repeatable.

### Immutability when pertinent

**Objective:** reduce accidental state changes and make concurrent or historical reasoning safer.

Value objects such as `Money` or a published invoice snapshot are good candidates: create a new value rather than mutate the existing one. Local mutable builders and performance-sensitive buffers may be clearer and cheaper when ownership is exclusive.

Do not impose deep copying or immutable wrappers universally. Apply immutability where identity is absent, history matters, state is shared, or mutation could bypass an invariant.

### Fail fast

**Objective:** reject an invalid state as close as possible to its source, before it causes broader or irreversible effects.

Validate required configuration at startup and reject an invalid state transition before writing or sending an event. Return an actionable error with context, while avoiding secrets.

Fail fast does not mean crash on every expected user error. At process boundaries, classify failures: validation errors become controlled responses; corrupted invariants may stop the operation; transient provider failures may be retried under a bounded policy.

### Defensive programming

**Objective:** protect trusted code from inputs and dependencies that can violate its assumptions.

Validate untrusted input at the boundary, set timeouts on network calls, cap collections and file sizes, handle unknown enum values, and verify an external response before using it. Authorization must still be enforced at the authoritative backend boundary even if the UI hides an action.

Inside a strongly controlled module, repeating the same validation at every private function can obscure the real invariant. State and test the trust boundary rather than treating all code as equally hostile.

## SOLID as an analysis tool

SOLID can expose change pressure and unsafe dependencies in object-oriented or modular code. It is not an obligation to produce more classes, interfaces, factories, or files. A direct function can satisfy the underlying goals better than a class hierarchy.

### S — Single Responsibility Principle

**Objective:** a unit should have one cohesive reason to change, expressed in business or operational terms.

**Violation:** `ReportService` calculates revenue, renders PDF, uploads it, sends email, and decides recipient authorization. Changes from accounting, design, storage, messaging, and security collide.

**Correction:** keep the revenue policy cohesive; let an application flow coordinate rendering, storage, and delivery through focused capabilities. Split only along observed change boundaries.

**Common excess:** interpreting “responsibility” as “one method,” producing many forwarding classes and forcing readers through several files.

**When unnecessary:** a short one-purpose script or function whose steps change together does not need artificial class separation.

### O — Open/Closed Principle

**Objective:** make expected variations extendable without repeatedly modifying stable policy.

**Violation:** a checkout function contains a growing `switch` over payment providers, including provider-specific request mapping and retry rules.

**Correction:** once multiple real providers exist, define the narrow payment capability used by checkout and implement provider adapters. The checkout policy remains stable while adapters vary.

**Common excess:** building registries, plugins, and strategy hierarchies for one implementation or an unconfirmed variation.

**When unnecessary:** modifying a small, well-tested switch can be cheaper and clearer when variants are few, closed, and change together.

### L — Liskov Substitution Principle

**Objective:** any implementation of a contract should preserve its promises, not surprise the consumer with stronger preconditions or weaker outcomes.

**Violation:** `ReadOnlyAccountRepository` subclasses a repository whose contract promises `save`, then throws `UnsupportedOperation` when called.

**Correction:** expose a read-only query contract to read consumers and a separate write capability where needed; do not claim substitutability that does not exist.

**Common excess:** forcing unlike concepts under one base type because methods look similar, or treating every implementation detail as a contract clause.

**When unnecessary:** there is no subtype analysis to perform for a standalone function or a final concrete module with no substitution contract.

### I — Interface Segregation Principle

**Objective:** consumers should depend only on capabilities they actually use.

**Violation:** a notification consumer must implement one interface containing email, SMS, push, template management, delivery reports, and administration methods.

**Correction:** define small contracts around consumer needs, such as `SendNotification` and `ReadDeliveryStatus`, without fragmenting one cohesive operation.

**Common excess:** one-method interfaces for every method regardless of consumers, creating indirection with no independent use or change.

**When unnecessary:** a small internal concrete API used cohesively by one caller may be simpler than several interface files.

### D — Dependency Inversion Principle

**Objective:** let policy define what it needs and keep volatile mechanisms behind that boundary.

**Violation:** a credit-approval rule imports an HTTP vendor client, maps its wire model, reads environment variables, and handles vendor-specific error codes.

**Correction:** the rule consumes a domain-level `CreditEvidence` capability; an outer adapter owns configuration, transport, mapping, and provider failures.

**Common excess:** mirroring every concrete class with an identical interface, adding dependency injection containers to trivial programs, or placing generic contracts in a detached “interfaces” folder.

**When unnecessary:** direct dependency on stable, local code is acceptable when no valuable policy is being protected and substitution has no real use.

## A practical review sequence

Before introducing or changing an abstraction, answer:

1. What current behavior or risk requires this design?
2. Which knowledge must have one authoritative source?
3. Which parts change for the same reason, and which change independently?
4. Is the proposed boundary expressed in domain or consumer language?
5. Is a direct function or concrete dependency sufficient today?
6. What test becomes clearer or more meaningful because of the boundary?
7. What cognitive, runtime, and maintenance cost does it add?
8. What evidence would justify revisiting the simpler choice?

Record durable choices in an ADR and align module boundaries with [Project structure](04-project-structure.md). For domains with meaningful invariants and state transitions, apply these principles through the focused guidance in [Domain modeling](06-domain-modeling.md).
