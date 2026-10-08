# ADR 0006: SSRF-safe metadata prefill on paste

- **Status:** Accepted (2026-10-08)
- **Source:** M1 D6 and §8

## Context

Prefilling a link's title, description, and favicon means fetching a user-supplied URL from our server: a textbook SSRF vector. The fetch also must never slow down or break saving a link.

## Decision

**When:** only when a full URL is pasted into the destination field. The form fills title and description **only if they're empty**; favicon and OG image are replaced. Saving never fetches anything, and the server stores client-supplied `faviconUrl`/`imageUrl` only after re-validating them as `https:` URLs of at most 2048 characters. If the destination's origin changes after the prefill, the form drops the stale favicon/image.

**How (`fetchMetadataFn` → `server/metadata.server.ts`):**

1. `lib/url-safety.ts` allows only `http:`/`https:` on default ports, without credentials. It rejects `localhost`, single-label hosts, `.local`/`.internal`/`.localhost`/`.home.arpa`/`.lan`/`.intranet`/`.corp`, our own domain, every non-public IPv4 range, and every IPv6 literal outside global unicast (`2000::/3`, minus documentation, Teredo, and 6to4). This blocks IPv4-mapped, NAT64, ULA, link-local, multicast, and loopback addresses. The WHATWG URL parser canonicalises integer, hex, and octal IPv4 forms first, so `http://2130706433` is caught as `127.0.0.1`.
2. `redirect: "manual"`, at most 3 redirects, and the guard re-runs on **every hop**.
3. 3 s total budget (`AbortSignal.timeout`), only `text/html`, read at most 512 KB, and stop reading at `</head>`.
4. `lib/html-metadata.ts` parses the head: `og:title` → `<title>`, `og:description` → `description`, `og:image` → `twitter:image`, `link[rel~=icon]` → `/favicon.ico`. It resolves relative URLs (honouring `<base>`), collapses whitespace, caps the title at 120 and the description at 500 characters, and keeps only `https:` assets.
5. `User-Agent: PulseBot/1.0 (+https://github.com/devxsameer/pulse)`.
6. Any failure returns empty fields, never an error.
7. **Rate limit:** 10 requests per minute per user via the Workers Rate Limiting binding `METADATA_RATE_LIMITER` (`wrangler.jsonc`). Over the limit, it returns empty fields. It fails open if the binding is missing.

**Parser choice:** a small regex-based head parser instead of `HTMLRewriter`. Its input is already capped, it runs (and is unit-tested) under Node as well as Workers, and a wrong guess only produces a worse prefill that the user can edit.

## Consequences

- **Known gap:** Workers can't resolve DNS, so a public hostname whose DNS points at a private IP passes the hostname check. The backstop is that Cloudflare's outbound `fetch` can't reach private networks or our origin's internals. Revisit if fetching ever moves off Workers.
- Rate-limit counters are per Cloudflare location and approximate; that's fine for an abuse guard.
- Metadata is a snapshot from creation time; refreshing it is post-v1.
