import { and, desc, eq, sql } from "drizzle-orm";

import { getDb } from "#/db";
import { links } from "#/db/schema";

export type CreateLinkRecord = typeof links.$inferInsert;

export async function insertLink(input: CreateLinkRecord) {
  const [createdLink] = await getDb().insert(links).values(input).returning();

  if (!createdLink) {
    throw new Error("Failed to create link");
  }

  return createdLink;
}

export async function findLinkByShortCode(shortCode: string) {
  const [foundLink] = await getDb()
    .select()
    .from(links)
    .where(eq(sql`lower(${links.shortCode})`, shortCode.toLowerCase()))
    .limit(1);

  return foundLink ?? null;
}

export async function findLinksByWorkspaceId(workspaceId: string) {
  return getDb()
    .select()
    .from(links)
    .where(eq(links.workspaceId, workspaceId))
    .orderBy(desc(links.createdAt));
}

export async function findWorkspaceLinkById(
  linkId: string,
  workspaceId: string,
) {
  const [foundLink] = await getDb()
    .select()
    .from(links)
    .where(and(eq(links.id, linkId), eq(links.workspaceId, workspaceId)))
    .limit(1);

  return foundLink ?? null;
}
