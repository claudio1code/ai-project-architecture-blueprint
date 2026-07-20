# 11 — Security

## Scope, applicability, and limitation

Security is a design responsibility, not a final checklist activity. The depth of each control depends on exposure, data sensitivity, criticality, regulation, and credible threats.

- **Essential:** least privilege, input validation, dependency hygiene, secret handling, safe errors/logs, and an explicit public-or-protected access policy at every trusted boundary.
- **Conditional:** authentication, sessions, CSRF, CORS policy, rate limiting, file-upload controls, audit trails, and tenant isolation when those capabilities exist.
- **Advanced:** dedicated key infrastructure, tamper-evident audit, independent penetration testing, or formal security engineering for high-risk systems.
- **Not applicable:** remove controls tied to absent capabilities—for example, CSRF for a CLI with no browser session—but document why they do not apply.

This blueprint and its checklist do **not** replace a specialized security audit, penetration test, privacy assessment, compliance review, or legal advice. Use qualified specialists whenever risk, contracts, or regulation require them.

## Start with threats and data

Before selecting controls, record:

1. assets and data classifications;
2. users, administrators, services, and external actors;
3. trust boundaries and exposed entry points;
4. likely misuse, fraud, disclosure, modification, and availability threats;
5. impact and likelihood;
6. preventive, detective, and recovery controls;
7. accepted risks, owners, and review dates.

Use the [security checklist template](../templates/security-checklist.template.md) and connect material decisions to the [project context](../templates/project-context.template.md). Reassess when exposure, identity model, data, integrations, or deployment changes.

## Least privilege and secure defaults

- grant users, services, jobs, and operators only the actions and data required;
- separate administrative operations from normal application access;
- deny by default and fail closed for authorization and tenant selection;
- scope database, storage, queue, and cloud identities to the exact resources they use;
- separate environments and credentials; production access must be exceptional and attributable;
- remove unused accounts, permissions, routes, features, and network exposure;
- require explicit secure configuration rather than silently falling back to permissive behavior.

Least privilege adds role design and operational maintenance. Keep the model small enough to understand, but do not replace resource-level decisions with one broad `isAdmin` flag when risks differ.

## Authentication

Authentication proves an identity; authorization decides what that identity may do. Use a mature identity provider or framework instead of designing password, recovery, federation, or token protocols from scratch.

- hash passwords using a current password-hashing function with managed parameters and unique salts;
- protect sign-in, recovery, enrollment, and factor-reset paths consistently;
- avoid account enumeration in public responses where it creates risk;
- rate-limit and monitor credential attacks without enabling trivial denial of service;
- require multi-factor authentication **Conditionally** for privileged users, sensitive actions, or elevated risk;
- re-authenticate or require step-up verification for critical changes when appropriate;
- revoke or rotate compromised credentials and document recovery.

A public site with no accounts does not need authentication. Do not add it speculatively.

## Sessions and tokens

Choose browser sessions, opaque tokens, or signed tokens based on clients and revocation needs—not trends.

- generate unpredictable session identifiers and rotate them after authentication or privilege change;
- for browser cookies, use `Secure`, `HttpOnly`, and an appropriate `SameSite` setting;
- set idle and absolute expiration according to risk;
- invalidate sessions on logout, credential compromise, and relevant account changes;
- validate token issuer, audience, signature, algorithm, expiry, and intended use;
- keep access tokens short-lived and protect refresh-token rotation/reuse;
- never put secrets or unnecessary personal data in token claims;
- do not store long-lived bearer tokens in browser-accessible storage without accepting the XSS exposure.

Self-contained signed tokens reduce server lookups but make immediate revocation and claim freshness harder. Stateful sessions can simplify revocation but require shared, available session storage at scale.

## Authorization in the backend

Frontend route guards and hidden buttons improve experience but provide no security boundary. Every backend operation needs an explicit access policy. A deliberately public operation needs no authenticated actor; every protected operation must authorize the verified actor in the trusted backend.

Check, as applicable:

- action or capability;
- specific resource ownership/membership;
- tenant/organization;
- current resource state;
- field-level restrictions;
- delegation or impersonation scope;
- administrative purpose and audit requirement.

