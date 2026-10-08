import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "#/components/ui/dialog";

import { LinkForm } from "./link-form";

type CreateLinkDialogProps = {
  trigger?: React.ReactNode;
};

export function CreateLinkDialog({ trigger }: CreateLinkDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            Create link
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a short link</DialogTitle>

          <DialogDescription>
            Create a trackable short link for any destination.
          </DialogDescription>
        </DialogHeader>

        <LinkForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
