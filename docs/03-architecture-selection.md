# 03 — Architecture Selection

Architecture is a set of trade-offs for the current context, not a maturity ladder. Select the least costly option that protects the important behavior and leaves a credible path to change. “More advanced” does not mean “better,” and patterns in this matrix can be complementary rather than mutually exclusive.

Base the decision on [Project classification](01-project-classification.md), compare at least one simpler alternative, and record a durable choice with [`adr.template.md`](../templates/adr.template.md).

## How to use the matrix

1. State the concrete problem in measurable or observable terms.
2. Exclude options whose prerequisites are absent.
3. Compare behavior, team capability, cognitive cost, runtime cost, and operations.
4. Make testing, deployment, migration, rollback, and ownership part of the decision.
5. Choose a starting status: `Essential`, `Conditional`, `Advanced`, or `Not applicable`.
6. Record signals that would reopen the decision.

Typical applicability below is a prompt, not a default imposed on every project.

| Option | Typical initial applicability | Primary reason to consider | Dominant cost |
|---|---|---|---|
| Simple layered structure | `Essential` or `Conditional` | make a modest application navigable | changes can scatter across technical layers |
| Feature-based architecture | `Conditional` | keep one behavior close together | cross-feature rules require discipline |
| Modular monolith | `Conditional` | enforce domain/team boundaries in one deployable | explicit module contracts and boundary governance |
| Clean Architecture | `Conditional` | protect substantial policy from external mechanisms | mapping, indirection, and extra concepts |
| Hexagonal architecture | `Conditional` | isolate a core from multiple or volatile adapters | port design and adapter translation |
| Domain-Driven Design | `Conditional`; tactical patterns often `Advanced` | model genuinely complex business behavior | discovery time and modeling skill |
| Microservices | `Advanced` | independent ownership, scaling, or deployment | distributed operations and consistency |
| Event-driven architecture | `Advanced` when system-wide | decouple reactions in time and ownership | eventual consistency and event evolution |
| CQRS | `Advanced` | separate materially different read and write needs | duplicated models and synchronization |
| Event Sourcing | `Advanced` | events must be the authoritative history | event compatibility, replay, and projections |
| Queues and asynchronous processing | `Conditional` | handle long work, bursts, and controlled retries | idempotency and worker operations |
| Cache | `Conditional` | remove a measured latency or load bottleneck | invalidation and stale data |
| API Gateway | `Conditional` | manage an external entry point across services | critical configuration and another runtime hop |
| Backend for Frontend | `Conditional` | serve materially different client needs | extra service and duplicated orchestration risk |
| Real-time communication | `Conditional` | updates lose value if polled or delayed | connection lifecycle and ordering |
| Multi-tenancy | `Conditional`; isolation variants may be `Advanced` | serve multiple organizations safely | pervasive identity and isolation concerns |

## Decision matrix

### Simple layered structure

- **Problem it solves:** separates a modest codebase into recognizable technical responsibilities such as delivery, application logic, and data access.
- **Consider when:** one team owns one deployable; request/response flows dominate; domain rules are limited; newcomers benefit from familiar technical navigation.
- **Do not use when:** layers would consist only of pass-through calls, or most changes are feature-local but must jump across many technical folders. It may also be insufficient when independent domain boundaries need enforcement.
- **Costs introduced:** layer hopping, temptation to create generic services/repositories, horizontal coupling, and rules drifting between controllers and persistence.
- **Signals it is needed:** handlers mix transport, business decisions, and database details; the same technical concern is implemented inconsistently; a small separation makes tests and ownership clearer.
- **Simpler alternative:** a flat set of cohesive feature functions with boundary validation and direct persistence where appropriate.
- **Testing impact:** unit tests can target real rules and integration tests can cover layer boundaries; avoid mocking every forwarding layer.
- **Deployment and maintenance impact:** normally one build and deploy; maintenance is straightforward while layer contracts remain purposeful, but feature changes can become scattered as the system grows.

### Feature-based architecture

