# Feature Specification

> Describe observable behavior and the smallest coherent scope. Link to authoritative rules rather than copying them. Unknown behavior must remain an explicit question.

## Summary

- **Problem:** `{who cannot do what, with evidence}`
- **Desired outcome:** `{observable change}`
- **Owner:** `{product/engineering}`
- **Target/review date:** `{...}`
- **Related context/ADR:** `{relative links}`

## Scope

### Included

- `{behavior}`

### Excluded

- `{tempting adjacent behavior}`

## Actors and permissions

| Actor | Resource scope | Allowed action | Forbidden behavior |
| --- | --- | --- | --- |
| `{actor}` | `{own/tenant/all/etc.}` | `{action}` | `{negative case}` |

## Current behavior

`{What the system does now, based on code/tests/observation. Include existing components or contracts to reuse.}`

## Proposed behavior

Describe the primary flow and meaningful alternatives. For UI work include loading, empty, success, validation, error, and accessibility behavior. For jobs or APIs include timeout, duplicate, retry, and partial-failure behavior.

1. `{trigger}`
2. `{system behavior}`
3. `{observable outcome}`

## Rules and source of truth

| Rule | Authoritative source | Existing implementation/type/schema | Change required |
| --- | --- | --- | --- |
| `{rule}` | `{policy/contract/ADR}` | `{path or None}` | `{smallest change}` |

## Acceptance criteria

- `AC-001 — Given {context}, when {action}, then {observable result}.`
- `AC-002 — Given {invalid/unauthorized/failure context}, when {action}, then {safe result}.`

## States and errors

| Condition/state | User/consumer result | Stable error code | Recovery |
| --- | --- | --- | --- |
| `{condition}` | `{result}` | `{code or N/A}` | `{retry/correct/contact}` |

## Impact assessment

| Area | Impact or `Not applicable` with reason | Required action |
| --- | --- | --- |
| Frontend/accessibility | `{...}` | `{...}` |
| Backend/domain | `{...}` | `{...}` |
| API/public contract | `{...}` | `{...}` |
| Data/migration | `{...}` | `{...}` |
| Authorization/privacy | `{...}` | `{...}` |
| Async/integrations | `{...}` | `{...}` |
| Observability/audit | `{...}` | `{...}` |
| Deployment/rollback | `{...}` | `{...}` |

## Test evidence

| Risk/criterion | Test level | Evidence expected |
| --- | --- | --- |
| `{critical behavior}` | `{unit/integration/contract/component/E2E}` | `{assertion}` |

## Rollout and measurement

- Delivery strategy/feature flag: `{... or N/A}`
- Rollback/recovery: `{...}`
- Success and guardrail metrics: `{...}`
- Post-release owner/window: `{...}`

## Open questions and assumptions

| Type | Statement | Owner | Must resolve by / review trigger |
| --- | --- | --- | --- |
| `Question / Assumption` | `{...}` | `{...}` | `{...}` |
