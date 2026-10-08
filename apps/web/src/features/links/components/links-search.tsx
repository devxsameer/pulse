import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "#/components/ui/input";

const DEBOUNCE_MS = 300;

type LinksSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function LinksSearch({ value, onChange }: LinksSearchProps) {
  const [draft, setDraft] = useState(value);

  // Follow URL changes made elsewhere, e.g. browser back/forward.
  useEffect(() => {
    setDraft((current) => (current.trim() === value ? current : value));
  }, [value]);

  useEffect(() => {
    const next = draft.trim();
    if (next === value) return;

    const timeout = setTimeout(() => onChange(next), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [draft, value, onChange]);

  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />

      <Input
        type="search"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder="Search by code, title, or URL"
        aria-label="Search links"
        className="pl-9"
      />
    </div>
  );
}
