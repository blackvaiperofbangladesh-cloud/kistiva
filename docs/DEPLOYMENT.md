# Independent deployments

Use Node 24 and `npm ci --ignore-scripts`. Run `npm test` followed by `npm run build`. `npm run test:browser` runs the browser checks against the live public catalogue without creating users/orders or charging money.

Each project deploys from the repository root using its own local configuration, for example `vercel --local-config apps/marketplace/vercel.json`. The configuration sets build/output paths and KRISTIVA_APP; API functions stay at the root and share server modules. Do not set rootDirectory to apps/<app>, because the shared API/modules are outside that directory.

Proposed project targets are documented in EXECUTION.md. Confirm mapping before configuring projects. A mobile target has not been provisioned. The duplicate projects stay unchanged.

Configure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY for build, and SUPABASE_URL/SUPABASE_PUBLISHABLE_KEY for runtime using secure Vercel settings. No service-role key is required by the current API. Keep both financial gate flags false. Never put payment, Brevo, Sentry server credentials, or a service-role key in browser configuration.

Preview deployments must remain protected and must not be promoted to production. The production workflow is intentionally absent until the mandatory release gates pass. Use Vercel's deployment approval checks and GitHub required checks before release. Branch protection and Vercel automatic CI gates have not been changed by this branch.

No domain or DNS operation is authorized without the owner's separate explicit approval. Cloudflare and Figma changes are unnecessary for this checkpoint.