Prefer centralized policy functions with intent-revealing names over duplicated conditionals. Keep enforcement close enough to the data access that a caller cannot forget tenant/resource filtering. Avoid a generic role matrix when rules depend on state and relationships; avoid a policy engine when three explicit checks are easier to audit.

Test unauthorized, cross-resource, and cross-tenant paths—not only happy paths. See [testing](12-testing.md).

## Secrets and key management

- never commit secrets, private keys, production credentials, or populated environment files;
- inject secrets through an approved secret store or deployment mechanism;
- distinguish secrets from ordinary configuration;
- scope access per service and environment;
- rotate on a schedule proportionate to risk and immediately after suspected exposure;
- ensure rotation can occur without prolonged downtime;
- prevent secrets from reaching logs, traces, build artifacts, crash reports, prompts, or test fixtures;
- scan source history and artifacts, while treating scanning as a detection layer rather than permission to commit secrets;
- document revocation and incident procedures.

Environment variables are a transport mechanism, not automatically a secret-management system. Evaluate process inspection, build logs, and operator access.

## Input, output, and common vulnerability classes

Treat all data crossing a trust boundary as untrusted, including webhooks, files, queue messages, database content originally supplied by users, and AI-generated output.

- validate schemas, lengths, ranges, encodings, content types, and nested depth;
- use parameterized queries; never concatenate untrusted SQL or command fragments;
- contextually encode output to prevent script/markup injection;
- restrict outbound URLs and resolve SSRF risks before fetching user-controlled locations;
- normalize and constrain file paths to prevent traversal;
- avoid unsafe deserialization and dynamic code evaluation;
- set relevant browser headers and a Content Security Policy when applicable;
- return generic public errors and keep internal context in protected telemetry;
- place business invariants in the authoritative domain code, not only the UI.

Defensive checks must have bounds. Unbounded request bodies, recursive structures, decompression, regexes, queries, and exports can exhaust resources even when inputs are syntactically valid.

## CORS and CSRF

### CORS — Conditional

CORS controls which browser origins may read responses; it is not authentication and does not block direct HTTP clients. Use an explicit allowlist, methods, and headers. Never combine wildcard origins with credentials. Validate deployment environments so development origins do not leak into production.

If a server has no cross-origin browser clients, a restrictive same-origin posture may require no special CORS configuration.

### CSRF — Conditional

Protect state-changing requests when browsers automatically attach credentials, commonly cookie-based sessions. Use an appropriate combination of `SameSite`, anti-CSRF tokens, and Origin/Referer validation. Keep `GET` free of state-changing effects.

CSRF protection may be **Not applicable** to a non-browser API whose bearer credential is explicitly attached by the client, but XSS and token theft remain relevant.

## Rate limiting and abuse controls

Apply limits where unauthenticated abuse, credential attacks, expensive work, or tenant fairness creates risk. Choose dimensions deliberately: IP, account, tenant, API key, endpoint, and business operation. Define burst and sustained rates, response semantics, monitoring, and trusted-proxy handling.

Distributed limiting adds shared state, latency, and failure modes. For low-risk internal traffic, bounded concurrency and upstream gateway limits may be sufficient. Business quotas and fraud rules must not rely only on technical request rate.

## File uploads

File upload is **Conditional** and should be omitted when the product does not need it. When present:

- allowlist purpose-specific types and verify content, not just filename or supplied MIME type;
- limit size, count, dimensions, archive expansion, and processing time;
- generate storage names and keep uploads outside executable/static application paths;
- scan or sandbox content according to threat and do not trust a clean filename;
- strip unsafe metadata when appropriate;
- authorize create, read, replace, and delete separately;
- use short-lived signed download URLs where suitable;
- quarantine before processing and make asynchronous scanning state visible;
- define retention, deletion, and orphan cleanup.

Rejecting dangerous extensions alone is not sufficient.

## Dependencies and software supply chain

