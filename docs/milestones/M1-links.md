# M1 — Links done right

> Make link management reliable and polished: edit, delete, find, share as QR, auto-fill metadata safely, and show visitors proper pages. Only what v1 needs; everything else is listed under [Post-v1](#10-post-v1).

| Field        | Value                                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| Status       | **Implemented**, pending manual acceptance testing ([§12](#12-acceptance-criteria)) |
| Parent doc   | [ARCHITECTURE.md](../ARCHITECTURE.md) (§2 scope, §9 data model, §15 security)       |
| Depends on   | M0 (workspaces, short code rules, CI) ✅                                            |
| Next         | M2 (edge redirector + click pipeline)                                               |
| Estimate     | 3–4 days                                                                            |
| Last updated | 2026-10-08                                                                          |

---

## 1. Goal

At the end of M1, a signed-in user can:

1. **Edit** a link's destination, title, description, expiration, and on/off state.
2. **Delete** a link (with confirmation).
3. **Search** their links and page through them with **Load more**.
4. Download a **QR code** for any link.
5. Paste a URL and get its **title and favicon prefilled**, fetched safely on the server.

And a visitor hitting a not-found, expired, or disabled link gets a **proper page** instead of plain text or a 500.

---

## 2. Current state (start of M1)

- `links` table: `id, workspace_id, created_by, short_code, destination_url, title, description, is_active, expires_at, created_at, updated_at`.
- Create link: dialog + form → `createLinkFn` → `links.service.createLink` (workspace-scoped, race-safe).
- `/links` renders every workspace link at once: no search, no pagination.
- `LinkCard` dropdown: "Copy short link" and "Open destination" only.
- `/r/$shortCode`: 302 if active and unexpired, otherwise plain-text 404.
- `/qr-codes` is a "coming soon" placeholder in the sidebar.

---

## 3. Scope

| #   | Feature              | Summary                                                                                         |
| --- | -------------------- | ----------------------------------------------------------------------------------------------- |
| F1  | Edit link            | Dialog from the card: destination, title, description, expiration; Disable/Enable in the menu   |
| F2  | Delete link          | Confirm dialog → soft delete (`deleted_at`); stops redirecting immediately; code stays reserved |
| F3  | Search + pagination  | Search box (code, title, URL) and cursor-based **Load more**; state in the URL                  |
| F4  | QR code dialog       | Generated in the browser; PNG/SVG download; available from every card                           |
| F5  | Metadata prefill     | On paste, fetch title + favicon (+ description, OG image) through an SSRF-safe server function  |
| F6  | Visitor status pages | Minimal HTML pages for not found (404), expired (410), disabled (410)                           |

Not in M1: analytics, KV cache, edge redirector (M2); public API (M4); AI features (M5); everything in [Post-v1](#10-post-v1).

---

## 4. Decisions

Recorded as ADRs: D1–D2 → [0003](../adr/0003-immutable-codes-and-soft-delete.md), D3–D4 → [0004](../adr/0004-cursor-pagination-and-ilike-search.md), D5 → [0005](../adr/0005-client-side-qr-codes.md), D6 → [0006](../adr/0006-ssrf-safe-metadata-prefill.md), D7–D8 → [0007](../adr/0007-static-visitor-status-pages.md).

| ID  | Question                             | Recommendation                                                                                                                                 | Status   |
| --- | ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| D1  | Can the short code be edited?        | **No.** Changing it silently breaks every place the link was shared. Users can create a new link instead.                                      | ACCEPTED |
| D2  | Do deleted links free their code?    | **No, never in v1.** Prevents someone re-registering a just-deleted code and hijacking traffic from old shares. A purge job can come after v1. | ACCEPTED |
| D3  | Pagination style                     | **Cursor** on `(created_at, id)`: stable under inserts, and matches the planned public API (ARCHITECTURE §13).                                 | ACCEPTED |
| D4  | Search implementation                | **`ILIKE`** on short code, title, and destination URL. Add a `pg_trgm` index only when a workspace has thousands of links.                     | ACCEPTED |
| D5  | QR generation                        | **In the browser** with the `qrcode` package: no server cost. A public QR endpoint can come with the API in M4.                                | ACCEPTED |
| D6  | When is metadata fetched?            | **Only on paste**, to prefill the form. The user sees and can edit the result; saving never waits on a remote site.                            | ACCEPTED |
| D7  | Status pages: how are they rendered? | **Static HTML strings** from the `/r` server handler: fast, no React, and the same templates move into the redirector in M2.                   | ACCEPTED |
| D8  | Disabled link: 410 or 404?           | **410 "This link has been disabled"**: honest for visitors; the owner chose to disable it.                                                     | ACCEPTED |

---

## 5. Data model changes

One migration, `0003_links_m1`. No new tables.

**`links`: add columns**

| column        | type        | notes                                           |
| ------------- | ----------- | ----------------------------------------------- |
| `favicon_url` | text        | `https:` URL only; null if none found           |
| `image_url`   | text        | OG/Twitter image; `https:` only; null if none   |
| `deleted_at`  | timestamptz | null = live; set on delete; never cleared in v1 |

**Indexes**

- Replace `links_workspace_created_at_idx` with a partial index `(workspace_id, created_at DESC, id DESC) WHERE deleted_at IS NULL`. It serves the default list and cursor pagination.
- Keep `links_short_code_lower_unique_idx` covering deleted rows (D2).

**Display status** is derived in code, not stored:

```ts
type LinkStatus = "active" | "disabled" | "expired";
// precedence: disabled > expired > active (deleted links are never shown)
```

---

## 6. Server functions

All call `requireWorkspace()`, validate with Zod, and delegate to `links.service`. Every query filters by `workspace_id` **and** `deleted_at IS NULL`. A link from another workspace, or a deleted one, returns **not found**, never "forbidden", so IDs don't leak.

| Function          | Input                                                                         | Returns                                                             |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `listLinksFn`     | `{ q?: string, cursor?: string, limit?: number (≤ 50, default 20) }`          | `{ items: LinkView[], nextCursor: string \| null }`                 |
| `createLinkFn`    | existing input + `faviconUrl`, `imageUrl` (`""` when none)                    | `LinkView`                                                          |
| `updateLinkFn`    | `{ id, destinationUrl, title, description, expiresAt, faviconUrl, imageUrl }` | `LinkView`                                                          |
| `setLinkActiveFn` | `{ id, isActive }`                                                            | `LinkView`                                                          |
| `deleteLinkFn`    | `{ id }`                                                                      | `{ id }`                                                            |
| `fetchMetadataFn` | `{ url }`                                                                     | `{ title, description, faviconUrl, imageUrl }` (fields may be null) |

- `LinkView` = public link fields + derived `status`. Built by one explicit mapper, so internal columns never leak to the client.
- `faviconUrl` / `imageUrl` sent by the client are re-validated (`https:` only, length-capped). The server never fetches them.
- An unchanged expiration is accepted on update even if it's already in the past, so editing an expired link's title doesn't fail.
- Services throw typed errors (`LinkNotFoundError`, `LinkConflictError`, `InvalidLinkError`). The server functions turn them into user-facing messages; unknown errors become a generic message and are logged.

---

## 7. Redirect behavior (`/r/$shortCode`)

| Link state           | Response                                   |
| -------------------- | ------------------------------------------ |
| Not found or deleted | `404` + "Link not found" page              |
| Disabled             | `410` + "This link has been disabled" page |
| Expired              | `410` + "This link has expired" page       |
| Active               | `302` → destination                        |

HTML pages: self-contained, no JavaScript, accessible, a link back to the home page, and no user content rendered (so nothing to escape). Headers: `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`.

---

## 8. Metadata fetch: SSRF-safe design

Fetching user-supplied URLs from our server is a classic SSRF vector. Implemented in `features/links/lib/url-safety.ts` (guard), `lib/html-metadata.ts` (parser), and `server/metadata.server.ts` (fetch); see [ADR 0006](../adr/0006-ssrf-safe-metadata-prefill.md). Rules:

1. **Scheme and port:** only `http:` / `https:` on default ports.
2. **Host:** reject `localhost`, `*.local`, `*.internal`, our own domains, and IP literals in private, loopback, link-local (`169.254.0.0/16`), CGNAT, multicast, and reserved ranges, for IPv4 and IPv6 (including `::ffff:` mapped and integer forms like `http://2130706433`).
3. **Redirects:** `redirect: "manual"`, at most 3 hops, **re-validating every hop**.
4. **Budget:** 3 s total (`AbortSignal.timeout`), read at most 512 KB, only parse `text/html`.
5. **Parsing:** a small head-only parser (not `HTMLRewriter`, so it's unit-testable under Node) for `<title>`, `og:title`, `description`, `og:description`, `og:image`, `twitter:image`, and `link[rel~=icon]` (falling back to `/favicon.ico`). Resolve relative URLs against the final URL and `<base href>`.
6. **Output:** trim and collapse whitespace; cap title at 120 and description at 500 characters; keep image and favicon only if they're `https:`.
7. **Identity:** `User-Agent: PulseBot/1.0 (+https://github.com/devxsameer/pulse)`.
8. **Fail silently:** any violation or error returns empty fields. Never surfaces as a form error.
9. **Abuse limit:** 10 requests per minute per user, via the Workers Rate Limiting binding `METADATA_RATE_LIMITER` in `wrangler.jsonc`.

> Workers can't do DNS lookups, so a public hostname that resolves to a private IP can't be caught by rule 2. Cloudflare's outbound `fetch` can't reach private networks anyway, which is the backstop. Record this trade-off in the ADR.

---

## 9. UI changes

- **`/links`**: search input (debounced, synced to `?q=`), list of cards, **Load more** button driven by `nextCursor`, empty state for "no results".
- **`LinkCard`**: shows the favicon (fallback icon), title, short URL, destination, and a status badge for disabled/expired. Dropdown: Copy, Open, **QR code**, **Edit**, **Disable/Enable**, **Delete**.
- **Link form** (shared by create and edit): pasting a URL into the destination field calls `fetchMetadataFn` and prefills title/description/favicon **only if those fields are empty**; shows a small spinner, never an error. In edit mode the short code is shown read-only (D1).
- **QR dialog**: preview, size (256 / 512 / 1024), **Download PNG** and **Download SVG**; file name `pulse-<code>.png`.
- **Delete**: confirm dialog ("Visitors will see 'Link not found'. This can't be undone.").
- Mutations: TanStack Query; optimistic update for disable/enable and delete; invalidate `linkKeys` on settle.
- **Sidebar**: remove the **QR Codes** entry and the `/qr-codes` route; QR lives on each card.

---

## 10. Post-v1

Deliberately deferred. All are additive (new columns/tables/UI), so nothing built in M1 needs reworking for them.

| Feature                                  | Why it can wait                                                 |
| ---------------------------------------- | --------------------------------------------------------------- |
| Tags (+ tag filter, tag settings)        | Search covers finding links for now; two tables + lots of UI    |
| UTM builder                              | Users can paste URLs that already contain UTM parameters        |
| Archive                                  | The active/disabled toggle covers "hide this"                   |
| Password-protected links                 | Medium effort (hashing, signed cookies, rate limits), niche use |
| Undo / restore deleted links + purge job | Confirmation dialog is enough for v1                            |
| Link detail page `/links/$linkId`        | Built in M3, when it has analytics to show                      |
| `/qr-codes` page, QR customization       | The per-link QR dialog covers v1                                |
| Server-side metadata fetch on save       | Prefill on paste is enough                                      |
| Status filter tabs, sort options         | Newest-first + search is enough at v1 scale                     |
| Duplicate link                           | Nice-to-have                                                    |

---

## 11. Security checklist

- [x] Every workspace repository function takes `workspaceId` and filters by it and by `deleted_at IS NULL` (`findLinkByShortCode` deliberately includes deleted rows for the redirect path).
- [x] Update and delete affect zero rows for another workspace's link and return not found.
- [x] `updateLinkFn` re-runs `normalizeDestinationUrl` and expiration validation.
- [x] Client-supplied `faviconUrl` / `imageUrl` are validated, not fetched.
- [x] Metadata fetch follows §8, including per-hop validation and the rate limit.
- [x] Status pages contain no user-controlled content.

---

## 12. Acceptance criteria

- [ ] Editing a link updates the list without a reload; the short code can't be changed.
- [ ] Disabling a link makes `/r/<code>` return the 410 disabled page; enabling restores the redirect.
- [ ] Deleting a link asks for confirmation, removes it from the list, and `/r/<code>` returns the 404 page; creating a new link with the same code fails.
- [ ] Searching by part of a title, URL, or short code finds the link; **Load more** never duplicates or skips links.
- [ ] The QR code downloads as PNG and SVG and scans to the short URL.
- [ ] Pasting a URL prefills the title and favicon within ~3 s or silently does nothing; `http://localhost`, `http://169.254.169.254`, and `http://10.0.0.1` are never fetched.
- [ ] Expired links show the 410 expired page.
- [ ] CI is green: lint, typecheck, tests, migration sync, build.

---

## 13. Task breakdown (PR-sized)

1. ✅ **Schema + migration**: `favicon_url`, `image_url`, `deleted_at`, partial index. Generate, review, and run locally with seed data.
2. ✅ **Service layer**: typed errors, `LinkView` mapper, display status, workspace + not-deleted scoping.
3. ✅ **List search + pagination**: `listLinksFn`, URL search params, Load more, empty states.
4. ✅ **Edit + disable/enable + delete**: `updateLinkFn`, `setLinkActiveFn`, `deleteLinkFn`, shared form in edit mode, confirm dialog, optimistic updates.
5. ✅ **Visitor status pages**: 404/410 templates in the `/r` handler.
6. ✅ **QR dialog**: `qrcode` package, PNG/SVG download; remove the `/qr-codes` route and sidebar entry.
7. ✅ **Metadata prefill**: SSRF guard + parser, `fetchMetadataFn`, rate-limit binding, prefill UX, favicon on cards.
8. ✅ **Docs**: ADRs in `docs/adr/`; ARCHITECTURE.md updated (§3 current state, §9 data model, §15 SSRF, §22 decision log, roadmap).

Each PR: green CI, migrations generated and reviewed, never `db:push`.

---

## 14. Open questions

- ~~Rate limiting for `fetchMetadataFn`~~: resolved, using the Workers Rate Limiting binding now (ADR 0006).
- Should the list show a relative "created 3 days ago" or an absolute date? (The list shows no date yet.)
