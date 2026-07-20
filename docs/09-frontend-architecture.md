# 09 — Frontend Architecture

## Purpose and applicability

Frontend architecture should make user behavior, state, and integration boundaries understandable without introducing a framework inside the framework.

- **Essential when a frontend exists:** accessible rendering and interaction, clear responsibility, and support for the intended viewports and input methods.
- **Essential when interactive state exists:** explicit state ownership and deliberate loading, empty, success, and error behavior.
- **Essential when remote data exists:** one consistent API boundary and explicit stale, retry, timeout, and failure behavior.
- **Conditional:** feature-based modules, shared state, reusable hooks, forms libraries, and server-state libraries as complexity appears.
- **Advanced:** micro-frontends, offline synchronization, or a broad frontend platform only for proven organizational or product needs.
- **Not applicable:** remove this document for a backend-only API, library, CLI, or automation script.

Technology choice belongs in the [technology stack template](../templates/technology-stack.template.md). API and visual-system boundaries are covered in [API design](07-api-design.md) and the [design system guide](10-design-system.md).

## Start with user flows and ownership

For each screen or flow, identify:

1. what the user is trying to accomplish;
2. which state is local, shared in the client, or owned by the server;
3. which permissions and domain rules affect the flow;
4. which loading, empty, success, partial, and error states exist;
5. which behavior must remain usable with keyboard, zoom, and assistive technology;
6. which API contract is consumed.

This prevents folder conventions and component extraction from becoming substitutes for understanding behavior.

## Organize by feature when it improves locality

A feature-based structure is **Conditional**, particularly useful when several screens, state transitions, API calls, and tests evolve together.

```text
src/
├── app/                 # composition root, routing, providers
├── features/
│   ├── billing/
│   │   ├── components/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── model/
│   │   └── tests/
│   └── account/
├── shared/
│   ├── ui/              # domain-neutral visual primitives
│   ├── api/             # transport policy and generated client
│   └── utilities/       # stable technical utilities
└── main.*
```

This is an example, not a required tree. A small page may keep a few files together. Move code into a feature when locality reduces navigation and accidental coupling. Keep feature internals private where the language/tooling permits, and expose a small public entry point.

Do not turn `shared/` into a dumping ground. Code belongs there only after its semantics are genuinely common and stable. Similar-looking business behavior in billing and account management may still represent different rules and should remain separate.

See [project structure](04-project-structure.md) for technical, domain, hybrid, and repository-level alternatives.

## Components and composition

A component should have one coherent reason to change. Separate concerns where it clarifies behavior:

- **presentation:** markup, styling, accessibility, and interaction events;
- **state/orchestration:** loading data, coordinating mutations, and interpreting flow state;
- **data access:** transport, serialization, authentication context, and error mapping;
- **domain policy:** calculations and transitions in a testable source of truth outside incidental rendering code.

This does not require four files for every button. A small component may own local state and markup when the combination is readable.

### Extract a component when

- a meaningful visual or interaction unit repeats;
- a block has a clear name and contract;
- isolated testing or accessibility review becomes valuable;
- it changes independently of its parent;
- the parent is difficult to understand because it mixes several responsibilities.

Do not extract only to reduce line count. One use and five readable lines usually need no abstraction.

### Prefer composition to universal components

Avoid components with dozens of conditional properties such as `isInvoice`, `isCompact`, `showAdminActions`, and `specialHeader`. They couple unrelated use cases and create invalid combinations.

Prefer explicit composition:

```text
<Card>
  <InvoiceSummary />
  <InvoiceActions />
</Card>
```

Use variants for a bounded visual vocabulary, such as button size or intent. Use distinct domain components when behavior or rules differ. A shared primitive should not import a feature module.

## Shared and domain-specific components

| Kind | Examples | Ownership rule |
| --- | --- | --- |
| Shared visual primitive | Button, input, modal shell | Domain-neutral; accessibility and appearance are centralized. |
| Shared technical component | Error boundary, route guard shell | Reuses a stable technical policy, not a business rule. |
| Domain component | Invoice status badge, approval timeline | Lives with the feature/domain and uses its vocabulary. |
| Page/flow component | Checkout, onboarding step | Orchestrates one user outcome and may compose all of the above. |

Promote a domain component to shared only when its meaning—not merely its CSS—is common. Reuse of visual decisions, technical mechanics, and business rules are separate decisions.

## Hooks and reusable behavior

Hooks or equivalent composables are **Conditional**. Extract one when it captures a coherent reusable lifecycle or integration behavior, such as debounced search or subscription cleanup. Keep it within a feature if it knows domain terms.

Avoid hooks that:

- hide unrelated requests and side effects;
- return a large bag of flags and callbacks;
- duplicate server-state caching already handled elsewhere;
- are extracted before a second conceptual use exists;
- make call order or dependencies implicit.

A plain function is preferable for pure calculation; a component is preferable when the reuse is mostly markup.

## State ownership

