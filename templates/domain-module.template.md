# Domain Module

> Use this document only for a cohesive area with meaningful vocabulary, rules, ownership, or lifecycle. A straightforward CRUD resource usually needs types, validation, and authorization—not a rich domain model.

## Boundary and language

- **Module/domain:** `{business capability, not technical layer}`
- **Purpose and owner:** `{outcome and accountable team}`
- **In scope:** `{decisions and data owned}`
- **Out of scope:** `{neighbor responsibilities}`
- **Upstream/downstream modules:** `{dependency and contract}`

| Term | Precise meaning | Common ambiguity to avoid |
| --- | --- | --- |
| `{term}` | `{definition}` | `{similar term/different context}` |

## Use cases

| Use case | Actor | Preconditions | Result | Failure outcomes |
| --- | --- | --- | --- | --- |
| `{action}` | `{actor}` | `{conditions}` | `{observable result}` | `{domain failures}` |

## Model

Use only constructs that clarify real rules.

### Entities and identity

| Entity | Identity | Lifecycle | Owned behavior |
| --- | --- | --- | --- |
| `{entity}` | `{stable identifier}` | `{creation to terminal state}` | `{rules}` |

### Value objects

| Value | Validity/invariant | Why a distinct type helps |
| --- | --- | --- |
| `{value}` | `{rule}` | `{prevents invalid state/centralizes meaning}` |

### Aggregates and consistency

| Aggregate boundary | Invariants protected atomically | Referenced external entities |
| --- | --- | --- |
| `{root and contents}` | `{rules}` | `{by identifier}` |

If no aggregate is justified, state: `Not applicable — {why transaction-level validation is sufficient}`.

## Invariants and policies

| ID | Rule | Authoritative source | Enforcement point | Required tests |
| --- | --- | --- | --- | --- |
| `INV-001` | `{must always hold}` | `{policy/contract}` | `{domain/database/boundary}` | `{cases}` |

Policies that vary independently from an entity: `{policy, inputs, output, owner or N/A}`.

## States and transitions

| Current state | Command/event | Guard and permission | Next state | Side effects |
| --- | --- | --- | --- | --- |
| `{state}` | `{trigger}` | `{rule}` | `{state}` | `{explicit effect}` |

Use an explicit state machine only when it prevents illegal transitions or clarifies concurrency. Otherwise a validated field may be sufficient.

## Time, history, and audit

- Deadlines/time-zone/clock policy: `{...}`
- Business history required: `{state/value changes to retain}`
- Audit evidence: `{actor, action, resource, time, reason}`
- Retention and privacy constraints: `{...}`

## Events and integrations

| Event/contract | Producer/consumer | Meaning | Delivery/idempotency | Schema owner |
| --- | --- | --- | --- | --- |
| `{event}` | `{...}` | `{past-tense fact}` | `{at-most/at-least/exact effect}` | `{owner}` |

Domain events are `Not applicable` unless another part of the model needs to react or the fact has independent business meaning.

## Persistence and transactions

- Transaction boundary: `{...}`
- Concurrency strategy: `{constraint/lock/version/idempotency}`
- Persistence mapping isolation: `{direct ORM/mapping/repository and reason}`
- Data ownership and migration constraints: `{...}`

## Evolution signals

- Extract or enrich the model when `{repeated invariant bugs, policy branching, terminology conflict, independent change}`.
- Split the module when `{different owners/change cadence/consistency needs}`.
- Do not split merely because `{file count or superficial code similarity}`.
