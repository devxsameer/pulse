import { LoginPage } from "#/features/auth/pages/login.page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/login")({
  component: LoginPage,
});
