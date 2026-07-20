# Technology Stack Decision

> Select technology after understanding constraints. Familiar, supported technology is usually preferable to a theoretically ideal tool with no owner. Use the adopted project's ADR process for choices that are costly to reverse.

## Decision scope

- **Capability needed:** `{problem to solve}`
- **Decision owner:** `{person/team}`
- **Decision deadline:** `YYYY-MM-DD`
- **Expected lifetime:** `{experiment, project lifetime, replaceable component}`
- **Applicability:** `Essential / Conditional / Advanced`

## Drivers and constraints

Rank only drivers that materially distinguish options.

| Driver | Weight | Measurable requirement or constraint |
| --- | --- | --- |
| `{security, ecosystem fit, latency, operability, cost, etc.}` | `1–5` | `{evidence}` |

## Existing ecosystem

- **Supported languages/runtimes:** `{...}`
- **Team experience and learning capacity:** `{...}`
- **Approved platforms/vendors:** `{...}`
- **Interoperability and public contracts:** `{...}`
- **License, privacy, residency, or procurement limits:** `{...}`
- **Build, deploy, and support ownership:** `{...}`

## Options

Score only as a discussion aid; a weighted total does not override a critical constraint.

| Option | Evidence/prototype | Driver fit | Operational cost | Lock-in/exit | Security/maintenance | Result |
| --- | --- | --- | --- | --- | --- | --- |
| `{option}` | `{benchmark/docs/spike}` | `{summary}` | `{people/money/complexity}` | `{migration path}` | `{update/support posture}` | `Select / Reject / Investigate` |

## Selected stack

| Concern | Selection and version policy | Why it is needed | Owner | Replacement/review trigger |
| --- | --- | --- | --- | --- |
| Language/runtime | `{selection}` | `{reason}` | `{owner}` | `{trigger}` |
| UI/client | `{selection or N/A}` | `{reason}` | `{owner}` | `{trigger}` |
| Server/API | `{selection or N/A}` | `{reason}` | `{owner}` | `{trigger}` |
| Data store | `{selection or N/A}` | `{reason}` | `{owner}` | `{trigger}` |
| Async processing | `{selection or N/A}` | `{reason}` | `{owner}` | `{trigger}` |
| Build/package tooling | `{selection}` | `{reason}` | `{owner}` | `{trigger}` |
| Test tooling | `{selection}` | `{risk covered}` | `{owner}` | `{trigger}` |
| Delivery/hosting | `{selection or N/A}` | `{reason}` | `{owner}` | `{trigger}` |
| Observability | `{selection or N/A}` | `{reason}` | `{owner}` | `{trigger}` |

## Dependency policy

- Pinning and lockfile policy: `{...}`
- Supported version window and upgrade cadence: `{...}`
- Vulnerability and end-of-life response: `{...}`
- Criteria for adding a dependency instead of local code: `{...}`
- License review process: `{...}`
- Removal/exit plan for critical dependencies: `{...}`

## Validation

- [ ] A representative vertical slice proved the riskiest integration.
- [ ] Build, test, deploy, update, and rollback paths are understood.
- [ ] A named team can operate and maintain every selected component.
- [ ] Rejected simpler alternatives have evidence-based reasons.
- [ ] No technology was selected only for hypothetical scale or popularity.

## Decision summary

`{Selection, consequences, assumptions, unresolved risks, and links to ADRs.}`
