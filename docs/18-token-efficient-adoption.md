# 18 — Token-Efficient Adoption

## Purpose

The adoption workflow gives a project durable architecture context without copying the complete blueprint or requiring an AI agent to read it on every task. It separates a small, project-owned **active pack** from the versioned **reference catalog**, which remains available on demand.

The CLI requires Node.js 22 or later, has no runtime dependencies, installs no application code, and creates no infrastructure. It writes Markdown context plus a manifest into an existing target directory.

## Trust and release prerequisites

The examples pin `v0.2.0` rather than a mutable branch and disable npm lifecycle scripts:

```bash
npx --yes --ignore-scripts --package=github:claudio1code/ai-project-architecture-blueprint#v0.2.0 -- architecture-blueprint --help
```

The remote command works only after the `v0.2.0` Git tag has been published. Pinning reduces accidental drift, but it is not a complete supply-chain guarantee: a repository owner can move a tag, and `--ignore-scripts` does not prevent the selected CLI itself from executing. Before using it in a sensitive environment, review the release, verify the tag resolves to the expected commit, or pin a reviewed commit SHA instead.

When network execution or repository trust is unacceptable, use a reviewed local clone:

```bash
git clone --branch v0.2.0 --depth 1 https://github.com/claudio1code/ai-project-architecture-blueprint.git /trusted/path/architecture-blueprint
node /trusted/path/architecture-blueprint/bin/architecture-blueprint.mjs --help
```

Before the tag is published, clone the intended source revision without `--branch v0.2.0`, review it, and use the same local `node` command. No package installation is required.

The remainder of this guide uses `architecture-blueprint` for readability. For remote use, replace it with this pinned prefix:

```text
npx --yes --ignore-scripts --package=github:claudio1code/ai-project-architecture-blueprint#v0.2.0 -- architecture-blueprint
```

For a local clone, replace it with `node /trusted/path/architecture-blueprint/bin/architecture-blueprint.mjs`.

## Initialize an active pack

List the starting profiles, preview the write, and initialize an existing project directory:

```bash
architecture-blueprint profiles
architecture-blueprint init --profile backend-api --target . --dry-run
architecture-blueprint init --profile backend-api --target .
```

`init` creates:

```text
.architecture-blueprint.json
PROJECT_CONTEXT.md
AGENTS.md                         # creates or updates only a delimited managed block
docs/architecture/
├── overview.md                   # read first
├── assessment.md
├── profile.md
├── technology-stack.md
├── testing-strategy.md
├── definition-of-done.md
└── decisions/
    └── README.md
```

The profile is a starting hypothesis, not an accepted architecture. Complete the project context and assessment, remove inapplicable guidance, and summarize accepted boundaries and practices in `docs/architecture/overview.md`.

Initialization is conservative: the target directory must already exist, the command refuses to replace an existing manifest or active document, and failures roll back files created by that run. If `AGENTS.md` already exists, content outside the exact managed marker pair remains project-owned. Review `--dry-run` output and commit or otherwise back up the target before adoption.

The CLI rejects symbolic links, multiply linked files, traversal, filesystem roots, and case-colliding destinations in the managed paths. It is designed for a cooperative, user-controlled working tree; do not run it with elevated privileges or while an untrusted process can mutate the target concurrently, because filesystem validation and writes cannot form one cross-platform transaction.

## Active pack versus reference catalog

The active pack is the project's source of truth. It records what the project actually is, which practices apply, and which decisions were accepted. It belongs in the target repository and evolves with the implementation.

The reference catalog contains broad decision guidance, profiles, templates, and checklists. It is not active project policy and is not copied by `init`. Retaining it outside the target keeps irrelevant patterns out of routine context and prevents an agent from interpreting every documented option as a requirement.

Use this loading order:

1. Always read the local architecture overview.
2. Read project context, assessment, ADRs, contracts, and strategy documents only when they constrain the task.
3. Inspect the current implementation, tests, schemas, and configuration.
4. Route the task to the smallest relevant reference topics.
5. Load compact guidance first; expand one section or the full topic only when evidence shows it is necessary.

Never recursively scan the reference repository by default. Reference material may inform a decision, but it does not override the adopted project's context, contracts, accepted ADRs, or implementation evidence.

## Route and load reference guidance

List available topic identifiers and aliases:

```bash
architecture-blueprint topics
```

List and resolve a supported task route from the adopted project:

```bash
architecture-blueprint routes
architecture-blueprint recommend api-change --target .
```

`recommend` identifies a small primary topic set, conditional related topics, and applicable checklists or templates. Related topics should be loaded only when the task actually touches them.

Load a compact topic, inspect its outline, or request one complete section:

