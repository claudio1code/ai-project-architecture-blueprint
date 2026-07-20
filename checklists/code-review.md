# Code Review Checklist

Review the risk of the change, not the author's style preferences.

- [ ] Behavior matches acceptance criteria and handles meaningful failure paths.
- [ ] Names and control flow communicate intent without unnecessary sophistication.
- [ ] Shared code represents shared knowledge, not merely similar text.
- [ ] Responsibilities are cohesive and dependencies cross intentional boundaries.
- [ ] No pass-through layer, speculative interface, or unrelated refactor was added.
- [ ] Public contracts and persisted data remain compatible or have an approved migration.
- [ ] Boundary validation, authorization, tenant isolation, secrets, and sensitive logs are safe.
- [ ] Transactions, concurrency, idempotency, retries, and partial failure are correct where applicable.
- [ ] Tests cover important behavior and would fail for the relevant defect.
- [ ] Migrations, indexes, performance, and rollback are proportionate to risk.
- [ ] Failures are observable; technical logs are not confused with audit records.
- [ ] Documentation and ADRs reflect changed behavior or decisions.
- [ ] The diff contains no accidental files, credentials, dead code, or masked failure.