- **Problem it solves:** keeps the UI, use cases, rules, and adapters for one capability close to the reason they change.
- **Consider when:** work is planned by feature; changes repeatedly touch several technical folders; teams need discoverable vertical slices; the application has multiple cohesive capabilities.
- **Do not use when:** the project is a tiny single-purpose utility, or the apparent features are only screens over one indivisible workflow. Do not duplicate a shared business rule merely to keep folders independent.
- **Costs introduced:** uncertainty about what belongs in shared code, possible duplication, cross-feature transaction design, and a need for explicit dependency direction.
- **Signals it is needed:** pull requests span every technical layer for one behavior; merge conflicts cluster in generic folders; ownership follows capabilities rather than technologies.
- **Simpler alternative:** a flat structure or technical folders with clear naming for a small codebase.
- **Testing impact:** behavior and component tests can live with each feature; cross-feature tests remain necessary for contracts and shared flows.
- **Deployment and maintenance impact:** it can remain one deployable; feature-local changes become easier to review, while shared modules need ownership to avoid becoming dumping grounds.

### Modular monolith

- **Problem it solves:** provides explicit capability or domain boundaries while retaining one process and usually one deployment unit.
- **Consider when:** several substantial capabilities change independently; multiple teams need ownership; accidental internal coupling is increasing; transactions and operational simplicity still favor one deployable.
- **Do not use when:** a simple monolith is still easy to change, or requirements already prove that independent failure isolation, technology, geography, or deployment is mandatory. A folder named `modules` without enforced contracts is not a modular monolith.
- **Costs introduced:** module API design, dependency checks, data ownership rules, cross-module workflow design, and possible internal event handling.
- **Signals it is needed:** teams modify each other's internals; cyclic dependencies appear; one domain change causes unrelated regressions; release conflicts grow while runtime distribution offers no proven benefit.
- **Simpler alternative:** a feature-based monolith with conventions and ownership before strict enforcement.
- **Testing impact:** test rules inside modules, module contracts at boundaries, and a limited set of end-to-end flows; boundary tests should prevent forbidden dependencies.
- **Deployment and maintenance impact:** one deployment and simple local transactions remain possible; database and release coordination are shared, but clear module ownership can support later extraction if evidence appears.

### Clean Architecture

- **Problem it solves:** protects high-value business and application policy from UI, framework, database, and provider details through dependency direction.
- **Consider when:** policy is substantial and long-lived; delivery mechanisms or providers change independently; several interfaces drive the same use cases; infrastructure details currently leak into rules.
- **Do not use when:** the application is mostly straightforward CRUD, a script, or a thin integration; layers would only mirror data and forward calls; the team cannot explain what policy is being protected.
- **Costs introduced:** additional boundaries, mappings, composition, contracts, terminology, and the risk of ceremonial use-case/interactor classes.
- **Signals it is needed:** framework upgrades force domain changes; rules cannot be tested without booting infrastructure; provider schemas spread through the code; delivery channels duplicate policy.
- **Simpler alternative:** cohesive use-case functions with direct dependencies and adapters only around demonstrably volatile integrations.
- **Testing impact:** core policies can have fast tests while adapters require integration tests; excessive mocks are a warning that boundaries are too granular.
- **Deployment and maintenance impact:** it usually remains one deployable; maintenance benefits when external mechanisms change, but routine changes pay mapping and navigation costs. Keep only layers that add responsibility.

### Hexagonal architecture

- **Problem it solves:** lets an application core be driven and observed through explicit ports while adapters handle protocols, persistence, UI, and external systems.
- **Consider when:** multiple inbound channels invoke the same behavior; an external dependency is volatile; integration failure semantics need isolation; core tests benefit from controllable boundaries.
- **Do not use when:** there is one stable mechanism around a trivial flow, or each port would exactly mirror one concrete class without translating concepts or protecting policy.
- **Costs introduced:** port ownership and naming, adapter mapping, application composition, more integration contracts, and possible confusion between inbound and outbound responsibilities.
- **Signals it is needed:** vendor models leak into use cases; replacing an integration touches many modules; HTTP handlers, jobs, and CLI commands repeat the same behavior; failures are handled inconsistently.
- **Simpler alternative:** one focused integration wrapper or a direct use-case function with an injected callback at the actual seam.
- **Testing impact:** test the core through inbound ports and adapters against real dependencies or fakes; do not claim an adapter works based only on a mocked port test.
- **Deployment and maintenance impact:** often one deployable, though adapters may be separate processes; port compatibility and mapping add maintenance while limiting the blast radius of infrastructure changes.

