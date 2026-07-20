# ADR-0001: Adopt a Modular Monolith for the Operations Platform

- **Status:** Accepted
- **Date:** 2026-07-20
- **Decision owners:** Engineering lead and operations product owner
- **Review date:** 2027-01-20

This is a completed example based on the [ADR template](../templates/adr.template.md). Names and numbers are illustrative, but the decision and trade-offs are realistic.

## Context

The operations platform will replace spreadsheets used to manage customer onboarding, orders, invoices, and exception handling. The first team has six developers. A second team may be added after product fit is proven. The expected first-year load is 300 internal users and 40 requests per second at peak.

The capabilities use one relational data set and several workflows need atomic updates: approving an order reserves capacity and creates a billable item; cancelling an onboarding case releases allocated identifiers. Deployments currently share one change window and one on-call rotation. The platform integrates with a billing provider and sends notifications asynchronously.

## Problem

We need an initial code and deployment structure that keeps business capabilities understandable while allowing the team to deliver and operate the product safely. A simple layer-only monolith risks unrestricted coupling as features grow. Independently deployed microservices would introduce distributed consistency, contract, infrastructure, and incident-response costs before the organization has independent service teams or scaling requirements.

## Decision forces

- Preserve local transactions for current cross-capability workflows.
- Keep one-command local development and one coordinated release.
- Make ownership and dependencies between capabilities visible.
- Support focused tests and future extraction without designing for extraction everywhere.
- Fit a six-developer team and one on-call rotation.
- Isolate billing-provider failures from core transactions.
- Avoid shared abstractions that merge unrelated business rules.

## Alternatives considered

### 1. Monolith organized only by technical layer

```text
controllers/
services/
repositories/
models/
```

- **Benefits:** lowest initial structural cost and familiar navigation for a very small CRUD.
- **Costs:** capability changes span global folders; ownership and forbidden dependencies are hard to see.
- **Reason not selected:** onboarding, orders, and billing already have distinct vocabulary and change patterns. The projected scope exceeds a small CRUD.

### 2. Modular monolith organized by business capability

- **Benefits:** explicit ownership, local calls and transactions, simple deployment, and selective rich modeling.
- **Costs:** boundaries require discipline and automated checks; database and deployment remain shared.
- **Fit:** meets current team, consistency, and operational needs without network boundaries.

### 3. Independently deployed microservices

- **Benefits:** independent deployment, scaling, and fault containment when each service truly owns its capability.
- **Costs:** versioned network contracts, eventual consistency, retries/idempotency, distributed tracing, more pipelines, and broader on-call burden.
- **Reason not selected:** no capability has an independent scaling or availability target, and ownership is not separated across teams.

### 4. Purchase a workflow platform

- **Benefits:** built-in case management, audit, and forms.
- **Costs:** licensing, vendor-specific extension model, and difficult integration of capacity-reservation rules.
- **Reason not selected:** a time-boxed prototype failed two mandatory atomic workflows and required duplicating authoritative order rules.

## Decision

Build one deployable application as a modular monolith. Initial modules are `onboarding`, `orders`, `billing`, `notifications`, and `identity-access`.

Each module:

- Owns its application operations, business rules, persistence mappings, and tests.
- Exposes a named public API inside the process.
- Does not import another module's internal packages or query its owned tables directly.
- May use a simple operation plus ORM for CRUD, adding domain objects or repositories only when its rules or persistence boundary justify them.

The modules share one relational database instance. Tables and migrations have a declared owner. Cross-module atomic workflows are coordinated by the initiating application operation and call public module APIs inside one transaction only where the invariant requires it.

Secondary work, such as notifications, uses in-process events. Messages sent to external systems use a transactional outbox so a committed state change is not separated from publication. In-process events must not hide a required synchronous invariant.

The build will enforce the allowed dependency graph:

```text
app/bootstrap
     │
     ├── onboarding ──> identity-access (public API)
     ├── orders ──────> billing (public API)
     └── notifications (subscribes to secondary events)
```

There will be no generic base service or repository shared by modules. Cross-cutting packages are limited initially to observability, database transaction primitives, authentication context, and immutable contract types.

## Positive consequences

- Developers run and debug one application and database locally.
- Current invariants can use local transactions.
- Capability-specific vocabulary and tests remain together.
- The team operates one primary deployment pipeline and rollback procedure.
- Dependency violations become reviewable and automatically detectable.
- Future extraction, if justified, starts from a known public contract and data owner.

## Negative consequences

- A faulty deployment can affect the whole application.
- Modules cannot scale or deploy independently.
- Database maintenance is a shared operational event.
- Architecture checks and code review are required to prevent boundary erosion.
- Some cross-module reporting requires deliberate read models rather than ad hoc table access.
- Later extraction still requires migration work and is not promised to be automatic.

## Risks and mitigations

| Risk | Early signal | Mitigation/guardrail | Owner |
| --- | --- | --- | --- |
| `shared` becomes an ownerless domain | Business types enter `shared`, or a change has no accountable module | Require a named owner and two demonstrated consumers; keep business concepts in their owning module | Engineering lead |
| Direct cross-module table access | Query or ORM import references another module's owned table | Database access conventions, architecture checks, and review checklist | Module leads |
| One module dominates release risk | Rollbacks or defects repeatedly originate in the same module | Feature flags, module-level tests, progressive deployment, and rollback rehearsal | Release owner |
| In-process events create hidden control flow | A primary operation cannot be understood without tracing subscribers | Use events only for secondary effects; document subscribers and test initiating behavior | Module owner |
| Hypothetical extraction drives premature interfaces | Public APIs have no current caller or copy internal persistence shapes | Design contracts for current callers; review extraction only against explicit triggers | Engineering lead |
| Billing outage holds a database transaction | Provider latency appears within transaction traces | Commit internal intent/outbox atomically and call the provider asynchronously with idempotency | Billing owner |

## Adoption and rollback

- **Incremental adoption:** implement the order-approval vertical slice first, including an `orders` public operation, a call to `billing`, one atomic transaction, an outbox record, and architecture checks for the two modules.
- **Compatibility/migration:** move existing prototype tables behind declared module owners without renaming public API fields in the first step. Use expand/migrate/contract migrations and keep old readers during the rollout window.
- **Rollback or exit:** module boundaries are code organization and can be simplified without data loss. A deployment rolls back to the previous artifact while compatible expanded columns remain. If the modular approach is abandoned, record a superseding ADR; do not silently remove ownership checks.
- **Validation:** measure change lead time, forbidden dependency findings, deployment failure rate, and billing-outage behavior over the first three production releases.

## Review plan

Review this ADR on 2027-01-20 and earlier if any trigger occurs:

- A capability needs a materially different availability or scaling target for two consecutive quarters.
- An autonomous team owns a stable module and coordinated releases block delivery.
- More than 20% of changes in a quarter require forbidden cross-module data access.
- Incidents repeatedly need capability-level fault containment.
- Database contention cannot be resolved through query, index, or workload isolation.
- A regulatory boundary requires separate data or deployment control.

The review may retain the architecture, revise a module boundary, or create a new ADR for one extraction. It must not treat service count as a success metric.

## References

- [Architecture selection guidance](../docs/03-architecture-selection.md)
- [Project structure guidance](../docs/04-project-structure.md)
- [Modular monolith profile](../profiles/modular-monolith.md)
- [ADR template](../templates/adr.template.md)
