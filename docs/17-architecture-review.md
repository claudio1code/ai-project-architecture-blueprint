# 17 — Architecture Review

## Purpose and applicability

An architecture review tests whether the current design still fits current constraints and risks. It is not a score for using fashionable patterns or the number of layers.

- **Essential:** conduct an initial assessment and review material architecture-impacting changes.
- **Conditional:** schedule periodic health reviews for long-lived, growing, regulated, or operationally critical systems.
- **Advanced:** use formal review boards, quantitative fitness functions, or independent assessment only when scale and risk justify their cost.
- **Not applicable:** remove recurring ceremony for a short-lived low-risk artifact; still review its important security, compatibility, and maintenance decisions.

Use the [architecture health checklist](../checklists/architecture-health.md) for a concise pass and this document when evidence, trade-offs, and follow-up decisions need deeper analysis.

## Review triggers

Review at the point a decision can still change. Useful triggers include:

- project inception and the first vertical slice;
- a new public contract, persistence model, authentication scheme, tenant model, or external integration;
- a material change in users, data sensitivity, regulation, availability, team topology, or rate of change;
- repeated incidents, slow delivery, fragile tests, or operational toil;
- a scaling threshold or evolution signal recorded in the assessment/ADR;
- adoption of a new deployment unit, queue, cache, service, framework, or platform;
- a migration that is difficult to reverse;
- scheduled review of a high-criticality or long-lived system.

Do not hold a broad meeting for every small feature. Use the [feature-start checklist](../checklists/feature-start.md) to decide whether a focused architecture review is warranted.

## Inputs and evidence

Prepare only the materials needed for the decision:

- [project context](../templates/project-context.template.md) and current [architecture assessment](../templates/architecture-assessment.template.md);
- [architecture overview](../templates/architecture-overview.template.md) and applicable profile;
- relevant contracts, domain rules, data model, and accepted [ADRs](adr/README.md);
- system/dependency or critical-flow diagrams where they clarify relationships;
- representative implementation and tests;
- production evidence: incidents, latency/error trends, support burden, deployment frequency, recovery results, cost, or capacity;
- proposed change, alternatives, constraints, and migration/reversal path.

Label estimates and assumptions. A review cannot turn speculation into fact by putting it in a diagram.

## Review process

```text
restate context and decision
→ identify applicable quality attributes and constraints
→ inspect evidence and current boundaries
→ test alternatives against concrete scenarios
→ expose costs, risks, and reversibility
→ decide, experiment, defer, or reject
→ record owners, validation, and review triggers
```

Keep participants to the accountable decision owner and people with relevant product, domain, engineering, security, data, or operations knowledge. A reviewer should be able to challenge assumptions; a large standing committee is not automatically more rigorous.

## Evaluate fitness, not pattern compliance

### Context and simplicity

- Does the design solve current requirements without speculative infrastructure?
- Which elements are **Essential**, **Conditional**, **Advanced**, or **Not applicable** in this context?
- Can a layer, service, repository, broker, cache, or framework be removed without losing a needed responsibility?
- Are evolution signals explicit rather than implemented prematurely?
- Is accepted technical debt named, bounded, owned, and revisited?

A simpler alternative is preferred when it meets the same constraints with lower change and operating cost.

### Boundaries and structure

- Do modules align with cohesive capabilities or stable technical responsibilities?
- Are dependencies directional and public interfaces small?
- Are routes/controllers thin without mandatory pass-through layers?
- Are shared utilities genuine shared concepts rather than a dumping ground?
- Can the team change one feature without unrelated edits?

Use [architecture selection](03-architecture-selection.md), [project structure](04-project-structure.md), and [backend architecture](backend-architecture.md) as decision guides, not compliance catalogs.

### Domain model

- Are vocabulary, invariants, states, transitions, policies, and permissions explicit where complexity requires them?
- Does each business rule have one authoritative owner?
- Have similar-looking but distinct business concepts been incorrectly unified?
- Is DDD terminology adding clarity, or only ceremony to CRUD?

See [domain modeling](06-domain-modeling.md).

### APIs and integrations

- Are contracts, schemas, errors, authentication/authorization, idempotency, and compatibility explicit?
- Are timeout, retry, rate limit, and partial-failure behaviors defined?
- Are asynchronous/event semantics, ordering assumptions, ownership, replay, and deduplication clear?
- Can consumers migrate without a coordinated flag day?

See [API design](07-api-design.md).

### Data and consistency

- Do constraints and transactions protect important invariants under concurrency?
- Are schema changes compatible, testable, and recoverable?
- Are normalization, indexes, deletion/history, retention, backup, and restoration deliberate?
- Is tenant isolation enforced across every storage and processing path?

See [data and persistence](08-data-and-persistence.md).

### Frontend and visual system

- Is state owned by the narrowest authoritative scope?
- Are presentation, orchestration, remote data, and domain rules understandable?
- Are loading, empty, error, accessibility, and responsive behavior covered?
- Is shared UI proportional to reuse, without a universal component or premature design system?

