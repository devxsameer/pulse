import {
  ArrowRight,
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  MousePointerClick,
} from "lucide-react";

import { Link } from "@tanstack/react-router";

import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

const links = [
  {
    id: "1",
    shortUrl: "pulse.dev/launch",
    destination: "https://pulse.dev/product/launch",
    clicks: "12,429",
    createdAt: "2 hours ago",
  },
  {
    id: "2",
    shortUrl: "pulse.dev/github",
    destination: "https://github.com/pulse",
    clicks: "8,241",
    createdAt: "Yesterday",
  },
  {
    id: "3",
    shortUrl: "pulse.dev/docs",
    destination: "https://docs.pulse.dev",
    clicks: "4,782",
    createdAt: "3 days ago",
  },
  {
    id: "4",
    shortUrl: "pulse.dev/waitlist",
    destination: "https://pulse.dev/waitlist",
    clicks: "2,103",
    createdAt: "5 days ago",
  },
];

export function RecentLinks() {
  return (
    <section className="bg-card overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h2 className="font-semibold tracking-tight">Recent links</h2>

          <p className="text-muted-foreground mt-1 text-xs">
            Your latest shortened links
          </p>
        </div>

        <Button variant="ghost" size="sm" asChild>
          <Link to="/links">
            View all
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="divide-y">
        {links.map((link) => (
          <div
            key={link.id}
            className="hover:bg-muted/30 flex items-center gap-4 px-5 py-4 transition-colors"
          >
            <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
              <Link2 className="text-muted-foreground size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{link.shortUrl}</p>

              <p className="text-muted-foreground mt-1 truncate text-xs">
                {link.destination}
              </p>
            </div>

            <div className="hidden items-center gap-1.5 sm:flex">
              <MousePointerClick className="text-muted-foreground size-3.5" />

              <span className="text-sm font-medium">{link.clicks}</span>
            </div>

            <p className="text-muted-foreground hidden w-24 text-right text-xs md:block">
              {link.createdAt}
            </p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreHorizontal className="size-4" />

                  <span className="sr-only">Link actions</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Copy className="size-4" />
                  Copy link
                </DropdownMenuItem>

                <DropdownMenuItem>
                  <ExternalLink className="size-4" />
                  Open destination
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </section>
  );
}
