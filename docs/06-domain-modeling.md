# 06 — Domain Modeling

Domain modeling makes important business behavior explicit: identity, rules, state, time, permission, and consequences. It does not require tactical Domain-Driven Design, classes for every noun, or repositories for every table. A validated CRUD flow can remain simple when it has no meaningful invariant beyond shape and access.

The objective is the smallest model that lets domain experts and engineers explain, enforce, and test the behavior that matters.

## Applicability

| Status | Contextual interpretation |
|---|---|
| `Essential` | name the business concepts, authoritative rules, actors, inputs, outputs, and invalid conditions in every project that implements business behavior |
| `Conditional` | entities, value objects, explicit policies, state machines, domain events, and richer use-case boundaries where identity, invariants, transitions, time, or coordination require them |
| `Advanced` | aggregate design across complex consistency boundaries, strategic bounded contexts, sophisticated temporal models, or tactical DDD patterns when sustained complexity justifies the cost |
| `Not applicable` | rich domain layers for static content, simple data transformation, or CRUD whose only behavior is boundary validation and authorization |

Use the complexity evidence from [Project classification](01-project-classification.md). If rich modeling is selected, [Backend architecture](backend-architecture.md) explains how delivery, application flow, persistence, and integration boundaries can support it without mandatory layers.

## Does the domain justify a richer model?

Look for behavior, not the number of tables or screens.

### Signals of meaningful domain complexity

- domain experts use precise terms that differ from database or UI labels;
- valid behavior depends on several facts, states, deadlines, or prior decisions;
- the same action has important exceptions and policies;
- incorrect transitions create financial, legal, safety, or operational impact;
- rules change frequently but only within identifiable business areas;
- two teams use the same word with different meanings;
- concurrency can break an invariant even when each request is valid alone;
- decisions must explain who, when, under which policy version, or based on which evidence;
- bugs arise because rules are scattered across UI, services, jobs, and queries;
- a domain expert describes behavior as a lifecycle rather than create/read/update/delete.

### Signals that a simple model is sufficient

- the system stores reference data with basic field validation;
- operations map directly to create, read, update, and delete with no consequential transition rules;
- each record can be handled independently;
- framework validation and database constraints express all real invariants clearly;
- there is no domain-specific language or policy to protect;
- a function and transaction make the behavior easy to understand and test.

Do not manufacture complexity to make the model look “domain-driven.” Start simple and retain explicit names and tests so richer modeling can be introduced where evidence appears.

## Start with language and examples

Before choosing tactical building blocks:

1. identify actors and desired outcomes;
2. write concrete successful and rejected examples;
3. name concepts using stakeholder language;
4. identify facts that must always remain true;
5. map states, transitions, deadlines, permissions, and external decisions;
6. distinguish commands, facts, queries, and side effects;
7. mark unclear terms and assumptions for domain-expert confirmation.

Example:

```text
Given a reservation awaiting payment
And its payment deadline is 14:00 UTC
When confirmed payment is received at 13:59 UTC
Then the reservation becomes confirmed
And inventory remains allocated

When the same confirmation arrives again
Then no second allocation or receipt is created
```

This example reveals state, a deadline, an external fact, an invariant, and idempotency. It does not yet prove the need for an aggregate class, event bus, or Event Sourcing.

## Modeling building blocks

Use only the elements that make a current rule safer or clearer.

### Entities

An entity has identity and a lifecycle; its attributes can change while it remains the same business thing. Identity should reflect the domain and must not be confused with object location or every database row.

Examples include a reservation, invoice, user membership, or claim. An entity should own behavior that protects its state when that behavior exists:

```text
reservation.confirm(payment, receivedAt)
reservation.expire(now)
```

If a record has no behavior beyond validated fields, a plain typed record may be sufficient. Do not add getters, setters, and an empty base entity only to satisfy a pattern.

### Value objects

A value object is defined by its value rather than identity. It is often immutable and can own validation, equality, units, or formatting.

Useful examples:

- `Money(amountInMinorUnits, currency)` prevents adding unlike currencies;
- `DateRange(start, end)` ensures the end is not before the start;
- `EmailAddress` can normalize and validate the representation expected by the business;
- `TenantId` can prevent accidental mixing with a user or organization ID.

A wrapper around a string with no behavior or safety benefit may add noise. Also avoid treating all addresses or amounts as one shared type if different domains assign different meaning and lifecycle.

### Aggregates

An aggregate is a consistency boundary: a cluster of state changed through one root so specific invariants remain true in one transaction. It is not a synonym for a large object graph, module, API response, or database join.

Consider an aggregate when concurrent commands must coordinate to protect a rule—for example, accepted allocations must not exceed a reservation's capacity. Keep the boundary as small as the invariant permits; references by identity and separate transactions are often better than loading every related object.

Questions before choosing one:

- Which invariant must hold immediately after one command?
- Which state is required to decide that command?
- Can another aggregate be consistent later without violating the business promise?
- What concurrency mechanism protects the boundary?
- Will the aggregate remain usable at expected volume?

