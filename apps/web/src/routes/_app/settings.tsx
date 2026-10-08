import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "#/components/layouts/coming-soon";

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <ComingSoon
      title="Settings"
      description="Manage your account, workspace, and API keys."
    />
  ),
});