### Domain-Driven Design

- **Problem it solves:** creates a shared model and clear boundaries for a domain whose rules, language, states, and trade-offs are genuinely complex.
- **Consider when:** domain experts use nuanced language; invariants interact; behavior depends on history or time; subdomains use the same words differently; misunderstanding rules causes expensive defects. Strategic DDD can help identify boundaries without requiring every tactical pattern.
- **Do not use when:** the system is primarily CRUD, content delivery, or technical orchestration with few business rules; domain experts are unavailable; entities and repositories would be anemic wrappers. Tactical DDD is not a default starting architecture.
- **Costs introduced:** sustained discovery, ubiquitous-language maintenance, aggregate and consistency decisions, mapping, specialist facilitation, and training. Poor modeling adds more complexity than it removes.
- **Signals it is needed:** rule changes repeatedly break unrelated behavior; terms conflict across teams; validation is duplicated; state transitions and exceptions are hard to explain; technical tables dominate business conversations.
- **Simpler alternative:** feature modules with named policy functions, validated data, and an explicit state-transition table.
- **Testing impact:** examples from domain experts become invariant, policy, state-transition, and scenario tests; persistence tests verify aggregate boundaries only where used.
- **Deployment and maintenance impact:** bounded contexts do not require separate services; language and model evolution must be maintained, and cross-context contracts need translation. See [Domain modeling](06-domain-modeling.md).

### Microservices

- **Problem it solves:** enables independent ownership, deployment, scaling, technology, or failure containment for capabilities with well-understood boundaries.
- **Consider when:** those independent properties have measured value; boundaries are stable enough to own data and contracts; multiple capable teams exist; platform, observability, security, and on-call practices can support many services.
- **Do not use when:** product and domain boundaries are still being discovered; one small team owns everything; a monolith meets deployment and scaling needs; the main reason is fashion or hypothetical growth. Do not use microservices as the default initial architecture.
- **Costs introduced:** network and partial failures, eventual consistency, duplicated platform work, service discovery, contract evolution, distributed security, observability, deployment coordination, incident response, and higher infrastructure cost.
- **Signals it is needed:** a modular boundary requires demonstrably independent scaling or release cadence; one capability's failures must be contained; teams are blocked by shared releases despite disciplined modularization; legal or geographic isolation requires separation.
- **Simpler alternative:** a modular monolith, separately scalable worker, read replica, or extraction of only one proven hotspot.
- **Testing impact:** emphasize consumer/provider contracts and service-level integration tests; retain a few critical end-to-end tests because broad suites become slow and fragile. Test failure and timeout behavior explicitly.
- **Deployment and maintenance impact:** each service needs pipeline, rollback, monitoring, secrets, capacity, and ownership; changes require backward-compatible contracts and data migration strategies. Operational maintenance is continuous, not a one-time setup.

### Event-driven architecture

