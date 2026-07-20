# Backend Architecture

Backend guidance is **Not applicable** when a project has no trusted server-side behavior. When it does, start with the fewest boundaries that keep validation, authorization, business rules, and side effects understandable. A backend is not improved merely by having more layers.

Related guidance: [project structure](04-project-structure.md), [domain modeling](06-domain-modeling.md), [API design](07-api-design.md), [data and persistence](08-data-and-persistence.md), and [security](11-security.md).

## Default decision

For a small backend, one route/controller may parse input, enforce access, call one focused function, persist through the framework or ORM, and map the result. Extract a responsibility when it has an independent reason to change, is reused as the same business concept, needs a distinct test boundary, or coordinates a transaction or external side effect.

| Context | Reasonable starting point | Usually unnecessary initially |
| --- | --- | --- |
| Trivial CRUD, trusted internal use, simple validation | Thin route plus direct, explicit persistence | Generic service/repository hierarchies, factories, domain events |
| Several use cases with rules and integrations | Feature modules with application functions/services | One global `BaseService` or `BaseRepository` |
| Complex lifecycle and invariants | Application orchestration plus a focused domain model | Splitting into services only to mirror entities |
| Independent teams, scaling, or isolation requirements | Explicit modules first; independent services only with evidence | Distribution based on anticipated growth alone |

“Thin” does not mean a fixed line count. A route is thin when protocol concerns are clear and business decisions live in an authoritative, testable place.

## Responsibility flow

Use these responsibilities only when present:

```text
Transport boundary
  parse input and classify public/protected access
  authenticate when protected
  → Application operation
      authorize the resource and coordinate the use case
      → Domain rule or focused function
          decide valid business behavior
      → Persistence/integration boundary
          perform durable or external effects
  → Transport mapping
      stable response or error
```

This is a responsibility map, not a requirement for one class or directory per box. A single function may cover several steps coherently in a trivial application.

### Controllers or routes

**Essential when a backend exposes a protocol.** Keep HTTP, message, CLI, or job mechanics at this boundary:

- parse and bound input using a schema;
- establish correlation context and an explicit public-or-protected access policy;
- authenticate and propagate verified identity for protected operations;
- invoke one clear application operation;
- map typed success and failure outcomes to the protocol;
- avoid deciding prices, permissions, transitions, or other business policies inline.

Do not silently convert malformed input or unexpected failures into plausible success. Follow the stable error contract in [API design](07-api-design.md).

### Application functions or services

An application operation coordinates a user or system goal: load required state, authorize protected actions, invoke rules, define a transaction, persist the outcome, and schedule required effects.

- A **simple function is sufficient** when there is one short flow, few collaborators, and no useful lifecycle or polymorphism.
- A **focused service is useful** when multiple steps form one use case, transaction or retry boundaries need a clear owner, or the same operation has several adapters.
- A **service is not useful** when it only renames and forwards every ORM or repository method.

Name services after outcomes such as `ApproveApplication`, not vague containers such as `CommonService`, `Manager`, or `Utils`.

### Domain rules

Keep an important rule in one authoritative place even if several transports call it. Represent invariants, calculations, policies, and state transitions with the simplest construct that makes invalid behavior difficult. This may be a pure function, validated type, entity method, policy object, or database constraint. See [domain modeling](06-domain-modeling.md); tactical DDD is never a default for CRUD.

### Validation and authorization

Validation has distinct purposes:

1. **Structural validation** at the boundary rejects malformed shape, size, and format.
2. **Domain validation** enforces invariants using current authoritative state.
3. **Persistence constraints** protect durable integrity under concurrency.

Authentication identifies an actor; authorization decides whether that actor may perform this action on this resource. Enforce authorization on the trusted backend, close to the use case and before revealing protected state. UI checks improve experience but are not a security control.

## Persistence choices

### Direct ORM or database access

Direct use is reasonable when queries are local to a simple use case, the persistence model closely matches the data behavior, tests can exercise the real boundary, and changing the storage mechanism is not a credible requirement. Keep queries explicit and prevent transport code from leaking persistence objects as public contracts.

### Focused repository or gateway

Introduce one when it provides a real boundary, for example:

- a domain model must be reconstituted without depending on ORM mechanics;
- several storage operations form one meaningful collection contract;
- a volatile provider or legacy system needs isolation;
- tests benefit from a faithful in-memory fake at that boundary;
- a module must prevent unrelated code from accessing its owned data.

