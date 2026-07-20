# Example Assessment: Multi-Organization Payment Reconciliation Platform

This completed [architecture assessment](../templates/architecture-assessment.template.md) shows a critical, higher-scale context. Distribution is selected for specific workload and ownership boundaries; CQRS and Event Sourcing are not applied globally.

## Decision summary

- **Selected profiles:** [Distributed system](../profiles/distributed-system.md) and [SaaS application](../profiles/saas-application.md)
- **Contextual classification:** high criticality, data sensitivity, integration, operational, and regulatory complexity
- **Initial architecture:** four independently deployable capabilities connected by versioned APIs and a durable event stream
- **Decision:** separate ingress, reconciliation, settlement orchestration, and operations-query workloads; retain explicit data ownership
- **Review owner:** architecture council with named service owners

## Assessment record

| Field | Value |
| --- | --- |
| Project and horizon | Payment reconciliation platform; launch plus 24-month expansion horizon |
| Assessors | Principal architect, four capability leads, security architect, SRE lead, compliance representative |
| Date | 2026-07-20 |
| Evidence reviewed | Transaction forecasts, settlement deadlines, partner protocol samples, failure-mode workshop, recovery exercise results, regulatory/control register |
| Confidence | Medium; core volumes and failure consequences are evidenced, while two future institutional isolation contracts remain unresolved |

## Context and classification

The platform receives transaction files and APIs from financial institutions, reconciles them against processor records, sends approved settlement instructions, and exposes an operations console. It launches with 30 institutions and must support 80 within two years. A human approves exceptional settlements; no service may silently infer approval.

| Dimension | Assessed context | Architectural implication |
| --- | --- | --- |
| Estimated users | 2,500 operators; 2 million transactions/day at launch, projected 3× | Independently scale ingestion and processing; capacity and load tests |
| Criticality | High: incorrect or delayed settlement has financial impact | Fail closed, explicit state machine, reconciliation, SLOs, incident runbooks |
| Data sensitivity | Financial transaction identifiers and personal/account-related data | Encryption, least privilege, field minimization, redacted telemetry, controlled exports |
| Domain complexity | High: matching policy, exceptions, approvals, settlement windows, reversals | Rich models around reconciliation and settlement; explicit invariants/transitions |
| Integrations | 12 processor/bank contract variants, identity, notification, object storage | Anti-corruption adapters, contract versions, replay-safe ingestion |
| Development team | 24 developers in four capability teams plus platform support | Stable ownership can support a small number of services |
| Growth expectation | 3× volume, additional file/API variants, regional expansion | Partitioning strategy and measured scaling per workload |
| Availability need | 99.95% for ingestion, 99.9% for operations UI; settlement deadlines are explicit | Per-journey SLOs, buffering, graceful degradation, tested failover |
| Audit requirements | Immutable record of receipt, matching decision, approval, instruction, and actor | Business audit journal linked by correlation and causation IDs |
| Regulatory requirements | Financial-sector and data-protection obligations, validated per operating region | Evidence retention, separation of duties, access reviews, data residency assessment |
| Processing model | Synchronous validation/acknowledgement; asynchronous matching and notifications; controlled settlement workflow | Durable stream, idempotent consumers, outbox/inbox, visible pending states |
| Audience | Partner APIs plus private operator console | Gateway at the external edge; BFF only if console aggregation becomes unstable |
| Frontend need | Yes, for exceptions, approvals, and audit search | Typed API, accessible high-density UI, server-enforced permissions |
| Persistence need | Yes, durable transactional state, source files, audit journal, and read projections | Ownership per capability, encryption, lifecycle rules, restore exercises |
| Organizations | 30–80 customer institutions | Explicit tenant context in APIs, messages, jobs, storage, search, and telemetry |
| Customer isolation | Strong logical isolation; dedicated encryption/storage may be contractual for selected institutions | Central policy plus database/object-store enforcement and negative tests |
| Change frequency | Weekly product releases; partner contracts evolve independently | Versioned schemas and expand/migrate/contract rollouts |
| Downtime tolerance | Ingestion/settlement recovery within 30 minutes; console within four hours | Multi-zone operation, warm recovery environment, and journey-specific runbooks |
| Data-loss tolerance | No acknowledged transaction may be silently lost; infrastructure RPO is near zero for core records | Acknowledge after durable acceptance, replicated storage, and reconciliation after restore |

