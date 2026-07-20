# 12 — Testing

## Purpose and applicability

Testing provides evidence that important behavior and quality attributes work. Optimize for risk detection and feedback, not a coverage percentage.

- **Essential:** automate important business rules and at least one realistic path through critical integration boundaries.
- **Conditional:** component, contract, migration, end-to-end, security, and performance tests when the corresponding capability or risk exists.
- **Advanced:** large-scale fault injection, continuous performance baselines, mutation testing, or broad property-based suites when their signal justifies maintenance.
- **Not applicable:** remove test types that cannot exercise anything meaningful; document the reason instead of creating empty suites.

Define the project-specific selection in the [testing strategy template](../templates/testing-strategy.template.md) and enforce the agreed minimum in the [Definition of Done](../templates/definition-of-done.template.md).

## Select tests from risks

For every important behavior, ask:

1. What failure would matter to a user, operator, or business?
2. Which boundary is most likely to fail?
3. What is the cheapest deterministic test that detects it accurately?
4. What remaining risk needs a higher-level test?

A useful suite normally has many fast focused tests, enough integration tests to cover real boundaries, and a small number of high-value end-to-end journeys. This is a heuristic, not a fixed pyramid or ratio.

### Test-type decision guide

| Test type | Best evidence | Consider when | Costs and cautions |
| --- | --- | --- | --- |
| Unit | Pure rule, state transition, calculation, parser | Logic has meaningful branches or edge cases | Can lock in implementation if tests assert private calls rather than outcomes. |
| Integration | Code works with a real database, broker, filesystem, or external protocol adapter | Boundaries, transactions, queries, serialization, or configuration matter | Slower setup and cleanup; use realistic infrastructure where feasible. |
| Contract | Producer and consumer agree on requests, responses, schemas, or events | Teams deploy independently or an external/public contract exists | Version and fixture governance; does not prove full business behavior. |
| Component | A UI component renders and interacts accessibly | Frontend states and user interaction are important | Mocking every child or DOM detail makes tests brittle. |
| End-to-end | A complete user journey works in a deployed-like system | A few critical flows cross many layers | Slow and failure diagnosis can be hard; keep scope small and data controlled. |
| Migration | Existing data/schema can move forward safely | Persistence and migrations exist | Needs representative volume/shapes; rollback may not be reversible. |
| Security | A control rejects misuse and unsafe access | Authentication, authorization, uploads, tenants, or sensitive data exist | Scanners alone miss business authorization; specialist testing may still be needed. |
| Performance | Latency, throughput, resource use, or concurrency meet a target | There is an SLO, capacity risk, or measured regression | Requires realistic workload/environment and costs operational time. |

Do not duplicate the same assertion at every level. Use a focused test for combinations and one higher-level test to prove wiring.

## Mandatory high-risk rules

Where present, these behaviors deserve direct automated coverage:

- **authorization:** allowed and denied actors, resource ownership, role changes, and privilege escalation;
- **state transitions:** valid transitions, prohibited transitions, terminal states, and concurrent attempts;
- **calculations:** boundaries, rounding, currency/unit rules, taxes, discounts, and overflow;
- **invariants:** uniqueness, date ordering, quantity limits, and atomic multi-record effects;
- **data isolation:** cross-tenant reads/writes, cache keys, search, jobs, exports, and administrative paths;
- **idempotency:** same key/same request, same key/different request, concurrent duplicates, and expiry;
- **critical integrations:** success, timeout, malformed response, authentication failure, retry, and duplicate callback.

These are **Essential when the rule exists**. A CRUD field with no meaningful branch does not need a ceremonial unit test merely to increase coverage.

## Test behavior, not implementation

Prefer assertions about public output, state, events, accessibility semantics, or persisted effects. Avoid asserting internal call order unless order is part of correctness. Refactoring should not require rewriting tests that still describe the same behavior.

Good test names state scenario and expected outcome:

```text
rejects approval when the invoice is already cancelled
does not expose records from another tenant
returns the original result when an idempotency key is retried
```

Coverage reports can reveal untested areas but cannot measure assertion quality, missing requirements, or risk. Use coverage as a diagnostic signal; never weaken assertions or test trivial getters to meet a target.

## Test doubles and data

Use the least powerful double that communicates the test boundary:

| Term | Meaning | Appropriate use | Common failure |
| --- | --- | --- | --- |
| Stub | Returns predefined values | Force a specific dependency response or error | Stubs diverge from the real contract. |
| Fake | Working lightweight implementation | In-memory clock, store, mail sink, or local server | Different semantics hide database/network defects. |
| Mock | Verifies expected interaction | Side effects whose call is the behavior, such as emitting a notification | Over-specifies private collaboration and makes refactors painful. |
| Fixture | Reusable input or environment state | Clear representative records and payloads | Giant shared fixtures hide relevant setup and create coupling. |