Do not add a repository only because a table exists or because storage might hypothetically change. Avoid generic CRUD repositories that accumulate unrelated filters, eager-loading flags, tenant switches, and transaction options. Prefer narrow operations expressed in domain or use-case language.

### Transactions and concurrency

Define the smallest atomic boundary that protects an invariant. Do not hold a database transaction open across an unreliable network call. Choose deliberately among constraints, optimistic version checks, locks, idempotency keys, and serialized work according to the conflict and throughput profile.

When a committed state change must reliably cause an external message, consider an outbox or equivalent durable handoff. This is **Conditional**: it introduces relay, deduplication, retention, and monitoring work.

## External integrations

Wrap an external system at a boundary when its contract, authentication, failure behavior, or release cycle differs from the application's. Define:

- explicit timeouts and bounded resource use;
- which failures are transient, permanent, or ambiguous;
- retries with backoff/jitter only when the operation is safe or idempotent;
- stable internal outcomes rather than provider-specific errors throughout the codebase;
- contract tests or provider sandbox checks for critical paths;
- ownership and a manual recovery path where loss matters.

Circuit breakers and bulkheads are **Advanced** controls for measured cascading-failure risk, not mandatory wrappers around every call.

## Asynchronous processing and events

Queues or background jobs are **Conditional** when work exceeds request latency, must survive a process restart, absorbs bursts, or can complete independently. They add duplicate delivery, ordering, poison-message handling, retry exhaustion, visibility, and operational ownership.

Every handler should define:

- its idempotency identity and duplicate outcome;
- retryable versus terminal failures;
- ordering and concurrency assumptions;
- dead-letter or manual recovery behavior;
- safe payload versioning and retention;
- metrics and correlation back to the initiating work.

Use an event for a fact that other behavior genuinely needs, not to hide an ordinary function call. Domain events, integration events, and audit records have different consumers and durability requirements; do not treat them as interchangeable.

## Errors, logs, and audit

- Model expected domain conflicts explicitly and map them to stable external error codes.
- Let unexpected faults reach a centralized safety boundary that records correlation and returns a non-sensitive response.
- Use structured technical logs for diagnosis; never include secrets or unnecessary personal data.
- Use a separate, durable audit trail when the business or regulation must prove who performed which action, on what resource, when, and sometimes why.
- Record metrics or traces only when they answer an operational question proportionate to criticality. See [observability](13-observability.md).

## Possible structures

### Small feature-based backend

```text
src/
├── features/
│   └── invitations/
│       ├── create-invitation.*
│       ├── invitation-route.*
│       └── invitation.test.*
├── shared/
│   └── database.*
└── main.*
```

### Backend with meaningful domain modules

```text
src/
├── modules/
│   ├── billing/
│   │   ├── application/
│   │   ├── domain/
│   │   └── adapters/
│   └── accounts/
│       ├── application/
│       ├── domain/
│       └── adapters/
├── platform/
│   ├── database/
│   └── http/
└── main
```

The second structure is justified only when those distinctions contain real responsibility. Empty directories and one-line pass-through files are evidence that the structure is ahead of the problem.

## Evolution signals

Reassess the backend structure when evidence shows:

- business rules are duplicated across transports or jobs;
- transaction or authorization boundaries are repeatedly wrong;
- changes to one feature break unrelated features;
- provider details spread through application and domain code;
- module ownership cannot be enforced with current dependencies;
- measured latency, throughput, or failure isolation misses explicit objectives;
- deployment coordination—not code aesthetics—prevents teams from delivering independently.

Before extracting a service, strengthen the module boundary inside the existing deployable, measure the bottleneck, and document data ownership and failure semantics. Consult the [architecture selection matrix](03-architecture-selection.md) and record a costly-to-reverse choice as an [ADR](../templates/adr.template.md).

## Review questions

- Is each important rule implemented once at its authoritative boundary?
- Can a reader identify validation, authorization, transaction, and side-effect ownership?
- Does every abstraction remove a concrete coupling or express a domain concept?
- Are direct ORM access and repositories used intentionally rather than uniformly?
- Are integration timeout, retry, idempotency, and recovery behaviors explicit?
- Can production failures be diagnosed without confusing logs with audit evidence?
- Are [testing](12-testing.md) and [security](11-security.md) proportional to the actual risks?
