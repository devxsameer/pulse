import { resolveLink } from "#/features/links/server/links.service";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/r/$shortCode")({
  server: {
    handlers: {
      GET: async ({
        params,
      }: {
        params: {
          shortCode: string;
        };
      }) => {
        const link = await resolveLink(params.shortCode);

        if (!link) {
          return new Response("Link not found", {
            status: 404,
          });
        }

        return new Response(null, {
          status: 302,

          headers: {
            Location: link.destinationUrl,

            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
});
