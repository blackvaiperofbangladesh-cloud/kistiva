# KRISTIVA — Namecheap cPanel Deployment Candidate (2026-11-11)

**Status: PREVIEW SOURCE ONLY / NOT DEPLOYED.** This is an incremental export of the approved **existing Webflow design**, not a replacement storefront and not a live payment application.

## Sources
- Webflow: site `6ae8f0273e8ecccd13fce56e`; current main homepage HtmlEmbed `92980463-4193-6ee6-3528-a5de691fabec`. Original Webflow pages remain unchanged.
- Existing backend: Supabase `imtlvvninxwvxhzydjqa`, healthy as inspected on 2026-11-11. No migrations or writes were made.
- Original GitHub `main` is an Astro/Webflow Cloud **starter**, not this deployable homepage. The source in this preview branch is kept separate from `main`.
- The official logo and design image sources are the owner-approved references already embedded in Webflow. Some media files currently use approved Picsart CDN URLs.

## Directory structure
```
cpanel-preview/site_upload/
├── index.html
├── create-account/index.html
├── terms/index.html
├── privacy-policy/index.html
├── returns-refunds/index.html
├── payment-policy/index.html
├── shipping-delivery/index.html
├── checkout-readiness-demo/index.html
└── assets/kristiva-public-readonly.js
```

## Security / integrations
- `assets/kristiva-public-readonly.js` reads **only** two published Supabase REST resources: active `categories` and `homepage_media`.
- Uses the official `sb_publishable_` public browser key **only**; no service_role, database password, refresh token, wallet address or API secret is embedded.
- Both read-target tables have RLS enabled. Failed/blocked reads preserve static approved images.
- No writes: **No signup, checkout, order creation, payment confirmation, wallet configuration, emails, KYC, EMI, or crypto lending** are activated by this preview.
- All pages have `noindex,nofollow`; policy text is draft, not counsel-verified.
- Supabase security advisor flagged `public.checkout_create_order` as an authenticated-executable SECURITY DEFINER function. Review before exposing live checkout. Do not modify RLS blindly.
- Frontend payment simulation is fake/demo only. The site cannot verify blockchain payments or claim "Paid".

## Required steps before touching hosting
1. Authenticate to the owner-owned **Namecheap cPanel** account; establish actual package, cPanel username, `kristiva.com` document root and server details.
2. Back up current website files and `.htaccess`. Capture authoritative nameservers, current web DNS (A/AAAA/CNAME) and ALL mail records (MX/SPF/DKIM/DMARC/TXT). Check seven existing mailbox names and delivery. **No changes until comparison and explicit approval**.
3. Stage files under a **new, isolated** preview directory or other owner-approved staging location; do not overwrite production root.
4. On an isolated preview, run desktop and mobile visual QA (320, 390, 768, 1440px), image loading, nav, search, 3-slide carousel, and each of eight routes. Test read-only Supabase request and fallback. This is still pending.
5. If existing DNS or files conflict, present exact before/after diff. Ask owner before any production root or DNS switch.
6. For approved final deployment, put **contents of `site_upload/`** into the verified document root, not its outer directory. Preserve existing `.htaccess` directives and mail/DNS. Do not repoint `store.kristiva.com` at this landing page.
7. Obtain owner's release approval after tests. Keep checkout blocked until independent on-chain verification, secure admin permissions, compliance and owner review.

## URLs to validate only after hosting upload
- `/`
- `/create-account/` (design-only; signups OFF)
- `/terms/`
- `/privacy-policy/`
- `/returns-refunds/`
- `/payment-policy/`
- `/shipping-delivery/`
- `/checkout-readiness-demo/` (simulation only)

## Owner's business emails — preserve
`owner@kristiva.com`, `merchants@kristiva.com`, `payments@kristiva.com`, `accounts@kristiva.com`, `applications@kristiva.com`, `orders@kristiva.com`, `support@kristiva.com`.

## Status ledger
| Gate | Status |
|---|---|
| KRISTIVA Webflow design export to GitHub preview | DONE |
| Eight static routes staged in branch | DONE |
| Supabase category/brand media read-only JS | CODE PREPARED, live fetch not verified |
| Hosting ownership/cPanel document root | BLOCKED — login required |
| DNS/mail inventory and backup | NOT YET VERIFIED |
| cPanel upload and staging preview | NOT DEPLOYED |
| Visual QA and live URL tests | NOT YET VERIFIED |
| Payments, account creation, EMI | OFF |
| Production domain switch | NOT AUTHORIZED / NOT DONE |
