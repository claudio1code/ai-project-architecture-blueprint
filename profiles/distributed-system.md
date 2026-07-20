# Profile: Distributed System

Use this profile only when independently deployable components solve a demonstrated need such as distinct scaling, fault containment, data residency, technology constraints, or autonomous team ownership. Distribution introduces network failure, partial availability, eventual consistency, contract evolution, and substantially higher operational cost.

Document the driver in an [ADR](../templates/adr.template.md), complete the [architecture assessment](../templates/architecture-assessment.template.md), and define operational requirements using the [observability guidance](../docs/13-observability.md).

## Characteristics

- Multiple processes communicate over unreliable networks.
- Components have explicit owners and may deploy independently.
- Operations can partially succeed and messages may be late, duplicated, or reordered.
- Consistency, availability, and latency trade-offs must be explicit per workflow.
- Incident response, capacity management, and contract governance are first-class work.
- Local development and end-to-end diagnosis are inherently harder.

If these costs are not justified by a concrete requirement, start with a [modular monolith](modular-monolith.md).

## Recommended initial architecture

Keep the number of deployables minimal and align each one with a stable business capability or workload boundary. Choose synchronous communication for immediate answers and asynchronous communication for temporal decoupling, buffering, or durable work—not as a universal default. Each component owns its data; cross-service database access is prohibited.

```text
services/
├── ingestion/
├── core-processing/
└── query-api/
contracts/
├── http/
└── events/
platform/
├── deployment/
└── observability/
tests/
├── contract/
└── system/
```

Multiple repositories may be appropriate for independent teams; a monorepo may be simpler for a small team. Repository layout does not create service independence.

## Practice selection

### Essential

- Written justification and owner for every deployable component.
- Versioned contracts with backward-compatible rollout rules.
- Timeouts, bounded retries with jitter, and explicit failure handling.
- Idempotent consumers and deduplication where at-least-once delivery is possible.
- Correlation/trace context propagated across calls and messages.
- Structured logs, metrics, traces, health signals, dashboards, and actionable alerts.
- SLI/SLO definitions for critical user journeys, not only individual services.
- Data ownership and consistency model documented per workflow.
- Independent deployment, rollback, migration, and incident runbooks tested.
- Security between components, least privilege, secret rotation, and audit where required.

### Conditional

- Queue or stream when buffering, fan-out, durable work, or temporal decoupling is required.
- Transactional outbox/inbox for reliable state-to-message transitions.
- API Gateway for shared edge policies across several external APIs.
- Cache for measured read pressure with ownership and invalidation semantics.
- Circuit breaker when failing calls otherwise cause cascades.

### Advanced

- Orchestration or sagas for multi-component workflows with compensations.
- Service mesh only when its operational platform solves repeated, measured concerns.
- Multi-region operation when recovery and latency goals justify consistency complexity.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- CQRS applied to every service.
- Event Sourcing without an explicit need to reconstruct state from immutable events.
- A message broker for simple request-response flows.
- Kubernetes solely to deploy a few low-volume services.
- One service per entity or database table.
- Shared generic libraries that force synchronized releases across all services.

These remain `Not applicable` unless independently justified.

## Minimum testing strategy

- Unit and component tests for rules and failure policies inside each service.
- Provider/consumer contract tests for APIs and events.
- Integration tests with the real database and broker protocol.
- System tests for a small set of critical cross-service journeys.
- Tests for duplicates, reordering, timeout, retry exhaustion, partial failure, and recovery.
- Deployment compatibility and migration tests across mixed versions.
- Periodic load, resilience, backup/restore, and incident exercises according to criticality.

## Common risks

- Distributing unclear boundaries and creating a networked monolith.
- Retries amplifying an outage or duplicating financial effects.
- Treating broker acknowledgement as completed business processing.
- Changing event meaning without versioning existing consumers.
- Dashboards per service while no one can observe the user journey.
- Synchronous call chains that multiply latency and failure probability.
- Operational load exceeding the team's ability to support the platform.

## Evolution signals

Add a component only when ownership and non-functional requirements are explicit. Merge components when they always change and deploy together, share transactions, or have no independent owner. Reassess asynchronous boundaries when reconciliation work and user-facing uncertainty exceed their benefit. Review the distribution ADR at least when traffic, team topology, SLOs, regulation, or incident patterns materially change.
