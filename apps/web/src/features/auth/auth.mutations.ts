import { authClient } from "#/lib/auth/auth-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "./auth.queries";

export function useGithubLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
      });
    },

    onSuccess: async () => {
      // Normally won't execute because OAuth redirects immediately.
      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { error } = await authClient.signOut();

      if (error) {
        throw error;
      }
    },

    onSuccess: async () => {
      await queryClient.setQueryData(authKeys.session(), null);

      await queryClient.invalidateQueries({
        queryKey: authKeys.session(),
      });
    },
  });
}
