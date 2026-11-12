# KRISTIVA — Owner Diagram vs Approved Visual Design vs Current Staging
Date: 2026-11-13
Status: **DESIGN PARITY FAILED · FUNCTIONAL PARITY PARTIAL · PRODUCTION LOCKED**

## Two different authoritative inputs
1. **Functional process reference:** the owner-supplied black background / burgundy-node flowchart, showing Homepage → Customer vs Merchant, Orders & Payment, trusted chain verification, Admin/Owner approval, product review and separate Homepage Product Review.
2. **Visual master:** approved standalone `index(3).html` in owner-supplied `KRISTIVA_LATEST_BACKUP_2026-11-12.zip`, plus the approved original reference images/logo and `01_MASTER_HOME_ARCHITECTURE_BN(1).md`. Marketing: navy header/hero, white retail merchandising sections, cyan/blue/purple accents, three hero images, accessible mobile layout. The flowchart's burgundy nodes are **not** a replacement colour/style specification for the shopping homepage.

## What is actually implemented (not what was planned)
| Owner flow stage | Current v2/Vercel staging | Parity |
|---|---|---|
| KRISTIVA Homepage → Customer Store | Landing and Store staging projects; search/CTA preserved via protected preview SSO. Three slider images/controls seen by TinyFish. | PARTIAL (not pixel-matched to approved reference) |
| Customer Dashboard → Orders & Payments | Customer pages/API scaffolding and mock CI; production Supabase staging writes explicitly blocked. | PARTIAL |
| Trusted Payment Verification | Previous manual admin review blocked pending independent on-chain verifier. | BLOCKED |
| Merchant Sales Ledger → Settlement Review | Fragmentary Admin/Merchant views; no independently reconciled ledger or payout controls. | BLOCKED |
| Merchant Registration → Approval Request | Merchant sign-in and 8-step **information-only** onboarding page. No actual registration or KYC intake. | DESIGN-ONLY |
| Admin Review → Owner Final Decision / Activation | Pure JS transition-validation and mock tests. Owner-specific session/MFA + storage not implemented. | DESIGN-ONLY |
| Approved Merchant Dashboard → Product Submission | Existing merchant portal UI with products/order route but no complete new approved activation/product moderation workflow; staging writes blocked. | PARTIAL |
| Admin Product Review → Owner Product Approval | State contract only; no auditable persisted owner approval across real user accounts. | BLOCKED |
| Store Catalog | Read-only Supabase published catalogue; one product, stock 0, cart disabled. | PARTIAL |
| Homepage Product Review → Eligible Installment Display | Owner 16-menu **blueprint** only; no owner-only persisted item selection or verified eligibility gate. Financing remains HOLD. | DESIGN-ONLY |
| Installment applications | OFF/HOLD | Correctly disabled |
| Mobile | Build/CI pass; 320/390/768/1440 pixel QA not completed | UNVERIFIED |

**Important business separation:** a customer's payment must not grant merchant onboarding approval. Merchant KYC/activation decisions and payment/settlement decisions are independent audited workflows; the diagram's converging Owner box is a conceptual review queue, not a shared approval override.

## Confirmed visual mismatch
- Reference `index(3).html` is an approximately 1 MB, multiple-surface standalone design with the approved sections and styles. GitHub `apps/landing/index.html` is a different ~60 KB implementation. Do not describe either as pixel-perfect match without identical screenshot evidence.
- `apps/owner/index.html` is a small informational 16-menu blueprint, **not** the fully implemented Owner Dashboard.
- `apps/admin/index.html` and `apps/merchant/index.html` are legacy v2 dashboards, not direct visual ports of all approved reference panels.
- Current TinyFish checks verified functional landing hero controls, but **did not verify screenshot parity** against the owner's master reference or mobile 390px dimensions.

## Mandatory remediation order
1. Keep original approved `index(3).html` and official logo/images unchanged as visual source of truth. Extract a design tokens/assets/sections map; never treat illustrative demo counters or mock purchases as real data.
2. Compare at **1440, 768, 390, 320px**: header, official logo, 3 original hero assets, CTA links, categories, search, standalone international store entry, **Crypto Installment Products** (not Featured), footer. Correct exact discrepancies one by one.
3. Build the approved role-specific screens using existing code and a single authoritative backend contract. Never make the owner governance screen a fictitious working dashboard.
4. Restore full Emergent v3 source through authorized export or complete manual source recovery and compare modules. No blind Python/Node backend combination or unapproved migrations.
5. Isolate Supabase staging and prove server-side RLS/RBAC, owner MFA, merchant correction/activation, owner product approval, homepage selection and immutable audit.
6. Implement trusted chain validation (non-production testnet only), tax/shipping, events/outbox, returns, settlement; perform full role isolation/negative tests. Keep all financial collections HOLD until separate release.
7. Produce screenshot-difference evidence + E2E test report and get owner sign-off before any production DNS/email/payment updates.

**Release Gate: CLOSED. Existing v2 approved state and production protected.**
