# 07 — API Design

## Purpose and applicability

This document guides API contracts and protocol behavior. It does not require REST. Internal controller, application-service, repository, integration, and asynchronous-processing boundaries belong to [backend architecture](backend-architecture.md).

- **Essential:** make contracts and failure behavior explicit at meaningful interfaces; make validation and access policy explicit at exposed or untrusted boundaries.
- **Conditional:** apply the HTTP/REST guidance when the project exposes an HTTP API.
- **Advanced:** use generated clients, distributed rate limiting, or parallel API versions only when consumers and scale justify their cost.
- **Not applicable:** remove the HTTP sections for libraries, CLIs, or scripts with no API; still keep contracts clear at the boundaries that do exist.

Before deciding, consult [backend architecture](backend-architecture.md), [domain modeling](06-domain-modeling.md), [data and persistence](08-data-and-persistence.md), [security](11-security.md), and [observability](13-observability.md).

## Contract before implementation

A contract describes observable behavior, not internal structure. Record at least:

- operation and purpose;
- required authentication and permissions;
- parameters, request body, and input schemas;
- output schemas and status codes;
- expected errors;
- idempotency semantics;
- pagination, filtering, and sorting;
- side effects and compatibility guarantees.

Use the [API contract template](../templates/api-contract.template.md). For public REST APIs, integrations owned by different teams, or generated clients, keep OpenAPI as a verifiable source of truth. Generate or validate it in CI so implementation and documentation cannot drift unnoticed. For a small internal API with one consumer, typed schemas next to the routes can be sufficient; adopt OpenAPI when manual coordination starts failing.

### Input and output schemas

Do not expose ORM entities automatically. Transport models describe the public contract and may differ from persistence models.

- validate types, formats, limits, and field combinations at the boundary;
- normalize only unambiguous transformations, such as trimming an identifier whose definition allows it;
- reject unknown fields when accepting them could hide a client error;
- never trust tenant, ownership, or permission identifiers supplied by a client;
- use distinct request and response models when reads and writes have different needs;
- do not return internal fields, secrets, stack traces, or unnecessary personal data.

Schema validation does not replace domain invariants. “This field is a valid date” belongs at the boundary; “the deadline must follow approval” belongs to the business rule.

## Predictable REST semantics

REST is **Conditional**: it is useful when resources and operations map naturally to HTTP. RPC, GraphQL, events, or local interfaces may fit better depending on consumers, latency, and the domain. Do not disguise a complex command as CRUD when doing so hides intent.

### Resources, methods, and HTTP status codes

Prefer stable nouns in URLs and use methods according to their semantics:

| Situation | Typical method/status | Note |
| --- | --- | --- |
| Create a resource | `POST` + `201` | Return its location or representation. |
| Read | `GET` + `200` | Do not create business side effects. |
| Replace | `PUT` + `200`/`204` | Must be idempotent. |
| Partially update | `PATCH` + `200`/`204` | Document the patch format and absent-field behavior. |
| Delete | `DELETE` + `204` | Define whether repetition returns `204` or `404`. |
| Explicit command | `POST /orders/{id}/cancel` | Useful when a transition is clearer than a generic patch. |

Use status codes consistently:

- `400` for malformed requests or syntactic validation failures;
- `401` for missing or invalid authentication;
- `403` when the authenticated identity may not perform the action;
- `404` when a resource does not exist or must be hidden from the caller;
- `409` for state, uniqueness, or concurrency conflicts;
- `422` for syntactically valid but semantically invalid input, if the contract makes this distinction;
- `429` when a usage limit is exceeded;
- `500` for unexpected failures, without internal details.

Choose one convention for `400` versus `422` and apply it consistently. Predictability matters more than personal preference.

### Standard error model

Every endpoint should use the same basic shape. `code` is stable and machine-readable, `message` is human-readable, `details` contains only safe structured information, and `correlation_id` locates the execution.

```json
{
  "code": "RESOURCE_CONFLICT",
  "message": "The operation cannot be completed in the current state.",
  "details": {
    "current_state": "approved",
    "requested_operation": "edit"
  },
  "correlation_id": "01J2..."
}
```

Consumers must not depend on the text of `message`. For validation errors, `details` may contain field names and stable codes without echoing sensitive values. Map known failures at the HTTP boundary; log unexpected exceptions internally and return a generic error.

## Collections: pagination, filtering, and sorting

