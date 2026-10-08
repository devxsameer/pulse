import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "#/components/layouts/coming-soon";

export const Route = createFileRoute("/_app/analytics")({
  component: () => (
    <ComingSoon
      title="Analytics"
      description="Clicks, referrers, locations, and devices across your links."
    />
  ),
});
