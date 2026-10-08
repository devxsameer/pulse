# ADR 0003: Immutable short codes; soft delete keeps codes reserved

- **Status:** Accepted (2026-10-08)
- **Source:** M1 D1, D2. Narrows ARCHITECTURE.md D15 (no purge in v1).

## Context

A short code is a public promise: it's printed, shared, and encoded into QR codes. Two ways to break that promise are renaming a code and letting someone else claim a code after its link is deleted. The second also lets a stranger hijack traffic from old shares.

## Decision

- **Short codes can't be edited.** The edit form shows the code read-only and `updateLinkFn` has no `shortCode` field. Users create a new link instead.
- **Delete is a soft delete:** set `links.deleted_at`. Deleted links disappear from every workspace query and `/r/<code>` returns the 404 page.
- **Deleted codes stay reserved.** The unique `lower(short_code)` index covers deleted rows, so the code can never be reused in v1.
- No undo and no purge job in v1.

## Consequences

- Old shares never point somewhere unexpected.
- Codes are consumed permanently; at 36⁷ generated codes this is irrelevant for generated codes, and acceptable for custom aliases.
- A future purge job (post-v1) must decide whether purged codes become claimable; the safe default is a tombstone table.
- The list index is partial (`WHERE deleted_at IS NULL`), so deleted rows cost nothing on the hot list query.
