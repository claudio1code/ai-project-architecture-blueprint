# Project Architecture Overview

> This is the concise entry point for contributors and AI agents after the blueprint is adopted. It summarizes accepted choices; linked context, contracts, and ADRs remain authoritative. Keep it short and remove every non-applicable section.

## System purpose

`{One paragraph: users, problem, and critical outcome. Link to PROJECT_CONTEXT.md.}`

## Context profile

- **Selected profile(s):** `{link and deviations}`
- **Criticality / data sensitivity / domain complexity:** `{assessment summary}`
- **Primary constraints:** `{top three}`
- **Architecture assessment:** `{relative link}`

## System shape

```text
{Small text diagram showing people/systems, deployable units, data stores, and trust boundaries.}
```

| Unit/module | Responsibility | Owns data | Public contract | Owner |
| --- | --- | --- | --- | --- |
| `{name}` | `{cohesive responsibility}` | `{data or None}` | `{link or internal}` | `{team}` |

## Dependency and data rules

- `{which direction dependencies may flow}`
- `{single source of truth for important rules/data}`
- `{transaction, consistency, concurrency, and tenant boundary}`
- `{communication style and failure policy}`

## Adopted practices

| Practice | Applicability | Project-specific rule | Source |
| --- | --- | --- | --- |
| `{practice}` | `Essential / Conditional / Advanced` | `{active instruction}` | `{config/doc/ADR}` |

Practices classified `Not applicable` remain in the assessment, not in this active overview.

## Quality gates and operation

- **Local and CI validation:** `{commands and required result}`
- **Deployment and rollback:** `{summary/link}`
- **Security and privacy:** `{summary/link}`
- **Observability and support:** `{summary/link}`
- **Testing strategy:** `{relative link}`

## Decisions and evolution

- **ADR index:** `{relative link}`
- **Consciously accepted debt:** `{link}`
- **Current evolution signals:** `{measurable triggers}`
- **Next architecture review:** `{date or trigger}`

## Change rule

Update this overview in the same change that modifies a boundary, deployable unit, ownership rule, or active architectural practice. Record costly-to-reverse changes as ADRs.