- **Problem it solves:** decouples producers from reactions in time and ownership, allowing several consumers to respond to a fact without synchronous orchestration.
- **Consider when:** events are meaningful business facts; consumers evolve independently; delayed consistency is acceptable; replay or buffering has value; failure of one reaction must not block the producer.
- **Do not use when:** a direct call is clearer; the user needs one immediate transactional outcome; global ordering is required but unavailable; events would merely conceal a synchronous workflow. One queued job does not require a system-wide event-driven architecture.
- **Costs introduced:** eventual consistency, duplicate and out-of-order delivery, schema evolution, event discovery, correlation, replay, dead-letter handling, and harder debugging.
- **Signals it is needed:** a producer repeatedly changes to call new consumers; polling and batch synchronization proliferate; synchronous fan-out harms availability; independently owned reactions are emerging.
- **Simpler alternative:** direct calls, in-process events, a transactional outbox feeding one worker, or a scheduled job.
- **Testing impact:** test event contracts, idempotent consumers, ordering assumptions, eventual outcomes, and replay; include integration tests with the actual broker when one exists.
- **Deployment and maintenance impact:** producers and consumers must tolerate version overlap; operators need event catalogs, lag metrics, retention, dead-letter and replay procedures. Removing or renaming fields requires compatibility planning.

### CQRS

- **Problem it solves:** separates command models that protect invariants from query models optimized for materially different read shapes or scale.
- **Consider when:** write behavior is complex but reads need denormalized views; read and write loads differ substantially; several projections serve distinct consumers; eventual consistency is acceptable and owned.
- **Do not use when:** CRUD reads and writes use the same model effectively; “separation” would only create duplicate DTOs; the team cannot operate projection lag or rebuilds. CQRS is not a default starting pattern.
- **Costs introduced:** duplicated schemas and code, projection pipelines, consistency delay, rebuild tooling, synchronization failures, and a more complex mental model.
- **Signals it is needed:** query requirements distort the transactional model; read scaling dominates measured load; many complex joins or consumer-specific views conflict with write invariants.
- **Simpler alternative:** separate command and query functions over one database, a database view, targeted read replica, or one denormalized table maintained transactionally.
- **Testing impact:** test command invariants and query projections separately, plus end-to-end convergence, duplicate events, and projection rebuilds.
- **Deployment and maintenance impact:** projection versions and migrations may overlap; deploy order must preserve event/contract compatibility. Operators must monitor lag and maintain backfill and rebuild procedures.

### Event Sourcing

- **Problem it solves:** makes an append-only sequence of domain events the authoritative state, supporting temporal reconstruction and decisions that depend on the exact history.
- **Consider when:** history is core business data; reconstructing state at a point in time is required; corrections must preserve prior facts; the team can design immutable events and operate projections. Audit alone rarely justifies it.
- **Do not use when:** current state plus a conventional audit trail is sufficient; deletion/privacy constraints conflict with immutable payloads; the domain is simple; event meaning is unstable; replay and projection operations are not funded. Event Sourcing is not a default.
- **Costs introduced:** permanent event-schema compatibility, upcasting, replay time, projection consistency, storage growth, debugging tools, concurrency design, privacy handling, and scarce expertise.
- **Signals it is needed:** temporal questions are frequent and contractual; state reconstruction drives core behavior; a conventional history model cannot express required corrections or causality; stakeholders accept the operational cost.
- **Simpler alternative:** current-state tables plus an audit log, effective-dated history tables, snapshots, or explicit domain events used only for integration.
- **Testing impact:** test event sequences, invariant decisions, optimistic concurrency, upcasters, snapshots, replay, and all critical projections using historical fixtures.
- **Deployment and maintenance impact:** stored events must remain readable indefinitely; projection rebuilds and event migrations need controlled tooling. Retention, encryption, redaction, and incident recovery require special procedures.

### Queues and asynchronous processing

- **Problem it solves:** moves long-running or bursty work out of a request, buffers load, and enables bounded retries or independent workers.
- **Consider when:** work exceeds response limits; peaks overwhelm a dependency; completion can be reported later; retries and backpressure improve reliability; scheduled or batch processing is natural.
- **Do not use when:** the result must be part of the same immediate transaction; throughput is small and predictable; a direct call is more reliable; the team lacks a way to observe and replay jobs.
- **Costs introduced:** broker or job-store operation, workers, at-least-once delivery, duplicate and poison messages, idempotency, retry policy, dead-letter handling, status reporting, and eventual consistency.
- **Signals it is needed:** recurring timeouts, manual reprocessing, burst-related failures, wasted request capacity, or long work blocking user-facing paths.
- **Simpler alternative:** an in-process background task where loss is acceptable, a database-backed job table, scheduled batch, or a bounded synchronous call.
- **Testing impact:** test idempotency, retry exhaustion, concurrency, duplicate/out-of-order messages, poison jobs, and user-visible status; integration-test serialization and the real queue boundary.
- **Deployment and maintenance impact:** workers may deploy and scale separately; drain behavior and message compatibility matter during rollout. Monitor queue depth, oldest age, retry rate, dead letters, and replay outcomes.

