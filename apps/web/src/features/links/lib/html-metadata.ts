export type LinkMetadata = {
  title: string | null;
  description: string | null;
  faviconUrl: string | null;
  imageUrl: string | null;
};

export const EMPTY_METADATA: LinkMetadata = {
  title: null,
  description: null,
  faviconUrl: null,
  imageUrl: null,
};

export const METADATA_TITLE_MAX_LENGTH = 120;
export const METADATA_DESCRIPTION_MAX_LENGTH = 500;
export const ASSET_URL_MAX_LENGTH = 2048;

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
};

function decodeEntities(value: string) {
  return value.replace(
    /&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,
    (entity, code: string) => {
      if (code.startsWith("#")) {
        const point =
          code[1]?.toLowerCase() === "x"
            ? Number.parseInt(code.slice(2), 16)
            : Number.parseInt(code.slice(1), 10);

        return point > 0 && point <= 0x10ffff
          ? String.fromCodePoint(point)
          : entity;
      }

      return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
    },
  );
}

function cleanText(value: string | undefined, maxLength: number) {
  if (!value) return null;

  const text = decodeEntities(value).replace(/\s+/g, " ").trim();
  if (!text) return null;

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 1).trimEnd()}…`
    : text;
}

// Only https assets are kept: the client renders them, and mixed content would be blocked anyway.
export function toHttpsAssetUrl(value: string | undefined, baseUrl: URL) {
  if (!value) return null;

  try {
    const url = new URL(decodeEntities(value.trim()), baseUrl);

    return url.protocol === "https:" && url.href.length <= ASSET_URL_MAX_LENGTH
      ? url.href
      : null;
  } catch {
    return null;
  }
}

const ATTRIBUTE_PATTERN =
  /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function parseAttributes(tag: string) {
  const attributes = new Map<string, string>();
  const body = tag.replace(/^<\w+/, "").replace(/\/?>$/, "");

  for (const match of body.matchAll(ATTRIBUTE_PATTERN)) {
    const name = match[1]?.toLowerCase();
    if (!name || attributes.has(name)) continue;

    attributes.set(name, match[2] ?? match[3] ?? match[4] ?? "");
  }

  return attributes;
}

// Pulls preview metadata from the document head. A deliberately small parser: the input is
// already size-capped, and a wrong guess only means a worse prefill the user can edit.
export function parseHtmlMetadata(html: string, pageUrl: URL): LinkMetadata {
  const headEnd = html.search(/<\/head\s*>|<body[\s>]/i);
  const head = (headEnd === -1 ? html : html.slice(0, headEnd))
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1\s*>/gi, "");

  let baseUrl = pageUrl;
  const baseHref = /<base\b[^>]*>/i.exec(head);
  if (baseHref) {
    const href = parseAttributes(baseHref[0]).get("href");
    try {
      if (href) baseUrl = new URL(href, pageUrl);
    } catch {
      // Ignore an invalid <base>.
    }
  }

  const meta = new Map<string, string>();
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(tag);
    const key = (attributes.get("property") ?? attributes.get("name"))
      ?.trim()
      .toLowerCase();
    const content = attributes.get("content");

    if (key && content && !meta.has(key)) meta.set(key, content);
  }

  let iconHref: string | undefined;
  for (const [tag] of head.matchAll(/<link\b[^>]*>/gi)) {
    const attributes = parseAttributes(tag);
    const rel = attributes.get("rel")?.toLowerCase().split(/\s+/) ?? [];

    if (rel.includes("icon") || rel.includes("apple-touch-icon")) {
      iconHref = attributes.get("href");
      // Prefer a plain icon over the larger apple-touch-icon.
      if (rel.includes("icon") && iconHref) break;
    }
  }

  const titleTag = /<title\b[^>]*>([\s\S]*?)<\/title\s*>/i.exec(head)?.[1];

  return {
    title:
      cleanText(meta.get("og:title"), METADATA_TITLE_MAX_LENGTH) ??
      cleanText(titleTag, METADATA_TITLE_MAX_LENGTH),
    description:
      cleanText(meta.get("og:description"), METADATA_DESCRIPTION_MAX_LENGTH) ??
      cleanText(meta.get("description"), METADATA_DESCRIPTION_MAX_LENGTH),
    imageUrl:
      toHttpsAssetUrl(meta.get("og:image"), baseUrl) ??
      toHttpsAssetUrl(meta.get("twitter:image"), baseUrl),
    faviconUrl:
      toHttpsAssetUrl(iconHref, baseUrl) ??
      toHttpsAssetUrl("/favicon.ico", pageUrl),
  };
}
