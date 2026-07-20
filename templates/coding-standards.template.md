# Coding Standards

> Keep only rules the project can explain and preferably enforce. Reference formatter, linter, compiler, and framework configuration as the executable source of truth; do not duplicate their complete rule sets here.

## Scope and authority

- **Languages and generated code covered:** `{...}`
- **Configuration sources:** `{relative links}`
- **Owners:** `{team}`
- **Exception process:** `{scope, reason, approver, review date}`

## Automated baseline

| Check | Command | Runs locally | Runs in CI | Failure policy |
| --- | --- | --- | --- | --- |
| Format | `{command}` | `{when}` | `{yes/no}` | `{block/warn}` |
| Lint | `{command}` | `{when}` | `{yes/no}` | `{block/warn}` |
| Type check | `{command or N/A}` | `{when}` | `{yes/no}` | `{block/warn}` |
| Tests | `{command}` | `{scope}` | `{scope}` | `{block/warn}` |

## Naming and organization

- Name code after domain behavior, not implementation fashion: `{project examples}`.
- File/module naming: `{rule and example}`.
- Public type/function/component naming: `{rule and example}`.
- Test naming should describe condition and outcome: `{example}`.
- Organize primarily by `{feature/domain/technical type/hybrid}` because `{contextual reason}`.
- A file or module is extracted when `{cohesion/change/test boundary signal}`, not only after a line-count threshold.

## Functions, modules, and dependencies

- Keep one clear responsibility at the level where change reasons differ.
- Prefer composition to inheritance unless `{documented exception}`.
- Dependency direction: `{rule}`.
- Direct framework/ORM use is allowed when `{criteria}`; isolate it when `{volatility/test/domain criteria}`.
- Do not create pass-through layers, one-implementation interfaces, generic services, factories, or repositories without an identified boundary.
- Abstract duplicated knowledge only after the shared rule and its owner are clear.

## Types and data

- Strong typing policy: `{strictness and exceptions}`.
- Boundary data must be parsed/validated at `{entry points}`.
- Domain-valid states are represented by `{types/value objects/state transitions when justified}`.
- Null/optional/error conventions: `{...}`.
- Mutability policy: `{where immutable values help and where mutation is controlled}`.
- Date/time, money, identifiers, and locale conventions: `{...}`.

## Errors and resilience

- Expected domain failures: `{representation and mapping}`.
- Unexpected failures: `{capture, correlation, safe response}`.
- Retry only operations that are `{transient and safe/idempotent}`; policy: `{...}`.
- Never swallow errors or return fabricated success. Fallbacks for critical rules require `{explicit decision/monitoring}`.
- Fail fast at `{configuration/programmer-error boundary}` and handle recoverable external failures at `{boundary}`.

## Security and privacy

- Authorization enforcement: `{trusted location and resource checks}`.
- Secret handling: `{approved mechanism}`.
- Sensitive-data logging rules: `{redaction/prohibited fields}`.
- Input/output encoding, file upload, and dependency rules: `{relative security guidance}`.

## Logging and observability

- Structured log fields: `{timestamp, severity, event, correlation ID, safe identifiers}`.
- What must/must not be logged: `{...}`.
- Audit events are written to `{separate durable trail or N/A}`.
- Metrics/traces added when `{risk or diagnostic need}`.

## Tests

- Required tests by risk: `{link to testing strategy}`.
- Test doubles: `{where fakes/stubs/mocks are acceptable}`.
- Fixtures/builders: `{ownership and isolation rule}`.
- Flaky tests: `{quarantine is/is not allowed; repair ownership}`.

## Documentation

- Public contract and behavior documentation lives in `{source}`.
- Comments explain non-obvious reasons and constraints, not line-by-line behavior.
- Durable, costly-to-reverse choices require an ADR; routine choices do not.

## Project-specific examples

### Preferred

```text
{small representative example}
```

### Avoid

```text
{counterexample and the concrete problem it creates}
```
