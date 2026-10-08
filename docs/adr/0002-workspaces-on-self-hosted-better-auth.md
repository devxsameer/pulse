# ADR 0002: Workspaces on self-hosted Better Auth

- **Status:** Accepted (2026-10-07)
- **Source:** ARCHITECTURE.md D6

## Context

Links need an owner that can later be shared by a team, and the public API (M4) needs keys scoped to that owner. We considered Neon Managed Auth, which wraps Better Auth, but it doesn't support TanStack Start SSR and only partially supports the organization plugin.

## Decision

- Run **Better Auth ourselves** with the `organization` plugin. Organizations are called **workspaces** in the product and in our columns (`links.workspace_id`).
- A `session.create.before` hook guarantees a personal workspace (idempotent, slug `personal-<userId>`) and sets it as the session's active workspace.
- Every server function resolves `{ userId, workspaceId }` via `requireWorkspace()`, and every repository query filters by `workspace_id`.

## Consequences

- Multi-tenant from day one; team invites become a UI feature, not a migration.
- We own auth configuration, secrets, and upgrades.
- `created_by` records the author separately from ownership, so removing a user doesn't orphan workspace links.