### Cache

- **Problem it solves:** reduces measured latency, repeated computation, or load on a constrained dependency.
- **Consider when:** profiling identifies hot, reusable data; an acceptable staleness window exists; invalidation can be stated; the source of truth remains clear.
- **Do not use when:** no bottleneck has been measured; every read must be immediately current; data is highly personalized or sensitive without safe keying; invalidation rules are unknown.
- **Costs introduced:** stale results, invalidation, stampedes, eviction, memory and service cost, cache poisoning, tenant leakage through bad keys, and a second behavior path.
- **Signals it is needed:** repeated identical queries dominate latency or cost; dependency limits are reached; precomputation has a demonstrated payoff.
- **Simpler alternative:** fix the query or algorithm, add a justified index, remove repeated calls within one request, precompute a static artifact, or use protocol caching at one boundary.
- **Testing impact:** cover hit, miss, expiry, invalidation, stampede protection, unavailable cache, authorization, and tenant-key isolation; correctness must not rely on a warm cache unless explicitly designed.
- **Deployment and maintenance impact:** rolling versions may need compatible key/value formats; warming and cold-start behavior affect releases. Maintain TTLs, capacity, eviction metrics, cost, and an emergency bypass.

### API Gateway

- **Problem it solves:** provides one external entry point for routing and genuinely common edge concerns across multiple services or APIs.
- **Consider when:** clients otherwise manage many endpoints; authentication verification, rate limiting, certificates, routing, or protocol translation must be applied consistently; service topology should remain internal.
- **Do not use when:** there is one application endpoint, a simple load balancer or reverse proxy is enough, or business orchestration would be hidden in gateway configuration.
- **Costs introduced:** another network hop, critical configuration, possible single failure domain, vendor coupling, security concentration, deployment coordination, and difficult local reproduction.
- **Signals it is needed:** clients duplicate service discovery; edge controls drift; public topology changes break consumers; certificates and rate policies are managed inconsistently.
- **Simpler alternative:** a load balancer, reverse proxy, framework middleware, or one public application API.
- **Testing impact:** test routing, identity propagation, limits, timeouts, headers, error mapping, and bypass prevention; retain service tests because the gateway does not validate service behavior.
- **Deployment and maintenance impact:** route and contract changes may require coordinated rollout; gateway rollback is high-impact. Maintain certificates, policy ownership, access logs, latency, capacity, and configuration review.

### Backend for Frontend

- **Problem it solves:** gives a specific client type an API optimized for its interaction, aggregation, release cadence, and network constraints.
- **Consider when:** web, mobile, partner, or device clients have materially different data and orchestration needs; client teams own the BFF; chattiness or over-fetching is measured.
- **Do not use when:** one API serves all clients clearly; differences are cosmetic; a few targeted endpoints solve the issue; the BFF would duplicate authorization or business policy.
- **Costs introduced:** another deployable or module, API composition, duplicated mapping, latency, authentication propagation, client-specific maintenance, and the risk of divergent business rules.
- **Signals it is needed:** one client's changes repeatedly block others; mobile requires many round trips; generic endpoints become collections of client conditionals; release ownership is misaligned.
- **Simpler alternative:** client-oriented endpoints in the existing backend, response shaping, or a thin composition module within the monolith.
- **Testing impact:** test each client contract, aggregation failure, authorization propagation, latency budget, and compatibility; keep business-rule tests in the authoritative service or domain.
- **Deployment and maintenance impact:** a BFF can release with its client but must remain compatible with downstream APIs. Own dashboards and on-call paths, and prevent shared policy from drifting between BFFs.

