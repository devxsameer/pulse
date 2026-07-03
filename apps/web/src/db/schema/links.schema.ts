import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const links = pgTable(
  "links",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: text("user_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    shortCode: text("short_code").notNull(),

    destinationUrl: text("destination_url").notNull(),

    title: text("title"),

    description: text("description"),

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
  },
  (table) => [
    uniqueIndex("links_short_code_unique_idx").on(table.shortCode),

    index("links_user_id_idx").on(table.userId),

    index("links_user_created_at_idx").on(table.userId, table.createdAt),

    index("links_user_active_idx").on(table.userId, table.isActive),
  ],
);