Put state in the narrowest authoritative owner.

| State kind | Starting point | Move when | Typical mistake |
| --- | --- | --- | --- |
| Local UI state | Component or nearby reducer | Siblings truly coordinate it or URL persistence is required | Globalizing modal/open flags prematurely. |
| Shareable navigation state | URL/query parameters | It is not meaningful to bookmark or navigate | Keeping filters only in memory and breaking back/forward. |
| Shared client state | Feature context/store | Many distant consumers need coordinated writes | One global store for every field. |
| Remote/server state | Query/cache layer or feature API module | A trivial one-off fetch does not justify a dependency | Copying server data into a second global source of truth. |
| Form draft | Form/component boundary | A multi-step draft must survive navigation | Treating every keystroke as global business state. |

Remote state needs freshness, invalidation, retry, cancellation, and race handling. A dedicated library may help when these concerns recur, but it introduces conventions, cache behavior, and dependency cost. For a small flow, an explicit request plus local state can be clearer.

Never duplicate an authoritative server value into client state without defining synchronization. Optimistic updates are **Conditional**: use them when reversal is safe and conflicts are handled; do not use them for high-risk transitions merely to feel faster.

## Standardize API access

Centralize transport policy rather than every endpoint:

- base URL and environment configuration;
- credential/session attachment;
- timeout and cancellation;
- request/correlation headers;
- safe retry rules;
- response decoding and schema validation when appropriate;
- mapping from structured API errors to application errors;
- observability hooks without sensitive data.

Feature modules may own endpoint-specific calls and typed models. Do not let components scatter raw fetch calls with inconsistent authentication and error handling. Do not silently retry non-idempotent mutations. Follow the [API contract](07-api-design.md) rather than importing ORM/domain internals.

## Forms and validation

Use native controls and browser semantics where possible. A form library is **Conditional** when nested data, dynamic fields, complex validation, or repeated forms justify its learning and bundle cost.

- associate every control with an accessible label;
- expose instructions and errors programmatically, not only by color;
- preserve user input after a recoverable failure;
- distinguish field errors, form-level business errors, and infrastructure failures;
- validate format in the client for timely feedback, but enforce all security and business rules in the backend;
- avoid disabling submission without explaining why;
- define date, locale, number, and timezone behavior explicitly;
- focus or announce the error summary after a failed submit when appropriate.

Client validation is user experience, not a security boundary.

## Loading, empty, error, and partial states

Every remote view should deliberately define:

- **initial loading:** reserve layout space and communicate progress;
- **background refresh:** keep usable stale content when safe;
- **empty:** distinguish “no records exist” from “filters found none” and offer the next action;
- **error:** explain what the user can do, preserve safe context, and expose the correlation ID for support;
- **partial data:** identify unavailable sections without representing the whole operation as successful;
- **mutation pending:** prevent accidental duplicate effects without trapping the user indefinitely.

Skeletons are not automatically better than a progress message; use them when they reflect the eventual layout. Error boundaries protect rendering trees but do not replace expected request-error handling.

## Accessibility and responsiveness

Accessibility is **Essential**, not a post-release enhancement.

- use semantic HTML before ARIA;
- preserve keyboard order, visible focus, and escape/close behavior;
- test labels, names, roles, and announcements with assistive technology for critical flows;
- meet the contrast target selected by the project;
- support text resizing, zoom, reduced motion, and adequate target sizes;
- never require hover, color, or pointer precision as the only signal;
- keep DOM order meaningful when visual layout changes.

Responsiveness should follow content constraints and supported devices, not an arbitrary device list. Define breakpoints in the visual system when one exists, test narrow/wide layouts and content expansion, and avoid hiding essential actions on small screens.

See the [design system guide](10-design-system.md) for tokens and shared components and [testing](12-testing.md) for component and end-to-end coverage.

## Signals to add structure

- repeated request lifecycle code causes inconsistent behavior;
- remote data is stale because invalidation is ad hoc;
- a component has many mutually dependent flags or domain branches;
- accessibility fixes repeat across similar controls;
- several teams modify the same shared area without ownership;
- feature changes require edits across unrelated technical folders.

Respond to the observed signal: extract one boundary, add one policy, or reorganize one feature. Micro-frontends are not the default response to a large directory; they add deployment, consistency, performance, routing, and ownership costs and require an organizational reason.

## Review checklist

- [ ] Is each state owned by the narrowest authoritative scope?
- [ ] Are presentation, orchestration, data access, and domain rules understandable?
- [ ] Are shared primitives domain-neutral and feature internals contained?
- [ ] Does composition avoid a universal component with conditional props?
- [ ] Are API calls typed and consistently handle authentication, cancellation, and errors?
- [ ] Do forms remain accessible and preserve recoverable input?
- [ ] Are loading, empty, error, partial, and success states intentional?
- [ ] Do keyboard, screen-reader, zoom, and responsive checks cover critical flows?
- [ ] Does every abstraction solve observed conceptual duplication?
