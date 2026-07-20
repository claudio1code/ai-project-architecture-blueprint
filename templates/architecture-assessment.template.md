# Initial Architecture Assessment

> Purpose: turn project evidence into an intentionally small starting architecture. This is a recommendation, not a scoring competition. Complete the adopted project's context document first and revisit this assessment when a listed trigger occurs.

## Assessment record

| Field | Value |
| --- | --- |
| Project and horizon | `{name; prototype/MVP/current release/12 months}` |
| Assessors | `{names and roles}` |
| Date | `YYYY-MM-DD` |
| Evidence reviewed | `{context, metrics, contracts, regulations, experiments}` |
| Confidence | `Low / Medium / High — {why}` |

## Contextual classification

Rate each dimension independently as `None`, `Low`, `Moderate`, `High`, or `Critical`. Do not total the ratings: interactions matter more than a sum. Include evidence and uncertainty.

| Dimension | Rating or value | Evidence and implication |
| --- | --- | --- |
| Estimated users and concurrency | `{...}` | `{volume, peak, confidence}` |
| System criticality | `{...}` | `{harm caused by failure}` |
| Data sensitivity | `{...}` | `{classification and exposure impact}` |
| Domain complexity | `{...}` | `{invariants, states, policies, vocabulary}` |
| Number of integrations | `{...}` | `{ownership and reliability}` |
| Development team size | `{...}` | `{parallel work and coordination}` |
| Growth expectation | `{...}` | `{evidence and time horizon}` |
| Availability need | `{...}` | `{operating window and objective}` |
| Audit requirements | `{...}` | `{events, consumers, retention}` |
| Regulatory requirements | `{...}` | `{regime and accountable reviewer}` |
| Processing model | `Synchronous / Asynchronous / Mixed` | `{latency, durability, ordering}` |
| Audience | `Internal / Public / Partner / Mixed` | `{trust boundary and accessibility}` |
| Frontend need | `None / Static / Interactive / Multiple` | `{owned clients}` |
| Persistence need | `None / Local / Shared / Multiple stores` | `{data lifecycle}` |
| Organizations served | `One / Multiple` | `{organizational boundaries}` |
| Tenant isolation need | `None / Logical / Strong / Regulatory` | `{threat and contractual needs}` |
| Expected change frequency | `{...}` | `{areas and cadence}` |
| Downtime tolerance | `{duration}` | `{business consequence}` |
| Data-loss tolerance | `{RPO or explicit best effort}` | `{business consequence}` |

### Interaction notes

Record combinations that change the recommendation. Examples: low traffic plus highly sensitive data still requires strong security; a small team plus 24x7 operation argues against distributed deployment; frequent policy changes plus many invariants may justify richer domain boundaries.

- `{dimension + dimension → implication}`

## Domain complexity

- **Core business decisions:** `{rules the software must make}`
- **Invariants:** `{conditions that must always hold}`
- **States and transitions:** `{simple CRUD or meaningful lifecycle}`
- **Vocabulary ambiguity:** `{terms with different meanings}`
- **Policy change rate:** `{frequency and source}`
- **Assessment:** `Simple data workflow / Moderate behavior / Complex domain`
- **Modeling depth justified now:** `{transaction script, focused domain model, richer domain model}`

## Criticality and top risks

| Risk scenario | Likelihood | Impact | Current control | Required treatment | Owner |
| --- | --- | --- | --- | --- | --- |
| `{event → consequence}` | `Low / Medium / High` | `Low / Medium / High / Critical` | `{control or none}` | `Avoid / Reduce / Transfer / Accept` | `{owner}` |

## Practice disposition

Use exactly one label per practice:

- `Essential`: recommended now for practically any project with this context; omission needs an explicit rationale and, where relevant, a compensating control.
- `Conditional`: adopt only if the stated condition becomes true.
- `Advanced`: justified only by evidence and additional operational capacity.
- `Not applicable`: remove from active project guidance.

Classify independent choices independently. The groups below are a review surface, not a mandate to adopt every item; retain the rationale for `Not applicable` choices that could otherwise surprise a maintainer.

### Delivery and test feedback

| Practice | Disposition | Contextual reason | Cost accepted | Adoption or review trigger |
| --- | --- | --- | --- | --- |
| Version control and reviewable changes | `{label}` | `{evidence}` | `{cost}` | `{trigger}` |
| Automated formatting | `{label}` | `{consistency evidence}` | `{tooling cost}` | `{trigger}` |
| Automated lint/static analysis | `{label}` | `{defect risk}` | `{tooling/noise}` | `{trigger}` |
| Automated type checking | `{label}` | `{technology/defect risk}` | `{tooling/annotation cost}` | `{trigger}` |
| Unit tests | `{label}` | `{rule/algorithm risk}` | `{runtime/maintenance}` | `{trigger}` |
| Integration tests | `{label}` | `{boundary risk}` | `{runtime/environment}` | `{trigger}` |
| Contract tests | `{label}` | `{consumer/provider risk}` | `{contract maintenance}` | `{trigger}` |
| Component tests | `{label}` | `{UI/module risk}` | `{runtime/fixtures}` | `{trigger}` |
| End-to-end tests | `{label}` | `{critical journey risk}` | `{runtime/flakiness}` | `{trigger}` |
| Migration tests | `{label}` | `{existing data risk}` | `{representative environment}` | `{trigger}` |
| Security tests | `{label}` | `{threat/control risk}` | `{tooling/review}` | `{trigger}` |
| Performance tests | `{label}` | `{capacity/latency risk}` | `{environment/workload}` | `{trigger}` |

