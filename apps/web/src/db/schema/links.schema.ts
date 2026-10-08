import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { organization, user } from "./auth.schema";

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    workspaceId: text("workspace_id")
      .notNull()
      .references(() => organization.id, {
        onDelete: "cascade",
      }),

    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),

    shortCode: text("short_code").notNull(),

    destinationUrl: text("destination_url").notNull(),

    title: text("title"),

    description: text("description"),

    faviconUrl: text("favicon_url"),

    imageUrl: text("image_url"),

    isActive: boolean("is_active").default(true).notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),

    // Soft delete: deleted links stop resolving but keep their short code reserved.
    deletedAt: timestamp("deleted_at", {
      withTimezone: true,
    }),
  },
  (table) => [
    // Codes keep the casing they were created with but resolve case-insensitively.
    // Covers deleted rows too, so a deleted code can't be re-registered.
    uniqueIndex("links_short_code_lower_unique_idx").on(
      sql`lower(${table.shortCode})`,
    ),

    // Default list order + cursor pagination over live links.
    index("links_workspace_live_created_idx")
      .on(table.workspaceId, table.createdAt.desc(), table.id.desc())
      .where(sql`${table.deletedAt} is null`),

    index("links_created_by_idx").on(table.createdBy),
  ],
);