```bash
architecture-blueprint guide api
architecture-blueprint guide api --outline
architecture-blueprint guide api --section "Idempotency and concurrency"
architecture-blueprint guide api --section "Idempotency and concurrency" --max-tokens 2400
```

The compact guide is assembled from complete source sections. It is not an arbitrary truncation. The default `--max-tokens` value is `1600`; if no complete configured section fits, the command asks for a larger explicit budget. `--section`, `--outline`, and `--full` are mutually exclusive.

Use the full document only after the active project context, compact guide, and a targeted section prove insufficient:

```bash
architecture-blueprint guide api --full
```

`--full` is an explicit override and is not constrained by `--max-tokens`.

## Token budget model

The CLI estimates tokens as UTF-8 bytes divided by three, rounded up. This deliberately conservative calculation is deterministic and tokenizer-independent, but it is only an approximation; actual usage varies by model, language, formatting, tool wrapper, and surrounding conversation.

The default context tiers are:

| Tier | Material | Loading rule | Default estimate |
| --- | --- | --- | --- |
| 0 | Root `AGENTS.md`, including project-owned instructions | Tool-dependent; keep concise and authoritative | Maximum `1200` tokens |
| 1 | Local architecture overview | Read at the start of every task | Maximum `1600` tokens |
| 2 | Local context, assessment, profile, stack, tests, ADRs, and contracts | Read only when relevant | Project-managed |
| 3 | Compact external topic guide | Load after task routing | Maximum `1600` tokens |
| 4 | One requested section or full reference topic | Explicit escalation only | Caller-selected or unlimited for `--full` |

The combined Tier 0 and Tier 1 bootstrap defaults to a maximum estimate of `2400` tokens. Normal validation warns when the full root instructions or combined bootstrap exceed their budgets; strict validation fails.

These are guardrails, not quality targets. A shorter overview is preferable when it still names system purpose, shape, boundaries, dependency and data rules, adopted practices, quality gates, and decision links. Do not remove a critical security, compatibility, or operational constraint merely to satisfy a token budget; move detailed rationale to an authoritative linked document and keep the constraint visible.

## Validate the adopted pack

Run the normal check while completing templates, then use strict mode before treating adoption as complete:

```bash
architecture-blueprint check --target .
architecture-blueprint check --target . --strict
architecture-blueprint check --target . --strict --max-overview-tokens 1800
```

`check` validates the manifest and context policy, declared active files, managed-block integrity, required overview headings, relative links, safe paths, and the cumulative always-read estimate. Unresolved template placeholders and excess bootstrap context are warnings by default and errors in `--strict` mode. Raising `--max-overview-tokens` is an explicit project choice; record why extra always-loaded context is worth its cost.

The manifest records the blueprint version, selected profile, source reference, active file paths, and context-loading policy. It is metadata, not a substitute for the architecture overview.

## AI product integration

`init` manages only the text between these markers in root `AGENTS.md`:

```text
<!-- architecture-blueprint:start -->
...
<!-- architecture-blueprint:end -->
```

Do not edit inside the block if it will be regenerated. Project-specific rules belong outside it or in linked authoritative files.

Instruction-file discovery differs across AI products and versions. Do not assume every agent reads `AGENTS.md`, nested instructions, or imported files with the same precedence. Configure each approved product to read the root file, reference it from that product's supported instruction file, or place an equivalent short pointer there. Keep the managed `AGENTS.md` block authoritative instead of maintaining independent copies of its rules.

After integration, verify with a small task that the chosen agent:

- reads `docs/architecture/overview.md` first;
- loads local and external context conditionally;
- does not scan the complete blueprint by default;
- preserves project-specific instructions outside the managed block;
- reports which guidance and validations it used.

## Updates and manual fallback

Version `0.2.0` has no automatic update command. To adopt a later release, review its changelog and compatibility, invoke that exact version, and reconcile active project documents deliberately. Re-running `init` with the same version and profile is a no-op only when the pack remains structurally valid; an incompatible or damaged existing pack is refused. It is not an update mechanism.

If the CLI cannot be used, manually create the same active file layout from the templates, add a project-specific agent instruction that enforces conditional loading, and record the source version. This remains a supported fallback, but the CLI is preferred because it applies collision checks, stable metadata, managed-block boundaries, and repeatable validation without copying the reference catalog.

## Adoption completion criteria

- [ ] The profile was treated as a hypothesis and adjusted with project evidence.
- [ ] Context, assessment, and overview contain no invented facts.
- [ ] The overview fits the agreed read-first budget without hiding critical constraints.
- [ ] Inapplicable practices were removed or clearly marked.
- [ ] Accepted consequential decisions are indexed as ADRs.
- [ ] The configured AI products discover the active instructions and follow conditional loading.
- [ ] `check --strict` passes with the intended overview budget.
- [ ] The exact reviewed blueprint tag or commit is recorded in the manifest and project history.
