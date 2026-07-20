# 05 — Coding Conventions

Coding conventions reduce ambiguity and make defects easier to see. They should encode decisions that affect correctness, readability, compatibility, and collaboration—not personal preferences already handled by a formatter.

Adapt [`coding-standards.template.md`](../templates/coding-standards.template.md) to the selected language and framework. Keep the project-specific document short enough to use during implementation and review.

## Applicability

| Status | Typical convention |
|---|---|
| `Essential` | one automated formatter, a documented validation command, intent-revealing names, explicit error behavior, boundary validation, and no secrets in code or logs |
| `Conditional` | strong type-checking rules, asynchronous cancellation, idempotency, public API compatibility, audit metadata, or generated-code policies when the corresponding capability exists |
| `Advanced` | custom static-analysis rules, architectural import checks, or formal compatibility pipelines when recurring risks justify their upkeep |
| `Not applicable` | conventions for a language, runtime, API, database, or UI that the project does not have |

Framework defaults and community conventions are usually cheaper than a custom style. Deviate when the project has a concrete readability, safety, or compatibility reason, and document the exception.

## Precedence and sources of truth

Use this order when instructions conflict:

1. behavior, security, legal, and public-contract requirements;
2. accepted architecture decisions and project context;
3. compiler, runtime, framework, and repository automation;
4. project coding standards;
5. local style preference.

Do not duplicate formatter settings in prose. Reference the configuration and record only intent that tooling cannot express. A rule enforced by CI should have the same local command.

For important concepts, name the authoritative source:

| Concept | Possible authoritative source | Derived consumers |
|---|---|---|
| public request/response shape | contract schema | generated client, documentation, validation |
| persisted uniqueness | database constraint | application error mapping, UI guidance |
| business eligibility | domain policy or cohesive rule function | API, worker, and UI presentation |
| design value | semantic token | components and themes |
| build version | release metadata | package and runtime reporting |

The actual source depends on the project. Do not let generated and handwritten definitions both claim authority.

## Automated baseline

Define one fast local command and its CI equivalent for the checks that exist:

```text
format check → lint → type check → focused tests → build
```

The sequence is illustrative. A shell script may have no compile step; a documentation repository may validate Markdown and links instead. Record commands, supported tool versions, and whether warnings fail CI. Avoid introducing a tool whose configuration and maintenance cost exceed the defects it is meant to prevent.

Formatting should be automated and non-negotiated in review. Lint and type suppressions require a narrow scope and a reason; do not disable a rule globally to avoid understanding one failure.

## Naming

Names should reveal business meaning, unit, side effect, and scope where relevant.

Prefer:

- `reservationExpiresAt` over `date`;
- `amountInMinorUnits` over `amount` when the representation matters;
- `loadCustomer` for a read and `createCustomer` for a state change;
- `isEligibleForRenewal` for a predicate;
- domain terms agreed with stakeholders over generic `data`, `item`, `manager`, or `helper`.

Avoid encoding a temporary implementation in a public name unless consumers need to know it. `RedisSessionRepository` can be a concrete adapter; the consuming capability may simply be `SessionStore` if substitution is justified.

Use one vocabulary for the same concept. If two domains assign different meanings to “account,” qualify the terms rather than forcing one shared model. Similar spellings do not prove shared responsibility.

## Functions and control flow

A function should have one cohesive purpose at its level of abstraction. Prefer:

- explicit inputs and outputs over hidden global state;
- early validation or guard clauses when they clarify the main path;
- shallow control flow over deeply nested conditionals;
- pure calculations for rules that do not require effects;
- orchestration that names steps rather than hiding them in callbacks;
- composition over inheritance for assembling optional behavior.

Do not set universal line or parameter limits. A long function may need separation when it mixes reasons to change; splitting a readable rule into many one-line forwarding functions can make it worse. Extract when the result gains a name, protects an invariant, removes duplicated knowledge, or isolates an effect.

Example of an explicit transition:

```text
approveRequest(request, actor, now):
  require actor can approve request
  require request.status is PENDING
  require now <= request.deadline
  return request transitioned to APPROVED with actor and timestamp
```