## Interaction notes

- High domain complexity plus financial impact requires explicit state machines and domain invariants independently of traffic volume.
- Multiple teams plus distinct workload/SLO profiles supports a few services, while cross-capability financial invariants limit further splitting.
- Asynchronous processing plus near-zero accepted-data loss requires durable acceptance, idempotency, and recovery reconciliation.
- Multi-organization data plus partner-facing APIs makes tenant context and versioned contracts cross-cutting boundaries.
- 24/7 critical operation justifies advanced observability and resilience testing but also caps the number of deployables the support model can own.

## Domain complexity

- **Core business decisions:** match candidate selection, exception classification, approval eligibility, settlement readiness, and reversal policy.
- **Invariants:** amounts/currency balance; no settlement without required approval; one external effect per idempotency key; terminal states cannot silently regress.
- **States and transitions:** receipt, reconciliation, exception, approval, instruction, confirmation, rejection, and controlled reversal have guarded transitions.
- **Vocabulary ambiguity:** “received,” “accepted,” “matched,” and “settled” are distinct states and may have different partner meanings.
- **Policy change rate:** matching and exception policies monthly; partner schemas independently; settlement controls through governed releases.
- **Assessment:** complex domain.
- **Modeling depth justified now:** rich models for reconciliation/settlement, explicit policies and state machines, simpler transaction scripts for configuration CRUD.

## Risks and constraints

| Risk scenario | Likelihood | Impact | Current control | Treatment | Owner |
| --- | --- | --- | --- | --- | --- |
| Retry duplicates a settlement instruction | Medium | Critical | Partner request IDs vary | Platform idempotency key, durable outcome record, and reconciliation | Settlement lead |
| Late/reordered event causes invalid transition | High | High | Event timestamps | State/version guard, inbox deduplication, quarantine and replay tests | Reconciliation lead |
| Tenant context is lost in a secondary boundary | Medium | Critical | API tenant middleware | Typed tenant envelope, storage/query policy, negative isolation suite | Security architect |
| Partner schema change breaks ingestion | High | High | Sample files | Versioned adapter contracts, compatibility gate, quarantine | Ingestion lead |
| Synchronous dependency chain misses deadline | Medium | Critical | Timeout defaults | Remove nonessential synchronous calls, budget timeouts, buffer durable work | Principal architect |
| Business evidence relies on mutable logs | Low | Critical | Central logging | Separate immutable audit journal with retention/access controls | Compliance lead |
| Service count exceeds operational capacity | Medium | High | Architecture review | Named owner/SLO/runbook required before any deployable is created | SRE lead |

Constraints include regional data handling, mandatory human approval above defined thresholds, existing partner protocols, and 24/7 support for ingestion. Regulatory interpretations require validation by security/legal specialists; this blueprint does not replace that review.

## Practice selection

