import { queryOptions } from "@tanstack/react-query";
import { authClient } from "#/lib/auth/auth-client";

export const authKeys = {
  all: ["auth"] as const,

  session: () => [...authKeys.all, "session"] as const,
};

export const sessionQueryOptions = () =>
  queryOptions({
    queryKey: authKeys.session(),

    queryFn: async () => {
      const { data, error } = await authClient.getSession();

      if (error) {
        throw error;
      }

      return data;
    },

    staleTime: 1000 * 60 * 5,
  });
