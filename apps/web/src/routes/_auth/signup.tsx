import { SignupPage } from "#/features/auth/pages/signup.page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/signup")({
  component: SignupPage,
});