| Practice | Disposition | Contextual reason and accepted cost | Adoption or review trigger |
| --- | --- | --- | --- |
| Version control and reviewable changes | Essential | Financial/control changes require traceability and approval | Always active |
| Automated formatting | Essential | Keeps changes reviewable across four teams | Every build |
| Lint/static analysis | Essential | Contract and tenant-envelope defects must fail early | Every build |
| Type checking | Essential | Typed contracts and tenant context prevent high-impact boundary defects | Every build |
| Unit tests | Essential | Matching, amounts, and transitions contain critical rules | Every invariant/policy |
| Property tests | Essential | Financial values and matching inputs have broad combinatorial spaces | Every calculation/policy suited to generated cases |
| Integration tests | Essential | Broker, database, and restore boundaries carry material risk | Every service and durable boundary |
| System/end-to-end tests | Essential | A small set of financial journeys must work across services | Every release-critical journey |
| Contract tests | Essential | Partners and services evolve independently | Every supported API/event/schema version |
| Authentication | Essential | Partner and operator identities cross public/private trust boundaries | Always active at protected ingress |
| Authorization | Essential | Resource/tenant scope and separation of duties protect financial effects | Always active at API, command, query, and job boundaries |
| Multiple persistent stores | Essential | Capabilities own durable state and query projections are disposable | Ownership/recovery documented before provisioning |
| Cache | Conditional | Only reference/query workloads tolerate staleness | Measured bottleneck plus an invalidation owner |
| Queue/event stream | Essential | Buffering, durable work, and replay-safe ingestion are current needs | Start with the documented asynchronous workflows only |
| Rich domain modeling/DDD | Advanced | Reconciliation/settlement complexity justifies skilled modeling cost | Extend only where invariants/policy vocabulary warrant it |
| Modular monolith | Conditional | Default inside each service and for new capabilities | Use unless independent operation is evidenced |
| Microservices | Advanced | Four deployables have distinct owner/workload/SLO evidence | Any additional service needs a new justification/operating owner |
| Event-driven architecture | Essential | Selected workflows need durable temporal decoupling | Synchronous commands remain where immediate outcome is required |
| CQRS | Conditional | One operations projection serves high-volume flexible search | Add another projection only for measured read/write divergence |
| Event Sourcing | Not applicable | Audit journal plus direct state persistence meets history needs | Only a separate state-reconstruction requirement can reopen it |
| Multi-tenancy | Essential | 30–80 institutions with contractual boundaries | Always active across all data/effect paths |
| API Gateway | Conditional | Shared partner-edge authentication, quotas, and routing justify it | Only external APIs use it |
| BFF | Not applicable | Query API currently gives the console a stable contract | Console-specific aggregation churn or credential mediation appears |
| Structured logs/basic health | Essential | Every deployable needs correlated diagnosis and truthful health | Always active |
| Advanced observability | Essential | Distributed 24/7 workflows require traces, SLOs, and alerts | Always active with retention/cost review |
| Containers | Conditional | Use platform-standard images when they simplify repeatable runtime packaging | Confirm against the supported runtime platform |
| Workload orchestration | Advanced | Independently scaled workloads and an existing platform can justify it | Platform ownership and recovery exercises remain prerequisites |
| Service mesh | Not applicable | Launch services do not show repeated mesh-level needs | Reassess only with measured security/traffic-policy duplication |

## Recommended initial architecture

```text
external partners
       │
  API/file edge
       │
  ingestion service ── durable stream ── reconciliation service
                                               │
                                      settlement orchestrator
                                               │
                                      processor adapters

  operations console ── query/audit API ── read projections
```

- **Ingestion** owns receipt, schema validation, deduplication, and durable acceptance. It acknowledges only after the input can be recovered.
- **Reconciliation** owns matching policy, exception creation, and deterministic reprocessing.
- **Settlement orchestration** owns approval state, separation of duties, idempotent instruction, and outcome reconciliation.
- **Query/audit API** owns disposable read projections for operator search; authoritative decisions remain in owning services.

The query projection is a targeted CQRS-style optimization, not a mandate for every capability. The audit journal records business facts, but current domain state is persisted directly; the system is not Event Sourced. Events carry a tenant, event ID, schema version, occurred/recorded timestamps, correlation ID, and causation ID.

- **Deployable units:** ingestion, reconciliation, settlement orchestration, and query/audit API, each with a named team; the web console is a separate static/client deploy.
- **Primary boundaries:** durable acceptance, matching/exception policy, controlled settlement, and operator search/audit.
- **Dependency direction:** each service uses its own domain/application code and adapters; no service accesses another service's store.
- **Data ownership:** each capability writes its authoritative state; read projections are rebuildable and never authorize a mutation.
- **Communication:** synchronous validation/commands where an immediate decision is required; versioned durable events for buffered work.
- **Minimum operational controls:** per-journey SLOs, traces, on-call runbooks, progressive delivery, restore/failover and reconciliation exercises.
- **Smallest vertical slice:** accept one versioned partner record durably, reconcile it deterministically, route an exception for authorized human approval, send one idempotent instruction, and expose complete audit evidence.

## Minimum testing and delivery

