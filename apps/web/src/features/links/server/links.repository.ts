import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm";

import { getDb } from "#/db";
import { links } from "#/db/schema";

import type { LinkCursor } from "../lib/cursor";

export type LinkRecord = typeof links.$inferSelect;
export type CreateLinkRecord = typeof links.$inferInsert;
export type UpdateLinkRecord = Partial<
  Pick<
    CreateLinkRecord,
    | "destinationUrl"
    | "title"
    | "description"
    | "faviconUrl"
    | "imageUrl"
    | "expiresAt"
    | "isActive"
  >
>;

const isLive = isNull(links.deletedAt);

function inWorkspace(linkId: string, workspaceId: string) {
  return and(eq(links.id, linkId), eq(links.workspaceId, workspaceId), isLive);
}

function escapeLikePattern(value: string) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

export async function insertLink(input: CreateLinkRecord) {
  const [createdLink] = await getDb().insert(links).values(input).returning();

  if (!createdLink) {
    throw new Error("Failed to create link");
  }

  return createdLink;
}

// Includes deleted links: callers decide how to treat them (D2 keeps codes reserved).
export async function findLinkByShortCode(shortCode: string) {
  const [foundLink] = await getDb()
    .select()
    .from(links)
    .where(eq(sql`lower(${links.shortCode})`, shortCode.toLowerCase()))
    .limit(1);

  return foundLink ?? null;
}

export async function listWorkspaceLinks(options: {
  workspaceId: string;
  query?: string;
  cursor?: LinkCursor | null;
  limit: number;
}) {
  const { workspaceId, query, cursor, limit } = options;

  const pattern = query ? `%${escapeLikePattern(query)}%` : null;

  return getDb()
    .select()
    .from(links)
    .where(
      and(
        eq(links.workspaceId, workspaceId),
        isLive,
        pattern
          ? or(
              ilike(links.shortCode, pattern),
              ilike(links.title, pattern),
              ilike(links.destinationUrl, pattern),
            )
          : undefined,
        cursor
          ? sql`(${links.createdAt}, ${links.id}) < (${cursor.createdAt.toISOString()}::timestamptz, ${cursor.id}::uuid)`
          : undefined,
      ),
    )
    .orderBy(desc(links.createdAt), desc(links.id))
    .limit(limit);
}

export async function findWorkspaceLink(linkId: string, workspaceId: string) {
  const [foundLink] = await getDb()
    .select()
    .from(links)
    .where(inWorkspace(linkId, workspaceId))
    .limit(1);

  return foundLink ?? null;
}

export async function updateWorkspaceLink(
  linkId: string,
  workspaceId: string,
  patch: UpdateLinkRecord,
) {
  const [updatedLink] = await getDb()
    .update(links)
    .set(patch)
    .where(inWorkspace(linkId, workspaceId))
    .returning();

  return updatedLink ?? null;
}

export async function softDeleteWorkspaceLink(
  linkId: string,
  workspaceId: string,
) {
  const [deletedLink] = await getDb()
    .update(links)
    .set({ deletedAt: new Date() })
    .where(inWorkspace(linkId, workspaceId))
    .returning({ id: links.id });

  return deletedLink ?? null;
}
