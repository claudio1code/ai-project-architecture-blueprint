# Example Assessment: Public Campaign Landing Page

This is a completed example of the [architecture assessment template](../templates/architecture-assessment.template.md). It demonstrates that a short-lived public project can still have material accessibility, privacy, and traffic concerns without needing application architecture.

## Decision summary

- **Selected profile:** [Static frontend](../profiles/static-frontend.md)
- **Contextual classification:** low domain and operational complexity; moderate public-exposure and delivery risk
- **Initial architecture:** statically generated site deployed to a CDN, with a serverless form provider as the only integration
- **Decision:** no custom backend, database, authentication, message broker, or full Design System
- **Review owner:** campaign technical lead

## Assessment record

| Field | Value |
| --- | --- |
| Project and horizon | Product campaign landing page; 12-week production lifetime |
| Assessors | Campaign technical lead, marketing owner, privacy reviewer |
| Date | 2026-07-20 |
| Evidence reviewed | Campaign forecast, approved page designs, form-provider contract, content calendar, privacy questionnaire |
| Confidence | High for scope and integration; moderate for launch traffic because the forecast has a 5× range |

## Context and classification

The company needs a public landing page for a 12-week product campaign. It contains six content sections, localized variants in English and Portuguese, and one lead form. Marketing edits copy twice per week. The lead provider receives the form and sends records to the existing CRM.

| Dimension | Assessed context | Architectural implication |
| --- | --- | --- |
| Estimated users | 50,000 visits/month; campaign peaks up to 5× baseline | CDN delivery, optimized assets, and load validation of the form path |
| Criticality | Low operational criticality; moderate commercial impact | Simple recovery, but monitor the CTA and form |
| Data sensitivity | Public content; name, work email, and company in the external form | Minimize fields, obtain required consent, and never log submissions in the browser |
| Domain complexity | Low: content, localization, and submission | No domain layer or tactical DDD |
| Integrations | One form provider and one consent/analytics tool | Small adapters/configuration; failure states visible to users |
| Development team | Two developers and one content editor | Low ceremony and a single repository |
| Growth expectation | Traffic spikes during launches; no feature-platform roadmap | Static delivery scales adequately; avoid speculative abstractions |
| Availability need | Target 99.5% during the campaign | Managed CDN and basic uptime check |
| Audit requirements | Deployment history only | Git history and provider deployment log are sufficient |
| Regulatory requirements | Privacy and cookie obligations may apply to lead collection | Legal text and consent configuration reviewed before release |
| Processing model | Page delivery is static; form submission is synchronous to the provider | No queue; show explicit success/failure and allow retry |
| Audience | Public internet | Security headers, dependency checks, and abuse protection on the form provider |
| Frontend need | Yes, responsive and accessible | Semantic HTML and progressive enhancement |
| Persistence need | No first-party persistence | The existing CRM/provider owns submitted records |
| Organizations | One organization operates the site | No tenant model |
| Customer isolation | Not applicable | Remove multi-tenancy sections from project documentation |
| Change frequency | Content twice weekly; code roughly every two weeks | Content separated from presentation, preview deployment per change |
| Downtime tolerance | Up to four hours outside launch windows | Provider status monitoring and an alternate contact path during outage |
| Data-loss tolerance | Static artifacts are reproducible; an acknowledged lead must not be silently lost | The provider owns durable submission; show success only after acknowledgement |

## Interaction notes

- Low domain complexity plus high public traffic favors static delivery, not a scalable application backend.
- Public exposure plus personal data in one form still requires privacy and security controls.
- A two-person team plus a short lifetime makes a custom CMS or multi-service runtime a support risk.

## Domain complexity

- **Core business decisions:** none; the site selects localized content and validates form shape.
- **Invariants:** every published locale has approved legal text; a submission is never shown as successful before provider acknowledgement.
- **States and transitions:** form `idle → invalid/submitting → success/error`; no persisted business lifecycle.
- **Vocabulary ambiguity:** “conversion” means provider-acknowledged lead, not a button click.
- **Policy change rate:** campaign copy twice weekly; privacy fields change only through reviewer approval.
- **Assessment:** simple data workflow.
- **Modeling depth justified now:** presentation components and a focused form adapter; no domain model.

## Risks and constraints

| Risk scenario | Likelihood | Impact | Current control | Treatment | Owner |
| --- | --- | --- | --- | --- | --- |
| Third-party script collects before consent or breaks the budget | Medium | High | Approved script list | Block by consent category and enforce CSP/performance checks | Technical lead |
| Provider failure is displayed as form success | Low | High | None in prototype | Test acknowledgement semantics and provide explicit error/retry | Frontend developer |
| Editorial change breaks layout or links near launch | Medium | Medium | Preview deployment | Automated checks plus marketing preview approval | Marketing owner |
| Public artifact contains a secret or unintended data | Low | High | Repository review | Secret scan and artifact inspection in CI | Technical lead |
| One locale ships stale metadata or legal text | Medium | Medium | Content checklist | Locale completeness test and privacy approval | Content editor |

Constraints are a ten-business-day delivery window, no new production account beyond approved providers, and support for current evergreen browsers plus the company's agreed mobile baseline.

## Practice selection

