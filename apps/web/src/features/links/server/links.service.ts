import type { CreateLinkInput } from "../schemas/create-link.schema";

import {
  findLinkByShortCode,
  findLinksByUserId,
  insertLink,
} from "./links.repository";

import { generateShortCode } from "./short-code";

const MAX_GENERATION_ATTEMPTS = 5;

export class LinkConflictError extends Error {
  constructor(message = "Short code is already in use") {
    super(message);
    this.name = "LinkConflictError";
  }
}

export class InvalidLinkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidLinkError";
  }
}

function normalizeDestinationUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidLinkError("Only HTTP and HTTPS URLs are allowed");
  }

  return url.toString();
}

function normalizeOptionalText(value: string) {
  const normalized = value.trim();

  return normalized.length > 0 ? normalized : null;
}

function normalizeExpiration(value: string) {
  if (!value) {
    return null;
  }

  const expiresAt = new Date(value);

  if (Number.isNaN(expiresAt.getTime())) {
    throw new InvalidLinkError("Invalid expiration date");
  }

  if (expiresAt <= new Date()) {
    throw new InvalidLinkError("Expiration date must be in the future");
  }

  return expiresAt;
}

export async function createLink(userId: string, input: CreateLinkInput) {
  const destinationUrl = normalizeDestinationUrl(input.destinationUrl);

  const title = normalizeOptionalText(input.title);

  const description = normalizeOptionalText(input.description);

  const expiresAt = normalizeExpiration(input.expiresAt);

  const requestedShortCode = input.shortCode.trim().toLowerCase();

  if (requestedShortCode) {
    const existingLink = await findLinkByShortCode(requestedShortCode);

    if (existingLink) {
      throw new LinkConflictError();
    }

    return insertLink({
      userId,
      shortCode: requestedShortCode,
      destinationUrl,
      title,
      description,
      expiresAt,
    });
  }

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    const shortCode = generateShortCode();

    const existingLink = await findLinkByShortCode(shortCode);

    if (existingLink) {
      continue;
    }

    return insertLink({
      userId,
      shortCode,
      destinationUrl,
      title,
      description,
      expiresAt,
    });
  }

  throw new Error("Unable to generate a unique short code");
}

export async function getUserLinks(userId: string) {
  return findLinksByUserId(userId);
}

export async function resolveLink(shortCode: string) {
  const link = await findLinkByShortCode(shortCode);

  if (!link) {
    return null;
  }

  if (!link.isActive) {
    return null;
  }

  if (link.expiresAt && link.expiresAt <= new Date()) {
    return null;
  }

  return link;
}