Inject time, randomness, and identifiers when determinism matters. Do not mock the unit under test, the schema validator whose behavior matters, or every ORM call in a way that reimplements the query in test code.

For external APIs, combine:

- focused adapter tests against recorded or synthetic protocol responses;
- provider/consumer contract tests when ownership supports them;
- a limited sandbox or smoke test if the provider offers a stable environment.

Never send real secrets or personal production data to a test environment.

## Unit and domain tests

Unit tests are most valuable for dense decision logic. Cover equivalence classes and boundaries rather than every line. Tables or parameterized cases work well for permissions, calculations, and state machines.

Property-based testing is **Advanced** but useful for parsers, serialization, and mathematical invariants where broad generated input can reveal edge cases. Its generators and failure shrinking need maintenance; use examples when the space is simple.

## Integration and persistence tests

Prefer the actual database engine and meaningful constraints for repository/query behavior. An in-memory substitute can differ in transactions, collation, SQL, and isolation.

Integration tests should cover:

- schema mappings and constraints;
- transaction rollback and concurrent conflicts;
- important queries, tenant filters, and ordering;
- serialization and error mapping;
- migration compatibility;
- integration timeout and retry policy.

Isolate test data per test or worker. Make cleanup deterministic and diagnose leaked state rather than hiding it with retries.

## API and event contract tests

Validate requests and responses against the authoritative schema. Include error shapes, status codes, required headers, backward-compatible evolution, and generated-client compilation where used. Event contracts also need topic/type, schema, semantics, ordering assumptions, idempotency key, and evolution rules.

Contract tests show that shapes agree; they do not prove authorization or business correctness. See [API design](07-api-design.md).

## Frontend component and end-to-end tests

Component tests should interact as users do: by accessible role, label, text, keyboard, and pointer. Cover loading, empty, error, disabled/pending, and success states. Avoid selectors tied to incidental markup.

Use end-to-end tests for a small set of flows such as sign-in, a critical transaction, permission enforcement, or recovery from a failed dependency. Make test accounts and data setup explicit. A test that depends on execution order or a shared mutable account is not trustworthy.

See [frontend architecture](09-frontend-architecture.md) and the [design system guide](10-design-system.md).

## Migration tests

For each consequential migration:

1. start from the previous supported schema and representative data;
2. apply the migration;
3. verify constraints, transformed values, application compatibility, and indexes;
4. measure runtime/locking on realistic volume when relevant;
5. exercise roll-forward or the documented recovery path;
6. confirm the old/new application coexistence required by deployment.

Do not claim rollback support if the transformation discards information. See [data and persistence](08-data-and-persistence.md).

## Security and performance tests

Security tests are **Conditional on the surface** and include authorization matrices, cross-tenant attempts, injection payloads at risky interpreters, session behavior, upload validation, and dependency/static analysis. Automated scans supplement, but do not replace, threat-specific review or specialist assessment. See [security](11-security.md).

Performance tests require a question and target: for example, “p95 create-order latency stays below the selected SLO at 100 requests/second with the expected dataset.” Record workload, environment, data size, warm-up, percentile, error rate, and resource use. Microbenchmarks do not predict system capacity.

## Flaky tests

A flaky test is a defect. Record and fix its cause: uncontrolled time, randomness, asynchronous completion, shared state, environment capacity, or real race. Quarantine only with an owner and deadline; do not add broad retries that turn failures into false passes.

Test retries may be acceptable for diagnosing unstable infrastructure, but the first failure must remain visible.

## CI feedback and ownership

- run fast deterministic checks on every change;
- place slower integration/security/performance suites at a cadence matching risk;
- fail on test failures rather than silently continuing;
- keep failure output actionable and artifacts available;
- assign ownership for broken or slow suites;
- update tests with behavior and contract changes;
- delete tests that no longer protect a relevant behavior.

Delivery gates are detailed in [DevOps and delivery](14-devops-and-delivery.md).

## Strategy checklist

- [ ] Are critical behaviors and failure impacts identified?
- [ ] Is each test at the cheapest reliable level?
- [ ] Are authorization, transitions, calculations, invariants, isolation, idempotency, and critical integrations covered where present?
- [ ] Do assertions target behavior rather than private implementation?
- [ ] Are doubles used deliberately and checked against real contracts?
- [ ] Are database and migration tests realistic enough for their claims?
- [ ] Are only high-value journeys covered end to end?
- [ ] Do security/performance tests answer explicit risks and targets?
- [ ] Is test data isolated, safe, and deterministic?
- [ ] Are flaky tests investigated with owners rather than hidden by retries?
