# Profile: Backend API

Use this profile for an HTTP or RPC service that exposes data and operations to clients. Persistence, authentication, and asynchronous processing depend on context; an API does not automatically require all three.

Use the [architecture assessment](../templates/architecture-assessment.template.md), [API contract template](../templates/api-contract.template.md), [backend architecture guidance](../docs/backend-architecture.md), and [API design guidance](../docs/07-api-design.md) before selecting implementation patterns.

## Characteristics

- A contract consumed by one or more clients.
- Validation and an explicit public-or-protected access policy at a trusted boundary.
- Rules ranging from simple CRUD to transactional domain behavior.
- Optional persistence and external integrations.
- A need for compatibility, predictable errors, and operability.

## Recommended initial architecture

Start with thin routes and modules organized by resource or feature. A use-case function is enough when it coordinates validation, a rule, and direct ORM access. Separate domain, application, and adapters only when each boundary has a concrete responsibility.

```text
src/
├── app/                 # bootstrap, configuration, middleware
├── modules/
│   └── orders/
│       ├── routes/
│       ├── schemas/
│       ├── operations/
│       └── persistence/
├── integrations/
└── shared/
tests/
migrations/
```

For a small CRUD, routes, a schema, and a model may suffice. Add a repository when multiple data sources, complex queries, a domain boundary, or testing needs justify a port; do not mechanically wrap every ORM method.

## Practice selection

### Essential

- Explicit contract, input/output schemas, and structured errors.
- Authentication when applicable and server-side authorization for every protected operation/resource.
- Transaction boundaries around operations that require atomicity.
- When persistence exists, reproducible migrations and constraints that protect persisted invariants.
- Timeouts and explicit failure behavior for integrations.
- Structured logs with correlation IDs and no secrets.
- Deliberate backward compatibility or versioning.
- Health checks that truthfully represent serving capability.

### Conditional

- A service layer for reused orchestration or material transactional flows.
- Repositories for complex persistence or domain isolation.
- Queues for long work, bursts, retries, or temporal decoupling.
- Cache with defined invalidation and staleness tolerance.
- OpenAPI and generated clients when other teams depend on the contract.

### Advanced

- Hexagonal or Clean Architecture when multiple adapters and stable rules justify those boundaries.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- Frontend and Design System.
- Interfaces for single implementations without a meaningful boundary.
- `BaseService` or `GenericRepository` types that mix unrelated rules.
- CQRS, Event Sourcing, and microservices as a starting point.
- API Gateway for one API with no shared edge requirement.

## Minimum testing strategy

- HTTP integration tests for contracts, validation, errors, and authorization.
- Tests for relevant rules, invariants, and transactions.
- Integration with a real database for critical queries, constraints, and migrations when persistence exists.
- Contract or sandbox tests for critical external integrations.
- Idempotency tests for retryable or key-protected operations.
- Smoke test after deployment.

## Common risks

- Controllers accumulating business rules, persistence, and serialization.
- Giant generic services and repositories.
- Exposing ORM entities as the public contract.
- Validating shape without checking resource-level authorization.
- Retries without idempotency, creating duplicate effects.
- Holding database transactions open across network calls.
- Logging tokens or personal data.

## Evolution signals

Add a queue when response time, bursts, or retries harm synchronous requests. Strengthen module boundaries when one feature repeatedly affects unrelated areas. Split deployments only for demonstrated scaling, availability, technology, or team autonomy needs; before that, prefer a [modular monolith](modular-monolith.md).