| Practice | Disposition | Contextual reason and accepted cost | Adoption or review trigger |
| --- | --- | --- | --- |
| Version control and reviewable changes | Essential | Provides publication history; one review per change | Always active |
| Automated formatting | Essential | Keeps the small codebase consistent; seconds of CI time | Always active |
| Lint/static analysis | Essential | Catches broken references and unsafe browser patterns cheaply | Always active |
| Type checking | Conditional | Useful only if the selected source/toolchain supports meaningful types | Typed source or schemas are selected |
| Unit tests | Conditional | Add for non-trivial form/content transformations | Logic branches exceed simple boundary validation |
| Component tests | Conditional | Useful when form or interaction states acquire independent behavior | A component has meaningful state branches |
| Integration tests | Essential | Protect provider acknowledgement semantics; sandbox maintenance is accepted | Always active for the form boundary |
| End-to-end tests | Essential | Protect the primary CTA and conversion journey; browser runtime is accepted | Always active for the main conversion path |
| Authentication | Not applicable | Public content and submission require no first-party identity | Private content or accounts appear |
| Authorization | Not applicable | There is no protected first-party resource or operation | A protected resource or administration flow appears |
| Persistence | Not applicable | No first-party state | The project must own submissions or sessions |
| Cache | Not applicable | CDN asset caching is delivery configuration, not an application cache | Dynamic origin becomes a measured bottleneck |
| Queue/background processing | Not applicable | One synchronous provider submission | First-party post-processing becomes slow or retryable |
| Rich domain modeling/DDD | Not applicable | No business decisions or persisted lifecycle | Stateful rules and invariants appear |
| Modular monolith | Not applicable | There is no application backend or multiple capabilities | A cohesive backend with several capabilities appears |
| Microservices | Not applicable | No independent workloads or service teams | Reassess only after a backend has proven independent needs |
| Event-driven architecture | Not applicable | No durable asynchronous workflow | Durable fan-out or delayed work appears |
| CQRS | Not applicable | No owned read/write model | Materially different read/write needs appear |
| Event Sourcing | Not applicable | No owned state or reconstruction need | A separate requirement makes event history authoritative |
| Design System | Conditional | Lightweight semantic tokens and three shared controls suffice | Multiple campaign products need governed reuse |
| Basic availability/form monitoring | Essential | Detects loss of the campaign's only conversion path | Always active during the campaign |
| Advanced observability | Not applicable | Uptime/form checks cover the risk | Several runtime components or stricter SLOs appear |
| Containers | Not applicable | Static host accepts build artifacts directly | Hosting introduces a container runtime requirement |
| Workload orchestration | Not applicable | There is no long-running workload | Several independently scheduled workloads appear |

## Recommended initial architecture

```text
src/
├── pages/
├── components/         # header, lead-form, legal-footer
├── content/            # localized campaign copy
├── styles/             # semantic tokens and page styles
└── assets/
public/
tests/
```

The build emits static HTML and versioned assets. The lead form posts directly to the approved provider using its public integration mechanism. Provider credentials, if any, must remain outside the bundle; needing a secret would trigger a small trusted server endpoint rather than embedding it.

- **Deployable units:** one static artifact.
- **Primary boundaries:** page content, presentation components, and external form adapter.
- **Dependency direction:** pages compose components; provider-specific behavior stays in the form adapter.
- **Data ownership:** no first-party store; the approved provider/CRM owns acknowledged leads.
- **Minimum operational controls:** uptime/form check, deploy log, prior artifact rollback, and provider status link.
- **Smallest vertical slice:** one localized page whose form validates, submits, reports failure, and is observable end to end.

## Minimum testing and delivery

- Production build, lint, relative-link check, and dependency scan in CI.
- Automated accessibility checks on both localized pages.
- Browser test for CTA navigation and form success, validation, and provider failure.
- Performance-budget check on mobile network settings.
- Responsive/manual review of approved breakpoints and consent behavior.
- Preview approval, atomic CDN release, and rollback to the prior artifact.

## Alternatives considered

1. **Hosted site builder:** faster content editing, but rejected because the approved platform could not meet the required localization and consent behavior within the campaign timeline.
2. **SPA:** rejected because client-side routing and hydration add cost without application state.
3. **Custom full-stack application:** rejected because there is no owned data, authorization, or business workflow.

## Evolution signals

| Signal | Evidence | Threshold or pattern | Candidate response |
| --- | --- | --- | --- |
| Content publication becomes a bottleneck | Change lead-time history | More than two urgent edits/week miss the target | Evaluate a managed CMS |
| Dynamic behavior grows | Feature inventory | Authentication, personalized pricing, or first-party state | Reassess as frontend/full-stack application |
| Integration surface expands | Architecture inventory | More than three runtime integrations | Add explicit adapters and reassess trusted backend needs |
| Traffic exceeds validation | CDN dashboard/load test | Forecast or observed peak exceeds validated peak by 2× | Re-run load/performance assessment |

## Reassessment triggers

Authenticated content, first-party lead storage, an editorial workflow beyond repository review, a new regulatory obligation, or provider incidents causing two missed launch windows all require a new assessment.

## Consciously accepted debt

| Debt | Benefit now | Consequence | Guardrail | Owner | Review trigger |
| --- | --- | --- | --- | --- | --- |
| Translations remain in repository files | Avoids CMS setup | Editors need developer-assisted publication | Preview and locale-completeness check | Marketing owner | More than two urgent edits/week |
| One form provider | No duplicate pipeline | Provider outage stops submissions | Alternate contact path and uptime check | Campaign technical lead | Two material outages during campaign |
| Visual regression covers only approved variants | Keeps test suite small | Unchecked widths rely on responsive rules | Manual device-width review before launch | Frontend developer | A width-specific production defect |

## Pending decisions

No architectural decision is pending. Legal approval of final consent copy and the marketing owner's launch schedule remain delivery approvals, not architecture choices.

## Outcome

- **Status:** Accepted
- **Approvers:** Campaign technical lead, marketing owner, privacy reviewer
- **Related ADRs:** None; the profile and assessment are sufficient for this reversible choice
- **Next review:** before launch and on any reassessment trigger above
