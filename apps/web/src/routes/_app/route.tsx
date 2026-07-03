import { AppShell } from "#/app/layouts/app-shell";
import { requireAuth } from "#/features/auth/server/auth.guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app")({
  beforeLoad: requireAuth,
  component: AppShell,
});
