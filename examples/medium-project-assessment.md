# Example Assessment: Internal Order Operations Dashboard

This completed [architecture assessment](../templates/architecture-assessment.template.md) shows an intermediate full-stack system whose rules justify module boundaries but not distributed deployment.

## Decision summary

- **Selected profiles:** [Full-stack application](../profiles/fullstack-application.md) with [modular monolith](../profiles/modular-monolith.md) boundaries
- **Contextual classification:** medium domain, data, and integration complexity; moderate business criticality
- **Initial architecture:** one monorepo, web application, modular backend, relational database, and one background worker from the same codebase
- **Decision:** modules by business capability; no independently deployed microservices
- **Review owner:** product engineering lead

## Assessment record

| Field | Value |
| --- | --- |
| Project and horizon | Order operations dashboard; MVP plus 24-month growth horizon |
| Assessors | Product engineering lead, product analyst, ERP integration owner, privacy representative |
| Date | 2026-07-20 |
| Evidence reviewed | Workflow observation, two years of order volume, ERP/carrier contracts, role matrix, recovery objectives |
| Confidence | Medium-high; workflows and volumes are observed, but carrier error distributions are incomplete |

## Context and classification

A regional distributor needs a private dashboard for customer-service and warehouse teams. Users search orders, correct delivery details before dispatch, approve returns, and see inventory synchronized with an existing ERP. Corporate identity provides login. Every order change requires actor, timestamp, previous value, and reason.

| Dimension | Assessed context | Architectural implication |
| --- | --- | --- |
| Estimated users | 120 named users; up to 35 concurrent | One application/database instance can handle expected load with headroom |
| Criticality | Moderate; outage delays fulfillment but does not stop warehouse safety controls | Targeted resilience and a documented manual procedure |
| Data sensitivity | Customer contact and delivery data; no card data | Role checks, field minimization, encryption, retention, redacted logs |
| Domain complexity | Medium: order states, return policy, stock reservations, cutoff times | Explicit application operations and richer modeling for orders/returns only |
| Integrations | Corporate identity, ERP, carrier tracking | Adapters, timeouts, contract tests, and reconciliation |
| Development team | Five developers and one product analyst | One repository and deployment reduce coordination overhead |
| Growth expectation | 2× order volume and up to 250 users in two years | Modular boundaries and measured database indexing; no horizontal split now |
| Availability need | 99.5% during business hours | Health checks, alerting, rolling/blue-green deploy, manual fallback |
| Audit requirements | Full history for order and return changes, retained for five years | Append-only audit records distinct from technical logs |
| Regulatory requirements | Organizational privacy policy and applicable data-protection law | Access reviews, retention/deletion workflow, incident procedure |
| Processing model | Interactive changes are synchronous; ERP imports and carrier refresh are asynchronous | One durable job queue and idempotent workers |
| Audience | Internal over corporate access controls | SSO plus backend resource authorization |
| Frontend need | Yes | Feature-oriented dashboard with accessible table/form behavior |
| Persistence need | Yes, relational transactions and history | Relational database, constraints, migrations, backups |
| Organizations | One distributor | No tenant abstraction |
| Customer isolation | Not applicable; authorization is by role and warehouse | Scope queries by permitted warehouse/resource, not tenant |
| Change frequency | Weekly product changes; ERP contract changes quarterly | Stable adapter boundary and backward-compatible migrations |
| Downtime tolerance | Two-hour recovery time during business hours | Health alerts, documented manual procedure, tested restore |
| Data-loss tolerance | 15-minute infrastructure RPO; no silent loss of an acknowledged approval | Transactions, durable jobs, audit/reconciliation, restore drill |

## Interaction notes

- Medium domain complexity plus audit requirements justifies explicit order/return modules, not a rich model for reference-data CRUD.
- One team plus coordinated releases favors a modular monolith over service deployment.
- Asynchronous ERP work plus no 24/7 staffing requires durable, diagnosable jobs with bounded retries.
- Moderate personal-data sensitivity plus internal access still requires resource-level backend authorization.

## Domain complexity

