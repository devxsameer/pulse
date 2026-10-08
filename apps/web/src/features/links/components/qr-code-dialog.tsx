import { Download, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { cn } from "#/lib/utils";

import type { LinkItem } from "../client/links.types";

const QR_SIZES = [256, 512, 1024] as const;
type QrSize = (typeof QR_SIZES)[number];

// Black on white with a quiet zone scans most reliably on every reader.
const QR_OPTIONS = {
  margin: 2,
  errorCorrectionLevel: "M",
  color: { dark: "#000000", light: "#ffffff" },
} as const;

type QrCodeDialogProps = {
  link: LinkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function QrCodeDialog({ link, open, onOpenChange }: QrCodeDialogProps) {
  const [size, setSize] = useState<QrSize>(512);
  const [svg, setSvg] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const fileName = `pulse-${link.shortCode}`;

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    void import("qrcode")
      .then(({ toString }) =>
        toString(getShortUrl(link.shortCode), { ...QR_OPTIONS, type: "svg" }),
      )
      .then((markup) => {
        if (!cancelled) setSvg(markup);
      })
      .catch(() => {
        if (!cancelled) toast.error("Couldn't generate QR code");
      });

    return () => {
      cancelled = true;
    };
  }, [open, link.shortCode]);

  async function downloadPng() {
    setIsDownloading(true);

    try {
      const { toDataURL } = await import("qrcode");
      const dataUrl = await toDataURL(getShortUrl(link.shortCode), {
        ...QR_OPTIONS,
        width: size,
      });

      triggerDownload(dataUrl, `${fileName}.png`);
    } catch {
      toast.error("Couldn't download QR code");
    } finally {
      setIsDownloading(false);
    }
  }

  function downloadSvg() {
    if (!svg) return;

    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));

    triggerDownload(url, `${fileName}.svg`);
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>QR code</DialogTitle>

          <DialogDescription>Scans to /r/{link.shortCode}</DialogDescription>
        </DialogHeader>

        <div className="flex aspect-square items-center justify-center rounded-xl border bg-white p-4">
          {svg ? (
            <img
              src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`}
              alt={`QR code for /r/${link.shortCode}`}
              className="size-full"
            />
          ) : (
            <Loader2 className="size-5 animate-spin text-neutral-400" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground text-xs font-medium">PNG size</p>

          <div className="grid grid-cols-3 gap-2" role="radiogroup">
            {QR_SIZES.map((option) => (
              <Button
                key={option}
                type="button"
                size="sm"
                variant={option === size ? "default" : "outline"}
                role="radio"
                aria-checked={option === size}
                onClick={() => setSize(option)}
                className={cn(option === size && "pointer-events-none")}
              >
                {option}px
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter className="sm:justify-stretch">
          <Button
            variant="outline"
            className="flex-1"
            onClick={downloadSvg}
            disabled={!svg}
          >
            <Download className="size-4" />
            SVG
          </Button>

          <Button
            className="flex-1"
            onClick={downloadPng}
            disabled={!svg || isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            PNG
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function getShortUrl(shortCode: string) {
  return `${window.location.origin}/r/${shortCode}`;
}

function triggerDownload(href: string, fileName: string) {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
}
