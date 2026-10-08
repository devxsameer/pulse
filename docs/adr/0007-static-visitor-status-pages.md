# ADR 0007: Static visitor status pages; 410 for disabled links

- **Status:** Accepted (2026-10-08)
- **Source:** M1 D7, D8

## Context

Visitors hitting a missing, disabled, or expired link got a plain-text 404. These responses sit on the redirect path, which moves to a separate edge worker in M2, so they must be cheap and portable.

## Decision

- `resolveLink()` returns either `{ kind: "redirect", destinationUrl }` or `{ kind: "unavailable", reason }`. The `/r/$shortCode` handler maps reasons to pages:

  | Reason              | Status | Page                          |
  | ------------------- | ------ | ----------------------------- |
  | not found / deleted | 404    | "Link not found"              |
  | disabled            | 410    | "This link has been disabled" |
  | expired             | 410    | "This link has expired"       |

- Pages are **static HTML strings** (`lib/status-pages.ts`): inline CSS with light/dark themes, no JavaScript, no React, a link home, and **no user-controlled content**, so there's nothing to escape.
- Headers: `Content-Type: text/html; charset=utf-8`, `Cache-Control: private, no-store`, `X-Robots-Tag: noindex`.
- Disabled is **410, not 404**: honest to visitors, since the owner chose to turn it off.

## Consequences

- Deleted links are indistinguishable from never-existing ones, so deletion leaks nothing.
- The templates move unchanged into the redirector worker in M2.
- A "report abuse" link on these pages comes with abuse handling in M6.
