import { InvalidLinkError } from "./errors";

export function normalizeDestinationUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new InvalidLinkError("Invalid destination URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidLinkError("Only HTTP and HTTPS URLs are allowed");
  }

  return url.toString();
}

export function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

export function normalizeExpiration(value: string, now = new Date()) {
  if (!value) {
    return null;
  }

  const expiresAt = new Date(value);

  if (Number.isNaN(expiresAt.getTime())) {
    throw new InvalidLinkError("Invalid expiration date");
  }

  if (expiresAt <= now) {
    throw new InvalidLinkError("Expiration date must be in the future");
  }

  return expiresAt;
}
