# 00 — How to Use This Blueprint

This repository is a set of questions, templates, and decision criteria. It is not a complete architecture to apply wholesale. Its useful output for a concrete project is a small, explicit configuration: documented context, known risks, selected practices, justified decisions, and observable signals for reassessment.

## Applicability language

Assign every selected practice one of the following statuses. The status belongs to the project being assessed, not to the practice in the abstract.

| Status | Meaning in the current project | Expected action |
|---|---|---|
| `Essential` | Recommended for nearly any project with this context; its absence creates disproportionate risk | Adopt from the start, or record the reason and compensating control when omitting it |
| `Conditional` | It adds value only if an identified condition is present | Record the condition and activate the practice when it occurs |
| `Advanced` | It addresses proven complexity at a significant cost | Require a rationale, an owner, and a way to verify the benefit |
| `Not applicable` | It does not match the scope or operating model | Remove it from the copied material; do not keep a fictional requirement |

The same practice can change status. Distributed tracing is usually `Not applicable` for a static page, may be `Conditional` for a monolith with critical integrations, and may be `Essential` for a distributed workflow with strict availability objectives.

## Initial flow

```text
Understand the problem
→ Classify the project
→ Identify risks and constraints
→ Select applicable practices
→ Record decisions
→ Define the structure
→ Implement a small vertical slice
→ Validate the architecture
→ Evolve incrementally
```

Do not choose patterns before understanding behavior, data, users, and failure consequences. A stack familiar to the team is a valid decision force, but it is not a substitute for context.

## Adoption guide

Start with the compact active pack described in [Token-efficient adoption](18-token-efficient-adoption.md). With Node.js 22 or later and after the `v0.2.0` tag is published, initialize an existing project with the pinned command:

```bash
npx --yes --ignore-scripts --package=github:claudio1code/ai-project-architecture-blueprint#v0.2.0 -- architecture-blueprint init --profile backend-api --target .
```

Use `profiles` to list alternatives and `init --dry-run` to inspect the planned files. When remote execution is unavailable or unacceptable, run `node bin/architecture-blueprint.mjs` from a reviewed local clone. Manual template adoption remains possible, but do not copy the full catalog or this source repository's complete `AGENTS.md` into the target.

### 1. Record the context

Complete the generated `PROJECT_CONTEXT.md`, or copy and adapt [`project-context.template.md`](../templates/project-context.template.md) when using the manual fallback. Confirm the problem, users, scope, out-of-scope items, critical flows, data, integrations, constraints, and success criteria with the people responsible for the product and its operation.

Do not fill gaps as though they were facts. Mark assumptions, who will confirm them, and by when. Resolve an assumption before implementation if it changes security, a public contract, or the data model.

### 2. Classify the project in context

Use [Project classification](01-project-classification.md) and complete [`architecture-assessment.template.md`](../templates/architecture-assessment.template.md). Assess each dimension using evidence rather than reducing the conclusion to “small,” “medium,” or “large.” Ten users can depend on a highly critical system; millions of readers can access static content with little domain complexity.

### 3. Choose a profile as a starting point

Select the profile closest to the delivery shape: static or interactive frontend, API, full-stack application, CLI, automation, modular monolith, SaaS, or distributed system. A profile is an initial configuration, not a permanent identity.

When adapting a profile:

1. retain only confirmed characteristics;
2. reclassify practices based on actual risks;
3. add missing constraints;
4. record meaningful deviations;
5. discard recommendations whose conditions are absent.

If no profile fits, combine only the necessary parts and document that composition in the architecture assessment.

### 4. Select the smallest coherent architecture

Consult [Architecture selection](03-architecture-selection.md). Start with the option that meets current requirements with the lowest cognitive and operational cost. Explicitly compare it with at least one simpler alternative.

Tactical DDD, microservices, CQRS, and Event Sourcing require an observable problem, suitable team capability, and a verifiable benefit. Familiarity, fashion, or indefinite future growth is not sufficient evidence.

### 5. Define structure and conventions

Choose an organization in [Project structure](04-project-structure.md), record project-specific decisions in [Coding conventions](05-coding-conventions.md), and adapt [`coding-standards.template.md`](../templates/coding-standards.template.md). The structure should make boundaries and common changes easy to locate; it need not create a layer for every architectural term.

Use [Engineering principles](02-engineering-principles.md) as an analysis tool. Principles help explain trade-offs, but they do not replace evidence or justify abstractions without a use.

Draft the [`architecture-overview.template.md`](../templates/architecture-overview.template.md) once the initial structure is clear, then finalize it after selecting applicable topics and decisions below. Keep it as the concise, active map of system boundaries, ownership, dependency rules, quality gates, and adopted practices; link to context and ADRs instead of copying their rationale.

### 6. Select only applicable topic groups

Use specialized documents according to the assessment:

