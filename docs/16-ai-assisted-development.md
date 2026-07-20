# 16 — AI-Assisted Development

## Purpose and authority

AI agents can accelerate discovery, implementation, and review, but they do not own product intent, risk acceptance, or architectural accountability.

This guide **complements and never replaces** the repository's [root `AGENTS.md`](../AGENTS.md). `AGENTS.md` is the operational instruction source agents must follow before and during changes. This document explains how humans and agents can prepare context, collaborate, and evaluate output. If the two conflict, follow `AGENTS.md` and record or resolve the inconsistency.

- **Essential when AI changes the repository:** provide authoritative context, constrain scope, inspect existing behavior, verify outputs, and review the resulting diff.
- **Conditional:** use planning artifacts, specialist agents, or parallel exploration for tasks whose uncertainty or breadth warrants them.
- **Advanced:** automated agent workflows, isolated evaluation environments, or policy enforcement only with ownership, auditability, and recovery controls.
- **Not applicable:** remove this document from a project that prohibits AI-assisted development; keep the prohibition and handling policy explicit elsewhere.

AI output is untrusted until reviewed and validated with the same or stronger standards as human-authored work.

## Build a trustworthy context chain

An agent should be able to locate authoritative information without treating every document as equally relevant. A useful order is:

1. root `AGENTS.md`, including the managed blueprint block, and any scoped agent instructions;
2. the adopted project's active architecture overview;
3. project context, architecture assessment, and selected starting profile when relevant;
4. accepted [ADRs](adr/README.md) and applicable architecture/domain guidance;
5. existing implementation, tests, schemas, and configuration;
6. the task specification and acceptance criteria.

Tests are evidence of behavior, not automatically the source of the requirement. When documents, tests, and implementation disagree, the agent must surface the conflict rather than silently choosing the easiest interpretation.

Keep instructions concise and point to sources. Copying the same rule into prompts, chat, `AGENTS.md`, and architecture files creates ambiguity and drift.

## Load context in tiers

An adopted project should keep its active pack local and the complete blueprint catalog external. Read the architecture overview for every task, then load other local documents only when they constrain the work. Route external reference material with:

```bash
architecture-blueprint recommend api-change --target .
architecture-blueprint guide api
```

Use `routes` to list the deterministic task types accepted by `recommend`. `recommend` distinguishes primary topics from related topics that are conditional on task impact. `guide` emits complete compact sections under an approximate 1,600-token default budget. Use `--outline`, then `--section <heading>` for targeted expansion; use `--full` only after project-local context and narrower reference output are insufficient. Token estimates conservatively use UTF-8 bytes divided by three and will differ from a model's exact tokenizer.

The active architecture overview also defaults to an approximate 1,600-token limit. Preserve critical constraints in the overview and link to detailed rationale instead of deleting necessary information to meet the budget. Validate the pack with `architecture-blueprint check --strict`.

The generated managed block lives in root `AGENTS.md`, but AI products differ in instruction-file names, discovery, scope, and precedence. Verify each approved product reads it. If a product requires a separate instruction file, use a short pointer or supported import to the authoritative block rather than maintaining an independent copy. The complete adoption and trust model is in [Token-efficient adoption](18-token-efficient-adoption.md).

## Prepare an actionable task

The human or coordinating agent should provide:

- desired user/business outcome;
- in-scope and out-of-scope behavior;
- acceptance criteria and important failure cases;
- relevant constraints and public compatibility requirements;
- known source-of-truth documents or symbols;
- permitted external changes, if any;
- expected validation commands;
- risks that require explicit review.

A compact task frame is more useful than prescribing an implementation prematurely:

```text
Outcome:
Acceptance criteria:
In scope / out of scope:
Relevant sources of truth:
Compatibility constraints:
Security/data concerns:
Validation expected:
Known unknowns:
```

The request is evidence of intent, not proof that its suggested code change is correct. The agent must first understand existing behavior and may propose a smaller or architecturally coherent alternative.

## Human and agent responsibilities

| Responsibility | Human/accountable owner | Agent contribution |
| --- | --- | --- |
| Product intent and priority | Defines and resolves ambiguity | Restates assumptions and identifies gaps. |
| Risk acceptance | Approves material security, data, cost, or compatibility risk | Finds risks and presents alternatives/trade-offs. |
| Architecture decision | Owns consequential choice | Collects evidence and drafts an ADR. |
| Implementation | Reviews and owns merged result | Locates existing code, implements the smallest coherent change, and validates it. |
| Quality evidence | Decides whether evidence is sufficient | Runs checks, reports failures honestly, and reviews the diff. |
| External side effects | Grants explicit authority | Does not deploy, publish, message, purchase, or mutate external systems without scope/authorization. |

An agent should not be used as an authority to approve its own uncertain security or regulatory interpretation.

## Evidence-first execution

The operational protocol lives in [root `AGENTS.md`](../AGENTS.md). In practice, evidence should flow through this loop:

```text
understand intent and instructions
→ locate related implementation and authoritative rule
→ inspect callers, tests, contracts, data, and history as needed
→ state assumptions and impact
→ make the smallest coherent change
→ run proportionate checks
→ inspect the complete diff
→ update the authoritative documentation
→ report result, evidence, risks, and pending work
```

“Smallest” does not mean a hard-coded shortcut; “coherent” means the change includes required validation, authorization, migration, contract, tests, and documentation. Conversely, the agent must not broaden a feature task into an unrelated cleanup.

## Reuse and source-of-truth discipline

Before adding code, search for related:

