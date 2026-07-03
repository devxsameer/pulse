import { Link2 } from "lucide-react";

import { useLinks } from "../client/links.hooks";

import { CreateLinkDialog } from "../components/create-link-dialog";
import { EmptyLinks } from "../components/empty-links";
import { LinkCard } from "../components/link-card";

export function LinksPage() {
  const { data: links } = useLinks();

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Links
          </h1>

          <p className="text-muted-foreground mt-1.5 text-sm sm:text-base">
            Create, manage, and understand your short links.
          </p>
        </div>

        <CreateLinkDialog />
      </section>

      {links.length === 0 ? (
        <EmptyLinks />
      ) : (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Link2 className="text-muted-foreground size-4" />

            <p className="text-muted-foreground text-sm">
              {links.length} {links.length === 1 ? "link" : "links"}
            </p>
          </div>

          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