### Architecture structure

| Practice | Disposition | Contextual reason | Cost accepted | Adoption or review trigger |
| --- | --- | --- | --- | --- |
| Simple layered structure | `{label}` | `{navigation/responsibility need}` | `{layer hopping}` | `{trigger}` |
| Feature-based architecture | `{label}` | `{change locality need}` | `{shared-boundary discipline}` | `{trigger}` |
| Modular monolith | `{label}` | `{boundary/ownership evidence}` | `{module governance}` | `{trigger}` |
| Clean Architecture | `{label}` | `{policy protection evidence}` | `{mapping/indirection}` | `{trigger}` |
| Hexagonal architecture | `{label}` | `{adapter volatility/evidence}` | `{ports/mapping}` | `{trigger}` |
| Rich domain modeling/DDD | `{label}` | `{domain evidence}` | `{discovery/modeling}` | `{trigger}` |
| Microservices | `{label}` | `{independent operation evidence}` | `{distributed systems/operations}` | `{trigger}` |
| Event-driven architecture | `{label}` | `{temporal decoupling evidence}` | `{consistency/evolution/debugging}` | `{trigger}` |
| CQRS | `{label}` | `{read/write divergence evidence}` | `{models/projections}` | `{trigger}` |
| Event Sourcing | `{label}` | `{authoritative history evidence}` | `{event compatibility/replay}` | `{trigger}` |

### Capabilities and operational practices

| Practice | Disposition | Contextual reason | Cost accepted | Adoption or review trigger |
| --- | --- | --- | --- | --- |
| Authentication | `{label}` | `{identity/trust need}` | `{identity lifecycle}` | `{trigger}` |
| Authorization | `{label}` | `{protected resource/action need}` | `{policy/testing}` | `{trigger}` |
| Relational or other persistence | `{label}` | `{data lifecycle need}` | `{operation/migrations}` | `{trigger}` |
| Queues/background processing | `{label}` | `{durability/latency need}` | `{retries/operations}` | `{trigger}` |
| Cache | `{label}` | `{measured bottleneck}` | `{invalidation/consistency}` | `{trigger}` |
| API Gateway | `{label}` | `{shared edge need}` | `{hop/configuration/operation}` | `{trigger}` |
| Backend for Frontend | `{label}` | `{client-specific need}` | `{deployable/orchestration}` | `{trigger}` |
| Real-time communication | `{label}` | `{latency/freshness need}` | `{connections/ordering}` | `{trigger}` |
| Multi-tenancy | `{label}` | `{organization/isolation need}` | `{pervasive scoping/operation}` | `{trigger}` |
| Design System | `{label}` | `{product/channel consistency need}` | `{ownership/versioning}` | `{trigger}` |
| Structured logs and basic health signals | `{label}` | `{operating need}` | `{instrumentation/retention}` | `{trigger}` |
| Advanced observability | `{label}` | `{criticality/distribution}` | `{metrics/tracing/SLO operation}` | `{trigger}` |
| Containers | `{label}` | `{packaging/runtime need}` | `{image lifecycle}` | `{trigger}` |
| Workload orchestration | `{label}` | `{scheduling/platform need}` | `{platform operation}` | `{trigger}` |

## Recommended initial architecture

- **Style:** `{simple layers, feature-based, modular monolith, etc.}`
- **Deployable units:** `{number and ownership}`
- **Primary boundaries:** `{features/domains/adapters}`
- **Dependency direction:** `{plain-language rule}`
- **Data ownership:** `{store and authoritative writer}`
- **Communication:** `{in-process, HTTP, queue; why}`
- **Minimum operational controls:** `{health, logs, backup, rollback as applicable}`
- **Smallest vertical slice:** `{behavior that validates the risky assumptions}`

### Justification

`{Connect the recommendation to contextual evidence. State why a simpler option is insufficient and why a more complex option is premature.}`

## Alternatives considered

| Alternative | Benefit | Cost/risk | Why not now | Reconsider when |
| --- | --- | --- | --- | --- |
| `{option}` | `{benefit}` | `{cost}` | `{evidence}` | `{signal}` |

## Evolution signals

Use measurable signals rather than planned dates alone.

| Signal | Evidence source | Threshold or pattern | Candidate response—not automatic action |
| --- | --- | --- | --- |
| `{e.g., p95 latency under representative load}` | `{dashboard/test}` | `{threshold over period}` | `{profile, optimize, cache, etc.}` |

## Reassessment triggers

- `{new regulation, ten-fold volume, new tenant class, team split, availability target, repeated incident, etc.}`

## Consciously accepted technical debt

| Debt | Benefit now | Consequence | Guardrail | Owner | Review trigger |
| --- | --- | --- | --- | --- | --- |
| `{specific compromise}` | `{time/risk reduced}` | `{future cost}` | `{limit/test/monitor}` | `{owner}` | `{date/signal}` |

## Outcome

- **Status:** `Proposed / Accepted / Needs evidence`
- **Approvers:** `{accountable roles}`
- **Related ADRs:** `{relative links or None}`
- **Next review:** `{date or trigger}`
