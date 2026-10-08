import { useSuspenseInfiniteQuery } from "@tanstack/react-query";

import { linksInfiniteQueryOptions } from "./links.queries";

export function useLinks(q = "") {
  const query = useSuspenseInfiniteQuery(linksInfiniteQueryOptions(q));

  return {
    ...query,
    links: query.data.pages.flatMap((page) => page.items),
  };
}