- pin or lock resolved versions and review lockfile changes;
- use automated update tooling such as Dependabot or an equivalent when the ecosystem supports it;
- evaluate package origin, maintenance, license, transitive footprint, and install scripts before introduction;
- scan dependencies and images, prioritize exploitable findings, and track remediation or accepted risk;
- protect package publication and CI credentials;
- produce signed artifacts or provenance **Conditionally** when supply-chain risk warrants it;
- remove unused dependencies and avoid an external package for trivial stable behavior.

An automated alert without ownership or remediation criteria creates noise, not security.

## Encryption and sensitive data

Use trusted libraries and platform services; do not invent cryptographic algorithms or protocols.

- protect data in transit with correctly validated TLS;
- encrypt sensitive data at rest according to the threat model;
- separate key access from ciphertext access and plan rotation/recovery;
- collect, expose, and retain the minimum data required;
- mask or omit secrets, credentials, tokens, personal data, financial values, and sensitive payloads from logs;
- sanitize analytics, traces, error reports, test data, and exports as well as application logs.

Field-level encryption has query, indexing, key-rotation, and recovery costs. Apply it when platform-level encryption does not address the threat. See [data and persistence](08-data-and-persistence.md).

## Tenant isolation

If the system serves multiple organizations:

- derive tenant from verified identity/context;
- include tenant scope in authorization and data access;
- scope caches, object keys, search indexes, jobs, exports, metrics, and rate limits;
- prevent tenant choice through untrusted identifiers alone;
- audit privileged cross-tenant support operations;
- test direct-object references and indirect paths for leakage;
- choose shared, schema, database, or deployment isolation according to risk.

Isolation choices and persistence constraints are detailed in [data and persistence](08-data-and-persistence.md).

## Audit trail and LGPD

An audit trail is **Conditional** on accountability, critical actions, contracts, or regulation. Record actor, action, target, time, outcome, source context, and reason where required. Protect integrity and access. Do not copy full before/after payloads by default; minimize sensitive data and define retention.

When LGPD applies, document purpose, legal basis, data categories, sharing, retention, data-subject request procedures, incident handling, and responsible stakeholders. Privacy by design includes minimization, purpose limitation, access control, deletion/anonymization where appropriate, and verifiable operational procedures. Legal interpretation requires qualified counsel.

Technical logs and audit trails have distinct purposes; see [observability](13-observability.md).

## Delivery and incident readiness

- run security-relevant tests and dependency checks in CI in proportion to risk;
- patch supported runtimes and base images;
- separate build and deploy authority;
- define how a vulnerable release is stopped or rolled back;
- monitor authentication, authorization denials, abuse, and privileged actions without exposing sensitive values;
- maintain a contact, triage, containment, communication, recovery, and learning process for incidents.

See [DevOps and delivery](14-devops-and-delivery.md) for pipeline and secret-deployment guidance.

## Security review checklist

- [ ] Are assets, sensitive data, trust boundaries, threats, and accepted risks documented?
- [ ] Do users, services, operators, and environments follow least privilege?
- [ ] Is authentication delegated to maintained implementations with secure recovery?
- [ ] Are sessions/tokens validated, expired, rotated, and revocable as required?
- [ ] Is every backend action explicitly public or protected, with protected actions authorized for the specific resource and tenant?
- [ ] Are secrets absent from source, artifacts, logs, telemetry, and AI prompts?
- [ ] Are inputs bounded and outputs encoded for their context?
- [ ] Are injection, XSS, SSRF, traversal, deserialization, and resource-exhaustion risks addressed where applicable?
- [ ] Are CORS and CSRF decisions correct for the browser credential model?
- [ ] Are rate limits and abuse controls scoped to the actual threat?
- [ ] Are uploads allowlisted, bounded, isolated, authorized, and cleaned up?
- [ ] Are dependencies locked, reviewed, monitored, and owned?
- [ ] Are encryption and key handling aligned with the threat model?
- [ ] Do logs exclude sensitive data while audit trails preserve accountability?
- [ ] Are all tenant-aware paths tested for isolation?
- [ ] Are privacy/LGPD duties reviewed by the appropriate stakeholder?
- [ ] Are backup, rollback, incident response, and security contacts ready?
- [ ] Has specialized review been scheduled when project risk requires it?
