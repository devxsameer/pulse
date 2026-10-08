import { infiniteQueryOptions } from "@tanstack/react-query";

import { listLinksFn } from "../server/links.functions";

export const linkKeys = {
  all: ["links"] as const,

  lists: () => [...linkKeys.all, "list"] as const,

  list: (q: string) => [...linkKeys.lists(), { q }] as const,
};

export const linksInfiniteQueryOptions = (q = "") =>
  infiniteQueryOptions({
    queryKey: linkKeys.list(q),

    queryFn: ({ pageParam }) =>
      listLinksFn({
        data: { q: q || undefined, cursor: pageParam },
      }),

    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,

    staleTime: 1000 * 30,
  });
