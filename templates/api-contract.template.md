# API Contract

> One contract per cohesive API surface. The machine-readable schema (for example OpenAPI, AsyncAPI, GraphQL schema, or protobuf) is authoritative where present; this document records behavior and decisions not expressed there.

## Contract identity

- **Name and version:** `{...}`
- **Protocol/style:** `REST / RPC / GraphQL / Event / Other`
- **Owner and consumers:** `{...}`
- **Base URL/topic/interface:** `{...}`
- **Machine-readable contract:** `{relative link}`
- **Stability:** `Experimental / Supported / Deprecated`

## Compatibility policy

- Compatible changes: `{e.g., optional response field}`
- Breaking changes: `{e.g., removed field, changed meaning}`
- Versioning and deprecation window: `{...}`
- Consumer notification and migration: `{...}`

## Security and limits

- Authentication: `{mechanism or None with reason}`
- Authorization: `{resource/action enforcement}`
- Tenant scope: `{derivation and validation}`
- Rate/resource limits: `{identity, window, response}`
- Sensitive fields and logging restrictions: `{...}`

## Operation

### `{METHOD /path or message name}`

- **Purpose:** `{observable capability}`
- **Idempotency:** `{safe by method, key semantics, or not idempotent}`
- **Authorization:** `{actor, action, resource}`
- **Input:** `{schema reference; required/optional fields and constraints}`
- **Successful output:** `{status/message and schema reference}`
- **Failure outcomes:** `{condition → stable error code/status}`
- **Side effects/transaction boundary:** `{...}`
- **Timeout/retry behavior:** `{...}`
- **Audit event:** `{event or N/A}`

## Query conventions

- Pagination: `{cursor/offset, default, maximum, stability}`
- Filtering: `{allowlisted fields/operators}`
- Sorting: `{fields, default, tie-breaker}`
- Field selection/expansion: `{policy or N/A}`
- Date/time and locale: `{format/time zone}`

## Error model

Use stable, documented machine codes. Messages are safe for users and may change or be localized; consumers must not branch on them.

```json
{
  "code": "RESOURCE_CONFLICT",
  "message": "The operation cannot be completed in the current state.",
  "details": {},
  "correlation_id": "01J..."
}
```

| Code/status | Condition | Retryable | Safe details |
| --- | --- | --- | --- |
| `{CODE / HTTP status}` | `{condition}` | `Yes / No / With idempotency key` | `{fields}` |

## Correlation and observability

- Correlation ID source/propagation: `{...}`
- Safe request metrics/log fields: `{...}`
- Trace propagation: `{conditional policy}`
- SLO or latency objective: `{value or N/A}`

## Contract verification

- [ ] Input and output schemas are executable or tested.
- [ ] Authentication, authorization, isolation, and limits have negative tests.
- [ ] Consumer compatibility is checked before release.
- [ ] Examples contain no secret or personal data.
- [ ] Typed client generation is `{used/not used}` because `{reason}`.
