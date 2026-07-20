# 04 — Project Structure

A useful structure helps a contributor answer three questions quickly: where a behavior belongs, which code owns a rule, and which dependencies are allowed. No folder layout is universally correct. Select the axis that matches how the project changes, then keep the smallest number of boundaries that express real responsibilities.

Apply the statuses contextually:

- `Essential`: a discoverable source root, clear public entry points, tests, and separation of generated/build artifacts from source;
- `Conditional`: feature, domain, application, infrastructure, or workspace boundaries when corresponding change pressures exist;
- `Advanced`: enforced module graphs, many packages, or multiple repositories when team and deployment independence justify them;
- `Not applicable`: empty layers, placeholder modules, or platform folders with no current responsibility.

Use [Architecture selection](03-architecture-selection.md) before encoding a pattern in folders and [Coding conventions](05-coding-conventions.md) to define project-specific naming and import rules.

## Selection criteria

Choose based on evidence rather than project size alone:

| Criterion | Question | Structural consequence to consider |
|---|---|---|
| Primary change axis | Do requests usually change one feature, one domain, or one technical mechanism? | organize around the most frequent cohesive change |
| Domain complexity | Are rules, language, and invariants distinct by business area? | domain modules may be clearer than generic technical layers |
| Ownership | Which team or person owns each capability and its operation? | align boundaries with accountable ownership where practical |
| Deployment | Must parts release, scale, or roll back independently? | packages alone do not create deployment independence; repositories alone do not guarantee it |
| Runtime constraints | Is code delivered to browser, server, worker, device, or CLI? | separate build/runtime entry points and avoid unsafe cross-runtime imports |
| Reuse | Is the shared artifact visual, technical, contractual, or business knowledge? | give each kind an explicit owner; do not put all reuse in `shared/` |
| Coupling | Which dependencies must be prevented rather than merely documented? | add package/module boundaries and automated checks only where valuable |
| Navigation | Can a new contributor trace one critical flow? | favor locality and consistent names over a theoretically pure diagram |
| Tooling | What layout does the language/build system support reliably? | work with tool conventions unless deviation solves a concrete problem |
| Change history | Which files repeatedly change together or conflict? | use repository history as evidence for grouping or separating them |

## Organization alternatives

### By technical type

Groups similar mechanisms together.

```text
src/
├── routes/
├── services/
├── models/
├── repositories/
└── validators/
```

**Consider when:** the application is small, flows are uniform, and contributors navigate primarily by technical role.

**Costs:** one feature change can span every folder; generic services and repositories can accumulate unrelated behavior; rule ownership may become unclear.

**Avoid or evolve when:** pull requests repeatedly touch the same cross-folder set, feature ownership matters, or domains use different models. Do not create every shown folder if its responsibility is absent.

### By feature

Keeps a vertical behavior close together.

```text
src/
├── features/
│   ├── account-recovery/
│   │   ├── route.*
│   │   ├── use-case.*
│   │   ├── validation.*
│   │   └── tests/
│   └── profile/
├── platform/
└── app.*
```

**Consider when:** work is planned by feature; changes repeatedly touch several technical folders; teams need discoverable vertical slices; the application has multiple cohesive capabilities.

**Costs:** deciding when concepts are genuinely shared; possible duplication; cross-feature flows need an explicit home.

**Boundary rule:** one feature may use another feature's public contract, not its internal persistence or private components. Start with convention; add automated dependency checks only if violations recur.

### By domain

Groups code by business capability or bounded meaning.

```text
src/
├── domains/
│   ├── billing/
│   ├── fulfillment/
│   └── customer-support/
├── identity/
└── platform/
```

**Consider when:** the domain contains distinct language, rules, data ownership, and change cadence; teams collaborate with different experts.

**Costs:** boundary discovery, translation between domains, duplicated representations that may look similar, and cross-domain workflow design.

**Avoid when:** labels merely rename technical layers or the business has one simple workflow. Domain organization does not require tactical DDD; see [Domain modeling](06-domain-modeling.md).

