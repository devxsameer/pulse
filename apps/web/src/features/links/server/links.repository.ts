import { and, desc, eq } from "drizzle-orm";

import { db } from "#/db";
import { links } from "#/db/schema";

export type CreateLinkRecord = typeof links.$inferInsert;

export async function insertLink(input: CreateLinkRecord) {
  const [createdLink] = await db.insert(links).values(input).returning();

  if (!createdLink) {
    throw new Error("Failed to create link");
  }

  return createdLink;
}

export async function findLinkByShortCode(shortCode: string) {
  const [foundLink] = await db
    .select()
    .from(links)
    .where(eq(links.shortCode, shortCode))
    .limit(1);

  return foundLink ?? null;
}

export async function findLinksByUserId(userId: string) {
  return db
    .select()
    .from(links)
    .where(eq(links.userId, userId))
    .orderBy(desc(links.createdAt));
}

export async function findUserLinkById(linkId: string, userId: string) {
  const [foundLink] = await db
    .select()
    .from(links)
    .where(and(eq(links.id, linkId), eq(links.userId, userId)))
    .limit(1);

  return foundLink ?? null;
}
