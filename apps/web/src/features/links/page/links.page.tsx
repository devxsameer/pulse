import { getRouteApi } from "@tanstack/react-router";
import { Link2, Loader2, SearchX } from "lucide-react";
import { useCallback, useDeferredValue } from "react";

import { Button } from "#/components/ui/button";

import { useLinks } from "../client/links.hooks";

import { CreateLinkDialog } from "../components/create-link-dialog";
import { EmptyLinks } from "../components/empty-links";
import { LinkCard } from "../components/link-card";
import { LinksSearch } from "../components/links-search";

const route = getRouteApi("/_app/links");

export function LinksPage() {
  const { q = "" } = route.useSearch();
  const navigate = route.useNavigate();

  // Keep showing the current results while a new search suspends.
  const deferredQ = useDeferredValue(q);

  const { links, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useLinks(deferredQ);

  const setQuery = useCallback(
    (value: string) =>
      navigate({ search: { q: value || undefined }, replace: true }),
    [navigate],
  );

  const isSearching = deferredQ !== "";

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

      {links.length === 0 && !isSearching ? (
        <EmptyLinks />
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Link2 className="text-muted-foreground size-4" />

              <p className="text-muted-foreground text-sm">
                {links.length}
                {hasNextPage && "+"} {links.length === 1 ? "link" : "links"}
                {isSearching && " found"}
              </p>
            </div>

            <LinksSearch value={q} onChange={setQuery} />
          </div>

          {links.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed px-6 text-center">
              <SearchX className="text-muted-foreground size-5" />

              <p className="mt-4 text-sm font-medium">
                No links match &ldquo;{deferredQ}&rdquo;
              </p>

              <Button
                variant="link"
                className="mt-1"
                onClick={() => setQuery("")}
              >
                Clear search
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} />
              ))}
            </div>
          )}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
              >
                {isFetchingNextPage && (
                  <Loader2 className="size-4 animate-spin" />
                )}
                Load more
              </Button>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
