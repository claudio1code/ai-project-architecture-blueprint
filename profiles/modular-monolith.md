# Profile: Modular Monolith

Use this profile when one deployable application contains several business capabilities whose boundaries need protection. It provides module isolation without accepting the network, data consistency, and operational costs of distributed services.

Complete the [architecture assessment](../templates/architecture-assessment.template.md) and use the [domain module template](../templates/domain-module.template.md) only for modules that need explicit ownership and contracts.

## Characteristics

- One process and usually one release unit.
- Multiple business capabilities with different rules and vocabulary.
- Transactions across related data are still valuable.
- A team that benefits from local development and operational simplicity.
- Module boundaries matter more than independent scaling today.
- Future extraction is possible, but is not the primary goal.

## Recommended initial architecture

Organize code by business module. Each module owns its application operations, rules, and persistence details and exposes a small public interface. Cross-module access goes through that interface; direct imports of internals or ad hoc joins across owned tables should be exceptional and documented.

```text
src/
├── app/                        # bootstrap and composition root
├── modules/
│   ├── billing/
│   │   ├── public/
│   │   ├── application/
│   │   ├── domain/
│   │   └── infrastructure/
│   └── fulfillment/
│       └── ...
└── shared-kernel/              # deliberately small
tests/
migrations/
```

Do not require every module to have all four folders. A CRUD-oriented module may use routes, operations, and persistence directly, while a rule-heavy module may justify richer domain modeling.

## Practice selection

### Essential

- Named module ownership and documented public contracts.
- Dependency direction enforced by tests, lint rules, or build boundaries.
- Business rules kept inside the module that owns the concept.
- Transaction boundaries explicit in application operations.
- Migrations that identify affected modules and remain safe for one deployment unit.
- No direct use of another module's internal types or persistence models.
- Integration behavior and failure semantics documented.
- One pipeline, observable deploy, and tested rollback strategy.

### Conditional

- Separate database schemas when they make ownership visible without blocking legitimate transactions.
- In-process events for secondary reactions that do not need immediate consistency.
- Transactional outbox when an event must be published reliably outside the process.
- Tactical DDD in modules with real invariants, policies, and state transitions.
- Architecture tests that reject forbidden imports.

### Advanced

- Extracting one module as a service when independent deployment has measured value.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- One microservice per module.
- API Gateway, service mesh, distributed tracing, or orchestration for internal calls.
- Event Sourcing or CQRS for every module.
- A universal repository or service shared by unrelated domains.
- Eventual consistency where a local transaction solves the requirement.

Mark these items `Not applicable` until a concrete driver changes.

## Minimum testing strategy

- Unit tests for important invariants, policies, and transitions.
- Integration tests for each module's persistence and transactions.
- Contract tests for public module interfaces.
- Architecture tests for forbidden cross-module dependencies.
- End-to-end tests for a few critical flows that cross modules.
- Migration and rollback verification on production-like data volume when risk warrants it.

## Common risks

- Modules that are only folders while all code imports everything.
- A `shared` package becoming the real coupled domain.
- Cross-module database queries bypassing contracts.
- Using asynchronous events to hide unclear ownership.
- Forcing rich domain objects into simple reference-data modules.
- Designing boundaries around technical layers rather than business change patterns.

## Evolution signals

Consider extracting a module only when it has stable boundaries and a concrete need for independent scale, availability, technology, security, or team cadence. High cross-module transaction frequency is evidence against extraction. Revisit boundaries when most changes touch multiple modules or teams repeatedly negotiate ownership of the same rule.