See [frontend architecture](09-frontend-architecture.md) and the [design system guide](10-design-system.md). Mark this dimension **Not applicable** when no frontend exists.

### Security and privacy

- Have assets, trust boundaries, threats, least privilege, and secure defaults been addressed?
- Does the backend authorize the actor for the resource and tenant?
- Are secrets, sensitive data, sessions/tokens, dependencies, uploads, and audit handled according to risk?
- Are LGPD or other regulatory obligations reviewed by the appropriate specialists?

Use [security](11-security.md). This review does not replace a specialized audit.

### Testing and change safety

- Do tests target the highest-impact behavior and failure modes?
- Are critical boundaries exercised realistically rather than mocked away?
- Are contract, migration, security, performance, and end-to-end tests present only where relevant?
- Can a change be deployed, observed, and reversed or corrected safely?

See [testing](12-testing.md).

### Operations and delivery

- Are logs, metrics, traces, alerts, and audit proportional to operational questions?
- Are SLI/SLO/SLA terms measurable and owned when used?
- Are configuration, artifacts, migrations, secrets, deployment, rollback, backup, and recovery reproducible?
- Is orchestration complexity justified by workload and team capability?

See [observability](13-observability.md) and [DevOps and delivery](14-devops-and-delivery.md).

### Documentation and agent readiness

- Can a new maintainer or agent locate context, sources of truth, constraints, and validation commands?
- Are current decisions indexed and old decisions superseded rather than rewritten?
- Do docs, schemas, code, tests, and runtime behavior agree?
- Does root `AGENTS.md` enable small, safe, reviewable changes?

See [documentation](15-documentation.md) and [AI-assisted development](16-ai-assisted-development.md).

## Scenario-based challenge

Test the design with a few concrete scenarios relevant to the project, for example:

- the same command is submitted twice after a timeout;
- two users update the same resource concurrently;
- a tenant identifier is manipulated;
- a dependency is slow or unavailable;
- a migration is deployed while old instances still run;
- a sensitive record must be deleted or restored;
- traffic grows by the forecast amount;
- an on-call engineer must diagnose a failed critical flow;
- a team must change one business rule without touching unrelated modules.

Scenarios reveal missing behavior more reliably than asking whether the design “is scalable.” Do not require every system to solve every scenario; select them from its risks.

## Findings and decisions

Classify each finding by evidence and required action:

| Outcome | Meaning | Required record |
| --- | --- | --- |
| Keep | Current design fits; no change needed | Rationale and next trigger if non-obvious. |
| Change now | Risk or constraint requires an implementation/migration | Owner, priority, acceptance evidence, and recovery path. |
| Experiment | Evidence is insufficient and a bounded test can answer it | Hypothesis, metric, time/effort bound, and decision date. |
| Accept debt | Cost is consciously deferred | Impact, owner, mitigation, deadline/trigger. |
| Reject | Proposed complexity does not solve a current need | Reason and signal that could reopen it. |
| Remove | Existing mechanism is not applicable or its cost exceeds value | Compatibility/migration and verification plan. |

Use severity to express impact and urgency, not reviewer preference. Separate observed fact from inference. A finding such as “service is not Clean Architecture” is invalid without a concrete consequence.

Record a material selected alternative in an [ADR](adr/README.md). Routine tasks can remain in the project tracker, linked from the review summary. Avoid turning the ADR into meeting minutes.

## Review output

A useful review summary contains:

- scope, date, participants, and decision owner;
- context and triggers;
- evidence inspected and missing evidence;
- applicable/not-applicable dimensions;
- findings ordered by risk;
- decisions and alternatives;
- accepted debt and residual risks;
- actions with owners and verification criteria;
- ADRs created or superseded;
- next trigger or review date.

Do not say “approved” without conditions when required actions remain. Distinguish blocking risk from recommended improvement.

## Anti-patterns

- reviewing slide aesthetics instead of behavior and constraints;
- mandating microservices, DDD, Clean Architecture, repositories, queues, or Kubernetes as maturity markers;
- treating all conditional practices as mandatory;
- proposing a rewrite before measuring the failure of incremental change;
- ignoring operation, migration, data, and team costs;
- accepting an abstraction because code examples look cleaner in isolation;
- producing a long findings list with no priority, owner, or validation;
- allowing an AI-generated explanation to substitute for evidence;
- scheduling recurring reviews that never change a decision.

## Completion checklist

- [ ] Were context, quality attributes, risks, and non-applicable areas explicit?
- [ ] Was the smallest viable alternative considered?
- [ ] Were current code/runtime evidence and affected contracts inspected?
- [ ] Were business rules, boundaries, data consistency, security, tests, and delivery assessed as applicable?
- [ ] Were costs in development, testing, deployment, operations, and maintenance compared?
- [ ] Were reversibility and evolution signals documented?
- [ ] Are facts, assumptions, decisions, debt, and risks distinguishable?
- [ ] Does every action have an owner and verification criterion?
- [ ] Were consequential decisions recorded or superseded as ADRs?
- [ ] Is there a meaningful next review trigger rather than arbitrary ceremony?
