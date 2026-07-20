# Profile: Full-stack Application

Use this profile when UI, backend, and persistence form one cohesive product and a team can evolve them together. It does not require a particular framework, monorepo, or deployment topology; choose those from ownership and operational constraints.

Complete the [project context](../templates/project-context.template.md), [architecture assessment](../templates/architecture-assessment.template.md), and [testing strategy](../templates/testing-strategy.template.md).

## Characteristics

- User journeys cross UI, API, business rules, and data.
- One small or medium team owns the product.
- Internal contracts can evolve in coordination but remain explicit.
- Authentication, authorization, and persistence are common, not universal.
- Simple development and deployment usually matter more than premature independence.

## Recommended initial architecture

Start with vertical slices or features, keep authoritative rules on the server, and define the boundary contract. A monorepo is convenient when ownership and release cadence are shared. One full-stack framework and deployable is equally valid when it meets security and availability needs.

```text
apps/
├── web/
│   └── src/features/
└── server/
    └── src/modules/
packages/
├── contracts/          # boundary schemas, not database entities
└── ui/                 # only after real reuse
migrations/
tests/
```

For a smaller product, `src/features/<feature>/{ui,server}` may be enough. Do not split frontend and backend to mirror an organizational boundary that does not exist.

## Practice selection

### Essential

- One authority for each rule: authorization and invariants stay server-side.
- Explicit input/output contracts even inside one repository.
- Validation at boundaries and actionable UI feedback.
- Versioned migrations, constraints, and transactions for atomic changes.
- Loading, empty, and failure states in primary journeys.
- Secret management, environment configuration, and a known rollback path.
- One small vertical slice validated before expanding the structure.
- Tests across the highest-risk boundaries.

### Conditional

- Monorepo for frequent coordinated changes and contract sharing.
- UI library after components with the same intent recur.
- Jobs or queues for email, imports, reports, and slow integrations.
- Audit trails for sensitive or regulated operations.
- Cache for a measured bottleneck with defined expiration semantics.

### Advanced

- Rich domain modules when invariants and transitions outgrow CRUD.
- Separate deployments when scale, risk, or release cadence demonstrably diverge.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- Microservices that split UI, API, and worker by convention.
- API Gateway or service mesh for one deployable product.
- Repository Pattern over every trivial ORM operation.
- CQRS and Event Sourcing without independent read/write or historical requirements.
- A complete Design System for one small interface.

## Minimum testing strategy

- Unit tests for non-trivial rules and transformations.
- API/database integration tests for authorization, constraints, and transactions.
- Component tests for forms and important states.
- One end-to-end test per critical journey, without repeating all lower-level cases.
- Migration test and deployable-artifact smoke test.
- Explicit failure test for each critical integration.

## Common risks

- Sharing database entities directly with the UI.
- Relying on browser-only validation or authorization.
- Turning `shared` into an ownerless dumping ground.
- Making every change cross many pass-through layers.
- Creating competing models for one rule without naming the authority.
- Releasing incompatible migrations without a safe deployment sequence.

## Evolution signals

Adopt [modular monolith](modular-monolith.md) boundaries when rules or teams begin interfering across business areas. Extract a worker when slow tasks harm latency. Consider independent deployment only when it offers measurable operational value; code size alone is not a distribution driver.
