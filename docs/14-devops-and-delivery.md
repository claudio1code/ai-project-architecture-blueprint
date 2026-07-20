# 14 — DevOps and Delivery

## Purpose and applicability

Delivery practices should make changes repeatable, reviewable, and recoverable. The required depth follows criticality, deployment frequency, team size, infrastructure, and data risk.

- **Essential for a shipped artifact:** reproducible build, versioned configuration, automated basic quality checks, and a known release/rollback path.
- **Conditional:** multiple environments, continuous delivery, containers, feature flags, staged deployments, and automated migrations when the project needs them.
- **Advanced:** canary automation, multi-region recovery, policy-as-code, or orchestration platforms for demonstrated scale and availability needs.
- **Not applicable:** a documentation-only repository has no application deployment or database migration; retain only checks and versioning relevant to its artifacts.

Kubernetes is never a default requirement. Use it only when workload scheduling, platform standardization, scale, or operational capabilities justify its substantial complexity.

## Environments

Create only environments with a defined purpose. A common progression is local → test/CI → production, with staging **Conditionally** added when release validation cannot be represented elsewhere.

For each environment, document:

- purpose and owner;
- deployed artifact and promotion path;
- configuration source;
- data classification and whether synthetic data is required;
- external integrations and safe substitutes;
- access policy;
- reset, backup, and retention behavior;
- expected parity and accepted differences.

“Staging” that no one trusts becomes cost without evidence. Production-like behavior matters more than identical capacity. Never copy production personal data into a lower environment without an approved, verified protection process.

## Configuration by environment

Keep code and deployable artifact environment-independent when practical. Supply configuration at deployment/runtime and validate it on startup.

- define schema, type, allowed values, and required/optional status;
- provide safe example values without secrets;
- fail fast on missing or invalid critical configuration;
- use explicit defaults only when they are safe in every target environment;
- identify which changes require restart or redeploy;
- record a non-secret configuration fingerprint/version for diagnosis;
- avoid environment-name branches scattered through business code.

Separate secrets from ordinary configuration and follow [security](11-security.md). A fixed value that silently activates an insecure fallback is not resilience.

## Continuous integration

CI should reproduce the checks a reviewer needs and fail visibly. Select gates according to the stack and risks:

1. dependency resolution and lockfile validation;
2. formatting check;
3. lint/static analysis;
4. type checking where the language supports it;
5. focused unit/component tests;
6. integration/contract/migration tests as applicable;
7. build/package;
8. dependency, secret, and artifact scanning as applicable;
9. artifact publication only after all required gates pass.

Run independent stages in parallel when it shortens feedback without hiding dependencies. Cache only keyed, verifiable inputs; a stale cache must not change correctness. Keep logs actionable and protect credentials from pull requests or untrusted code.

Do not require tools that the project does not use. A small script may need formatting, lint, a few tests, and packaging—not a distributed integration environment. See [testing](12-testing.md).

## Build and artifacts

A release artifact should be immutable and traceable to source, dependency lockfile, build process, and version. Prefer building once and promoting the same artifact rather than rebuilding per environment.

Record:

- source revision and release version;
- runtime/toolchain version;
- dependency resolution;
- build parameters that affect output;
- artifact digest;
- supported platform/architecture;
- provenance/signing requirements when supply-chain risk warrants them.

Reproducible builds are `Conditional` when artifact verification or supply-chain risk requires them, and may become `Advanced` when deterministic output needs substantial ecosystem-specific tooling. Traceable builds are a practical minimum.

## Continuous delivery and deployment

- **Continuous delivery:** every accepted change is releasable, but promotion may require a decision.
- **Continuous deployment:** every accepted change is automatically promoted to production.

Automatic production deployment is **Conditional** on reliable tests, observability, rollback, and team ownership. High-risk approval requirements may favor delivery with a controlled promotion step.

### Deployment strategies

| Strategy | Consider when | Cost/risk |
| --- | --- | --- |
| Recreate/in-place | Low traffic, brief downtime acceptable, simple service | Simplest; causes a visible interruption and rollback may take time. |
| Rolling | Several compatible instances can update gradually | Old/new versions coexist; readiness and backward compatibility matter. |
| Blue-green | Fast traffic switch and environment duplication are affordable | Double capacity, state/migration compatibility, and routing complexity. |
| Canary | Risk merits production exposure to a small cohort with measurable signals | Segmentation, analysis, and automated abort add complexity. |

Choose the simplest strategy that meets downtime and recovery requirements. A sophisticated rollout without trustworthy metrics only delays detection.

## Database migrations in delivery

Coordinate schema and application changes with expand/contract:

```text
add compatible schema
→ deploy code that can use old and new forms
→ backfill and verify
→ switch readers/writers
→ remove obsolete schema later
```

