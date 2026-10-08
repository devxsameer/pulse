# ADR 0004: Cursor pagination and `ILIKE` search

- **Status:** Accepted (2026-10-08)
- **Source:** M1 D3, D4

## Context

The links page rendered every link at once. It needs search and paging that stay correct while links are being created, and the same contract should serve the public API in M4.

## Decision

- **Keyset (cursor) pagination** on `(created_at DESC, id DESC)`. The cursor is an opaque base64url token of `{ createdAt, id }`, validated on decode; an invalid cursor is treated as the first page. The query uses a row comparison, `(created_at, id) < ($1, $2)`, and fetches `limit + 1` rows to know whether another page exists.
- Backed by the partial index `(workspace_id, created_at DESC, id DESC) WHERE deleted_at IS NULL`.
- **Search** is `ILIKE '%q%'` across short code, title, and destination URL, with `%`, `_`, and `\` escaped. The query lives in the URL (`/links?q=`).

## Consequences

- Load more never duplicates or skips links when new ones are inserted, unlike `OFFSET`.
- No "jump to page N"; not needed for a newest-first list.
- `ILIKE` with a leading wildcard scans the workspace's rows. That's fine at v1 scale; add a `pg_trgm` GIN index once a workspace has thousands of links.