The example keeps authorization, state, and time inputs visible. Its concrete placement depends on the domain complexity described in [Domain modeling](06-domain-modeling.md).

## Types and data representation

Use strong typing when the technology supports it and the type makes invalid or ambiguous states harder to express. Particularly useful candidates include identifiers, money and currency, timestamps, durations, statuses, tenant context, and public contracts.

Guidelines:

- distinguish absence from an empty value;
- include units in the type or name;
- use closed enumerations only when unknown future values have defined handling;
- avoid unbounded string maps at trusted internal boundaries;
- translate transport and persistence representations when their semantics differ from the domain;
- avoid `any`, unchecked casts, and non-null assertions except at a proven boundary with a narrow explanation.

Do not wrap every primitive automatically. A validated local display label may remain a string. Introduce a value type when it owns validation, formatting, units, equality, privacy behavior, or a recurring invariant.

## Validation and trust boundaries

Validate untrusted data before it reaches trusted rules: HTTP input, CLI arguments, files, messages, environment values, database content from legacy sources, and provider responses. Define size, shape, allowed values, normalization, and unknown-field behavior.

Validation has several responsibilities that should not be conflated:

- **shape validation:** can the input be parsed safely?
- **business validation:** is the operation allowed in the current state?
- **authorization:** may this actor perform it on this resource?
- **persistence constraints:** can valid state remain valid under concurrency?

Client-side validation improves feedback but is not authoritative for security or business rules. Database constraints remain useful for invariants that must survive concurrent writers. Map constraint failures to explicit domain or API errors rather than exposing implementation details.

## Error handling

Every boundary should define which failures are expected, retryable, reportable, or fatal to that operation.

- Use stable machine-readable error codes at public contracts where clients act on them.
- Preserve the original cause internally while translating provider or persistence details at a boundary.
- Include actionable context, but never credentials, tokens, personal data, or full sensitive payloads.
- Do not catch an error only to log and continue as if the operation succeeded.
- Do not replace a failed critical rule with a fixed value or silent fallback.
- Do not retry validation, authorization, or deterministic business failures.
- Bound retries by attempts or elapsed time and use backoff/jitter where the dependency requires it.

A fallback is valid only when product behavior defines it, users can tolerate the degraded result, and monitoring makes activation visible. “Return an empty list on any exception” commonly turns an outage into incorrect business behavior.

Use [API design](07-api-design.md) for transport error contracts and [Observability](13-observability.md) for error reporting.

## Asynchrony, concurrency, and time

When applicable:

- set explicit network and job timeouts;
- propagate cancellation where abandoning work is safe;
- define ownership of concurrent mutable state;
- state ordering and delivery assumptions;
- make retryable side effects idempotent or deduplicated;
- use database constraints, transactions, or optimistic locking for contested invariants;
- inject or centralize clock access for time-dependent rules and tests;
- store timestamps with an unambiguous time zone/instant representation and convert for display at the edge.

Do not add locks, queues, or idempotency stores without a concurrent or repeated execution path. When the path exists, document the idempotency key scope, lifetime, payload mismatch behavior, and response for a replay.

## Dependencies and external code

Before adding a dependency, record the capability it provides, why existing platform functionality is insufficient, its maintenance and security posture, license compatibility, runtime cost, and exit cost. Prefer a narrow adapter around a volatile provider; do not wrap a stable library with an identical API “just in case.”

Keep versions locked or constrained according to the ecosystem and automate update visibility. Review major upgrades as behavioral changes. Remove unused dependencies and do not introduce a package for a trivial function when ownership is cheaper than supply-chain risk.

Generated code should have:

- an identified authoritative input;
- one reproducible generation command and tool version;
- a policy on whether output is committed;
- a CI check for drift when practical;
- no manual edits unless the generator explicitly supports extension points.

## Configuration and secrets

Validate required configuration at startup rather than failing on the first request. Keep environment-specific values outside source code and distinguish non-secret configuration from secrets.

- never commit real credentials;
- do not log secret values or entire environment objects;
- grant the process only the secrets and permissions it needs;
- define rotation and local-development mechanisms for applicable projects;
- avoid passing a global configuration bag through business code—pass the capability or value actually required.

