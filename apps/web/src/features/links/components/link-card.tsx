import { Copy, ExternalLink, Link2, MoreHorizontal } from "lucide-react";

import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

type LinkCardProps = {
  link: {
    id: string;
    shortCode: string;
    destinationUrl: string;
    title: string | null;
    description: string | null;
    isActive: boolean;
    expiresAt: Date | null;
    createdAt: Date;
  };
};

export function LinkCard({ link }: LinkCardProps) {
  const shortUrl = `${window.location.origin}/${link.shortCode}`;

  async function copyShortUrl() {
    await navigator.clipboard.writeText(shortUrl);

    toast.success("Link copied");
  }

  return (
    <div className="bg-card hover:bg-muted/20 flex items-center gap-4 rounded-xl border p-4 transition-colors sm:p-5">
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Link2 className="text-muted-foreground size-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {link.title || `/${link.shortCode}`}
          </p>

          {!link.isActive && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
              Disabled
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={copyShortUrl}
          className="text-primary mt-1 block truncate text-sm hover:underline"
        >
          /{link.shortCode}
        </button>

        <p className="text-muted-foreground mt-1 truncate text-xs">
          {link.destinationUrl}
        </p>
      </div>

      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium">0</p>

        <p className="text-muted-foreground text-xs">clicks</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />

            <span className="sr-only">Link actions</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={copyShortUrl}>
            <Copy className="size-4" />
            Copy short link
          </DropdownMenuItem>

          <DropdownMenuItem asChild>
            <a href={link.destinationUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Open destination
            </a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
