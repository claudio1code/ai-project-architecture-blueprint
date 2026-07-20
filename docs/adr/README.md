# Architecture Decision Records

## Purpose and applicability

An Architecture Decision Record (ADR) preserves why a consequential choice was made in a particular context, including alternatives and trade-offs. It does not prove that the decision remains correct forever.

- **Essential:** record decisions that materially constrain architecture, public compatibility, data, security, operations, cost, or team autonomy.
- **Conditional:** record a reversible local choice when several teams/consumers need a durable shared rationale.
- **Advanced:** use formal approval workflows or an ADR tool only when repository scale and governance require them.
- **Not applicable:** do not create an ADR for formatting, routine refactoring, or a choice already dictated by an accepted standard with no meaningful alternative.

Use the [ADR template](../../templates/adr.template.md). A filled, realistic example is available in [the ADR example](../../examples/adr-example.md).

## When to create an ADR

Good candidates include:

- architecture style or module/service boundary;
- authoritative data owner or persistence technology;
- public API/event compatibility and versioning policy;
- tenant isolation model;
- authentication/authorization approach;
- delivery, availability, consistency, backup, or recovery guarantee;
- a significant framework, platform, or third-party dependency;
- acceptance of material technical debt or risk;
- replacement or reversal of an earlier decision.

Write the ADR while alternatives are still visible. If implementation already started, record that fact honestly rather than inventing a retrospective process.

## When not to create one

Use code, tests, a pull request, or project documentation instead when the choice is:

- a small implementation detail with low switching cost;
- an experiment that has not yet produced a decision—record the hypothesis and outcome first;
- an operational task with no lasting architecture consequence;
- a duplicate of an existing ADR;
- a general rule that belongs in [engineering principles](../02-engineering-principles.md) or [coding conventions](../05-coding-conventions.md).

Too many trivial ADRs hide the decisions that matter.

## Location and naming

Store project decisions in this directory using:

```text
NNNN-short-kebab-case-title.md
```

Examples: `0001-select-primary-database.md`, `0002-use-path-api-versioning.md`.

- allocate the next sequence number; never reuse a removed number;
- keep the filename stable after acceptance;
- keep one primary decision per ADR;
- link related/superseding ADRs explicitly;
- do not encode status in the filename.

A team may use date-based identifiers when merge concurrency makes sequence numbers costly. Choose once and record the convention; ordering convenience is not worth frequent rename conflicts.

## Status lifecycle

| Status | Meaning | Allowed next steps |
| --- | --- | --- |
| Proposed | Open for evaluation; not yet authoritative | Accepted, Rejected, or withdrawn if the project uses that state. |
| Accepted | Current decision and constraints apply | Deprecated or Superseded. |
| Rejected | Considered but not selected | Remains historical; a new context requires a new ADR. |
| Deprecated | No longer recommended, but may still exist during migration | Superseded or retired after removal. |
| Superseded | Replaced by a named newer ADR | Historical; do not edit it to describe the new choice. |

Do not rewrite an accepted ADR to erase old context. Correct typos or broken links without changing meaning. If the decision changes materially, create a new ADR, mark the old one as superseded by the new ADR's identifier and relative link, and link back from the new ADR.

## Workflow

1. **Frame the problem:** state context, constraints, and the decision that must be made.
2. **Identify forces:** list current requirements and quality attributes, not speculative wishes.
3. **Compare real alternatives:** include the simplest viable option and “defer/do nothing” where legitimate.
4. **Decide:** name the choice, scope, and owner; avoid vague hybrids.
5. **Expose consequences:** record benefits, costs, risks, migration, testing, deployment, and maintenance impact.
6. **Define review:** specify signals, date if useful, and evidence that would reopen the decision.
7. **Accept and index:** obtain the project's required review and add it below.
8. **Implement and verify:** link the change where the project workflow supports it; ADR acceptance alone does not complete implementation.

Use [architecture review](../17-architecture-review.md) when the decision crosses several quality attributes or lacks sufficient evidence.

## Writing rules

- write in present tense for the current decision and past tense for historical context;
- distinguish facts, assumptions, constraints, and preferences;
- quantify scale, latency, availability, cost, or team impact when evidence exists;
- explain why alternatives were not selected without presenting them as universally wrong;
- include negative consequences and residual risks;
- state whether the decision is easy to reverse;
- avoid copying vendor marketing or turning the ADR into implementation documentation;
- link to the authoritative contract or policy instead of duplicating it;
- keep the record concise enough to review.

An ADR saying only “we chose X because it is scalable” is incomplete. It must identify the concrete load or evolution concern, alternatives, operational/test/deploy costs, and signals for reevaluation.

## Decision index

This blueprint does not prescribe project-specific decisions. Projects adopting it should add one row per ADR and keep superseded/rejected records visible.

| ID | Title | Status | Date | Supersedes |
| --- | --- | --- | --- | --- |
| — | No project decisions recorded yet | — | — | — |

The [ADR example](../../examples/adr-example.md) is instructional and must not be copied into this index as an accepted project decision.

## Maintenance checklist

- [ ] Does the record describe one material decision and its context?
- [ ] Are the simplest viable alternative and meaningful trade-offs included?
- [ ] Are positive and negative consequences, risks, and reversibility explicit?
- [ ] Is status accurate and is the index updated?
- [ ] Is a superseded ADR preserved and linked in both directions?
- [ ] Does the review plan name a signal, date, or evidence rather than “review later”?
- [ ] Are implementation details kept in their authoritative location?
