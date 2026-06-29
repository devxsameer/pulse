import { Github } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";

import { useGithubLogin } from "#/features/auth/client/auth.mutations";
import LoginForm from "../components/login-form";
import { AuthFooter } from "../components/auth-footer";

export function LoginPage() {
  const login = useGithubLogin();

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>

        <p className="text-muted-foreground text-sm">
          Sign in to your Pulse account.
        </p>
      </div>

      <LoginForm />

      <div className="relative py-2">
        <Separator />

        <span className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-medium tracking-wider uppercase">
          OR
        </span>
      </div>

      <Button
        className="w-full"
        size="lg"
        variant="outline"
        disabled={login.isPending}
        onClick={() => login.mutate()}
      >
        <Github className="mr-2 h-5 w-5" />

        {login.isPending ? "Connecting..." : "Continue with GitHub"}
      </Button>

      <AuthFooter
        text="Don't have an account?"
        linkText="Sign up"
        to="/signup"
      />
    </div>
  );
}
