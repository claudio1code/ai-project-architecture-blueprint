# Profile: SaaS Application

Use this profile for a product serving multiple customer organizations. Multi-tenancy is a data ownership and authorization concern, not merely a `tenant_id` column. Start from the simplest isolation model that meets contractual, regulatory, and operational requirements.

Complete the [project context](../templates/project-context.template.md), [security checklist](../templates/security-checklist.template.md), and [architecture assessment](../templates/architecture-assessment.template.md) before choosing an isolation strategy.

## Characteristics

- Users act within one or more customer organizations.
- Plans, entitlements, quotas, invitations, and lifecycle states may differ.
- Tenant context affects every protected read and write.
- Onboarding, suspension, export, and deletion are product operations.
- Billing and identity providers are common external dependencies.
- Usage and customer count may grow unevenly.

## Recommended initial architecture

For one product and one team, prefer a full-stack application or modular monolith with explicit modules for identity/organizations, entitlements, and core capabilities, plus billing integration when the product has billing. Keep tenant resolution at the trusted boundary and propagate a typed tenant context. Shared-schema storage can be appropriate when isolation is enforced and tested consistently.

```text
apps/
├── web/
└── server/
    └── modules/
        ├── identity-organizations/
        ├── entitlements/
        ├── billing/                # only when the product owns billing behavior
        └── core-domain/
packages/
└── contracts/
migrations/
tests/
```

Do not allow feature code to accept an arbitrary tenant identifier from the browser as proof of access. The authenticated subject, membership, role, and selected organization must be resolved and authorized server-side.

## Practice selection

### Essential

- A documented tenant model, including users with membership in multiple organizations.
- Tenant-scoped authorization for every protected resource and background job.
- Database constraints and query conventions that reduce cross-tenant mistakes.
- Automated negative tests proving that tenant A cannot access tenant B.
- Audit trail for membership, role, entitlement, export, deletion, and billing changes when billing exists.
- Secrets management, privacy classification, retention, export, and deletion rules.
- Per-tenant operational context in logs and metrics without exposing sensitive data.
- Backup and restore procedures that match the promised isolation and recovery objectives.

### Conditional

- Row-level security as a second enforcement layer when the database supports it and operations can test it.
- Idempotent handling and signature verification when billing or identity providers send webhooks.
- Queues for webhooks, provisioning, notifications, exports, and usage aggregation.
- Per-tenant quotas, rate limits, and feature flags.
- Regional storage when contracts or regulation require data residency.

### Advanced

- Schema-per-tenant or database-per-tenant for stronger isolation, custom backup/restore, or very large tenants.
- Control plane/data plane separation when provisioning and workload operation have distinct scaling or security needs.

### Not applicable

Unless a new requirement changes the assessment, the following practices are usually unnecessary:

- Microservices solely because the product is called SaaS.
- Database-per-tenant for small, homogeneous customers without an isolation requirement.
- CQRS or Event Sourcing for subscription and entitlement CRUD.
- A custom identity provider when a supported provider meets requirements.
- A complete Design System before multiple interfaces and governance justify it.

## Minimum testing strategy

- Cross-tenant isolation tests for reads, writes, searches, exports, files, caches, and jobs.
- Integration tests for roles, invitations, tenant switching, suspension, and entitlement enforcement.
- Contract and replay tests for signed webhooks, including duplicates and reordering.
- Migration tests with multiple tenants and existing data.
- End-to-end tests for onboarding and one core paid journey.
- Restore exercise aligned with recovery objectives for the chosen tenancy model.

## Common risks

- Tenant filters applied manually and omitted in one query.
- Cache keys, object storage paths, or search indexes without tenant scope.
- Authorization based on UI state or a client-provided organization ID.
- Billing status and product entitlement drifting apart.
- One noisy tenant exhausting shared capacity.
- Promising tenant-level restore while backups only support whole-database recovery.
- Collecting usage or audit data without a retention policy.

## Evolution signals

Reconsider the storage model when a contract requires stronger isolation, restore by customer becomes mandatory, or a tenant dominates capacity. Split modules or deployments when independent scaling or ownership is sustained and measurable. A customer count increase alone does not require microservices; query shape, workload variance, recovery, and isolation requirements are stronger signals.
