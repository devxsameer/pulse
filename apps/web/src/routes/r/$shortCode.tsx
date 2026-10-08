import { createFileRoute } from "@tanstack/react-router";

import { statusPageResponse } from "#/features/links/lib/status-pages";
import { resolveLink } from "#/features/links/server/links.service";

export const Route = createFileRoute("/r/$shortCode")({
  server: {
    handlers: {
      GET: async ({ params }: { params: { shortCode: string } }) => {
        const result = await resolveLink(params.shortCode);

        if (result.kind === "unavailable") {
          return statusPageResponse(result.reason);
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: result.destinationUrl,
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