Defaults are appropriate for safe developer convenience. A production-critical secret, tenant identifier, or destructive target should not receive a silent default.

## Logging and audit

Use structured logs when software is operated as a service or automation whose failures need diagnosis. Prefer stable event names and fields such as correlation ID, operation, outcome, duration, and safe resource identifiers.

Do not use logs as an audit trail. Technical logs support diagnosis and may be sampled or rotated; an audit trail records business-relevant actor, action, target, time, and outcome under controlled access and retention.

Avoid:

- secrets, authorization tokens, raw personal data, or uploaded content;
- logging the same failure at every layer;
- interpolated messages that make aggregation difficult;
- success logs before the durable effect succeeds;
- high-cardinality fields in metrics without assessing cost.

Logging can be `Not applicable` to a purely static artifact. It becomes more important as operation, integrations, asynchronous work, and criticality increase.

## Comments and documentation

Code should express what happens; comments should explain information the code cannot preserve clearly: why a surprising trade-off exists, which external constraint applies, or when a workaround can be removed.

Good comment:

```text
Keep provider order stable: the first successful reservation owns the external id.
Changing this order requires reconciliation of in-flight requests; see ADR-012.
```

Weak comment:

```text
Increment counter by one.
```

Update comments when changing the behavior they explain. Remove dead code rather than commenting it out; version control preserves history. Public APIs and libraries need consumer-oriented contract documentation, including errors and compatibility, while private obvious functions usually do not need prose restating their signature.

## Compatibility and change discipline

Treat published APIs, events, persisted data, CLI output consumed by automation, library exports, and configuration names as contracts when consumers rely on them.

- make additive changes where compatibility is required;
- define deprecation and removal windows according to actual consumers;
- make schema and code deployments safe under version overlap;
- separate data migration from destructive cleanup when rollback needs old data;
- record intentional breaking changes and migration instructions;
- never change a public contract silently because internal naming changed.

Compatibility is `Not applicable` to a private prototype with no retained data or consumer, but that status must change before external adoption.

## Test code conventions

Test names should describe behavior and relevant conditions, not implementation method names. Keep setup focused on facts that affect the assertion and use builders or fixtures only when they clarify those facts.

- prefer observable outcomes over private-call assertions;
- use a real clock substitute for time behavior rather than fixed production code;
- make random values deterministic when failures need reproduction;
- do not weaken production validation to simplify a fixture;
- distinguish fakes, stubs, mocks, and real integrations in test support;
- keep critical authorization, invariant, state-transition, isolation, and idempotency tests explicit.

The broader selection of test types belongs in [Testing strategy](12-testing.md).

## AI-assisted changes

AI-generated code follows the same standards as human-authored code. An agent must inspect existing names, types, schemas, utilities, and patterns before creating equivalents. Require it to report assumptions and validations, review its diff, and reject changes that mask failure, invent requirements, duplicate an authoritative rule, or add unrelated refactoring. The operational protocol is in [`AGENTS.md`](../AGENTS.md).

## Project convention record

At minimum, the adapted standards should answer:

```text
Language/runtime versions:
Formatter and command:
Lint/type checks and commands:
Test commands by scope:
Naming exceptions:
Source and test layout:
Allowed dependency directions:
Boundary validation approach:
Error classification and public error format:
Time, money, identifier, and null representation:
Async timeout/retry/idempotency rules, if applicable:
Logging and sensitive-data policy, if applicable:
Public compatibility commitments, if applicable:
Generated-code policy, if applicable:
Dependency approval rule:
How to record and expire exceptions:
```

## Review checklist

- Is behavior readable without following avoidable indirection?
- Does each important rule have one authoritative source?
- Are names and types precise about meaning and units?
- Are trust boundaries validated and authorization authoritative?
- Are failures explicit, observable, and free of sensitive data?
- Are retries bounded and side effects safe to repeat where needed?
- Is shared code based on shared responsibility rather than similar text?
- Are public and persisted contracts compatible or intentionally migrated?
- Are suppressions, dependencies, and exceptions narrow and justified?
- Do automated checks and relevant tests pass without weakening safeguards?
