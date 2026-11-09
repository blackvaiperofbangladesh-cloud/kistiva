# KRISTIVA Master Build Execution v1.0

Checkpoint: 2026-11-09. Production release gate: CLOSED.

## Source authority and recovery

Repository: blackvaiperofbangladesh-cloud/kistiva. Inspected baseline: 23fdb32f5c0dff27c55840e8dc423809b9144208. This is an Astro/Webflow starter with no marketplace implementation. The existing starter remains intact under src; `build:legacy` reproduces its build. The new independently built applications live under apps.

Supabase: imtlvvninxwvxhzydjqa, kistiva, ap-south-1, Postgres 17.11.0.011. Read-only inventory found 35 public tables (all RLS enabled), 35 applied migrations, 60 functions across public/private and an existing kistiva-delivery Edge Function. Existing data and migrations were not changed.

| Vercel project | Observed role | Disposition |
| --- | --- | --- |
| kristova | Original dark premium marketplace and embedded legacy portals; alias kistiva.vercel.app | Master UI source; recovered byte snapshot |
| kristova-store | Newer green/cream store, visually different | Preserved; not used as design authority |
| kristiva-admin | Separate dark admin portal | Recovered portal shell; proposed admin target |
| kristiva-merchant | Separate dark merchant portal | Recovered portal shell; proposed merchant target |
| kristova-admin | Storefront copy, not a separate admin implementation | Preserved duplicate |
| kristova-merchant | Storefront copy, not a separate merchant implementation | Preserved duplicate |

Code review found and corrected notification column mismatch, product-edit currency overwrite and dropped merchant SKU. Regression tests reproduce the failures and verify the fixes.

The mobile experience has its own build/configuration and uses the same recovered responsive marketplace UI. No mobile Vercel project was created. No duplicate was overwritten or removed. Project mapping is evidence-based; only the marketplace design is asserted authoritative.

Recovered deployment IDs and source UIDs are in the private checkpoint. Original HTML snapshots and SHA-256 manifest are retained there. Metadata, RLS policies, function definitions, storage settings, trigger definitions, and read-only RLS probe results are retained in a private local evidence checkpoint, excluded from Git history. Only sanitized CSS and a public source hash are published under design-reference. These are source/schema snapshots, NOT a verified full database backup or restore test. A recoverable database backup remains mandatory before schema changes.

## Implemented in this branch

- Independently buildable marketplace, mobile, merchant and admin applications, with per-app Vercel configurations and a shared backend API boundary.
- Approved marketplace CSS retained without edits; new behavior replaces demo order storage and duplicate monkey-patched legacy scripts.
- Live published catalogue and category reads, search, category filtering, sorting, details, stock-aware cart, quantity removal and one-currency cart.
- Supabase sign-in/sign-up with per-app session storage; account/profile, order history/tracking reads, notification reads and support/return request submission handlers.
- Merchant server-side approval/deposit/removal checks; scoped products/orders/reports; product draft submission and existing inventory adjustment RPC integration.
- Admin server-side is_admin RPC authorization, live user/merchant/product/order/payment/audit/shipment/report reads. Financial and moderation mutations stay closed.
- Duplicate cart-line aggregation, strict quantities and UUIDs, foreign-origin mutation rejection, user validation through Auth, narrow profile writes, schema-aligned support payloads, generic backend errors and no service-role credential.
- Payment selection rules: BD→bKash only, foreign crypto→explicit country allowlist only. Crypto evidence validation and permitted order transition primitives. These are unit-tested rules, NOT a working payment integration.
- Node 24 alignment, missing test command repaired, independent build matrix, browser test job and artifact collection. The old package-publication workflow is manually triggered and cannot publish.

## Critical unresolved backend conflicts

