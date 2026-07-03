import { DashboardPage } from "#/features/dashboard/pages/dashboard.page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/dashboard")({
  component: DashboardPage,
});
