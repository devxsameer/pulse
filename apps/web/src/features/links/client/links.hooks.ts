import { useSuspenseQuery } from "@tanstack/react-query";

import { linksQueryOptions } from "./links.queries";

export function useLinks() {
  return useSuspenseQuery(linksQueryOptions());
}
