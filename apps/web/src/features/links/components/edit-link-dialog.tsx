import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

import type { LinkItem } from "../client/links.types";

import { LinkForm } from "./link-form";

type EditLinkDialogProps = {
  link: LinkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function EditLinkDialog({
  link,
  open,
  onOpenChange,
}: EditLinkDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit link</DialogTitle>

          <DialogDescription>
            Update where /r/{link.shortCode} points and how it appears.
          </DialogDescription>
        </DialogHeader>

        {/* Remount on open so the form always starts from the latest saved values. */}
        {open && <LinkForm link={link} onDone={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}
