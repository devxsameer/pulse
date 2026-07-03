import { relations } from "drizzle-orm";

import { account, session, user } from "./auth.schema";

import { links } from "./links.schema";

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  links: many(links),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const linkRelations = relations(links, ({ one }) => ({
  user: one(user, {
    fields: [links.userId],
    references: [user.id],
  }),
}));
