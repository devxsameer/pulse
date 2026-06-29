import { createFileRoute } from "@tanstack/react-router";
import AuthLayout from "#/features/auth/components/auth-layout";
import { requireGuest } from "#/features/auth/server/auth.guards";

export const Route = createFileRoute("/_auth")({
  beforeLoad: requireGuest,
  component: AuthLayout,
});
