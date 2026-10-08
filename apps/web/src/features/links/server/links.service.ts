import type { CreateLinkInput } from "../schemas/create-link.schema";
import type { WorkspaceContext } from "#/features/auth/server/auth.server";

import {
  InvalidLinkError,
  LinkConflictError,
  isUniqueViolation,
} from "../lib/errors";
import {
  normalizeDestinationUrl,
  normalizeExpiration,
  normalizeOptionalText,
} from "../lib/normalize";
import { generateShortCode, validateCustomShortCode } from "../lib/short-code";

import {
  findLinkByShortCode,
  findLinksByWorkspaceId,
  insertLink,
} from "./links.repository";

const MAX_GENERATION_ATTEMPTS = 5;

export async function createLink(
  ctx: WorkspaceContext,
  input: CreateLinkInput,
) {
  const record = {
    workspaceId: ctx.workspaceId,
    createdBy: ctx.userId,
    destinationUrl: normalizeDestinationUrl(input.destinationUrl),
    title: normalizeOptionalText(input.title),
    description: normalizeOptionalText(input.description),
    expiresAt: normalizeExpiration(input.expiresAt),
  };

  const customShortCode = input.shortCode.trim();

  if (customShortCode) {
    if (!validateCustomShortCode(customShortCode).ok) {
      throw new InvalidLinkError("Invalid short code");
    }

    try {
      return await insertLink({ ...record, shortCode: customShortCode });
    } catch (error) {
      if (isUniqueViolation(error)) throw new LinkConflictError();
      throw error;
    }
  }

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      return await insertLink({ ...record, shortCode: generateShortCode() });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  throw new Error("Unable to generate a unique short code");
}

export async function getWorkspaceLinks(ctx: WorkspaceContext) {
  return findLinksByWorkspaceId(ctx.workspaceId);
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
