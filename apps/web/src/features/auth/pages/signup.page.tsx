import { Github } from "lucide-react";

import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";

import { useGithubLogin } from "#/features/auth/client/auth.mutations";
import SignupForm from "../components/signup-form";
import { AuthFooter } from "../components/auth-footer";

export function SignupPage() {
  const signup = useGithubLogin();

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create your Pulse account</h1>

        <p className="text-muted-foreground text-sm">
          Start shortening, tracking and optimizing your links.
        </p>
      </div>
      <SignupForm />

      <div className="relative py-2">
        <Separator />

        <span className="bg-background text-muted-foreground absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs font-medium tracking-wider uppercase">
          OR
        </span>
      </div>

      <Button
        className="w-full"
        variant="outline"
        size="lg"
        disabled={signup.isPending}
        onClick={() => signup.mutate()}
      >
        <Github className="mr-2 h-5 w-5" />

        {signup.isPending ? "Connecting..." : "Continue with GitHub"}
      </Button>

      <AuthFooter
        text="Already have an account?"
        linkText="Log in"
        to="/login"
      />
    </div>
  );
}
