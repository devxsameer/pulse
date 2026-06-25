import { Button } from "#/components/ui/button";
import { useSession } from "#/features/auth/auth.hooks";
import { useGithubLogin, useLogout } from "#/features/auth/auth.mutations";
import { createFileRoute } from "@tanstack/react-router";
import { Github } from "lucide-react";

export const Route = createFileRoute("/")({ component: App });

function App() {
  const { data, isSuccess } = useSession();
  const loginMutation = useGithubLogin();
  const logoutMutation = useLogout();

  return (
    <main className="page-wrap px-4 pt-14 pb-8">
      Name: {data?.user.name ?? "Please Login"}
      {isSuccess && JSON.stringify(data?.user)}
      <section className="island-shell rise-in relative overflow-hidden rounded-4xl px-6 py-10 sm:px-10 sm:py-14">
        Hello this is Pulse.
      </section>
      {data?.user ? (
        <Button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <Github />
          {logoutMutation.isPending ? "Logging Out..." : "LogOut"}
        </Button>
      ) : (
        <Button
          onClick={() => loginMutation.mutate()}
          disabled={loginMutation.isPending}
        >
          <Github />
          {loginMutation.isPending ? "Connecting..." : "Continue with GitHub"}
        </Button>
      )}
    </main>
  );
}
