<!-- architecture-blueprint:start -->
## Architecture blueprint (managed)

Read `docs/architecture/overview.md` before changing the project. Load context, assessment, stack, tests, contracts, and accepted decisions only when they constrain the task. Project-local facts and approved decisions override generic blueprint guidance.

Use the pinned CLI prefix `npx --yes --ignore-scripts --package=github:claudio1code/ai-project-architecture-blueprint#v0.2.0 -- architecture-blueprint`. Run `routes` only when the route ID is unknown, then `recommend <route>`; request compact `guide <topic>` output only for affected topics. Use related topics conditionally and `--full` only when compact guidance is insufficient. Never scan the full reference by default.

Inspect current behavior and existing sources of truth before designing. Make the smallest coherent change, preserve contracts and data unless an approved migration exists, validate untrusted input at boundaries, enforce authorization for protected operations on the trusted side, and keep failures observable.

Test changed behavior and relevant failure paths in proportion to risk. Review the complete diff. Report outcomes, validation, assumptions, risks, and remaining work; disclose any check not run or not passed.
<!-- architecture-blueprint:end -->
