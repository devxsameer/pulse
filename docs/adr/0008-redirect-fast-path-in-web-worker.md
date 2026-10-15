# ADR 0008: Redirect fast path inside the web Worker (split only when measured)

- **Status:** Accepted (2026-10-15)
- **Source:** ARCHITECTURE.md D1 (supersedes the original recommendation of a dedicated redirector Worker)

## Context

The original plan put redirects in a separate `apps/redirector` Worker on the short domain for isolation, a tiny bundle, and a clean read/write split. That costs a second deploy pipeline, extracting shared packages before they're otherwise needed, and duplicated bindings and config, all before the first click chart ships.

[Dub](https://github.com/dubinc/dub), an open-source link-attribution platform serving production traffic, runs redirects from the **same Next.js app** as its dashboard. Its `LinkMiddleware` runs at the edge before any page code: it reads the link from Redis, falls back to the database on a miss, records the click with `waitUntil` (Tinybird), and returns the redirect. On Vercel, middleware is bundled and deployed separately from the app, so redirects are isolated in practice without being a separate service.

On Cloudflare Workers one deploy is one script. Today a redirect through `pulse-web` loads the same ~3.5 MB bundle as the dashboard and goes through TanStack Start's router. Copying Dub literally (a normal route) would pay that cost on every redirect.

## Decision

Keep **one Worker (`pulse-web`)**, and give redirects a **fast path that runs before the app**:

- A custom server entry (`apps/web/src/server.ts`) checks the request first. Short-link requests (the short domain, or `/r/<code>` on the app domain) go to `handleRedirect()`; everything else lazy-imports the TanStack Start handler.
- The fast path lives in `apps/web/src/edge/` and may only import: KV, the click queue, the status pages, a minimal link lookup, and pure helpers (short-code rules, bot hints). An ESLint `no-restricted-imports` rule forbids React, TanStack, Better Auth, and `features/*/server` imports there.
- Flow: validate code → KV read (positive 24 h, negative 60 s) → Postgres fallback that fills KV → status checks → `ctx.waitUntil(queue.send(click))` → 302. Click capture never blocks the redirect, as in Dub.
- The queue consumer stays a **separate Worker** (`apps/worker`): batch processing, retries, and cron shouldn't share CPU or deploys with user traffic.

**When to split the fast path into its own Worker** (any one is enough):

1. k6 shows redirect p95 or cold starts over the [§20 budgets](../ARCHITECTURE.md#20-performance-budgets--slos), attributable to the shared bundle.
2. An app deploy breaks redirects in production, or isolation becomes a requirement (custom domains for paying users).
3. Redirects need different limits, bindings, or regions from the app.

Splitting is then a new `wrangler.jsonc` whose `main` is the `src/edge` entry, plus shared bindings. The import rule above keeps it a config change, not a rewrite.

## Consequences

- One deploy and one config for app + redirects; M2 ships much sooner.
- A bad app deploy can break redirects. Mitigations: CI gates, gradual Workers deployments (M6), and the split triggers above.
- Package extraction happens only for what `apps/worker` needs (`packages/db`, plus bot/UA helpers in `packages/core`), not for redirects.
- Status pages ([ADR 0007](0007-static-visitor-status-pages.md)) are reused by the fast path unchanged.
- The trade-off is measured, not assumed: k6 results and the split criteria go in the README.
