import { Link2 } from "lucide-react";

import { CreateLinkDialog } from "./create-link-dialog";

export function EmptyLinks() {
  return (
    <div className="flex min-h-96 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
      <div className="bg-muted flex size-12 items-center justify-center rounded-xl">
        <Link2 className="text-muted-foreground size-5" />
      </div>

      <h2 className="mt-5 font-semibold">Create your first short link</h2>

      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-6">
        Shorten a destination URL and start understanding how people interact
        with your links.
      </p>

      <div className="mt-6">
        <CreateLinkDialog />
      </div>
    </div>
  );
}
