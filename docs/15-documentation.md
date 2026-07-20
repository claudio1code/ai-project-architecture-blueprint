# 15 — Documentation

## Purpose and applicability

Documentation preserves context that code alone cannot express: purpose, constraints, contracts, decisions, operations, and known risk. It should help a named reader make a decision or perform an action.

- **Essential:** project context, setup/use instructions, applicable architecture decisions, public contracts, and non-obvious operational or business constraints.
- **Conditional:** runbooks, diagrams, domain glossaries, onboarding guides, and published reference documentation when audiences need them.
- **Advanced:** automated documentation portals, executable specifications, or multi-product governance when scale warrants ownership and tooling.
- **Not applicable:** delete a document with no audience or decision rather than keeping a generic placeholder.

Documentation has maintenance cost. Prefer the smallest authoritative set that remains useful.

## Documentation map

Use the blueprint artifacts according to their responsibility:

| Artifact | Question answered | Update trigger |
| --- | --- | --- |
| [Project context](../templates/project-context.template.md) | Why does this project exist, for whom, and under which constraints? | Scope, stakeholders, risk, or non-functional requirements change. |
| [Architecture assessment](../templates/architecture-assessment.template.md) | Which practices apply now and why? | Classification or architecture signals change. |
| [Architecture overview](../templates/architecture-overview.template.md) | What is the concise, active read-first map of the system? | Boundaries, deployables, ownership, or applicable practices change. |
| [Technology stack](../templates/technology-stack.template.md) | Which technologies/versions are supported and why? | Adoption, replacement, or support policy changes. |
| [Coding standards](../templates/coding-standards.template.md) | Which local conventions cannot be inferred from tools/code? | Team conventions or automated rules change. |
| [Testing strategy](../templates/testing-strategy.template.md) | Which risks are tested at which level? | Critical paths, boundaries, or quality targets change. |
| [API contract](../templates/api-contract.template.md) | What may consumers rely on? | Endpoint/schema/error/compatibility behavior changes. |
| [Domain module](../templates/domain-module.template.md) | What vocabulary, invariants, states, and ownership define a domain? | Business rules or boundaries change. |
| [Feature specification](../templates/feature-specification.template.md) | What outcome and acceptance criteria does this feature have? | Requirement, scope, or accepted behavior changes. |
| [ADR](adr/README.md) | Why was one consequential decision made? | Decision proposed, accepted, superseded, or reviewed. |
| Root `AGENTS.md` | How must coding agents operate in this repository? | Agent workflow or repository-wide constraints change. |
| `.architecture-blueprint.json` | Which blueprint version, profile, active files, and loading policy were adopted? | The active pack is deliberately migrated to a reviewed blueprint release. |

Do not copy the same rule into several documents. Choose an authoritative source and link to it. A short local summary is acceptable only when it identifies the source and cannot silently diverge.

## Active documentation and on-demand reference

For an adopted project, keep the project-owned active pack small: the architecture overview is the read-first map, while context, assessment, stack, testing strategy, profile, contracts, and ADRs are loaded only when relevant. The complete blueprint catalog remains external reference material; it is not active policy and should not be copied or recursively loaded by default.

The adoption CLI creates this separation and records it in `.architecture-blueprint.json`. Use `routes` to discover route IDs, `recommend <route>` to route work, and `guide <topic>` to emit compact, complete source sections. The default overview and compact-guide estimates are 1,600 tokens each, calculated conservatively as UTF-8 bytes divided by three. This is a stable budget heuristic, not an exact model tokenizer count. See [Token-efficient adoption](18-token-efficient-adoption.md) for escalation and validation rules.

The managed block in `AGENTS.md` is the authoritative cross-agent policy, but instruction discovery varies by AI product. Product-specific instruction files should point to that block instead of duplicating it independently.

## What belongs where

- **Code:** mechanics clear to maintainers; names and types should carry routine intent.
- **Tests:** executable examples of behavior and edge cases.
- **Schemas/OpenAPI:** machine-verifiable data and API contracts.
- **Comments:** why a surprising local constraint exists, not a narration of syntax.
- **README:** entry point, audience, setup, common commands, and links.
- **Architecture documents:** boundaries, constraints, trade-offs, and evolution signals.
- **ADR:** one important decision, alternatives, consequences, and review plan.
- **Runbook:** detection, diagnosis, mitigation, recovery, escalation, and verification for an operational scenario.

Avoid duplicating generated references by hand. Generate them from the authoritative schema and document the generation command and version.

## Write for decisions and action

A useful document states:

1. audience and purpose;
2. scope and what is explicitly out of scope;
3. prerequisites or context;
4. concrete rules/recommendations, labeled as such;
5. examples where ambiguity is likely;
6. trade-offs and failure modes;
7. owner or review trigger;
8. related authoritative documents.

