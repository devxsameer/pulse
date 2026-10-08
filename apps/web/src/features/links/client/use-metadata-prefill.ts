import { useCallback, useRef, useState } from "react";

import type { LinkMetadata } from "../lib/html-metadata";
import { fetchMetadataFn } from "../server/links.functions";

export function getUrlOrigin(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

// Fetches metadata for a pasted URL. Only the latest request wins, and failures are silent.
export function useMetadataPrefill(
  onMetadata: (url: string, metadata: LinkMetadata) => void,
) {
  const [isFetching, setIsFetching] = useState(false);
  const latestRequest = useRef(0);

  const prefill = useCallback(
    async (url: string) => {
      if (!/^https?:\/\//i.test(url) || !getUrlOrigin(url)) return;

      const request = ++latestRequest.current;
      setIsFetching(true);

      try {
        const metadata = await fetchMetadataFn({ data: { url } });
        if (request === latestRequest.current) onMetadata(url, metadata);
      } catch {
        // Prefill is a convenience; the user can always fill the fields in.
      } finally {
        if (request === latestRequest.current) setIsFetching(false);
      }
    },
    [onMetadata],
  );

  return { prefill, isFetching };
}
