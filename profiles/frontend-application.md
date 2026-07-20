# Profile: Frontend Application

Use this profile for a SPA, dashboard, portal, or web client that consumes one or more APIs. The frontend may store local preferences, but no first-party database is assumed and the client is never the authority for authorization rules.

Start with the [architecture assessment](../templates/architecture-assessment.template.md) and document relevant boundaries using the [API contract template](../templates/api-contract.template.md).

## Characteristics

- Interactive UI with view state and remote data.
- Authentication and resource authorization may be provided by a backend or identity provider when the UI exposes protected behavior.
- Loading, empty, success, and error states.
- Routes, forms, and workflows that evolve by feature.
- Independent deployment is possible, but not required.
- Compatibility with external contracts matters.

## Recommended initial architecture

Organize by feature once the application has more than a few workflows. Keep feature-specific presentation, state, and data access close together; keep cross-cutting infrastructure small and explicit. Remote data should have one known source rather than competing copies in global stores.

```text
src/
├── app/                 # bootstrap, routes, providers
├── features/
│   ├── orders/
│   │   ├── components/
│   │   ├── api/
│   │   ├── model/
│   │   └── routes/
│   └── users/
├── shared/
│   ├── ui/
│   ├── api/
│   └── utilities/
└── tests/
```

Do not create every folder preemptively. A small feature can begin with one component and its test.

## Practice selection

### Essential

- Typed input/output contracts when the technology permits, with executable boundary validation for untrusted responses.
- One HTTP client policy for timeouts, correlation, errors, and authentication when present.
- Server-side authorization for protected behavior; hiding UI controls is only a usability measure.
- Local state by default and shared state only for demonstrated consumers.
- Accessible forms, coherent validation, and actionable messages.
- Deliberate handling of loading, empty, error, retry, and session-expiration states when sessions exist.
- Behavioral tests for important workflows and components.
- Prevention of sensitive data in logs, analytics, and browser storage.

### Conditional

- Remote-data caching when it improves latency with acceptable staleness.
- Global stores for genuinely shared state, not every API response.
- Generated clients when the OpenAPI contract is stable and versioned.
- Tokens and a component library when reuse and governance justify maintenance.
- Real-time communication for collaboration or live information with a defined latency need.

### Advanced

- A BFF when the UI repeatedly aggregates APIs, protects credentials, or needs a channel-specific contract.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- A frontend-owned database and migrations.
- Repository Pattern around straightforward HTTP calls.
- Full tactical DDD for presentation state.
- Microservices, queues, or Event Sourcing inside the client.
- Universal components with dozens of conditional properties.

## Minimum testing strategy

- Component tests for forms, empty/error states, and permission-driven presentation when permissions exist.
- Unit tests for non-trivial transformations and presentation rules.
- Contract tests or schema-validated fixtures for every critical API.
- One end-to-end test per highest-risk journey, including network failure and expired sessions when sessions exist.
- Automated accessibility, type, lint, and build checks.

Avoid mocking the whole application: green tests can still disagree with the real contract.

## Common risks

- Duplicating the same business rule in browser and server.
- Keeping divergent copies of data in cache, store, and component state.
- Coupling domain components through an over-configurable shared component.
- Ignoring cancellation, concurrent requests, and out-of-order responses.
- Assuming backend and frontend will always be deployed together.
- Trusting route guards as a security boundary.

## Evolution signals

Consider a BFF when cross-API composition repeatedly moves into the browser or credentials cannot reach the client. Extract a visual library only after consumers and governance exist. Revisit state management when synchronization defects recur, not merely because screen count grows.
