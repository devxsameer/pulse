import { queryOptions } from "@tanstack/react-query";

import { getLinksFn } from "../server/links.functions";

export const linkKeys = {
  all: ["links"] as const,

  list: () => [...linkKeys.all, "list"] as const,

  detail: (linkId: string) => [...linkKeys.all, "detail", linkId] as const,
};

export const linksQueryOptions = () =>
  queryOptions({
    queryKey: linkKeys.list(),

    queryFn: () => getLinksFn(),

    staleTime: 1000 * 30,
  });
