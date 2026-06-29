import { requireAuth } from "#/features/auth/server/auth.guards";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected")({
  component: RouteComponent,
  beforeLoad: requireAuth,
});

function RouteComponent() {
  return <div>Hello "/_protected"!</div>;
}