- Property and unit tests for matching, amounts, cutoffs, invariants, and state transitions.
- Integration tests using real database and broker protocols.
- Provider/consumer contract tests for every API/event version and partner adapter.
- Isolation tests across APIs, streams, jobs, caches, exports, storage paths, and projections.
- Duplicate, reorder, poison-message, timeout, retry-exhaustion, and replay tests.
- End-to-end tests for accepted-to-settled, exception approval, reversal, and restore/reconcile journeys.
- Performance tests at projected peak plus agreed headroom.
- Deployment tests across mixed versions, migration rehearsals, recovery exercises, and controlled failure injection.

Releases use progressive traffic, compatibility-first schema changes, automated health/SLO gates, and per-service rollback. A rollback never discards accepted input; processing pauses when safe compensation is unavailable.

## Alternatives considered

1. **Modular monolith:** best development simplicity, but rejected for this phase because ingestion and reconciliation have independently measured scaling/failure profiles, four teams have stable ownership, and settlement requires stricter deployment controls. It remains the default for capabilities without such drivers.
2. **Service per partner or entity:** rejected because it multiplies deployments and duplicates core rules; partner differences belong in adapters.
3. **Global Event Sourcing and CQRS:** rejected because rebuild, event evolution, and operational complexity do not solve most workloads. An immutable audit journal and one query projection meet the concrete needs.
4. **Synchronous request chain:** rejected for matching and notification because partner latency and bursts would propagate failure. Synchronous calls remain for immediate validation and deliberate operator commands.

## Evolution signals

| Signal | Evidence | Threshold or pattern | Candidate response |
| --- | --- | --- | --- |
| Boundary creates transaction workarounds | ADR/code review inventory | More than two in one quarter | Re-draw or merge the affected services |
| Claimed independence is absent | Deployment history | Services always release together for a quarter | Merge or restore a module boundary |
| Capacity headroom shrinks | Load dashboards/tests | 70% sustained capacity or observed peak reaches 50% of tested limit | Partition/tune the specific workload and retest |
| Recovery misses objective | Exercises/incidents | One critical miss or two near misses | Fund recovery remediation before adding features/services |
| Tenant workload becomes noisy | Per-tenant resource metrics | One tenant consumes over 30% capacity repeatedly | Quota, partition, or dedicated deployment assessment |
| Contract churn harms consumers | Compatibility pipeline | More than two breaking-change attempts in a quarter | Improve contract governance/adapters, not automatic service split |

## Reassessment triggers

A signed residency/isolation change, 3× observed volume, a team topology change, a revised settlement deadline, a critical isolation incident, or an inability to meet an SLO for two reporting periods requires a new assessment. Services that always change together and share invariants should be considered for merging.

## Consciously accepted debt

| Debt | Benefit now | Consequence | Guardrail | Owner | Review trigger |
| --- | --- | --- | --- | --- | --- |
| Active region plus warm recovery rather than active-active writes | Avoids unsafe cross-region settlement consistency | Recovery includes controlled failover | Monthly replication check and quarterly recovery exercise | SRE lead | Recovery objective tightens or exercise misses it |
| Three low-volume formats share one adapter runtime | Fewer deployables | Fault/release coupling among adapters | Separate contract modules, quotas, and per-format metrics | Ingestion lead | One format causes two material incidents or needs independent release |
| Operations projection may lag by 30 seconds | Scalable search without coupling writes | Operators can see stale state | Display freshness and revalidate every mutation authoritatively | Query lead | Lag breaches SLO for two periods |

## Pending decisions

- The dedicated-storage option for two prospective institutions awaits contractual confirmation. Owner: security architect; deadline: before their onboarding design begins.
- Long-term audit archive media awaits the final retention ruling. Owner: compliance lead; deadline: six months before the first archive transition.

## Outcome

- **Status:** Accepted for the launch scope; pending items do not change the core boundaries
- **Approvers:** Principal architect, capability leads, SRE lead, security architect, compliance representative
- **Related ADRs:** Separate project ADRs are required for service boundaries, tenancy storage, and recovery topology; use [ADR example](adr-example.md) as a completeness reference
- **Next review:** after the first production recovery exercise or any trigger above, whichever comes first