- **Core business decisions:** whether an order may be corrected, whether a return qualifies, and when stock is reserved/released.
- **Invariants:** dispatched orders are immutable; approval actor differs from requester for high-value returns; audit is committed with each protected change.
- **States and transitions:** orders and returns have explicit guarded lifecycles; reference data is CRUD.
- **Vocabulary ambiguity:** “available stock” differs between ERP physical stock and locally reserved stock.
- **Policy change rate:** return policy quarterly; cutoff and warehouse exceptions monthly.
- **Assessment:** moderate behavior.
- **Modeling depth justified now:** focused domain models for order/return transitions; transaction scripts for simple administration.

## Risks and constraints

| Risk scenario | Likelihood | Impact | Current control | Treatment | Owner |
| --- | --- | --- | --- | --- | --- |
| Late/duplicate ERP event corrupts local status | High | High | ERP event identifier | Idempotent inbox, ordering rule, and reconciliation report | Integration owner |
| Concurrent edit overwrites dispatch correction | Medium | High | None in prototype | Version column and conflict response | Orders module owner |
| UI-only role check exposes another warehouse | Medium | High | Corporate login | Backend resource policy and negative integration tests | Identity/access owner |
| Audit record diverges from protected mutation | Low | High | Application logging | Commit business audit in the same database transaction | Engineering lead |
| Web/worker migration incompatibility during rollout | Medium | High | Staging deploy | Expand/migrate/contract sequence and mixed-version test | Release owner |

The existing ERP remains the system of record for stock. The dashboard is authoritative for return approval and pre-dispatch correction requests. The team operates one production region and cannot staff 24/7 on-call.

## Practice selection

| Practice | Disposition | Contextual reason and accepted cost | Adoption or review trigger |
| --- | --- | --- | --- |
| Version control and reviewable changes | Essential | Weekly releases and audit-sensitive logic require traceability | Always active |
| Automated formatting | Essential | Keeps changes predictable at negligible cost | Always active |
| Lint/static analysis | Essential | Finds boundary and framework mistakes before review | Always active |
| Type checking | Essential | Shared contracts and migration code benefit from early feedback | Always active in the selected typed stack |
| Unit tests | Essential | Order/return policies have meaningful branches | Every invariant and transition |
| Integration tests | Essential | Authorization and database behavior cross real boundaries | Always active for protected operations and persistence |
| End-to-end tests | Essential | Two primary operator journeys carry release risk | Keep the suite intentionally limited to critical journeys |
| Contract tests | Essential | ERP and carrier evolve independently | Every supported provider schema |
| Authentication | Essential | The dashboard exposes private personal data | Always active at trusted ingress |
| Authorization | Essential | Roles and warehouse scope constrain every protected operation | Always active at resource/query boundaries |
| Relational persistence | Essential | Transactions, constraints, history, and queries fit relational storage | Always active |
| Cache | Conditional | No measured bottleneck yet; invalidation would add risk | p95 target missed after query/index tuning |
| Queue/background processing | Essential | ERP imports and carrier refresh need durability and retries | One queue plus worker now |
| Rich domain modeling/DDD | Advanced | Justified only in orders/returns; modeling overhead accepted there | Add to another module only after invariants/transitions emerge |
| Modular monolith | Essential | Capabilities differ but deploy/team remain shared | Revisit when independent operation is proven |
| Microservices | Not applicable | Five-person team and shared release/transactions | Independent team plus distinct SLO/scale for a stable module |
| Event-driven architecture | Conditional | Durable integration jobs use messages; core commands remain synchronous | Add events only for temporal decoupling or reliable secondary work |
| CQRS | Not applicable | Direct read/write models meet current query needs | Sustained read/write divergence appears |
| Event Sourcing | Not applicable | Direct state plus audit records meets history needs | State reconstruction from events becomes a separate requirement |
| Design System | Conditional | Tokens and a small component set improve dashboard consistency | Governed library only after another product consumes it |
| Structured logs/basic health | Essential | API and background jobs need safe failure diagnosis | Always active |
| Advanced observability | Conditional | Add tracing only if logs and metrics cannot diagnose flows | Repeated cross-boundary diagnosis failures |
| Containers | Conditional | Packaging may fit the selected deployment platform | Adopt only if the platform gains a concrete consistency benefit |
| Workload orchestration | Not applicable | One web deployable and one worker do not require a cluster platform | Platform standard or demonstrated scheduling/availability need |

