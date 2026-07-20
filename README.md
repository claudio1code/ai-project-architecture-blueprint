# AI Project Architecture Blueprint

A reusable, technology-neutral set of decision guides, templates, profiles, examples, and checklists for projects built with assistance from AI agents such as Codex, Claude Code, and ChatGPT.

The blueprint helps a team choose the smallest architecture that fits its current context, make important decisions explicit, and give human and AI contributors a shared source of truth. It is not an application starter, a framework, or a catalog of patterns to adopt wholesale.

Version: **0.2.0**

All project artifacts are written in English so humans and AI agents consume one consistent vocabulary.

## What it solves

Projects assisted by AI often accumulate plausible but inconsistent decisions: duplicated rules, unnecessary layers, silently changed contracts, and patterns introduced without a problem to solve. This repository provides:

- a context assessment that goes beyond “small, medium, or large”;
- explicit criteria for selecting or rejecting architectural practices;
- starting profiles for different kinds of projects;
- a common vocabulary for engineering, security, testing, delivery, and operations;
- operational instructions that AI agents can follow before changing code;
- lightweight records for assumptions, exceptions, risks, and durable decisions.

## What it does not solve

This blueprint does not replace product discovery, experienced engineering judgment, threat modeling, legal or regulatory advice, accessibility review, production readiness exercises, or specialist security audits. It does not assume that a project needs a frontend, backend, database, cloud platform, Design System, DDD, Clean Architecture, microservices, messaging, or advanced observability.

It contains no application runtime or infrastructure. The only executable code is a scoped, zero-dependency Node.js CLI that installs and validates project-local architecture context; the blueprint does not generate application code.

## Applicability model

Every practice should receive one of these labels during assessment:

| Label | Meaning |
| --- | --- |
| `Essential` | Expected in almost any project of this context. |
| `Conditional` | Adopt only when the stated characteristic or risk exists. |
| `Advanced` | Adopt only when demonstrated complexity justifies its cost. |
| `Not applicable` | Remove from the target project's active guidance. |

These are recommendations, not absolute rules. Record why a conditional or advanced practice was selected and why an expected practice was intentionally omitted.

## Quick adoption

With Node.js 22 or later, initialize a compact active pack in an existing project without copying this repository:

```bash
npx --yes --ignore-scripts --package=github:claudio1code/ai-project-architecture-blueprint#v0.2.0 -- architecture-blueprint init --profile backend-api --target .
```

Replace `backend-api` with a profile listed by the `profiles` command. The pinned remote command becomes available only after the `v0.2.0` tag is published. Until then, or when remote execution is not acceptable, run `node bin/architecture-blueprint.mjs` from a reviewed local clone.

`init` creates a small set of active project documents, a manifest, and a delimited managed block in `AGENTS.md`. It does not copy the full reference catalog. Agents should always read the local architecture overview, load other local documents only when relevant, and request compact reference sections on demand. See [Token-efficient adoption](docs/18-token-efficient-adoption.md) for commands, safety limits, AI-tool integration, and the manual fallback.

## Starting workflow

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

### 1. Establish context

