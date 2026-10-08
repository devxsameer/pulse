import type { CreateLinkInput } from "../schemas/create-link.schema";
import type {
  ListLinksInput,
  SetLinkActiveInput,
  UpdateLinkInput,
} from "../schemas/manage-link.schema";
import type { WorkspaceContext } from "#/features/auth/server/auth.server";

import { decodeCursor, encodeCursor } from "../lib/cursor";
import {
  InvalidLinkError,
  LinkConflictError,
  LinkNotFoundError,
  isUniqueViolation,
} from "../lib/errors";
import { getLinkStatus } from "../lib/link-status";
import {
  normalizeDestinationUrl,
  normalizeExpiration,
  normalizeOptionalText,
} from "../lib/normalize";
import { generateShortCode, validateCustomShortCode } from "../lib/short-code";
import type { UnavailableReason } from "../lib/status-pages";
import { LINKS_PAGE_SIZE } from "../schemas/manage-link.schema";

import type { LinkRecord } from "./links.repository";
import {
  findLinkByShortCode,
  findWorkspaceLink,
  insertLink,
  listWorkspaceLinks,
  softDeleteWorkspaceLink,
  updateWorkspaceLink,
} from "./links.repository";

const MAX_GENERATION_ATTEMPTS = 5;

export function toLinkView(link: LinkRecord) {
  return {
    id: link.id,
    shortCode: link.shortCode,
    destinationUrl: link.destinationUrl,
    title: link.title,
    description: link.description,
    faviconUrl: link.faviconUrl,
    imageUrl: link.imageUrl,
    isActive: link.isActive,
    expiresAt: link.expiresAt,
    createdAt: link.createdAt,
    updatedAt: link.updatedAt,
    status: getLinkStatus(link),
  };
}

export type LinkView = ReturnType<typeof toLinkView>;

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
    faviconUrl: normalizeOptionalText(input.faviconUrl),
    imageUrl: normalizeOptionalText(input.imageUrl),
    expiresAt: normalizeExpiration(input.expiresAt),
  };

  const customShortCode = input.shortCode.trim();

  if (customShortCode) {
    if (!validateCustomShortCode(customShortCode).ok) {
      throw new InvalidLinkError("Invalid short code");
    }

    try {
      return toLinkView(
        await insertLink({ ...record, shortCode: customShortCode }),
      );
    } catch (error) {
      if (isUniqueViolation(error)) throw new LinkConflictError();
      throw error;
    }
  }

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      return toLinkView(
        await insertLink({ ...record, shortCode: generateShortCode() }),
      );
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }

  throw new Error("Unable to generate a unique short code");
}

export async function listLinks(ctx: WorkspaceContext, input: ListLinksInput) {
  const limit = input.limit ?? LINKS_PAGE_SIZE;

  // Fetch one extra row to know whether another page exists.
  const rows = await listWorkspaceLinks({
    workspaceId: ctx.workspaceId,
    query: input.q || undefined,
    cursor: input.cursor ? decodeCursor(input.cursor) : null,
    limit: limit + 1,
  });

  const page = rows.slice(0, limit);
  const last = page.at(-1);

  return {
    items: page.map(toLinkView),
    nextCursor:
      rows.length > limit && last
        ? encodeCursor({ createdAt: last.createdAt, id: last.id })
        : null,
  };
}

export async function updateLink(
  ctx: WorkspaceContext,
  input: UpdateLinkInput,
) {
  const existing = await findWorkspaceLink(input.id, ctx.workspaceId);

  if (!existing) throw new LinkNotFoundError();

  const updated = await updateWorkspaceLink(input.id, ctx.workspaceId, {
    destinationUrl: normalizeDestinationUrl(input.destinationUrl),
    title: normalizeOptionalText(input.title),
    description: normalizeOptionalText(input.description),
    faviconUrl: normalizeOptionalText(input.faviconUrl),
    imageUrl: normalizeOptionalText(input.imageUrl),
    expiresAt: resolveExpirationUpdate(input.expiresAt, existing.expiresAt),
  });

  if (!updated) throw new LinkNotFoundError();

  return toLinkView(updated);
}

// An unchanged (possibly already past) expiration must not fail validation on unrelated edits.
function resolveExpirationUpdate(value: string, current: Date | null) {
  if (value && current && new Date(value).getTime() === current.getTime()) {
    return current;
  }

  return normalizeExpiration(value);
}

export async function setLinkActive(
  ctx: WorkspaceContext,
  input: SetLinkActiveInput,
) {
  const updated = await updateWorkspaceLink(input.id, ctx.workspaceId, {
    isActive: input.isActive,
  });

  if (!updated) throw new LinkNotFoundError();

  return toLinkView(updated);
}

export async function deleteLink(ctx: WorkspaceContext, linkId: string) {
  const deleted = await softDeleteWorkspaceLink(linkId, ctx.workspaceId);

  if (!deleted) throw new LinkNotFoundError();

  return deleted;
}

export type ResolvedLink =
  | { kind: "redirect"; destinationUrl: string }
  | { kind: "unavailable"; reason: UnavailableReason };

export async function resolveLink(shortCode: string): Promise<ResolvedLink> {
  const link = await findLinkByShortCode(shortCode);

  if (!link || link.deletedAt) {
    return { kind: "unavailable", reason: "not_found" };
  }

  const status = getLinkStatus(link);

  if (status !== "active") {
    return { kind: "unavailable", reason: status };
  }

  return { kind: "redirect", destinationUrl: link.destinationUrl };
}
