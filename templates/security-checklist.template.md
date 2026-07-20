# Security Checklist

> Tailor this checklist through threat modeling and the project's data classification. It is a review aid, not a substitute for a specialist audit, penetration test, or legal assessment.

## Context

- **Assets and sensitive data:** `{...}`
- **Actors and trust boundaries:** `{...}`
- **Likely abuse cases:** `{...}`
- **Regulatory/contractual obligations:** `{LGPD, GDPR, PCI DSS, contract, none identified}`
- **Security owner and review date:** `{...}`

## Identity and access

- [ ] Authentication strength and recovery match the harm of account compromise.
- [ ] Authorization is enforced in the trusted backend for every protected resource and action.
- [ ] Deny-by-default, least privilege, role scope, tenant scope, and privileged access were tested.
- [ ] Sessions/tokens have appropriate expiry, rotation, revocation, storage, and audience checks.
- [ ] Service identities and human identities are distinct and reviewable.

## Inputs and common attack paths

- [ ] Inputs are parsed, bounded, and validated at each trust boundary.
- [ ] Output encoding and parameterized data access address injection risks.
- [ ] CORS is restricted to required origins; CSRF protection exists for credentialed browser requests when applicable.
- [ ] Rate and resource limits exist on abuse-prone or expensive operations.
- [ ] Redirects, outbound URLs, webhooks, and deserialization are constrained when applicable.
- [ ] File uploads restrict type, size, name, storage, access, and malware risk.

## Data and tenancy

- [ ] Data minimization, purpose, consent/legal basis, retention, export, correction, and deletion are defined.
- [ ] Sensitive data is encrypted in transit and at rest using managed, current mechanisms.
- [ ] Tenant isolation is enforced and tested at query, cache, object storage, job, and export boundaries.
- [ ] Backups inherit access, encryption, retention, deletion, and restore requirements.
- [ ] Logs, traces, analytics, errors, and test fixtures exclude secrets and unnecessary personal data.

## Secrets and dependencies

- [ ] Secrets come from an approved manager or deployment mechanism, never source or client bundles.
- [ ] Rotation, emergency revocation, and least-privilege access are documented.
- [ ] Dependencies and images are pinned or locked, scanned, maintained, and license-reviewed.
- [ ] Unsupported components have an owner and migration plan; critical advisories have response targets.

## Operation and evidence

- [ ] Security-relevant actions generate a tamper-resistant audit trail with appropriate retention.
- [ ] Alerts cover material abuse and control failures without exposing sensitive data.
- [ ] Error responses reveal no stack, secret, or unauthorized resource existence.
- [ ] Incident contacts, containment, evidence preservation, and notification obligations are documented.
- [ ] Restore, access review, token revocation, and high-risk abuse cases have been exercised.

## Findings

| Finding/threat | Severity | Evidence | Treatment | Owner | Due/review date |
| --- | --- | --- | --- | --- | --- |
| `{specific scenario}` | `Low / Medium / High / Critical` | `{test/model}` | `Fix / Mitigate / Accept / Transfer` | `{owner}` | `YYYY-MM-DD` |
