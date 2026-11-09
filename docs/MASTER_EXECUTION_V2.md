# KRISTIVA — Master Build Execution v2.1

Execution authority: owner-supplied v2.0, with the additional acceptance gates below. This extends the existing implementation; it does not authorize a redesign, production release, ownership transfer, paid service, or destructive migration.

## Source and project identity

Repository: blackvaiperofbangladesh-cloud/kistiva. Existing foundation: build/kristiva-execution-v1, draft PR #1, checkpoint 84fd8586d823407425318dea905f574bf2c8a2b6. Continuation: build/kristiva-execution-v2. Keep PR #1 open and unmerged; review the continuation against that branch.

Backend: Supabase imtlvvninxwvxhzydjqa. No unrelated project source, credentials, migrations or assets.

| Surface | Source | Existing deployment target |
| --- | --- | --- |
| Customer marketplace | apps/marketplace | kristova |
| Customer mobile web experience | apps/mobile | kristiva-mobile (protected; deployment blocked) |
| Merchant portal | apps/merchant | kristiva-merchant |
| Admin control center | apps/admin | kristiva-admin |

Approved dark marketplace styles under design-reference remain authoritative. kristova-store, kristova-admin and kristova-merchant are preserved alternative/duplicate projects, not replacement design authority. Do not confuse a mobile web build with a released Android/iOS app.

Owner now identifies Namecheap abutahertc420 as the intended domain/hosting account. Earlier evidence placed the two KRISTIVA domains under crevantiq and hosting under abutahertc420. Verify completion of any transfer directly; never perform a transfer just to make the written account mapping true.

## Required scope

Continue all v2.0 phases: read-only audit, isolated marketplace/mobile/merchant/admin surfaces, shared secure backend, customer account/catalog/cart/orders/tracking/support, verified merchant onboarding/catalog/inventory/fulfillment/returns/payouts, controlled administration/moderation/disputes/refunds/reports, country-specific payments, DNS/SSL and a real support mailbox.

Use real backend records in application behavior. Fixtures are permitted only inside clearly labeled tests and never establish production transactions, account ownership, delivery, settlements, payment approval or mailbox deliverability.

## Added acceptance requirements

1. **Staging and backups.** Identify an isolated database before writing test transactions or migrations. Confirm backup recency and a restore drill before production schema work. Never treat a schema export as a tested database backup. Stop before paid branching/provisioning without cost approval.
2. **Money and stock.** Use server-authoritative prices/currency/tax/shipping/discount totals; explicit rounding and currency precision; transactional stock reservation and expiry/release; cancellation/refund restocking rules; concurrent checkout and duplicate-line tests. Avoid JavaScript floats for authoritative ledger amounts. Version commercial terms and record consent.
3. **Idempotency and reconciliation.** Unique scoped checkout keys, request fingerprints, unique provider transaction references, immutable review history, retry-safe webhooks, outbox delivery/retry/dead-letter handling, payment/order/stock state consistency, refund and payout reconciliation. A screenshot never authorizes payment success.
4. **Payments.** Bangladesh bKash requires the provider's actual onboarding contract and sandbox credentials. International manual crypto requires an explicit country/asset/network/wallet/confirmation policy and independent verification records. Fail closed when configuration is absent; keep both financial activation flags false until verified and explicitly approved. Do not fabricate tax, shipping, gateway fees, wallets or supported jurisdictions.
5. **Data isolation.** Test customer A versus B, merchant A versus B, merchant versus owner, suspended/removed accounts, anonymous authenticated users, expired tokens and direct REST/RPC/Storage access. API checks supplement database authorization. Restrict internal price/profit columns, immutable financial fields, privileged functions and storage object paths.
6. **Abuse resistance.** Shared persistent rate limiting on authentication, checkout, support and privileged endpoints; request byte limits; bounded lists and pagination; validated identifiers and image/upload type/size limits; signed short-lived private file access; user-safe error messages and correlation IDs. A per-process counter is not a distributed rate limiter.
7. **Accessibility and mobile.** Associated form labels, keyboard-operable dialogs/focus return, contrast, error announcements, empty/loading/error states, slow-network retries, responsive checks on all four surfaces. Preserve approved visual styles and verify any additions against them.
8. **Operations.** Exact-commit CI and staging evidence, dependency/secret scanning, monitoring with private-data redaction, provider retry/timeout tests, rollback plan, migration rollback/forward-fix plan, incident owner and runbook. Pin deployment targets; do not auto-promote or silently update production aliases.
9. **Email and domains.** Confirm domain ownership, authoritative DNS, SSL hostname/expiry, mailbox existence/quota, local/remote routing, MX/SPF/DKIM/DMARC and authenticated send/receive evidence. Preserve web hosting on Vercel when using cPanel only for mail. TXT ownership proof is preferred to unnecessary nameserver changes. Never call forwarding a mailbox.
10. **Truthful reporting.** Report pass/fail/blocked per workflow and environment, with commit/deployment IDs. READY is a build status, not E2E acceptance. Never mark a blocked payment, provider review, transfer, mailbox, restore, or live transaction as completed.

## Approval boundary

Proceed with authorized read-only inspection, coding, tests and reversible nonproduction repairs. Require explicit approval for domain ownership changes, production DNS changes, live payments, destructive migrations, purchases/charges, protected merges, design replacement and production deployment. Authentication is entered only through secure forms, never chat or committed files. Reuse an authenticated session while valid; do not retain passwords or OTPs to avoid future logins.

## Current continuation evidence and blockers

- GitHub checkpoint 84fd858 has successful CI and open draft PR #1. Existing marketplace/admin/merchant staging deployments are READY, but metadata points to older work; they do not prove current continuation behavior.
- Supabase is ACTIVE_HEALTHY; 35 public tables have RLS enabled. No Supabase development branch exists. Current security advisors still require review, including privileged checkout and anonymous authenticated-user policies.
- Added customer-owned support history and notification acknowledgement through narrow server filters; bounded streaming JSON parsing and object validation; merchant price/category/stock validation; required inventory audit reasons; accessible portal labels and keyboard dialog focus; admin report refresh cleanup.
- Unit/API/build checks currently pass 74 tests. Browser checks include actual public-catalogue smoke tests plus separately labeled fixture regressions for all four surfaces. Local Chromium fails to launch in this executor; rely on completed CI runs for browser pass evidence and report failures rather than counting discovered tests as passed.
- No active browser tabs/authenticated Namecheap session remain in this execution. Domain transfer, cPanel domain/mailbox, DNS edits and actual send/receive are not independently verified here. Do not overwrite the owner's newer setup based on old DNS observations.
- Backend migration/restore, provider sandbox credentials and commercial/jurisdiction settings, independent role test accounts, complete fulfillment/refunds/payouts and provider reconciliation remain external or implementation gates. No live provider workflow has passed.

## Required deliverables and readiness decision

Maintain source/architecture report, four independent builds, backend/payment implementation evidence, DNS/SSL/mailbox verification, CI/staging evidence, completed/pending/blocked matrix and required approvals. Current decision: **NOT READY FOR PRODUCTION**. Re-evaluate only after the actual acceptance gates pass, then request the owner's final explicit release approval.

Mobile deployment note: a protected project now exists with preview-only variables. Vercel labeled its first staging request as production, so it was canceled before READY. Automatic approval review rejected a retry without an explicit target. Correct preview targeting must be established before another mobile deployment.
