# Operational Instructions for AI Agents

This file guides agents changing a project that adopted this blueprint. Adapt paths and commands to the target repository. A request describes a desired outcome; it does not prove which implementation is correct.

## Determine the repository mode

- **Adopted project mode takes precedence:** use it when the repository contains an active project context/architecture overview or application/library implementation, even if a copied blueprint catalog is still present. Read the active overview first, then context, assessment, standards, and decisions when they constrain the task; treat any retained catalog as reference material only.
- **Blueprint source mode:** use it only when no adopted-project marker or application/library implementation exists and the root README identifies the repository itself as the reusable blueprint. Read `README.md` and `CONTRIBUTING.md`; preserve technology neutrality and contextual guidance. Keep the repository free of application runtime and infrastructure code. The only executable scope is the zero-dependency adoption CLI and validation tooling that installs or reads blueprint artifacts.

Do not infer an application's architecture from the catalog in blueprint source mode. The presence of a microservices guide, for example, is not a decision to use microservices.

Do not delete retained blueprint material unless the current task authorizes adoption cleanup. Instead, follow active project documents and report obsolete or conflicting guidance.

## Order of authority

When sources conflict, use this order and report the conflict:

1. non-negotiable legal, security, privacy, safety, and data-protection requirements;
2. approved observable behavior, acceptance criteria, and public contracts that comply with those requirements;
3. project context and accepted ADRs;
4. schemas, types, tests, and current implementation;
5. documented project conventions;
6. assumptions in the task request.

No requested or previously accepted behavior overrides the requirements in item 1. Do not use this order to preserve an evident defect. Record the evidence, impact, and decision required.

## Before making a change

The agent must:

1. in an adopted project, read the active architecture overview; in blueprint source mode, read `README.md` and `CONTRIBUTING.md`;
2. in an adopted project, read `PROJECT_CONTEXT.md` or its equivalent, the assessment, accepted ADRs, and relevant guidance when they constrain the task; in blueprint source mode, read the documents being changed and their linked owners;
3. inspect the existing implementation before proposing a solution;
4. locate related components, functions, types, schemas, services, tests, and patterns;
5. search for equivalent behavior and avoid duplication;
6. identify the single source of truth for the rule involved;
7. identify public contracts and compatibility constraints;
8. evaluate impact on frontend, backend, data, API, security, operations, and tests, marking absent areas as not applicable;
9. record assumptions that affect the result;
10. plan the smallest coherent, verifiable change.

When changing the adoption CLI in blueprint source mode, inspect `package.json`, `reference/catalog.json`, the adoption assets, and [Token-efficient adoption](docs/18-token-efficient-adoption.md). Preserve the pinned-version workflow, conservative file writes, managed `AGENTS.md` boundaries, zero runtime dependencies, and compact-by-default output. Run the Node test suite and exercise the affected CLI command.

If a required document is missing, do not invent its contents. Use repository evidence, state the gap, and continue only when an assumption is safe and reversible.

## Task execution protocol

```text
Analyze
→ Locate related implementation
→ Identify the rule and authoritative source
→ Assess impact
→ Plan the smallest coherent change
→ Implement
→ Test
→ Review the diff
→ Document
→ Report
```

### Analyze and locate

- Confirm current behavior through code, tests, contracts, and reproduction when available.
- Search before creating a file, module, component, helper, schema, service, or abstraction.
- Distinguish duplicated knowledge from merely similar implementations. Separate business rules must not be unified only because their code looks alike.
- Delimit affected files, flows, consumers, and data.

### Assess and plan

- Identify relevant failure modes, authorization, states, concurrency, compatibility, and rollback.
- Prefer a direct function when it expresses the full responsibility; add a layer only for a real responsibility or boundary.
- Preserve reasonable evolution paths without implementing hypothetical requirements.
- If a request introduces material technical debt, explain the cost and propose the smallest alternative that still meets the goal.

### Implement

- Keep changes small, cohesive, reviewable, and traceable.
- Reuse authoritative rules, tokens, types, schemas, and contracts.
- Respect existing lint, formatting, typing, style, and patterns.
- Validate untrusted input at boundaries and enforce authorization for protected operations on the trusted side of the system.
- Keep critical failures explicit and observable.

### Test and review

- Run focused validations first, followed by the suite proportional to the risk.
- Cover changed behavior, relevant error paths, and critical rules; do not optimize for a coverage number alone.
- Review the complete diff for accidental changes, secrets, sensitive data, dead code, and unintended generated files.
- Confirm that migrations, contracts, documentation, observability, and rollback were handled when applicable.

### Document and report

- Update any contract, context, decision, or instruction that no longer represents the system.
- In the final report, state the outcome, relevant files, validations run, assumptions, risks, and remaining work.
- Distinguish validations that passed from those unavailable or not run.

## Constraints

The agent must not:

- assume the request correctly describes the implementation needed;
- create a new application, module, component, or abstraction when an equivalent already exists;
- perform broad refactoring unrelated to the task;
- silently alter a public contract, persisted schema, or compatible behavior;
- introduce a dependency without need, maintenance analysis, and justification;
- remove or weaken validation merely to make tests pass;
- work around errors with fixed values or fabricated data;
- catch and ignore failures, conceal partial results, or create silent fallbacks for critical rules;
- invent requirements, permissions, states, or business behavior;
- place secrets, credentials, tokens, or personal data in code, tests, logs, or reports;
- declare completion when a required validation failed.

## Stop and communicate when

Ask for a decision before proceeding with a destructive or irreversible operation, a materially ambiguous requirement, a conflict with security or regulation, an incompatible public change without a migration strategy, or a change to an external system for which authority is missing.

Do not hide a pre-existing test failure. Isolate it when possible, show the evidence, and state whether it prevents validation of the change.

## Completion checklist

- [ ] Requested and previous behavior are understood.
- [ ] The authoritative source of every changed rule was preserved or updated.
- [ ] No avoidable knowledge duplication was introduced.
- [ ] Contracts, data, authorization, and compatibility were assessed.
- [ ] The smallest coherent change was implemented.
- [ ] Applicable tests and checks were run.
- [ ] The complete diff was reviewed.
- [ ] Documentation and ADRs were updated when necessary.
- [ ] Decisions, risks, assumptions, and remaining work were reported.

In blueprint source mode, also consult [AI-assisted development](docs/16-ai-assisted-development.md), [Token-efficient adoption](docs/18-token-efficient-adoption.md), the [feature start checklist](checklists/feature-start.md), and the [code review checklist](checklists/code-review.md). In an adopted project, replace these paths with the adopted equivalents or remove references that were not copied.
