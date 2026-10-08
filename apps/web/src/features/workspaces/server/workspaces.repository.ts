import { asc, eq } from "drizzle-orm";

import { getDb } from "#/db";
import { member, organization, user } from "#/db/schema";

export async function findDefaultWorkspaceId(userId: string) {
  const [membership] = await getDb()
    .select({ workspaceId: member.organizationId })
    .from(member)
    .where(eq(member.userId, userId))
    .orderBy(asc(member.createdAt))
    .limit(1);

  return membership?.workspaceId ?? null;
}

// Idempotent: safe to call concurrently for the same user.
export async function ensurePersonalWorkspace(userId: string) {
  const db = getDb();
  const slug = `personal-${userId.toLowerCase()}`;

  const [owner] = await db
    .select({ name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  await db
    .insert(organization)
    .values({
      id: crypto.randomUUID(),
      name: owner?.name ? `${owner.name}'s workspace` : "Personal workspace",
      slug,
    })
    .onConflictDoNothing({ target: organization.slug });

  const [workspace] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);

  if (!workspace) {
    throw new Error("Failed to create personal workspace");
  }

  await db
    .insert(member)
    .values({
      id: crypto.randomUUID(),
      organizationId: workspace.id,
      userId,
      role: "owner",
    })
    .onConflictDoNothing({
      target: [member.organizationId, member.userId],
    });

  return workspace.id;
}

export async function resolveWorkspaceId(userId: string) {
  return (
    (await findDefaultWorkspaceId(userId)) ??
    (await ensurePersonalWorkspace(userId))
  );
}
