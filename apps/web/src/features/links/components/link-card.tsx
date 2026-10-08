import {
  Copy,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  QrCode,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { cn } from "#/lib/utils";

import { useSetLinkActive } from "../client/links.mutations";
import type { LinkItem } from "../client/links.types";

import { DeleteLinkDialog } from "./delete-link-dialog";
import { EditLinkDialog } from "./edit-link-dialog";
import { QrCodeDialog } from "./qr-code-dialog";

type LinkCardProps = {
  link: LinkItem;
};

const STATUS_BADGE = {
  disabled: { label: "Disabled", className: "bg-muted text-muted-foreground" },
  expired: {
    label: "Expired",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
} as const;

export function LinkCard({ link }: LinkCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [faviconFailed, setFaviconFailed] = useState(false);

  const setLinkActive = useSetLinkActive();

  const shortPath = `/r/${link.shortCode}`;
  const badge = link.status === "active" ? null : STATUS_BADGE[link.status];

  async function copyShortUrl() {
    await navigator.clipboard.writeText(
      `${window.location.origin}${shortPath}`,
    );

    toast.success("Link copied");
  }

  function toggleActive() {
    const isActive = !link.isActive;

    setLinkActive.mutate(
      { id: link.id, isActive },
      {
        onSuccess: () =>
          toast.success(isActive ? "Link enabled" : "Link disabled"),
        onError: (error) =>
          toast.error("Couldn't update link", { description: error.message }),
      },
    );
  }

  return (
    <div
      className={cn(
        "bg-card hover:bg-muted/20 flex items-center gap-4 rounded-xl border p-4 transition-colors sm:p-5",
        link.status !== "active" && "opacity-75",
      )}
    >
      <div className="bg-muted flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
        {link.faviconUrl && !faviconFailed ? (
          <img
            src={link.faviconUrl}
            alt=""
            className="size-5"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setFaviconFailed(true)}
          />
        ) : (
          <Link2 className="text-muted-foreground size-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium">
            {link.title || shortPath}
          </p>

          {badge && (
            <span
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                badge.className,
              )}
            >
              {badge.label}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={copyShortUrl}
          className="text-primary mt-1 block max-w-full truncate text-sm hover:underline"
        >
          {shortPath}
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

        <DropdownMenuContent align="end" className="w-48">
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

          <DropdownMenuItem onClick={() => setQrOpen(true)}>
            <QrCode className="size-4" />
            QR code
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>

          <DropdownMenuItem onClick={toggleActive}>
            {link.isActive ? (
              <>
                <PowerOff className="size-4" />
                Disable
              </>
            ) : (
              <>
                <Power className="size-4" />
                Enable
              </>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <QrCodeDialog link={link} open={qrOpen} onOpenChange={setQrOpen} />

      <EditLinkDialog link={link} open={editOpen} onOpenChange={setEditOpen} />

      <DeleteLinkDialog
        link={link}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
