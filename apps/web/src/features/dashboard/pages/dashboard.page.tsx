import { Globe2, Link2, MousePointerClick, Plus, Users } from "lucide-react";

import { Link } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";

import { useAuth } from "#/features/auth/client/auth.hooks";

import { AnalyticsOverview } from "../components/analytics-overview";
import { DashboardMetric } from "../components/dashboard-metric";
import { RecentLinks } from "../components/recent-links";
import { AiInsightCard } from "../components/ai-insight-card";

export function DashboardPage() {
  const { data: session } = useAuth();

  const firstName = session?.user.name.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Welcome back, {firstName}
          </h1>

          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Here's what's happening with your links.
          </p>
        </div>

        <Button asChild>
          <Link to="/links">
            <Plus className="size-4" />
            Create link
          </Link>
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetric
          title="Total clicks"
          value="48,291"
          change="+18.2%"
          trend="up"
          icon={MousePointerClick}
        />

        <DashboardMetric
          title="Unique visitors"
          value="31,840"
          change="+12.4%"
          trend="up"
          icon={Users}
        />

        <DashboardMetric
          title="Active links"
          value="142"
          change="+8"
          trend="up"
          icon={Link2}
        />

        <DashboardMetric
          title="Countries"
          value="84"
          change="+6"
          trend="up"
          icon={Globe2}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <AnalyticsOverview />

        <AiInsightCard />
      </section>

      <RecentLinks />
    </div>
  );
}
