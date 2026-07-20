# 08 — Data and Persistence

## Purpose and applicability

Persistence must preserve invariants, support safe evolution, and meet the context's recovery, privacy, and audit needs.

- **Essential when data is persisted:** explicit schemas, relevant constraints, reviewable migrations, and a backup/restore strategy proportionate to risk.
- **Conditional:** relational storage, history, soft delete, multi-tenant isolation, and additional encryption based on domain and sensitivity.
- **Advanced:** partitioning, replication, broad denormalization, or multiple data models only when measurements justify them.
- **Not applicable:** remove this document from the active set for a static frontend, ephemeral transformation, or stateless library.

Start with the [project context](../templates/project-context.template.md) and invariants from [domain modeling](06-domain-modeling.md). Application boundaries and external contracts are covered in [backend architecture](backend-architecture.md) and [API design](07-api-design.md).

## Choosing persistence

Choose according to data shape, access patterns, consistency, and operations—not popularity.

| Dominant need | Possible starting point | Trade-off to validate |
| --- | --- | --- |
| Relationships, transactions, varied queries | Relational database | Schemas and migrations require discipline. |
| Aggregate-shaped documents with variable structure | Document database | Relationships, constraints, and cross-document queries become harder. |
| Key/value access, cache, or ephemeral state | Key/value store | Limited queries and a risk of treating weak durability as authoritative. |
| Large files/objects | Object storage plus metadata | Consistency between object and metadata must be designed. |
| No durability | Memory or temporary file | Loss on restart must be explicitly acceptable. |

Each additional persistence technology adds backup, security, observability, and expertise costs. Keep one primary technology until a concrete need exceeds those costs.

## Relational modeling

When the model is relational:

- use types that express the domain rather than generic text for dates, money, and states;
- declare `NOT NULL`, uniqueness, `CHECK`, and foreign keys for invariants the database can enforce;
- treat constraints as a final line of defense while keeping user-facing messages in the application;
- represent money with fixed-precision decimals or documented integer units, never binary floating point;
- standardize timestamps and timezones; normally store instants in UTC;
- choose identifiers based on exposure, distributed generation, and index cost rather than taste.

### Normalization and deliberate denormalization

Normalize first to reduce inconsistency and duplicated knowledge. Repeated values are not always mistakes: historical snapshots, the delivery address used for an order, or an auditable calculation may need preservation.

Denormalize only for a measured critical read or a clear historical requirement. For every copy, document:

1. the authoritative source;
2. how and when the copy is updated;
3. acceptable staleness;
4. how divergence is detected and repaired;
5. how backfill and rollback work.

Faster reads come with write, reconciliation, and migration costs.

## Indexes

Create indexes for constraints and observed or well-supported critical query patterns. Inspect filters, ordering, cardinality, selectivity, and the execution plan. Indexes accelerate reads but consume space and increase write and migration cost.

Do not index every field “just in case.” Remove an index only after checking usage, impact, and a safe window. In shared multi-tenancy, indexes often begin with `tenant_id` to support isolation and performance, subject to actual queries.

## Transactions and concurrency

A transaction should cover the smallest unit that must be atomic. Avoid holding it open over network calls; doing so lengthens locks and mixes external failure with local consistency.

Choose concurrency control deliberately:

- **Essential — constraint or atomic update:** best for uniqueness, conditional counters, and simple transitions;
- **Conditional — optimistic locking:** use a version or timestamp when conflicts are rare and lost updates are unacceptable; callers need an explicit conflict path;
- **Conditional — pessimistic lock:** useful for proven contention and a short critical section; it can reduce throughput and deadlock;
- **Advanced — serializable isolation:** provides strong guarantees but requires retry logic and pays contention cost.

Read and write an invariant inside the same consistency boundary. A `SELECT` followed by `UPDATE` without a constraint, version, or lock does not protect against concurrent requests.

When a database and broker or external API participate in one flow, do not assume a distributed transaction. Consider an outbox, intermediate state, and reconciliation when reliability warrants them; their cost includes a worker, idempotency, monitoring, and cleanup. For a simple flow, local state plus a synchronous integration with explicit error handling may suffice.

## Migrations

Migrations are production code: version them, review them, and run them reproducibly.

- never rewrite a migration already applied to a shared environment;
- separate schema change, backfill, and destructive removal for significant volume or independent deployments;
- prefer expand/contract: add → populate → migrate readers/writers → verify → remove;
- estimate locks, duration, and temporary space for large operations;
- keep deployments compatible with the preceding and following schema during transition;
- test upgrades with representative data and define rollback or roll-forward;
- take a backup before irreversible changes when risk demands it.

Application rollback does not imply a safe database rollback. After data transformation, an additive fix or planned restoration is often safer than an improvised reverse migration.

### Seeds and reference data