### Real-time communication

- **Problem it solves:** delivers server changes with low latency for collaboration, monitoring, presence, progress, or time-sensitive updates.
- **Consider when:** stale information causes a material problem; polling creates unacceptable load or latency; connection state and delivery semantics can be defined; clients can reconnect safely.
- **Do not use when:** periodic polling meets the need; events are rare; background refresh is sufficient; the team cannot operate many long-lived connections. “Modern UX” alone is not evidence.
- **Costs introduced:** connection lifecycle, fan-out, ordering, duplicates, reconnect and resume, presence state, authorization over time, load balancing, capacity, and client fallback behavior.
- **Signals it is needed:** measured polling load is wasteful; users act on stale shared state; job progress needs prompt updates; collaboration conflicts are caused by delayed visibility.
- **Simpler alternative:** polling with conditional requests, long polling, or Server-Sent Events before bidirectional WebSockets when only server push is required.
- **Testing impact:** cover reconnect, missed and duplicate messages, ordering assumptions, authorization changes, slow consumers, fan-out load, and fallback behavior.
- **Deployment and maintenance impact:** releases need connection draining and message-format compatibility; operators need connection, fan-out, lag, disconnect, and retry metrics. Stateful presence may constrain scaling.

### Multi-tenancy

- **Problem it solves:** allows one product or platform to serve multiple organizations while preserving identity, configuration, authorization, data isolation, and fair resource use.
- **Consider when:** multiple customer organizations are an actual product requirement; shared operation has economic or delivery value; isolation levels and tenant lifecycle are explicit.
- **Do not use when:** there is one organization, separate installations are contractually required, or tenancy is only hypothetical. Do not assume one shared-database strategy fits every data class or customer.
- **Costs introduced:** tenant context in every path, resource-level authorization, data and cache key isolation, noisy-neighbor controls, configuration, migrations, support tooling, billing/metering, backup/restore, and deletion/export workflows.
- **Signals it is needed:** the first real second organization is planned; contracts define segregation; per-organization configuration and administration emerge; separate deployments are becoming operationally wasteful.
- **Simpler alternative:** separate single-tenant instances, or a shared application with explicitly separate databases/schemas before adopting finer-grained row sharing. Each option trades isolation for cost and operational complexity.
- **Testing impact:** negative isolation tests are mandatory wherever tenancy applies; test identity propagation, cache and queue keys, authorization, migrations, export/deletion, and noisy-neighbor limits.
- **Deployment and maintenance impact:** rollout and migrations may need tenant batching, compatibility, and per-tenant rollback. Maintain tenant provisioning, suspension, key rotation, data residency, recovery, support access, and isolation incident response.

## Combining options deliberately

These options describe different axes. A feature-based modular monolith can use one queue for imports and one cache for measured read pressure without becoming a microservice or event-driven system. Clean and hexagonal architectures overlap in their protection of policy and boundaries; using both labels rarely adds value unless the project defines the distinction.

Avoid “pattern bundles.” In particular:

- DDD does not require microservices, repositories for every entity, or Event Sourcing;
- microservices do not require CQRS or an event bus for every interaction;
- CQRS does not require Event Sourcing;
- a queue does not make all state eventually consistent;
- multi-tenancy does not prescribe one database topology;
- feature folders do not remove the need for shared authoritative rules.

Use [Engineering principles](02-engineering-principles.md) to review coupling and abstraction, and [Project structure](04-project-structure.md) to represent the chosen boundaries without adding empty layers.

## Decision record checklist

For any `Advanced` choice, and for consequential `Conditional` choices, record:

- current evidence and the problem being solved;
- simpler alternatives and why they are insufficient;
- prerequisites and team ownership;
- consistency and failure semantics;
- effect on tests, deploy, rollback, migrations, security, and observability;
- introduced costs and consciously accepted debt;
- success measures and review triggers;
- an exit or simplification path where feasible.

If the evidence disappears, simplifying the architecture is a valid evolution.
