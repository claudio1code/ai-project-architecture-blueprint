# Feature Start Checklist

Before implementation:

- [ ] The problem, actor, outcome, acceptance criteria, and explicit non-goals are clear.
- [ ] Current behavior was inspected in code, tests, UI, contracts, and data as applicable.
- [ ] Existing components, functions, types, schemas, services, and patterns were searched.
- [ ] The authoritative source of each affected business rule is identified.
- [ ] Public contract and backward-compatibility impact is known.
- [ ] Data model, migration, retention, concurrency, and tenant impact is known.
- [ ] Authentication, resource-level authorization, abuse, and privacy impact is known.
- [ ] Loading, empty, error, state-transition, timeout, retry, and duplicate behavior is specified where relevant.
- [ ] Tests are chosen by risk, including negative and failure paths.
- [ ] Delivery, observability, audit, rollback, documentation, and measurement are addressed or explicitly `N/A`.
- [ ] The proposed change is the smallest coherent vertical slice.

Use the [feature specification](../templates/feature-specification.template.md) when the behavior cannot be captured clearly in the task itself.