Use the [quick adoption](#quick-adoption) command, then read [how to use the blueprint](docs/00-how-to-use-this-blueprint.md) and complete the generated `PROJECT_CONTEXT.md`. Work with product, engineering, security, data, operational, and team stakeholders. Unknowns should be recorded as unknowns with an owner, not guessed. If the CLI cannot be used, copy and adapt the equivalent [project context template](templates/project-context.template.md) manually.

### 2. Classify the project

Use [project classification](docs/01-project-classification.md) and complete [the architecture assessment](templates/architecture-assessment.template.md). The result is a contextual risk profile across multiple dimensions, not a size label.

### 3. Select a starting profile

Choose the closest profile as a hypothesis, then adjust it using the assessment. A project may combine two profiles, but each imported recommendation still needs a reason.

| Profile | Suitable starting point |
| --- | --- |
| [Static frontend](profiles/static-frontend.md) | Content-first site with little or no client-side behavior |
| [Frontend application](profiles/frontend-application.md) | Browser application consuming external services |
| [Backend API](profiles/backend-api.md) | API or service without a first-party UI |
| [Full-stack application](profiles/fullstack-application.md) | UI, server behavior, and persistence owned together |
| [CLI application](profiles/cli-application.md) | Command-line product or developer tool |
| [Automation script](profiles/automation-script.md) | Focused scheduled or ad hoc automation |
| [Modular monolith](profiles/modular-monolith.md) | One deployable with meaningful domain boundaries |
| [SaaS application](profiles/saas-application.md) | Multi-customer product with isolation and operational concerns |
| [Distributed system](profiles/distributed-system.md) | Independently operated components with proven distribution needs |

Profiles are starting configurations, never automatic prescriptions. For example, the frontend profile does not imply a private database, and the automation profile deliberately excludes a Design System and microservices.

### 4. Record the initial choices

Fill these documents first:

1. [Project context](templates/project-context.template.md) — problem, scope, users, constraints, and success.
2. [Architecture assessment](templates/architecture-assessment.template.md) — contextual classification, risks, and applicable practices.
3. [Technology stack](templates/technology-stack.template.md) — only after requirements and constraints are visible.
4. [Testing strategy](templates/testing-strategy.template.md) and [Definition of Done](templates/definition-of-done.template.md) — minimum feedback and completion criteria.
5. [Architecture overview](templates/architecture-overview.template.md) — synthesize the accepted choices into the short, active map that contributors and agents should read first.

Use an [ADR](templates/adr.template.md) for a durable decision that is costly to reverse. Use the [feature specification](templates/feature-specification.template.md) for local behavior and acceptance criteria. Do not create ADRs for routine or easily reversible implementation choices.

One possible adopted layout is shown below. Follow the target project's conventions if it already has an equivalent location.

```text
.architecture-blueprint.json
AGENTS.md
PROJECT_CONTEXT.md
docs/
└── architecture/
    ├── overview.md
    ├── assessment.md
    ├── profile.md
    ├── technology-stack.md
    ├── testing-strategy.md
    ├── definition-of-done.md
    ├── decisions/
    └── features/          # only when a feature needs a written specification
```

### 5. Remove what does not apply

When configuring the active pack:

1. mark each candidate practice using the applicability model;
2. delete `Not applicable` sections and unused generated guidance from the target project;
3. keep only a short reason in the assessment when the omission could surprise a future maintainer;
4. replace placeholders with project evidence; never leave competing examples as active rules;
5. set a review trigger for conditional practices instead of implementing them “for later.”

The source blueprint remains comprehensive; the adopted project guidance should be narrow.

### 6. Validate with a vertical slice

Implement one small end-to-end behavior that exercises the relevant boundaries. Use it to test naming, dependency direction, data flow, error handling, security, test speed, and deployment assumptions. Adjust the documented structure before multiplying it across the project.

## Using the blueprint with AI agents

Let `init` add only its delimited block in the target repository's `AGENTS.md`; do not replace existing project instructions with this source repository's full file. Agents must treat project context, accepted ADRs, public contracts, schemas, and existing behavior as sources of truth. Before editing, they inspect the implementation and search for existing components, types, rules, and patterns. They implement the smallest coherent change, validate it, review the diff, and report assumptions and risks.

After adoption, give an agent the project's active architecture overview and only the guidance relevant to its task. Use `recommend` to route a task and `guide` for compact, complete source sections. Do not require every agent to ingest the entire reference blueprint: inactive patterns create noise and can encourage accidental overengineering. Not every AI product reads `AGENTS.md`; configure that product to import or point to the managed block while keeping one authoritative copy.

Provide agents with a scoped task and point them to the relevant context, assessment, feature specification, and ADRs. Do not ask an agent to “apply best practices” without constraints: that invites unnecessary abstraction.

## Exceptions and disagreements

An exception is valid when it is explicit and reviewable:

- record a local exception beside the relevant standard, including scope, reason, owner, and expiry or review trigger;
- record a structural or hard-to-reverse exception as an ADR;
- list consciously accepted debt in the architecture assessment;
- if a request conflicts with an accepted contract or decision, surface the conflict before implementation;
- never hide an exception in code by silently disabling validation, swallowing errors, or adding fixed fallback values.

## Repository map

- [`docs/`](docs/00-how-to-use-this-blueprint.md): decision guidance by concern, including the [backend architecture guide](docs/backend-architecture.md).
- [`templates/`](templates/project-context.template.md): files to copy and fill in a target project.
- [`profiles/`](profiles/frontend-application.md): differentiated initial configurations.
- [`examples/`](examples/small-project-assessment.md): completed assessments and an ADR.
- [`checklists/`](checklists/project-start.md): short workflow gates.
- [`adoption/`](adoption/agent-block.md): compact assets installed into an adopted project.
- [`reference/catalog.json`](reference/catalog.json): machine-readable profiles, topics, and task routes used by the CLI.
- [`bin/architecture-blueprint.mjs`](bin/architecture-blueprint.mjs): zero-dependency adoption and validation CLI.
- [`.github/workflows/validate.yml`](.github/workflows/validate.yml): Node.js 22/24 test and package validation.
- [CONTRIBUTING.md](CONTRIBUTING.md): editorial and contribution rules.
- [CHANGELOG.md](CHANGELOG.md): release history and versioning policy.

## Evolving the blueprint

Changes should start from observed project needs. Preserve technology neutrality, state trade-offs, add links to related guidance, and keep one owner document for each concept. Test new guidance against at least two contrasting profiles so it does not accidentally become universal.

The blueprint follows semantic versioning:

- **major**: incompatible changes to the adoption model, required template structure, or meaning of established guidance;
- **minor**: backward-compatible profiles, templates, decision criteria, or substantial guidance;
- **patch**: corrections, clearer wording, and link or formatting repairs without changed recommendations.

See [architecture review](docs/17-architecture-review.md) for periodic reassessment and [CONTRIBUTING.md](CONTRIBUTING.md) for the change process.

## License

Released under the [MIT License](LICENSE).