Do not design aggregates from table relationships alone. A foreign key does not prove transactional ownership.

### Invariants

An invariant is a business condition that must hold for every committed valid state.

Examples:

- an approved refund cannot exceed the refundable balance;
- a membership has at most one active role assignment of a mutually exclusive kind;
- a confirmed reservation has allocated capacity;
- an invoice total equals the sum of its accepted lines under the applicable rounding policy.

Place enforcement at the authoritative write path and reinforce it with database constraints where concurrency or multiple writers could bypass application checks. UI validation can explain an invariant but cannot be its only enforcement.

Distinguish invariants from preferences and process checks. “Display names should be short” may be a UX guideline; “a regulated identifier must pass its checksum” can be an invariant.

### Use cases

A use case coordinates one actor goal: validate the command, load required state, authorize access, invoke rules, persist atomically where needed, and trigger/report effects. It defines an application boundary, not necessarily a class or `Service` suffix.

A simple function is enough when the flow is cohesive:

```text
cancelReservation(command, actor, clock, reservations)
```

Create a service or application object when it owns meaningful orchestration, transaction policy, several collaborators, or reuse across delivery mechanisms. Do not create a service that only forwards a controller DTO to a repository.

### Policies

A policy expresses a decision that does not naturally belong to one entity or varies by context, agreement, date, or strategy.

Examples include refund eligibility, credit limits, pricing, allocation priority, and approval thresholds. Name policies in domain language and pass the facts they need explicitly.

Version or snapshot the applied policy when past decisions must remain explainable. Do not replace clear conditionals with a strategy hierarchy unless multiple actual policies vary independently.

### Domain events

A domain event records a meaningful fact that has occurred, such as `ReservationConfirmed` or `RefundApproved`. Use past tense, stable business meaning, and enough identifiers/context for intended consumers without exposing an internal object graph.

Consider events when:

- another capability reacts independently;
- the fact is useful for audit or integration;
- decoupling a side effect from the transaction has clear value.

Do not emit events for every setter or use them to hide a direct required call. Define delivery, duplication, ordering, schema compatibility, privacy, and publication-after-commit behavior. An in-process event and a durable integration event have different guarantees; name that difference.

Domain events do not imply Event Sourcing. In conventional persistence, current state remains authoritative and selected events can be published through a transactional outbox.

## State and transitions

When valid actions depend on current state, model transitions explicitly instead of allowing arbitrary status assignment.

| Current state | Command | Required conditions | Next state | Side effects/facts |
|---|---|---|---|---|
| `PENDING` | confirm | verified payment before deadline | `CONFIRMED` | confirmation recorded |
| `PENDING` | expire | deadline reached and no payment | `EXPIRED` | capacity released |
| `CONFIRMED` | cancel | actor allowed; cancellation policy accepts | `CANCELLED` | refund evaluation requested |
| `EXPIRED` | confirm | none | rejected | late payment sent to reconciliation |

The table is a communication tool. Implement it with explicit functions, an enum plus transition rules, or a state-machine library only as complexity warrants.

### When a state machine helps

Consider a formal state machine when there are many states and transitions, parallel or nested states, time-triggered transitions, or frequent defects from missing paths. Its definition should make allowed transitions and guards reviewable and testable.

Avoid a state-machine framework for two obvious statuses if direct code is clearer. A diagram without authoritative implementation can drift; decide whether the machine definition, domain code, or specification is the source of truth.

### Invalid and exceptional transitions

Define the behavior for:

- repeated commands;
- stale versions and concurrent updates;
- events arriving late or out of order;
- an external effect succeeding after the local timeout;
- policy changes while work is in progress;
- manual correction or administrative override.

Do not silently coerce an invalid state. Return a stable error or route it to an explicit reconciliation process. Overrides should identify actor, reason, prior state, resulting state, and authority.

## Permissions are part of behavior

Authentication establishes identity; authorization decides whether that actor may perform an action on a resource in its current context. Model more than a UI role string when the rule depends on ownership, tenant, state, amount, separation of duties, or delegation.

Example:

```text
An approver may approve expenses in their organization up to their limit,
but may not approve an expense they submitted.
```

This rule combines actor, resource, tenant, amount, and history. Enforce it on the authoritative backend path and test negative cases. UI visibility is convenience, not protection.

Centralize shared authorization knowledge without creating one giant permission function full of unrelated resource switches. A policy per capability can share identity and tenant primitives while retaining domain ownership.

## Time, deadlines, and temporal rules

Time is an input to a rule, not a hidden constant.

- distinguish an instant from a local calendar date and business time zone;
- name inclusive/exclusive boundaries (`expiresAt`, `validThroughDate`);
- inject a clock into time-sensitive behavior;
- define daylight-saving and holiday/calendar assumptions where relevant;
- record which policy version applies to work spanning a rule change;
- account for scheduler delay and late messages rather than assuming exact execution at a deadline.

