import { toast } from "sonner";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";

import { useDeleteLink } from "../client/links.mutations";
import type { LinkItem } from "../client/links.types";

type DeleteLinkDialogProps = {
  link: LinkItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function DeleteLinkDialog({
  link,
  open,
  onOpenChange,
}: DeleteLinkDialogProps) {
  const deleteLink = useDeleteLink();

  function confirmDelete() {
    onOpenChange(false);

    deleteLink.mutate(link.id, {
      onSuccess: () => toast.success("Link deleted"),
      onError: (error) =>
        toast.error("Couldn't delete link", { description: error.message }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete this link?</DialogTitle>

          <DialogDescription>
            Visitors to /r/{link.shortCode} will see &ldquo;Link not
            found&rdquo;. The short code stays reserved, and this can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>

          <Button variant="destructive" onClick={confirmDelete}>
            Delete link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