### Hybrid

Uses a primary business axis and technical separation inside a module only where it helps.

```text
src/
├── modules/
│   ├── subscriptions/
│   │   ├── api/
│   │   ├── application/
│   │   ├── domain/
│   │   └── persistence/
│   └── reporting/
│       ├── routes.*
│       └── queries.*
└── platform/
```

The asymmetry is intentional: a rule-heavy subscription module can justify internal layers while reporting remains direct. Requiring identical folders in every module creates empty ceremony.

**Consider when:** capabilities have different complexity but still need consistent top-level ownership.

**Costs:** conventions require explanation, and contributors may overgeneralize the most elaborate module. Document dependency direction and criteria for adding a layer.

## Repository topology

Folder organization and repository topology are separate decisions.

### Monorepo

One repository contains several deployables or packages.

**Consider when:** changes often span contracts and consumers; one organization owns the code; unified tooling and atomic review are valuable; access policies permit it.

**Benefits:** discoverability, coordinated refactors, shared quality automation, and one place for contracts.

**Costs:** build performance, broad permissions, ownership ambiguity, accidental imports, versioning decisions, and a larger blast radius for tooling failures.

Use package boundaries, ownership, affected-only builds, and dependency rules in proportion to those costs. A monorepo does not mean one deployment or unrestricted sharing.

### Multiple repositories

Separate repositories hold independently owned or released artifacts.

**Consider when:** teams and lifecycles are genuinely independent; access separation is required; artifacts have stable published contracts; operational ownership differs.

**Benefits:** autonomy, focused history and permissions, and independent lifecycle.

**Costs:** cross-repository discovery, coordinated contract changes, duplicated tooling, version drift, and more difficult atomic refactors.

Do not split repositories solely to imitate service boundaries. A small team making frequent cross-cutting changes may be slowed by version and release coordination.

### Topology comparison

| Evidence | Monorepo may fit | Multiple repositories may fit |
|---|---|---|
| Change coupling | consumers and contracts often change together | contracts are stable and releases are independent |
| Ownership | shared teams and standards | distinct accountable teams or organizations |
| Access | similar access for contributors | material permission separation |
| Tooling | build system supports scoped work | artifact publishing and compatibility are mature |
| Deployment | any number; not decisive by itself | any number; not decisive by itself |

## Reference structures by project shape

These examples show possible starting points. Remove folders that have no code and adapt names to the language and framework.

### Frontend application

```text
src/
├── app/                    # bootstrap, routing, top-level providers
├── features/
│   ├── sign-in/
│   │   ├── components/
│   │   ├── data/
│   │   ├── state/
│   │   └── tests/
│   └── order-history/
├── shared/
│   ├── ui/                 # genuinely reusable visual primitives
│   ├── api/                # transport setup, not domain rules
│   └── utilities/          # small, named technical utilities
├── assets/
└── main.*
```

Place feature-specific components and hooks with their feature. Promote an item to `shared/` only when consumers share its meaning and lifecycle. Remote state, local interaction state, and presentation need not become separate folders if a feature is small.

### Backend application

A feature-oriented backend can start as:

```text
src/
├── app.*                   # composition and startup
├── features/
│   ├── create-invoice/
│   │   ├── route.*
│   │   ├── use-case.*
│   │   ├── schema.*
│   │   └── tests/
│   └── cancel-invoice/
├── invoice/                # shared invoice rules, if they exist
├── integrations/
└── platform/               # configuration, database, telemetry
```

A technical layered backend can instead use `routes/`, `application/`, `domain/`, and `persistence/` if those boundaries add responsibility. A trivial CRUD API may use a validated route and ORM transaction directly; do not add services and repositories that only forward calls. Use [Backend architecture](backend-architecture.md) to decide whether a function, service, repository, or direct ORM access fits the actual behavior.

### Full-stack application

When client and server have different build/runtime constraints:

```text
apps/
├── web/
│   └── src/
└── server/
    └── src/
packages/
├── api-contract/           # generated or authoritative transport schemas
└── test-support/           # only reusable test infrastructure
```

