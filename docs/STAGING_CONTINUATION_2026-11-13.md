# KRISTIVA — Staging Continuation and Emergent Recovery Gate

Status: **STAGING DEVELOPMENT ONLY — NOT PRODUCTION READY**  
Started: 2026-11-13  
Source: `blackvaiperofbangladesh-cloud/kistiva` / `build/kristiva-execution-v2` at `b2995df1f8fcdfabd186143939afe78eb7cda784`  
Working branch: `build/kristiva-staging-safety-2026-11-13`

## What is being continued

The existing four web surfaces (`apps/marketplace`, `apps/mobile` responsive web, `apps/merchant`, `apps/admin`) and the shared Node API are preserved; this branch is **not a replacement architecture or redesign**. The approved KRISTIVA marketing homepage and separate International Store remain distinct.

The source of truth for the approved workflow and appearance is the owner's `01_MASTER_HOME_ARCHITECTURE_BN.md`, `02_SECURITY_HOSTING_AND_BUILD_BN.md`, `03_AGENT_SITE_MASTER_PROMPT_BN.md`, `04_QUICK_START_BN.md`, `KRISTIVA_MASTER_HOME_ARCHITECTURE.pdf`, and `index.html` reference, held outside this public repository. The latest owner's handoff is `KRISTIVA_LATEST_BACKUP_2026-11-12.zip` in the KRISTIVA Library. Do not assume that ZIP includes Emergent's new v3 source.

## Emergent v3 recovery dependency

Emergent `Kristiva-Store` generated new Python FastAPI modules under `backend/kv/` (including `routes/staff.py`, `routes/auth.py`, `routes/customer.py`, `routes/merchant.py`, `routes/public.py`, `routes/support.py`, `security.py`, `commerce.py`, `core.py`, `tron.py`, `emails.py`). This code is visible in Emergent's Code panel but has **NOT** been fully exported and is **NOT** in this GitHub branch.

Support said Standard includes GitHub export, but a follow-up test in the Emergent UI still showed a trial-plan export paywall. The account entitlement mismatch is awaiting resolution. Do not reconstruct unknown modules by guessing. Once source is available:
1. Export to a **new private** repository or protected recovery branch, excluding secrets, `.env`, database records, and sensitive KYC files. Never force-push the original `kistiva/main`.
2. Validate file manifest, hashes, dependency versions, licensing and import paths.
3. Compare each module against this existing v2 code; treat the Emergent Python database as a **staging prototype** until formally mapped against existing Supabase project `imtlvvninxwvxhzydjqa`. Do not automatically replace the Supabase backend.
4. Review Python `staff.py` serialization lint blocker and execute full tests in an isolated environment.
5. Integrate only reviewed and tested changes into staging, without automatic production promotion.

## New safety change in this branch

- The existing `paymentMethod()` function blocks Bangladesh checkout by default. Previously a BD country value automatically selected bKash; this contradicted the approved BD-Store HOLD decision.
- `KRISTIVA_BD_CHECKOUT_ENABLED` is a **separate server-only opt-in**, defaulting to OFF. Enabling it later would **not**, on its own, approve bKash: provider, legal, country, backend and Owner approval gates are still required.
- Existing `KRISTIVA_PAYMENTS_ENABLED` and `KRISTIVA_BACKEND_V2_VERIFIED` must both explicitly equal `true` before normal checkout becomes executable. Keep both OFF in all existing environments.
- Merchant 500 USDT account fee, installment / loans and COD remain HOLD and no collections are authorized.
- No receiving-wallet changes, no trustless receipt of screenshots as payment evidence, and no admin/Owner override of independent chain verification.

## Staging acceptance checklist (not yet passed)

- `npm ci --ignore-scripts`, `npm test`, `npm run build` on Node 24; inspect CI run SHA. The newly added tests require Bangladesh to remain HOLD without the separate flag.
- Independent 320/390/768/1440 screenshots of marketing, Customer, Merchant, Admin and Owner; role-based access and truthful stock/price.
- No duplicate Homepage/Header/Hero; 3 hero slides; only Owner-selected approved product in Homepage **Crypto Installment Products** informational section (NO Featured Products). Financing action remains unavailable.
- Owner sidebar `Product Review` followed directly by `Homepage Product Review`. Product approval and homepage selection are separate audited decisions.
- Supabase security/RLS baseline (36 RLS-enabled public tables and 41 advisor WARN notices previously observed) requires isolated customer A/B, merchant A/B, storage, RPC and privileged checkout tests. A warning is not proof of exploitation; RLS-enabled is not proof of isolation.
- Existing Vercel Pro staging projects must be verified against exact branch/commit, with protected previews only; a Vercel READY state is not end-to-end acceptance.
- Preserve domain DNS, Stellar cPanel settings and all seven business mailbox MX/SPF/DKIM/DMARC records. Do not alter production.
- Backup and restore verification, security evidence and separate Owner production authorization are mandatory before release.

## Evidence/status vocabulary

`VERIFIED` requires actual logs, checks or screenshots; `PARTIAL` marks proved substeps; `BLOCKED` marks failed prerequisites; `UNVERIFIED` never implies success. This file is an execution handoff, not proof that any live checkout, financing, KYC, merchant payout, email or production feature is functioning.