- API, data, frontend, Design System, and backend guidance only when those surfaces exist;
- security proportional to exposure, data, and consequences, while retaining basic controls;
- tests focused on relevant behavior and risk;
- observability and delivery aligned with the actual operating model;
- rich domain modeling only where rules, states, and invariants justify it.

For each group, identify what is `Essential`, `Conditional`, `Advanced`, or `Not applicable`. If an entire topic does not apply, remove it from the copied set instead of retaining empty sections.

### 7. Record decisions that must outlive the conversation

Use [`adr.template.md`](../templates/adr.template.md) for decisions with real alternatives, lasting consequences, impact on public contracts, or a high reversal cost. A local and easily reversible choice can remain in the code or pull request.

An exception to a convention should state:

- the affected rule or recommendation;
- why the context requires an exception;
- its scope and owner;
- accepted risks and compensating controls;
- an expiry date or review trigger.

Do not hide exceptions in incidental implementation details, and do not turn one exception into a general policy.

### 8. Implement a small vertical slice

Deliver one representative end-to-end flow that is small enough to discard or adjust. It should exercise the boundaries relevant to the project—for example authorization, persistence, and one contract—without anticipating hypothetical modules.

Validate whether:

- responsibilities are discoverable without tribal knowledge;
- an important rule has one clear authoritative source;
- important tests cross the selected boundaries;
- build, deployment, migration, and rollback fit the structure;
- the introduced cost is proportional to the problem.

### 9. Evolve in response to signals

Keep reassessment signals in the architecture assessment: recurring team conflicts, coupled deployments, availability objectives, volume growth, new regulation, divergent rules, or a change in tenancy. Review on material events rather than only on a calendar.

## Likely minimum by context

| Observed context | Likely starting set | Do not assume |
|---|---|---|
| Static page | short context, static profile, lint/build, accessibility, and a smoke test | backend, persistence, DDD, or advanced observability |
| Internal automation script | context, inputs/outputs, idempotency when repeated, logs, and transformation tests | layers, repository, frontend, or cloud infrastructure |
| Administrative full-stack application | complete context, contracts, authorization, data, integration tests, and reversible delivery | microservices or a complete Design System |
| Critical system with integrations | failure analysis, contracts, consistency, security, observability, and recovery | distributed architecture without demonstrated need |

These are starting points. Sensitive data or financial impact can raise the required controls for an otherwise small project.

## How AI agents should consume the blueprint

After adoption, an agent should read the local architecture overview, use project context and assessment to verify relevant constraints, and load only the guidance classified as applicable to its task. The CLI-managed block in root `AGENTS.md` encodes this loading policy without replacing project-owned instructions. Before proposing code, the agent should inspect the implementation and locate existing types, functions, components, schemas, contracts, and decisions.

Use `routes` to discover deterministic route IDs and `recommend <route>` to identify primary and conditional topics. Use `guide <topic>` for a compact set of complete source sections, `--outline` before selecting a section, and `--full` only when narrower context is insufficient. The default guide and architecture-overview budgets are approximately 1,600 tokens each; the conservative estimate is UTF-8 bytes divided by three and is not an exact model tokenizer count. Validate the adopted pack with `check`, then `check --strict` once its templates are complete.

Do not assume every AI product discovers `AGENTS.md` or applies the same precedence rules. Configure the product to read or reference the managed block while keeping one authoritative copy. See [Token-efficient adoption](18-token-efficient-adoption.md) for integration and supply-chain constraints.

In a task given to an agent, identify:

- expected behavior and acceptance criteria;
- applicable context and decision files;
- constraints and contracts that must remain stable;
- validation commands;
- unresolved assumptions.

Request a small, reviewable change. The result should separate discovered facts, assumptions, decisions, validations, and open issues. A user request is input to analysis, not proof that a new abstraction or module is needed.

## Adoption completion criteria

The blueprint is sufficiently configured when:

- context and classification contain evidence and explicit unknowns;
- applicable and removed practices are distinguishable;
- the initial architecture and a simpler alternative were compared;
- critical risks have controls or conscious acceptance;
- structure and conventions support the first slice;
- the active architecture overview points contributors to current sources of truth;
- a minimum test and delivery strategy exists;
- hard-to-reverse decisions are recorded;
- evolution signals and owners are known.
- the configured AI tools discover the active instructions and do not load the complete reference by default;
- the active pack passes `architecture-blueprint check --strict` with its agreed overview budget.

Completing every document is unnecessary. Material with no decision consequence adds noise and makes important instructions less likely to be read.

## Evolving an adopted blueprint

Update context when the product changes and revisit a decision when its forces no longer hold. Preserve ADR history; supersede a decision with a new record instead of rewriting the past. Changes to shared guidance should follow [`CONTRIBUTING.md`](../CONTRIBUTING.md) and the versioning described in [`CHANGELOG.md`](../CHANGELOG.md).