- components and visual tokens;
- functions, hooks, types, and schemas;
- domain rules, states, and permission policies;
- routes, services, adapters, repositories, and queries;
- errors, telemetry conventions, fixtures, and test helpers.

Reuse only when semantics match. Two similar calculations for different business concepts may need to remain separate. If a rule is duplicated conceptually, move it to one authoritative owner and migrate callers only within task scope or through an explicit follow-up.

Do not create an interface, factory, generic service, universal component, or new dependency merely because generation makes it cheap. Each abstraction increases the future context every human and agent must understand.

## Assumptions and uncertainty

Agents must distinguish:

- **fact:** observed in a named file, test, tool output, or approved requirement;
- **inference:** likely conclusion from evidence;
- **assumption:** temporary premise needed to proceed;
- **decision:** selected alternative with an accountable owner;
- **unknown:** missing evidence that may block or constrain work.

Record an assumption when it affects behavior, data, compatibility, security, cost, or scope. Ask for direction before a materially different or irreversible action. Minor reversible choices can follow existing conventions and be reported.

Never invent a requirement to fill a gap. Do not conceal uncertainty with confident prose.

## Verification proportional to risk

Generated code may compile while being behaviorally wrong. Verify in layers:

1. inspect the complete diff, including generated and lock files;
2. run formatter, lint, and type checks used by the project;
3. run focused tests for changed behavior;
4. run relevant integration, contract, migration, security, or end-to-end tests;
5. build/package when delivery could be affected;
6. inspect failure paths, authorization, concurrency, tenant isolation, and compatibility manually where relevant;
7. report checks not run and why.

Never remove validation, weaken an assertion, hard-code a result, add a silent fallback, or swallow an error solely to make checks pass. Investigate the mismatch between implementation, test, and requirement.

See [testing](12-testing.md), [security](11-security.md), and [DevOps and delivery](14-devops-and-delivery.md).

## Security, privacy, and intellectual property

- do not place secrets, tokens, private keys, production personal data, confidential customer content, or privileged logs in prompts;
- follow the approved tool/model data handling and retention policy;
- minimize context to what the task requires;
- do not execute a mutable or unreviewed remote blueprint reference; pin a reviewed tag or commit and understand that disabling lifecycle scripts does not prevent the CLI itself from running;
- treat generated commands, SQL, migrations, regexes, and infrastructure changes as potentially destructive;
- review new dependencies for provenance, maintenance, license, install scripts, and transitive cost;
- scan and review generated code for injection, authorization, data leakage, insecure defaults, and unsafe error handling;
- do not reproduce third-party code whose license or origin is unknown;
- never interpret an AI-generated security explanation as a specialized audit.

When a model cannot receive the needed data safely, use sanitized/synthetic examples or do the work without that model.

## Parallel and multi-agent work

Parallel agents are **Conditional** when independent investigation or file ownership materially improves throughput. Before delegation:

- give each agent a bounded deliverable and relevant context;
- assign non-overlapping files or coordinate shared ownership;
- identify decisions that must remain centralized;
- require each agent to report files changed and checks run;
- integrate and review the combined diff, not only individual summaries.

Parallel output can be locally correct yet globally inconsistent in terminology, contracts, links, or architecture. One accountable integrator must resolve overlaps and run repository-wide validation. Do not use more agents when coordination costs exceed the work.

## Reviewing AI-authored changes

Review the change as if its author were unavailable to explain it:

- Does it solve the stated outcome rather than merely match keywords?
- Is it consistent with existing architecture and source-of-truth rules?
- Did it duplicate or bypass an existing implementation?
- Are public contracts, migrations, data retention, authorization, and tenant scope safe?
- Are errors visible rather than masked?
- Do tests prove behavior and important failure cases?
- Are new abstractions and dependencies justified?
- Is the diff limited, readable, and reversible where required?
- Are assumptions and residual risks explicit?

An articulate explanation is not evidence. Prefer code, tests, schemas, command results, and cited repository sources.

## Common failure patterns

Reject or correct outputs that:

- create a parallel implementation because the existing one was not searched;
- follow a user-proposed class/file name without checking current structure;
- refactor broad areas unrelated to acceptance criteria;
- silently break an API, event, schema, CLI, or configuration contract;
- introduce a dependency for trivial behavior;
- mock away the boundary the test should prove;
- treat a frontend permission check as authorization;
- retry a non-idempotent action blindly;
- create fixed-value fallbacks that hide missing configuration or failed integrations;
- claim tests passed without showing a completed command result;
- update descriptive prose but leave the authoritative schema or code stale.

## Adoption checklist

- [ ] Does root `AGENTS.md` contain operational instructions and precedence rules?
- [ ] Does each approved AI product actually discover those instructions without a divergent copy?
- [ ] Can the agent identify context, architecture overview, applicable decisions, and source-of-truth code?
- [ ] Does routine work stay within the active pack and compact routed guidance rather than scanning the full reference catalog?
- [ ] Does the task state outcome, acceptance criteria, scope, compatibility, and validation?
- [ ] Are sensitive data and external side effects constrained?
- [ ] Are facts, inferences, assumptions, decisions, and unknowns distinguishable?
- [ ] Was existing functionality searched before adding abstractions or dependencies?
- [ ] Do validations cover the actual risk and report omissions honestly?
- [ ] Was the complete diff reviewed for unrelated or generated changes?
- [ ] Are consequential decisions preserved in documentation/ADRs rather than only chat?
- [ ] Does a human remain accountable for intent and material risk?
