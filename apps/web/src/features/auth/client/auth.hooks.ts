import { useSuspenseQuery } from "@tanstack/react-query";
import { sessionQueryOptions } from "./auth.queries";

export function useAuth() {
  return useSuspenseQuery(sessionQueryOptions());
}