If a deadline is consequential, a query that merely hides expired items is insufficient. The authoritative command must reject or transition based on time, and background processing needs idempotent catch-up.

## History and audit

Different needs require different records:

| Need | Suitable starting mechanism | Important property |
|---|---|---|
| diagnose a technical failure | structured operational log | correlation and safe technical context |
| show prior business values | effective-dated/history table or snapshots | reconstruct relevant prior state |
| prove actor actions | audit trail | actor, action, target, time, reason/outcome, controlled access |
| rebuild state from facts | Event Sourcing, only if justified | durable event semantics and replay |

An `updated_at` timestamp does not provide a history. A technical log is not an audit trail and may be sampled or deleted under different rules. Define retention, access, privacy, correction, and restore requirements with [Data and persistence](08-data-and-persistence.md).

Audit records should capture the business action rather than every internal field mutation. Never include secrets or unnecessary personal data. For high-consequence overrides, record reason and authority in addition to before/after state.

## Boundaries and translation

The same real-world subject can have different valid models in different domains. A customer in billing may mean the legal party responsible for payment; in support it may mean a person participating in a case. Do not force both into one universal entity because names overlap.

Use explicit translation at a boundary when language, lifecycle, or ownership differs. Share stable identifiers or contracts only when their semantics are actually shared. This is a form of low coupling, not wasteful duplication.

Likewise, keep transport and persistence concerns from dictating the model where they conflict:

- API request fields are not automatically domain entities;
- ORM relations are not aggregate boundaries;
- database nullability is not the complete business validity rule;
- a frontend status label is not the authoritative transition mechanism.

A straightforward module may use an ORM record directly when semantics align and no protected domain model exists. Isolation becomes valuable when persistence changes independently, queries leak into rules, multiple stores exist, or aggregate consistency needs a dedicated boundary.

## Testing the model

Prioritize examples and consequences over class coverage. Tests are usually mandatory for applicable high-risk rules:

- invariants and boundary values;
- allowed and rejected state transitions;
- authorization, separation of duties, and tenant isolation;
- money, rounding, allocation, and limits;
- deadline boundaries and policy-version changes;
- idempotency and concurrent commands;
- event content, duplicate delivery, and ordering assumptions;
- history, audit creation, and administrative overrides.

Use domain-expert examples as test cases. Unit tests fit deterministic policies and transitions; integration tests verify constraints, transactions, persistence mapping, and outbox behavior; end-to-end tests should cover only critical representative flows.

Avoid tests that assert private method calls or require every domain object to be mocked. They freeze implementation rather than protect the rule.

## Modeling workflow

1. **Describe scenarios:** happy path, rejection, boundary, concurrency, and recovery.
2. **Build a glossary:** define terms, synonyms to avoid, and context-specific meanings.
3. **Locate invariants:** identify which facts must be consistent and when.
4. **Map state and time:** list transitions, deadlines, invalid/repeated actions, and overrides.
5. **Map authority:** identify actors, permissions, tenants, and policy owners.
6. **Select the smallest constructs:** function, validated record, entity, value object, policy, aggregate, or state machine.
7. **Choose consistency and persistence:** define transaction boundaries and external effects with [Backend architecture](backend-architecture.md).
8. **Test examples:** make consequential rules executable.
9. **Validate language:** review the model with domain experts and actual change requests.
10. **Reassess:** enrich or simplify when evidence changes.

Capture a module using [`domain-module.template.md`](../templates/domain-module.template.md) when the behavior warrants a dedicated model.

## Common modeling failures

- treating every table as an entity and every relation as an aggregate;
- placing all logic in generic services while domain objects only expose setters;
- creating a repository for each entity without a persistence-isolation need;
- using one shared model across domains with different meanings;
- duplicating an invariant in controllers, UI, jobs, and database hooks with no authoritative source;
- putting authorization only in the UI or route metadata;
- representing every change as an event without defined consumers or delivery semantics;
- adding CQRS or Event Sourcing because the domain is “important” rather than because their specific problems exist;
- making aggregates so large that every command loads and locks unrelated data;
- confusing audit, history, operational logs, and event storage;
- hiding time, policy version, or tenant context in globals;
- applying tactical DDD vocabulary to simple CRUD without behavioral benefit.

## Model review checklist

- Can a domain expert recognize the names and scenarios?
- Is the complex part of the domain identified, rather than assumed everywhere?
- Are entities distinguished by identity and value objects by value?
- Does each aggregate correspond to a stated immediate invariant?
- Are state transitions, invalid actions, and deadlines explicit?
- Is authorization based on actor, resource, tenant, and state where required?
- Do policy ownership and versioning match history needs?
- Are domain and integration events distinguished, with delivery semantics defined?
- Are transaction and concurrency controls sufficient for invariants?
- Are audit and history requirements separate from technical logging?
- Could a simpler function or validated record express the same behavior more clearly?
- Are the most consequential examples protected by behavior-focused tests?
