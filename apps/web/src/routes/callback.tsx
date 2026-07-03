import { authKeys } from "#/features/auth/client/auth.queries";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/callback")({
  beforeLoad: async ({ context }) => {
    await context.queryClient.invalidateQueries({
      queryKey: authKeys.session(),
    });

    throw redirect({
      to: "/",
      search: {
        loginSuccess: true,
      },
    });
  },
});