Sharing a repository does not authorize importing server models into browser code. Share an explicit safe contract, not ORM entities, secrets, or backend authorization logic. If the framework intentionally combines client and server, feature folders with clear runtime suffixes can be simpler than workspaces.

### Library

```text
src/
├── index.*                 # supported public API
├── core/
├── adapters/               # only if multiple environments exist
└── internal/
tests/
├── public-api/
└── integration/
examples/                   # executable usage when it adds consumer value
```

Treat exports from the public entry point as a compatibility commitment. Keep internal helpers unexported; do not mirror every internal file in the public API. Separate adapters only when runtime or provider differences are real.

### CLI application

```text
src/
├── cli.*                   # argument parsing and process exit mapping
├── commands/
│   ├── import.*
│   └── validate.*
├── core/                   # behavior reusable without the terminal
├── io/                     # filesystem, network, terminal adapters
└── config.*
tests/
```

For one command, `cli.*` plus one tested core function may be enough. Split command modules when help, validation, and behavior become independently substantial. Keep process exits and terminal formatting outside reusable rules.

### Automation script

Start with the smallest honest shape:

```text
automation/
├── run.*
├── test_run.*
└── README.md
```

If it grows:

```text
automation/
├── run.*                   # orchestration and exit behavior
├── inputs.*                # parsing and boundary validation
├── transform.*             # deterministic core
├── outputs.*               # side effects
└── tests/
```

Do not introduce layers, a dependency injection container, or repositories for a short script. Extract deterministic transformations and effect boundaries when they improve tests, retry safety, or reuse.

### Modular monolith

```text
src/
├── modules/
│   ├── orders/
│   │   ├── public/         # commands, queries, events, or facades for consumers
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── tests/
│   └── billing/
│       ├── public/
│       ├── application/
│       ├── domain/
│       ├── infrastructure/
│       └── tests/
├── platform/               # runtime capabilities, not shared business rules
└── app.*                   # composition root
```

Useful rules include:

- a module owns its data and invariants;
- consumers use `public/`, not another module's internals;
- cross-module transactions and consistency are explicitly designed;
- `platform/` provides technical capabilities and does not become a domain dumping ground;
- module events represent facts, not commands disguised as events;
- dependency checks are added when convention alone is demonstrably insufficient.

Not every module needs all four internal folders. A simple reference-data module can expose a small query without an artificial domain layer.

## Placement rules that prevent entropy

### Shared code

Before moving code to `shared`, identify the kind of reuse:

- **visual reuse:** style and interaction primitives;
- **technical reuse:** transport, parsing, time, or runtime capabilities;
- **contract reuse:** schemas and compatibility commitments;
- **business-knowledge reuse:** one authoritative policy owned by a domain.

Similar code does not imply the same responsibility. Keep independent business rules separate even when their implementation currently looks alike.

### Tests

Co-locate focused unit or component tests when that improves discovery. Keep cross-module integration, contract, migration, and end-to-end tests in a location that names the boundary they exercise. Test location is less important than clear ownership and reliable execution.

### Generated and operational artifacts

Distinguish source from generated clients, build output, coverage, local data, and runtime logs. Commit generated artifacts only when the project has a reason, such as consumer usability or unavailable generation tooling; document the source and regeneration command.

### Configuration and composition

Keep environment-specific values outside business modules. A composition root should assemble concrete dependencies and validate required configuration. Do not let a generic configuration object flow through every function.

## Structure review checklist

- Can a contributor trace one critical behavior from entry point to effect?
- Does each important rule have an identifiable owner and source?
- Do folders represent existing responsibilities rather than anticipated ones?
- Are public and private module surfaces distinguishable?
- Are runtime, security, and data boundaries respected by imports?
- Is shared code classified as visual, technical, contractual, or business reuse?
- Do tests sit at the boundaries where failures matter?
- Is the selected repository topology consistent with ownership and release reality?
- Can one folder or layer be removed without losing responsibility? If yes, simplify.