- **Essential for reproducible development:** minimal fixtures/seeds with no copied production personal data.
- **Conditional in production:** only versioned, idempotent reference data with an owner; it does not replace migrations.
- **Not applicable:** never keep demo data in production or depend on accidental execution order.

Initial credentials must not be fixed or shared. Generate them through a secure channel or require explicit configuration.

## Deletion, history, and audit

### Physical deletion

This is the simplest option when there is no retention duty and permanent removal is desired. It must account for relationships, backups, and privacy requirements.

### Soft delete — Conditional

Use `deleted_at` when operational restoration, investigation, or historical references require the row to remain. Costs include:

- every relevant query and index must account for deletion;
- uniqueness becomes more complex;
- relationships and cascades can produce ambiguous states;
- data remains subject to unauthorized access, retention, and privacy law;
- “deleted” records can reappear through bugs or exports.

Soft delete is not backup, audit, or anonymization. Do not adopt it by default. Define restoration, permanent purge, retention, and child-record behavior.

### History and audit log

History answers “how did the value change?” An audit log answers “who performed which action, when, on which resource?” They may use separate tables or events. Record enough for investigation without copying sensitive payloads. Protect audit records from modification, limit access, and define retention. See the operational distinction in [observability](13-observability.md).

## Backup, restoration, and continuity

A backup policy is real only after restoration has been tested.

Define:

- RPO: maximum acceptable data loss;
- RTO: maximum acceptable recovery time;
- backup frequency, retention, encryption, and failure domain;
- restoration owner and procedure;
- integrity and encryption-key checks;
- recovery exercise frequency;
- recovery for logical deletion, migration error, and regional loss according to risk.

Provider snapshots may be enough for a low-criticality project. Critical systems may need point-in-time recovery, a copy in another failure domain, and recurring exercises. Each increment adds financial and operational cost; align it with project classification.

## Retention, privacy, and encryption

Inventory data categories, purpose, legal basis where relevant, origin, consumers, and retention period. Collect only what is needed. Expiration must be executable and verifiable across replicas, exports, and backups according to policy.

- encryption in transit and at rest is **Essential** for sensitive data and is often available from the platform;
- field-level encryption is **Conditional** when database operators must not see a value or the threat model requires it; it complicates queries, rotation, and recovery;
- passwords require an appropriate password-hashing function; reversible encryption is not a substitute;
- keys must be stored outside the database they protect, with least access, rotation, and recovery procedures;
- do not place personal data or secrets in logs, exceptions, seeds, or test environments.

See [security](11-security.md) for the broader controls.

## Multi-tenant isolation

Multi-tenancy is **Conditional**; do not introduce it for a single-organization application. Choose isolation according to sensitivity, regulation, scale, and operations:

| Model | Benefit | Risk/cost | Consider when |
| --- | --- | --- | --- |
| Shared tables with `tenant_id` | Simple operations and lower cost | Every query must filter correctly; wider blast radius | Many similar tenants and moderate risk. |
| Schema per tenant | More logical separation | Migrations and connections multiply | A controlled tenant count needs intermediate isolation. |
| Database per tenant | Dedicated isolation, restore, and keys | Provisioning, monitoring, and cost increase | Regulated, large, or contractually isolated customers. |
| Dedicated instance/stack | Maximum operational isolation | Highest cost and configuration-drift risk | An explicit requirement, never the default. |

For shared storage:

- derive `tenant_id` from authenticated context, never solely from request data;
- include the tenant in constraints, foreign keys, and indexes when record identity depends on it;
- filter at the lowest reliable point and add defense such as row-level security when supported and tested;
- test reads, writes, search, export, jobs, caches, and logs for cross-tenant leakage;
- carry tenant context into administrative and asynchronous work.

Moving from shared to isolated storage is expensive. If plausible, record evolution signals and an export strategy early.

## Boundary with backend architecture

This document owns durable guarantees: schemas, queries, constraints, consistency, migrations, retention, isolation, and recovery. Decisions about direct ORM use, repositories, application transaction ownership, integrations, and asynchronous handoff belong to [backend architecture](backend-architecture.md). Keeping that boundary explicit prevents persistence mechanics from dictating domain or transport structure.

## Review checklist

- [ ] Do types, constraints, and foreign keys protect relevant invariants?
- [ ] Does normalization or denormalization have an authoritative source and rationale?
- [ ] Do indexes correspond to query patterns, with known write cost?
- [ ] Do transactions and concurrency controls cover the correct consistency unit?
- [ ] Are migrations deploy-compatible, testable, and recoverable?
- [ ] Are seeds minimal, idempotent, and free of real personal data?
- [ ] If soft delete is used, are restoration, purge, and retention defined?
- [ ] Do history and audit serve distinct purposes without excessive data?
- [ ] Do backups have an RPO/RTO and a tested restoration process?
- [ ] Do retention, privacy, and key management have owners?
- [ ] Do all paths, including jobs and exports, preserve tenant isolation?