Distinguish normative language:

- **Rule:** required for this project; exceptions must be recorded.
- **Recommendation:** preferred default with context-sensitive alternatives.
- **Example:** illustrative and not binding.
- **Decision:** selected alternative for a stated context, normally recorded in an ADR when consequential.

Avoid “use best practices,” “make it scalable,” or “handle errors properly.” State the observable behavior, boundary, or criterion.

## Keep documentation close to change

Update documentation in the same change when behavior, contracts, setup, supported configuration, architecture, or operating procedures change. Reviewers should ask whether the authoritative source changed, not whether every touched file needs prose.

Prefer:

- repository-local Markdown for versioned project knowledge;
- schema-generated reference for APIs and configuration;
- links to code by stable symbol/path only when they help navigation;
- diagrams as code/text when maintainability matters;
- owner and “last reviewed” metadata only when a process uses them.

External wikis are **Conditional** for cross-project discovery or organizational knowledge. If they duplicate repository instructions, explicitly designate one source and link from the other.

## Diagrams

Create a diagram only when relationships, sequence, trust boundaries, deployment, or ownership are clearer visually.

Every diagram should have:

- a named question it answers;
- a legend or unambiguous notation;
- system boundary and important external actors;
- direction and protocol for important flows;
- source that can be updated, when practical;
- enough adjacent prose to explain decisions not visible in shapes.

Do not maintain a detailed diagram of every class. A context diagram, container/module view, critical sequence, or deployment view is usually more durable. Mark examples as examples so agents do not infer nonexistent infrastructure.

## Architecture Decision Records

Use an ADR when a decision has material alternatives or future consequences: architecture style, data ownership, public versioning, tenant isolation, authentication approach, significant dependency, or operational guarantee.

Do not use an ADR for routine reversible implementation details already governed by standards. Never rewrite history to make an old decision look current; supersede it. The workflow and index are in [ADR guidance](adr/README.md).

## Runbooks and operational documentation

Runbooks are **Conditional** for systems with operational response. Start with failure modes that require timely human action:

- symptom and alert;
- impact and safety warnings;
- access/prerequisites;
- diagnosis steps and expected evidence;
- mitigation and rollback;
- data integrity checks;
- escalation and communication;
- recovery verification;
- follow-up actions.

Exercise high-risk runbooks. Commands that can delete data or alter production must identify scope, approval, and recovery rather than invite blind copy/paste.

## Compatibility and versioned documentation

Documentation must state which release or contract version it describes when multiple versions are supported. Keep deprecation dates and migration paths adjacent to consumer-facing contracts.

For this blueprint, maintain release history in the root `CHANGELOG.md` and versioning rules in the root `README.md`. For an adopted project, select versioning based on its artifacts; do not force library semantics onto an internal application.

## Documentation for AI-assisted work

Agents need concise authoritative context more than a large volume of prose. Keep repository-wide operating rules in root `AGENTS.md`, project purpose in the project context, architectural decisions in ADRs, and task behavior in feature/API/domain artifacts. The complementary workflow is described in [AI-assisted development](16-ai-assisted-development.md).

Do not optimize documentation solely for an agent: human maintainers must be able to review, correct, and own it. Do not put secrets, production personal data, or privileged operational credentials in context documents.

## Detect and correct drift

Use automation where it tests a real invariant:

- verify relative Markdown links;
- validate/lint OpenAPI and other schemas;
- compile code snippets that are meant to be executable;
- generate reference docs and check for an uncommitted diff;
- verify documented commands in CI where feasible.
- run `architecture-blueprint check --strict` for an adopted active pack.

Automation cannot verify that a rationale is still true. Use [architecture review](17-architecture-review.md) when triggers or scheduled risk reviews require human judgment.

Delete obsolete documents or clearly mark their historical status. A stale guide that looks current is worse than a visible gap.

## Review checklist

- [ ] Does every active document have an audience and decision/action?
- [ ] Is each important rule stored in one authoritative source?
- [ ] Are rules, recommendations, examples, and decisions distinguishable?
- [ ] Do contracts and commands match the implementation or generated source?
- [ ] Are trade-offs, non-applicable sections, and evolution triggers explicit?
- [ ] Are diagrams limited to relationships they clarify and kept maintainable?
- [ ] Are consequential decisions indexed as ADRs rather than buried in chat?
- [ ] Are operational procedures actionable, safe, and tested according to risk?
- [ ] Are version scope and deprecation/migration paths visible?
- [ ] Are relative links valid and stale documents removed or marked historical?
- [ ] Is documentation free of secrets and unnecessary personal data?