Do not start every instance by racing the same migration unless the tool safely serializes it. Prefer an explicit deployment step with ownership and visibility. Estimate locks/duration, back up before risky changes, and know whether recovery is rollback or roll-forward. See [data and persistence](08-data-and-persistence.md).

## Rollback and recovery

A rollback plan states the trigger, decision owner, commands/process, compatible versions, data implications, and verification. Test it at a cadence proportional to risk.

Rollback may not be safe after an irreversible data migration or external side effect. Alternatives include:

- roll forward with a corrective release;
- disable a path with a feature flag;
- restore a backup to a controlled point;
- reconcile external effects;
- route traffic to a known-good environment.

Do not advertise “one-click rollback” unless data and dependencies are also compatible.

## Feature flags

Feature flags are **Conditional** for decoupling deployment from release, limiting exposure, operational kill switches, or experiments. Each flag needs:

- owner and purpose;
- safe default;
- scope and authorization;
- creation and removal dates;
- behavior when the flag service is unavailable;
- test coverage for meaningful states;
- observability without high-cardinality labels.

Flags add branches and interaction combinations. Remove release/experiment flags promptly. Do not use a flag to conceal a permanently unsupported architecture or bypass a security control.

## Containers and orchestration

Docker or another container format is **Conditional** when it improves runtime consistency, packaging, isolation, or platform deployment. A single static site, native CLI, or simple managed-function deployment may not benefit.

If used:

- pin trusted minimal base images and update them;
- run as a non-root user when possible;
- keep secrets out of layers and build arguments;
- use multi-stage builds to reduce runtime contents;
- define health, signal handling, resource needs, and a read-only filesystem where feasible;
- scan images and retain a traceable digest.

Kubernetes is **Advanced**. Consider it only with multiple workloads, scaling/scheduling needs, an existing platform/team, or requirements not met by simpler managed services or container hosts. Its costs include cluster/platform operations, manifests, networking, security, upgrades, observability, and specialist knowledge.

## Backup and disaster recovery

Delivery owns recovery readiness together with data owners:

- translate tolerated loss and downtime into RPO/RTO;
- automate backups and monitor completion;
- protect copies and keys in an appropriate failure domain;
- test restoration rather than only file existence;
- document dependencies and restoration order;
- conduct recovery exercises for critical systems;
- update procedures after topology or provider changes.

High availability does not replace backup; replication can replicate corruption. Details are in [data and persistence](08-data-and-persistence.md).

## Secrets in pipelines and runtime

- use short-lived workload identity when supported;
- scope CI/CD credentials to repository, environment, action, and lifetime;
- protect production environments and approvals according to risk;
- mask output but assume masking can fail—do not print secrets;
- separate build-time and runtime secrets;
- rotate and revoke credentials with a tested process;
- prevent untrusted pull-request code from receiving privileged secrets.

## Dependency maintenance

Use Dependabot or an equivalent automated updater **Conditionally** where supported. Configure grouped, scheduled updates to keep noise manageable. Every alert/update path needs owners and urgency criteria.

- lock resolved dependencies;
- review source, license, maintenance, transitive impact, and install scripts for new dependencies;
- automate vulnerability/license checks proportional to risk;
- patch supported runtimes and base images;
- remove unused packages;
- define how emergency updates are tested and released.

Automation proposes changes; it does not prove compatibility or exploitability.

## Version control and releases

- protect the primary branch with review and required checks appropriate to team size;
- keep changes small and traceable to intent;
- tag immutable releases and maintain a useful changelog;
- define version semantics for public artifacts and contracts;
- avoid rewriting shared history;
- record breaking migrations and deprecation windows;
- retain release notes, artifact digests, and deployment status.

Semantic Versioning is useful for public libraries and reusable blueprints when compatibility has clear meaning. An internal continuously deployed application may use build/release identifiers instead; its APIs and events still need explicit compatibility rules. See [documentation](15-documentation.md).

## Delivery checklist

- [ ] Are environments necessary, owned, access-controlled, and different only by documented configuration?
- [ ] Does configuration fail fast without insecure defaults?
- [ ] Do CI gates cover formatting, lint, types, tests, build, and risk-relevant scans?
- [ ] Is one immutable, traceable artifact promoted across environments?
- [ ] Is the deployment strategy the simplest one that meets downtime and risk?
- [ ] Are migrations compatible, observable, and recoverable?
- [ ] Are rollback triggers, owners, data implications, and verification explicit?
- [ ] Do feature flags have safe defaults and removal dates?
- [ ] Are containers/orchestration justified rather than assumed?
- [ ] Are backups monitored and restorations tested against RPO/RTO?
- [ ] Are pipeline/runtime secrets least-privileged and revocable?
- [ ] Are dependencies, runtimes, versions, and release records maintained?
