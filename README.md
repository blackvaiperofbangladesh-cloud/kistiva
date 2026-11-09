# KRISTIVA

Four independently built web surfaces sharing one Supabase backend. The approved dark marketplace design is preserved under `design-reference`. This is an incomplete, gated implementation: **not ready for production**.

| Surface | Build | Local port |
| --- | --- | --- |
| Marketplace | `npm run build:marketplace` | 4173 |
| Mobile web | `npm run build:mobile` | 4174 |
| Merchant | `npm run build:merchant` | 4175 |
| Admin | `npm run build:admin` | 4176 |

Use Node 24, `npm ci --ignore-scripts`, `npm test`, and `npm run build`. Start one surface with `PORT=4175 node scripts/serve.mjs merchant` after building it. Browser verification uses `npm run test:browser`; install Chromium with `npx playwright install chromium` on a supported runner. Optional `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` selects an installed browser. The test runner starts four local servers.

Browser tests separate live public-catalogue smoke checks from explicitly labeled isolated UI fixtures. Fixture success never proves a real payment, authenticated database isolation, email delivery, provider integration or fulfillment transaction. No test creates production orders or charges money.

See [Master execution v2.1](docs/MASTER_EXECUTION_V2.md), [execution evidence and blockers](docs/EXECUTION.md), and [deployment instructions](docs/DEPLOYMENT.md). Preserve the v1 foundation and open draft PR #1. Current continuation branch: `build/kristiva-execution-v2`.

Both checkout activation flags default to false. Do not activate payments, change production DNS/schema, merge protected branches or deploy to production without the required approval and acceptance evidence. Credentials belong only in secure provider settings, never source files or chat. The legacy Astro starter remains available under `src` and `build:legacy`.
