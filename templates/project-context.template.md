# Project Context

> Purpose: authoritative summary of why the project exists and the constraints that shape it. Replace every `{...}` prompt, explicitly write `Unknown` with an owner when evidence is missing, and delete non-applicable sections. Review after material product or operating changes.

## Document control

| Field | Value |
| --- | --- |
| Owner | `{accountable person or team}` |
| Contributors | `{product, engineering, security, operations, legal}` |
| Status | `Draft / Accepted / Superseded` |
| Last reviewed | `YYYY-MM-DD` |
| Next review trigger | `{date or event}` |

## Business problem

- **Problem:** `{observable problem, not the proposed solution}`
- **Who experiences it:** `{users or organizations}`
- **Current workaround:** `{how the problem is handled today}`
- **Why now:** `{deadline, opportunity, risk, or evidence}`
- **Expected outcome:** `{change in behavior or result}`

## Users and stakeholders

| Group | Need or responsibility | Decision authority | Accessibility or support needs |
| --- | --- | --- | --- |
| `{user/stakeholder}` | `{need}` | `{what they approve}` | `{needs or N/A}` |

## Success criteria

Define measurable outcomes rather than delivery outputs.

| Outcome | Baseline | Target | Measurement window | Source |
| --- | --- | --- | --- | --- |
| `{outcome}` | `{current}` | `{target}` | `{period}` | `{analytics, audit, survey, etc.}` |

## Scope

### In scope

- `{capability or outcome included in the current horizon}`

### Out of scope

- `{explicit exclusion and, if useful, why}`

### Primary use cases

| Use case | Actor | Trigger | Successful result | Important failure behavior |
| --- | --- | --- | --- | --- |
| `{verb + object}` | `{actor}` | `{trigger}` | `{observable result}` | `{safe result}` |

## Requirements

### Functional requirements

- `FR-001 — {testable behavior}`

### Non-functional requirements

Express each quality requirement as a measurable scenario. “Fast,” “secure,” and “scalable” are not acceptance criteria.

| ID | Quality | Scenario and condition | Measure or threshold | Priority |
| --- | --- | --- | --- | --- |
| `NFR-001` | `{availability, latency, recovery, accessibility, etc.}` | `{when... the system...}` | `{number or verification}` | `Must / Should / Could` |

## Critical flows

| Flow | Why critical | Maximum interruption | Acceptable data loss | Recovery or fallback owner |
| --- | --- | --- | --- | --- |
| `{flow}` | `{business/safety impact}` | `{RTO expectation}` | `{RPO expectation}` | `{owner}` |

## Data

| Data category | Source | Sensitivity | Retention/deletion | Residency | Authoritative source |
| --- | --- | --- | --- | --- | --- |
| `{category}` | `{source}` | `Public / Internal / Confidential / Restricted` | `{policy}` | `{constraint or N/A}` | `{system}` |

- **Persistence needed:** `{yes/no and why}`
- **Estimated volume and growth:** `{records, bytes, events, rate}`
- **Privacy obligations:** `{LGPD/GDPR/contractual/none identified}`
- **Audit evidence required:** `{who did what, when, why, retention}`
- **Backup and restore expectation:** `{scope and verified recovery target}`

## Roles, permissions, and tenancy

| Role or actor | Resource | Allowed actions | Denied or constrained actions | Enforcement point |
| --- | --- | --- | --- | --- |
| `{role}` | `{resource/scope}` | `{actions}` | `{constraints}` | `{trusted backend/system}` |

- **Audience:** `Internal / Public / Partners / Mixed`
- **Organizations served:** `One / Multiple`
- **Tenant isolation:** `{none, logical, schema, database, account; justify}`
- **Privileged access process:** `{approval, expiry, review, logging}`

## Integrations

| System | Direction | Contract/owner | Authentication | Failure behavior | Data exchanged |
| --- | --- | --- | --- | --- | --- |
| `{system}` | `Inbound / Outbound / Both` | `{link/contact}` | `{method}` | `{retry, reject, degrade, manual recovery}` | `{classification}` |

State whether processing is synchronous, asynchronous, or mixed and why: `{decision or unknown}`.

## Scale and availability

- **Estimated users:** `{active, concurrent, peak}`
- **Request/job/event profile:** `{average, peak, burst, seasonality}`
- **Growth expectation:** `{time horizon and evidence}`
- **Availability window:** `{business hours, 24x7, scheduled use}`
- **Availability objective:** `{percentage or explicit best effort}`
- **Latency/throughput objectives:** `{user-visible and background}`
- **Tolerance to downtime:** `{duration and impact}`
- **Tolerance to data loss:** `{duration/records and impact}`

## Technology and environments

- **Existing stack or ecosystem constraints:** `{languages, runtimes, platforms, standards}`
- **Required environments:** `{local, test, staging, production, etc.}`
- **Hosting constraints:** `{on-premises, cloud, region, device, offline}`
- **Supported clients:** `{browser, OS, API consumer, terminal}`
- **Legacy or migration constraints:** `{compatibility and cutover}`

Do not select new technology here. Record evaluated choices in the adopted project's technology stack document and durable choices in its ADR index.

## Team and change profile

- **Developers and disciplines:** `{count, allocation, product/design/ops/security support}`
- **Ownership model:** `{who builds, reviews, deploys, operates}`
- **Relevant experience:** `{strengths and gaps}`
- **Expected change frequency:** `{daily, weekly, quarterly; areas likely to change}`
- **Parallel work:** `{number of streams and coordination needs}`
- **Support model:** `{hours, escalation, incident owner}`

## Constraints and assumptions

| Type | Statement | Evidence | Owner | Review trigger |
| --- | --- | --- | --- | --- |
| `Constraint / Assumption` | `{statement}` | `{source or unknown}` | `{owner}` | `{date/event}` |

## Risks

| Risk | Cause and consequence | Likelihood | Impact | Mitigation | Early signal | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| `{risk}` | `{because... may cause...}` | `Low / Medium / High` | `Low / Medium / High / Critical` | `{action}` | `{observable signal}` | `{owner}` |

## Pending decisions

| Decision | Why needed | Latest responsible date | Decision owner | Evidence required |
| --- | --- | --- | --- | --- |
| `{question}` | `{blocked outcome}` | `YYYY-MM-DD` | `{owner}` | `{experiment, metric, review}` |

## Glossary

| Term | Project-specific meaning |
| --- | --- |
| `{term}` | `{unambiguous definition}` |
