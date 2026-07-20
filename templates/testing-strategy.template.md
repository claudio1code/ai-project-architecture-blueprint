# Testing Strategy

> Design the smallest test portfolio that gives timely evidence about the project's most expensive failures. Optimize for behavior and confidence, not a coverage percentage alone.

## Context and risks

- **Critical behaviors:** `{authorization, calculations, transitions, isolation, etc.}`
- **Public contracts:** `{API/events/CLI/library/UI}`
- **External systems and unreliable boundaries:** `{...}`
- **Data/migration risks:** `{...}`
- **Performance and security risks:** `{...}`
- **Fast feedback target:** `{local and CI duration}`

## Test portfolio

| Test type | Applicability | Behavior/risk covered | Boundary and dependencies | Execution point | Owner |
| --- | --- | --- | --- | --- | --- |
| Unit | `{label}` | `{pure rule/algorithm}` | `{in process}` | `{local/CI}` | `{team}` |
| Integration | `{label}` | `{database/framework/provider boundary}` | `{real/fake dependency}` | `{local/CI}` | `{team}` |
| Contract | `{label}` | `{consumer/provider compatibility}` | `{schema/provider sandbox}` | `{CI/deploy}` | `{team}` |
| Component | `{label}` | `{UI/module behavior}` | `{rendered component/module}` | `{local/CI}` | `{team}` |
| End-to-end | `{label}` | `{few critical journeys}` | `{deployed system}` | `{CI/post-deploy}` | `{team}` |
| Migration | `{label}` | `{forward/backward/data preservation}` | `{representative database}` | `{CI/release}` | `{team}` |
| Security | `{label}` | `{authorization/abuse/dependency}` | `{appropriate environment}` | `{CI/scheduled}` | `{team}` |
| Performance | `{label}` | `{latency/throughput/resource target}` | `{representative workload}` | `{scheduled/release}` | `{team}` |

Use `Essential`, `Conditional`, `Advanced`, or `Not applicable` in the Applicability column and give a contextual reason.

## Mandatory rule coverage

For every applicable item, link the test or planned evidence:

- [ ] authorization and resource ownership;
- [ ] valid and forbidden state transitions;
- [ ] calculations, rounding, currency, and limits;
- [ ] domain and data invariants;
- [ ] tenant/user data isolation;
- [ ] idempotency, retry, and duplicate delivery;
- [ ] critical integration success, timeout, rejection, and recovery;
- [ ] migration of representative existing data.

## Test doubles and data

- **Stub:** use for controlled indirect input, such as a provider returning a specific response.
- **Fake:** use for a lightweight working boundary implementation when semantics remain faithful.
- **Mock/spy:** use sparingly to verify a meaningful interaction contract, not every internal call.
- **Fixture/builder:** create readable, minimal state; avoid one global fixture that couples unrelated tests.

Policy for this project: `{what may be doubled, what must be real, and why}`.

## Environments and isolation

- Test data ownership and cleanup: `{...}`
- Parallel execution/isolation: `{...}`
- Clock, randomness, network, and environment control: `{...}`
- Provider sandbox/contract version: `{...}`
- Secrets and personal data prohibition: `{...}`

## Quality gates

| Gate | Required suite | Time budget | Failure response |
| --- | --- | --- | --- |
| Pull request | `{...}` | `{...}` | `{block/quarantine policy}` |
| Main branch | `{...}` | `{...}` | `{...}` |
| Release/deploy | `{...}` | `{...}` | `{...}` |
| Scheduled | `{...}` | `{...}` | `{...}` |

## Maintenance signals

Track `{flakiness, duration, escaped defects, mutation score where useful, incident coverage}`. A flaky test remains a defect with an owner; retries must not conceal it.
