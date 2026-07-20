# 01 — Project Classification

Classification guides choices; it does not assign an architecture automatically. It combines exposure, failure consequences, domain, data, operation, and delivery capability. Its output is a map of needs and risks, not one label such as “small,” “medium,” or “large.”

Use this guide after recording the context in [`project-context.template.md`](../templates/project-context.template.md), then copy the result into [`architecture-assessment.template.md`](../templates/architecture-assessment.template.md).

## How to assess a project

For every dimension:

1. record the current state and the relevant horizon, often six to eighteen months;
2. cite evidence or mark the statement as an assumption;
3. describe the consequence of error, downtime, or growth;
4. assess intensity as `Low`, `Moderate`, `High`, or `Unknown`;
5. turn the finding into a recommendation, condition, or risk.

Do not total these levels into a universal score. One dimension can dominate a decision: few users do not remove audit needs from a regulated system. `Unknown` does not mean `Low`; it creates a discovery action or a temporary safety margin.

## Required dimensions

The descriptions below are contextual references. Adjust numerical ranges to the business, operating cost, and chosen technology.

| Dimension | Questions and evidence | Lower intensity | Signals of higher demands | Possible implications, not automatic choices |
|---|---|---|---|---|
| Estimated users | How many active and concurrent users? Are there peaks? | Limited group and predictable load | High concurrency, peaks, or network effects | load tests, cache, or horizontal scaling after measuring bottlenecks |
| System criticality | What happens after an incorrect result or delay? | Reversible inconvenience | safety, financial, legal, or core-operation impact | independent controls, recovery, review, and stronger tests |
| Data sensitivity | Does it hold personal, financial, health, credential, or secret data? | Public or low-impact data | sensitive personal data or material breach impact | minimization, restricted access, encryption, retention, and audit |
| Domain complexity | How many invariants, exceptions, policies, and transitions exist? | CRUD and local validation | interdependent rules, specialist language, or temporal rules | localized rich modeling and domain-expert collaboration |
| Integrations | How many external dependencies exist and how reliable are they? | None or one simple integration | many vendors, unstable contracts, limits, and partial failures | adapters, contract tests, controlled retry, and observability |
| Developers | How many people and teams change the code? | One small team | several teams with distinct cadence and ownership | explicit boundaries, ownership, and automation; not automatically microservices |
| Growth expectation | Is there a grounded projection or only an abstract possibility? | Stable demand | substantiated growth in users, data, or teams | measure capacity, identify limits, and preserve evolution paths |
| Availability need | During which hours must the service operate? | Maintenance windows are acceptable | continuous operation or no manual alternative | redundancy, health checks, gradual deployment, and incident response |
| Audit requirements | Must the system prove who did what, when, and why? | Operational logs are sufficient | immutable traceability or formal evidence | separate audit trail, controlled access, and defined retention |
| Regulatory requirements | Which laws, standards, or contracts apply? | No sector-specific obligation | sensitive-data law, regulated sector, or contractual controls | specialist review, evidence, and documented processes |
| Synchronous or asynchronous processing | Must the user receive an immediate result? Are jobs long-running or replayable? | Short synchronous flow | long duration, peaks, temporal decoupling, or eventual completion | queue, idempotency, job status, and failure handling |
| Internal or public application | Is access limited to staff, partners, or the public internet? | Controlled users and network | public internet, unknown clients, or an external ecosystem | larger attack surface, rate limits, compatibility, and support |
| Frontend need | Is there a visual interface? How many channels and interaction modes? | No UI or a static page | rich interaction, offline use, multiple clients, or critical accessibility | state architecture, contracts, and component tests |
| Persistence need | Which data must survive, under what consistency constraints? | No durable state | transactions, history, search, concurrency, or high volume | suitable storage and model, migrations, backup, and tested restore |
| Organizations | Does the product serve one or multiple organizations? | One organization | many organizations with distinct policy | tenant context, configuration, and per-organization administration |
| Customer isolation | What harm would cross-tenant data or load cause? | No tenants | contractual segregation or tenant-owned keys | resource-level authorization, isolation tests, and an explicit data strategy |
| Expected change frequency | How often do rules and interfaces change, and by whom? | Rare, coordinated changes | frequent experiments or volatile rules in separate areas | modularity along the axis of change, flags, and compatibility |
| Downtime and data-loss tolerance | What RTO and RPO has the business accepted? | Hours or days; some reconstruction is acceptable | minutes or seconds; near-zero loss | redundancy, frequent backup, rehearsed recovery, and greater cost |

RTO is the maximum acceptable time to restore a service; RPO is the maximum acceptable data-loss window. Do not promise either without verifying that the architecture, providers, and operation can sustain it.

