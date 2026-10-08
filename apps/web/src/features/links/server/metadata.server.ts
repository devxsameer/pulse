import { EMPTY_METADATA, parseHtmlMetadata } from "../lib/html-metadata";
import type { LinkMetadata } from "../lib/html-metadata";
import { isFetchableUrl } from "../lib/url-safety";

const TIMEOUT_MS = 3_000;
const MAX_REDIRECTS = 3;
const MAX_BYTES = 512 * 1024;
const USER_AGENT = "PulseBot/1.0 (+https://github.com/devxsameer/pulse)";

function decoderFor(contentType: string) {
  const charset = /charset=["']?([\w-]+)/i.exec(contentType)?.[1];

  try {
    return new TextDecoder(charset ?? "utf-8");
  } catch {
    return new TextDecoder("utf-8");
  }
}

async function readCapped(response: Response, decoder: TextDecoder) {
  if (!response.body) return "";

  const reader = response.body.getReader();
  let html = "";
  let bytes = 0;

  try {
    while (bytes < MAX_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = value.subarray(0, MAX_BYTES - bytes);
      bytes += chunk.byteLength;
      html += decoder.decode(chunk, { stream: true });

      // Everything we parse lives in <head>.
      if (/<\/head\s*>|<body[\s>]/i.test(html)) break;
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  return html + decoder.decode();
}

/**
 * Fetches preview metadata for a user-supplied URL. Every hop is SSRF-checked, the whole
 * fetch is time- and size-bounded, and any failure yields empty metadata instead of an error.
 */
export async function fetchLinkMetadata(
  rawUrl: string,
  options: { blockedHosts: Array<string> },
): Promise<LinkMetadata> {
  const signal = AbortSignal.timeout(TIMEOUT_MS);

  try {
    let url = new URL(rawUrl);

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!isFetchableUrl(url, options.blockedHosts)) return EMPTY_METADATA;

      const response = await fetch(url, {
        redirect: "manual",
        signal,
        headers: {
          "User-Agent": USER_AGENT,
          Accept: "text/html,application/xhtml+xml;q=0.9",
        },
      });

      const location = response.headers.get("Location");

      if (response.status >= 300 && response.status < 400 && location) {
        await response.body?.cancel();
        url = new URL(location, url);
        continue;
      }

      const contentType = response.headers.get("Content-Type") ?? "";

      if (!response.ok || !/text\/html|application\/xhtml/i.test(contentType)) {
        await response.body?.cancel();
        return EMPTY_METADATA;
      }

      const html = await readCapped(response, decoderFor(contentType));

      return parseHtmlMetadata(html, url);
    }
  } catch {
    // Invalid URL, network error, or timeout: prefill is best-effort.
  }

  return EMPTY_METADATA;
}
