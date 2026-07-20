# Definition of Done

> Apply criteria proportional to the change. Mark `N/A` with a reason; do not check an item that was not verified.

## Behavior

- [ ] Acceptance criteria and relevant failure behavior are demonstrated.
- [ ] The change uses the authoritative business rule and introduces no conflicting copy.
- [ ] Empty, loading, error, boundary, and concurrency states are handled when applicable.

## Contracts and data

- [ ] Public API, event, UI, CLI, or library compatibility is preserved or migration is approved.
- [ ] Schema/migration is forward-safe, tested, and has a rollback or recovery plan when applicable.
- [ ] Privacy, retention, tenant isolation, and audit impact are addressed when applicable.

## Quality and security

- [ ] Formatting, lint, type checks, build, and focused tests pass.
- [ ] Behavior and critical rules have tests proportional to risk.
- [ ] Authorization, input validation, secrets, sensitive logs, and dependency impact were reviewed.
- [ ] Accessibility and supported viewport/input behavior were checked for user interfaces.

## Delivery and operation

- [ ] Configuration, rollout, rollback, monitoring, and support notes are ready when applicable.
- [ ] New failure modes are observable without exposing sensitive data.
- [ ] Documentation, contracts, ADRs, and changelog are current.
- [ ] The final diff contains only intentional, reviewable changes.

## Evidence

| Check | Command, link, or observation | Result |
| --- | --- | --- |
| `{criterion}` | `{evidence}` | `Pass / N/A with reason / Blocked` |
