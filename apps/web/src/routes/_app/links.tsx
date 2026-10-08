import { createFileRoute } from "@tanstack/react-router";

import { linksQueryOptions } from "#/features/links/client/links.queries";
import { LinksPage } from "#/features/links/page/links.page";

export const Route = createFileRoute("/_app/links")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(linksQueryOptions()),
  component: LinksPage,
});