## Recommended initial architecture

```text
apps/
├── web/src/features/
└── server/src/
    ├── modules/
    │   ├── orders/
    │   ├── returns/
    │   ├── inventory-view/
    │   └── access-audit/
    ├── integrations/
    │   ├── erp/
    │   └── carrier/
    └── worker/
packages/
└── contracts/
migrations/
tests/
```

Web, API, and worker come from one versioned codebase; the worker may run as a separate process for scaling and failure isolation but is not an independently owned service. Modules use the ORM directly inside focused persistence operations. A generic repository is prohibited; an ERP port exists because the external contract needs isolation and fakes.

- **Deployable units:** web/API and one worker process built from the same release.
- **Primary boundaries:** orders, returns, inventory view, access/audit, and external adapters.
- **Dependency direction:** UI calls typed API; modules expose public operations; integrations never own domain rules.
- **Data ownership:** one relational database with table ownership by module; ERP remains authoritative for physical stock.
- **Communication:** synchronous commands/queries; durable jobs for ERP and carrier work.
- **Minimum operational controls:** health/error/job metrics, structured logs, backup/restore, rollback and migration runbook.
- **Smallest vertical slice:** correct an eligible order with warehouse authorization, optimistic conflict handling, atomic audit, UI feedback, and ERP follow-up job.

## Minimum testing and delivery

- Unit tests for order transitions, cutoff calculations, return policy, and permission decisions.
- API/database integration tests for constraints, optimistic conflicts, authorization, and atomic audit writes.
- Contract tests against captured ERP/carrier schemas plus a provider sandbox smoke test.
- Worker tests for duplicate, late, and failed messages.
- Component tests for edit/approval forms and table empty/error states.
- End-to-end tests for order correction and return approval.
- Forward/backward migration compatibility check, backup restore exercise, and smoke test per release.

## Alternatives considered

1. **Simple technical-layer monolith:** lower initial structure cost, but rejected because order, returns, and inventory have distinct ownership and change patterns. A modular monolith keeps the deployment simplicity while exposing those boundaries.
2. **Three microservices:** rejected because the five-person team would inherit distributed transactions, contracts, telemetry, and on-call load without independent scaling needs.
3. **Buy an ERP extension:** rejected after a fit assessment found no support for the required approval history and warehouse-specific workflow.

## Evolution signals

| Signal | Evidence | Threshold or pattern | Candidate response |
| --- | --- | --- | --- |
| Jobs miss their window | Queue dashboard | Four consecutive weeks | Tune/batch, scale worker, then reassess isolation |
| Interactive latency degrades | API traces/query metrics | p95 target missed for two weeks after index/query work | Profile and consider targeted cache/read model |
| Ownership separates | Team topology and release data | Autonomous team blocked by coordinated releases for a quarter | Assess extraction of its stable module |
| Fault coupling harms fulfillment | Incident reviews | Two material carrier incidents affect order commands | Isolate carrier adapter/worker before core orders |

## Reassessment triggers

A stricter availability target, a second organization requiring tenant isolation, a new regulated data class, sustained 5× volume, or repeated need for cross-module database bypass requires a fresh assessment.

## Consciously accepted debt

| Debt | Benefit now | Consequence | Guardrail | Owner | Review trigger |
| --- | --- | --- | --- | --- | --- |
| Worker and API share database/release | One team and simpler transactions | Cannot deploy independently | Mixed-version rollout test | Engineering lead | Separate owner or scaling/SLO target |
| Audit export is manual in version 1 | Avoids speculative scheduler | Administrator effort and delayed exports | Export runbook and access logging | Product owner | Compliance sets periodic frequency |
| One production region | Meets approved RTO with lower complexity | Regional recovery needs restore/failover | Quarterly restore exercise | Operations owner | RTO/RPO becomes stricter |

## Pending decisions

The exact five-year archive storage tier remains pending. The engineering lead and privacy owner will decide before production data reaches six months; the online audit schema and export format are already fixed.

## Outcome

- **Status:** Accepted
- **Approvers:** Product engineering lead, operations product owner, privacy representative
- **Related ADRs:** A project ADR will record the modular monolith decision before implementation; see the structure in [ADR example](adr-example.md)
- **Next review:** after the first three production releases or on any trigger above