- **Essential for potentially large collections:** a maximum page size and deterministic ordering.
- **Conditional:** offset pagination is simple and works for small datasets or page-by-page navigation.
- **Conditional:** cursor pagination is preferable for large or frequently changing feeds; its contract and implementation are more complex.
- **Not applicable:** do not paginate a small enumeration that is bounded by definition.

Document allowed filters, operators, date formats, timezone, filter combinations, and sortable fields. Add a stable tie-breaker such as `created_at,id`. Never pass arbitrary client field names directly to the database. Exact total counts can be expensive; make them optional or approximate when scale justifies it.

## Evolution and backward compatibility

Compatible changes include adding an optional response field or a new endpoint. Incompatible changes include removing or renaming fields, narrowing accepted values, changing semantics, or making an optional input mandatory.

Preferred sequence:

1. evolve additively;
2. mark elements as deprecated and measure usage;
3. provide a migration window;
4. version only when incompatibility is unavoidable;
5. remove the old version on a communicated date.

Path versioning (`/v1`) is explicit; header versioning keeps URLs stable but is harder to inspect. Record the choice in an [ADR](adr/README.md). Parallel versions increase testing, support, and divergent-fix costs; do not create `v2` for an internal refactor.

Typed clients generated from OpenAPI reduce drift and repeated work when there are several consumers. They also add generator, publication, and upgrade costs. For one client in the same repository, shared transport types or build-time contract validation can be simpler, provided the frontend is not coupled to backend internals.

## Idempotency and concurrency

`GET`, `PUT`, and `DELETE` should have idempotent semantics. For `POST` commands that callers may retry after a timeout—payments, order creation, or job submission—accept an idempotency key:

1. scope the key to the identity or tenant and operation;
2. store the request hash and result for a defined period;
3. return the stored result for the same request;
4. reject reuse of the key with a different payload;
5. make the business effect and result record atomic.

The cost is additional storage, expiration, and concurrency handling. It is unnecessary for reads or actions already safe to repeat. For concurrent updates, consider a version/ETag with `If-Match`; see [data and persistence](08-data-and-persistence.md).

## Authentication, authorization, and rate limiting

- classify every operation explicitly as public or protected;
- for protected operations, authenticate at the boundary and propagate a verified identity, not raw credentials;
- authorize the operation and, when relevant, the specific resource in the trusted backend;
- derive tenant and scope from trusted context;
- treat frontend visibility controls as user experience, never enforcement;
- rate-limit by identity, tenant, IP, or operation according to the abuse model;
- return `Retry-After` when useful, and do not rely on rate limiting alone to enforce business quotas.

In-process rate limiting works for one instance. Distributed coordination requires shared state and adds latency and an operational dependency. A low-risk private API may not need it. See [security](11-security.md) for decision criteria.

## Request correlation

Accept an external correlation ID only when it meets format and length limits; otherwise generate one. Propagate it through calls, jobs, and events, return it in headers and error responses, and include it in structured logs. It must contain no personal data and must never be treated as a security control.

## Backend responsibility boundary

The transport boundary parses and bounds input, establishes correlation context, authenticates and propagates verified identity for protected operations, invokes one backend operation, and maps its outcome to the documented contract. It must not leak persistence entities or provider-specific failures into the API.

How thin routes, simple functions, focused services, direct ORM access, repositories, integrations, transactions, asynchronous work, errors, logs, audit, and events are organized is defined in [backend architecture](backend-architecture.md). API design owns only their externally observable request, response, error, compatibility, authentication/authorization, idempotency, and correlation semantics.

## Signals to evolve

Reassess the API contract when a persistent signal appears:

- consumers interpret the same operation differently;
- HTTP-specific models leak storage or provider details;
- pagination no longer produces stable or affordable queries;
- consumers break because the contract is not verified;
- concurrency conflicts or duplicate requests cause real effects;
- deprecation cannot proceed because consumer use is unknown.

Make the smallest contract change that resolves the observed problem, preserve compatibility where required, and record high-impact choices in [ADRs](adr/README.md).

## Review checklist

- [ ] Does the contract define inputs, outputs, errors, permissions, and side effects?
- [ ] Are public schemas separated from internal entities when needed?
- [ ] Are HTTP methods and status codes semantically consistent?
- [ ] Do pagination, filters, and sorting have limits and deterministic ordering?
- [ ] Are changes backward compatible or covered by an explicit migration plan?
- [ ] Are retry-prone operations idempotent?
- [ ] Is every operation explicitly public or protected, with protected operations authorized in the backend using resource/tenant context?
- [ ] Is transport mapping separated from internal backend organization?
- [ ] Do errors and logs include a correlation ID without sensitive data?
