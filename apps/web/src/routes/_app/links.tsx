import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { linksInfiniteQueryOptions } from "#/features/links/client/links.queries";
import { LinksPage } from "#/features/links/page/links.page";

const linksSearchSchema = z.object({
  q: z.string().trim().max(200).optional().catch(undefined),
});

export const Route = createFileRoute("/_app/links")({
  validateSearch: linksSearchSchema,
  loaderDeps: ({ search }) => ({ q: search.q ?? "" }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureInfiniteQueryData(
      linksInfiniteQueryOptions(deps.q),
    ),
  component: LinksPage,
});
