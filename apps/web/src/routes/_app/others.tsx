import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/others")({
  component: LinksPage,
});

function LinksPage() {
  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-tight">Links</h1>

      <p className="text-muted-foreground mt-2">
        Create and manage your short links.
      </p>
    </div>
  );
}