1. Existing payment model supports manual_transfer and legacy installment/manual-proof flows. It does not implement the approved bKash Merchant Gateway plus international manual-crypto contract.
2. Existing audit_logs_admin_manage permits admin UPDATE/DELETE. It does not provide immutable financial audit history.
3. Merchant products policies allow more than draft-only moderation; public catalogue SELECT exposes row-level access rather than column restrictions. Review column grants to protect internal price/profit fields.
4. Existing checkout_create_order is callable by authenticated users directly, so API-only safeguards are insufficient. It lacks checkout idempotency and country/payment policy validation. Duplicate lines need canonicalization inside the database too. Stock's non-negative constraint remains an existing protection.
5. Merchant registration currently requires legacy 500 USDT fixed-deposit terms. This execution does not silently change or financially activate those terms.
6. Checkout, manual crypto settings/quotes/submission/review, bKash create/execute/query/reconcile/refund, cancellation stock restoration, verified order transitions and audited administration require transactional database contracts and staging tests. API extension names are reserved; the RPCs are not deployed.
7. Suspended-account checks must exist in database policies/RPCs, not just UI/API. Current profile status protection function exists; its wider enforcement needs adversarial tests.

## Verification and evidence limits

Unit tests exercise real domain/handler logic with injected provider responses where needed; those responses are test fixtures and are never counted as production transactions. Per-app builds run independently.

Read-only RLS probe ran a transaction under authenticated with an unrelated UUID and forged user_metadata.role=admin: is_admin=false, visible profiles=0, payments=0, audit logs=0. The transaction rolled back. This proves this narrow database scenario only; customer-to-customer, merchant-to-merchant, Storage and privileged mutation isolation remain unverified.

GitHub CI run 42602712617 completed successfully: 33 domain/API/build tests, all four independent app builds, and 3 browser tests. The browser catalogue contained one out-of-stock product, so an in-stock cart path and completed checkout were NOT proven. Desktop/mobile CI screenshots were inspected; an inherited dark-text contrast issue and obsolete demo/installment copy were corrected without editing the original CSS.

Local browser launch was attempted twice. Installed Playwright browser was missing; system Chromium then failed with `socket() failed: Operation not permitted`. Browser testing is also configured in GitHub CI, where a Chromium browser is installed on the runner. No local visual or E2E pass is claimed. The downloaded headless browser also failed installation with a truncated archive. CI screenshots and tests provide the available browser evidence.

## Release gate

| Requirement | Status |
| --- | --- |
| Original UI source recovered and all original CSS retained | PASS at source level; pixel fidelity pending |
| Independent app builds | PASS locally |
| Domain/API regression tests | PASS locally |
| GitHub CI and browser execution | PASS for checkpoint f6b7af7; see current PR checks for subsequent commits |
| Complete role isolation | Narrow read-only probe passed; full suite pending |
| Customer checkout and verified payments | BLOCKED; disabled |
| Merchant/admin full operations | PARTIAL; read integration and selected merchant writes prepared |
| Refunds, delivery transitions, settlement reconciliation | PENDING |
| Brevo/Sentry configuration | PENDING; no service credentials verified |
| Staging verification | Marketplace preview health/catalogue HTTP 200 observed; complete workflows pending |
| Production smoke tests | NOT RUN; production untouched |

## Next executable dependencies

1. Verify a recoverable backup and create an isolated, explicitly selected staging database without overwriting production. Supabase branching can incur costs and needs approval before provisioning.
2. Finalize transactional DB contracts against this inventory; reproduce security conflicts in staging; implement RLS/grant/immutable-audit hardening and checkout/payment/order idempotency.
3. Obtain the merchant-onboarding versioned bKash API contract and sandbox credentials through secure environment settings. Merchant payment-link code in the recovered source is not a gateway integration and is excluded from active apps.
4. Configure international crypto jurisdictions, approved assets/networks, receiving wallets, quote/expiry/confirmation rules and review procedures. No international country is enabled by default.
5. Complete merchant onboarding/moderation, order/refund/delivery/settlement operations with authoritative business terms; verify with independent customer/merchant/admin staging accounts.
6. Configure Brevo sender, Sentry and delivery provider, then run provider/retry/refund/settlement/E2E tests.
7. Explicit approval is required for production, financial activation, domain changes or destructive changes. No production release is requested while gates remain open.

Staging marketplace deployment dpl_6xvDyWqx5v7giFfiMBmYva5e1nNi was built from f6b7af7. Its /api/health returned the correct projectRef and paymentsEnabled=false; /api/catalog returned HTTP 200 with one product. Preview-only runtime variables were configured; production variables were not changed. Branch-specific env configuration was unavailable because the Vercel project has no persistent Git link, so the preview target was used. No automatic Git-to-Vercel deployment or production promotion was enabled.
