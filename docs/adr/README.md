# Architecture Decision Records

One file per accepted decision. The full decision log, including open proposals, lives in [ARCHITECTURE.md §22](../ARCHITECTURE.md#22-decision-log).

| ADR                                                   | Decision                                       | Source    | Status   |
| ----------------------------------------------------- | ---------------------------------------------- | --------- | -------- |
| [0001](0001-case-insensitive-short-codes.md)          | Case-insensitive short codes                   | ARCH D5   | Accepted |
| [0002](0002-workspaces-on-self-hosted-better-auth.md) | Workspaces on self-hosted Better Auth          | ARCH D6   | Accepted |
| [0003](0003-immutable-codes-and-soft-delete.md)       | Immutable short codes; soft delete keeps codes | M1 D1, D2 | Accepted |
| [0004](0004-cursor-pagination-and-ilike-search.md)    | Cursor pagination and `ILIKE` search           | M1 D3, D4 | Accepted |
| [0005](0005-client-side-qr-codes.md)                  | QR codes generated in the browser              | M1 D5     | Accepted |
| [0006](0006-ssrf-safe-metadata-prefill.md)            | SSRF-safe metadata prefill on paste            | M1 D6, §8 | Accepted |
| [0007](0007-static-visitor-status-pages.md)           | Static visitor status pages; 410 for disabled  | M1 D7, D8 | Accepted |

Template: **Context** (the problem and constraints), **Decision**, **Consequences** (trade-offs, follow-ups).
