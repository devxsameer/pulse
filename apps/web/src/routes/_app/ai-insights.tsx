import { createFileRoute } from "@tanstack/react-router";

import { ComingSoon } from "#/components/layouts/coming-soon";

export const Route = createFileRoute("/_app/ai-insights")({
  component: () => (
    <ComingSoon
      title="AI Insights"
      description="Weekly insights and answers grounded in your link traffic."
    />
  ),
});