## Synthesis axes

Group findings to make decisions traceable without hiding individual dimensions.

### Exposure and reach

Combine users, internal or public access, and client diversity. This axis affects edge protection, compatibility, accessibility, and capacity, but does not measure criticality by itself.

### Consequence and governance

Combine criticality, data, audit, regulation, RTO, and RPO. A `High` result often makes stronger security, evidence, recovery, and change controls `Essential`, even at low volume.

### Domain and change

Combine rules, states, change frequency, and access to domain experts. Domain complexity justifies modeling only in complex areas; supporting reference-data modules may remain simple.

### Integration and execution

Combine the number and quality of integrations with synchronous or asynchronous execution. Investigate timeouts, rate limits, duplicates, ordering, consistency, and replay.

### Data and tenancy

Combine persistence, number of organizations, and isolation. Multi-tenancy is an identity, authorization, data, operation, and billing decision; it is not merely adding `tenant_id`.

### Delivery and operation

Combine team shape, expected growth, availability, and fault tolerance. Organizational boundaries may influence modules, pipelines, and ownership, but splitting deployments too early adds operational coordination.

## Risk markers that must not be averaged away

Record any marker independently:

- safety, financial, or legal impact;
- sensitive personal data, credentials, or customer secrets;
- resource-level authorization or tenant isolation;
- an integration with no test environment or an unstable contract;
- irreversible processing or movement of money;
- demanding RTO/RPO without a tested recovery plan;
- asynchronous work that can be duplicated or lost;
- dependency on one person, vendor, or component with no alternative;
- a critical premise still marked `Unknown`.

These markers produce specific controls and questions; lower-intensity dimensions do not cancel them.

## Turn findings into recommendations

Populate four lists from the classification:

| List | Criterion | Contextual example |
|---|---|---|
| `Essential` | Reduces a present risk or enables the primary flow | resource-level authorization when users access separate organizations |
| `Conditional` | Depends on an observable event | introduce a queue if execution exceeds the response timeout or peaks lose work |
| `Advanced` | Addresses a demanding need with material cost | physically isolate each tenant when contracts require it |
| `Not applicable` | The corresponding characteristic is absent | a Design System in a CLI with no visual interface |

For each recommendation, write **evidence → risk/problem → practice → cost → review signal**. For example:

```text
Evidence: imports can take 20 minutes and arrive in monthly peaks.
Risk: timeouts and manual retries can duplicate records.
Practice: queued processing with an idempotency key and queryable status
          (Conditional now; Essential before the first production peak).
Cost: a worker, monitoring, replay handling, and eventual consistency.
Review signal: queue age exceeds the agreed time in three consecutive periods.
```

## Initial architecture heuristics

These relationships guide investigation; they do not create obligations:

- low domain complexity and one team often favor a simple or feature-based structure;
- interdependent rules and specialist vocabulary may justify domain boundaries and rich modeling in the relevant areas;
- several teams may benefit first from a modular monolith with explicit ownership;
- long-running, replayable tasks may justify asynchronous processing without making the whole system event-driven;
- an availability requirement may call for redundancy and recovery before service distribution;
- read-heavy workloads may justify indexes and caching only after measurement;
- tenant isolation belongs in authorization and its tests regardless of the physical data strategy.

Compare options in the [architecture decision matrix](03-architecture-selection.md).

## Example synthesis

```yaml
context: full-stack administration console for two internal teams
exposure_and_reach: low
consequence_and_governance: moderate
domain_and_change: moderate-high in the approval module
integration_and_execution: moderate; two synchronous external APIs
data_and_tenancy: moderate; relational persistence, no multi-tenancy
delivery_and_operation: moderate; six people, business-hours operation
risk_markers:
  - approval decisions require an audit trail
essential:
  - backend authorization
  - audit trail for approvals
  - migrations and integration tests
conditional:
  - queue if synchronization exceeds the response-time limit
advanced: []
not_applicable:
  - microservices
  - Event Sourcing
initial_architecture: feature-based monolith with an explicit approval module
```

This is not a universal profile for administration consoles. If approvals move material value or serve multiple organizations, consequences and the isolation strategy change.

## Reassessment triggers

Reassess after a material change such as:

- a new audience, tenant, country, or regulatory obligation;
- a substantial change to RTO, RPO, or operating hours;
- more sensitive data or a new financial flow;
- measured growth in load, latency, cost, or volume;
- a new critical integration or recurring partial failures;
- a second team working across the same boundary;
- a rule acquiring history, temporal behavior, or many exceptions;
- deployments blocked by coupling or tenant-isolation incidents;
- an invalidated critical assumption.

A review may conclude that no change is needed. Record the evidence and retain the simpler solution while it continues to fit.
