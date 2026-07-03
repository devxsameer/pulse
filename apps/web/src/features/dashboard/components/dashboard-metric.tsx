import type { LucideIcon } from "lucide-react";

import { TrendingDown, TrendingUp } from "lucide-react";

import { cn } from "#/lib/utils";

type DashboardMetricProps = {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
};

export function DashboardMetric({
  title,
  value,
  change,
  trend,
  icon: Icon,
}: DashboardMetricProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="bg-card rounded-xl border p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{title}</p>

        <div className="bg-muted flex size-8 items-center justify-center rounded-lg">
          <Icon className="text-muted-foreground size-4" />
        </div>
      </div>

      <p className="mt-4 text-2xl font-semibold tracking-tight">{value}</p>

      <div className="mt-2 flex items-center gap-1.5">
        <TrendIcon
          className={cn(
            "size-3.5",
            trend === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        />

        <span
          className={cn(
            "text-xs font-medium",
            trend === "up"
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-destructive",
          )}
        >
          {change}
        </span>

        <span className="text-muted-foreground text-xs">from last month</span>
      </div>
    </div>
  );
}
