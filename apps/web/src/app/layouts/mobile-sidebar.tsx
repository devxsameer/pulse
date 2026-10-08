import {
  BarChart3,
  Bot,
  LayoutDashboard,
  Link2,
  Settings,
  Zap,
} from "lucide-react";

import { Link, useLocation } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Links",
    to: "/links",
    icon: Link2,
  },
  {
    label: "Analytics",
    to: "/analytics",
    icon: BarChart3,
  },
  {
    label: "AI Insights",
    to: "/ai-insights",
    icon: Bot,
  },
] as const;

export function MobileSidebar() {
  const { pathname } = useLocation();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b px-5">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <Zap className="size-4" />
          </div>

          <span className="text-lg font-semibold tracking-tight">Pulse</span>
        </Link>
      </div>

      <div className="flex flex-1 flex-col px-3 py-4">
        <Button className="mb-5 w-full justify-start" asChild>
          <Link to="/links">
            <Link2 className="size-4" />
            Create link
          </Link>
        </Button>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.to || pathname.startsWith(`${item.to}/`);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="size-4" />

                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link
          to="/settings"
          className="text-muted-foreground hover:bg-muted hover:text-foreground mt-auto flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium"
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
