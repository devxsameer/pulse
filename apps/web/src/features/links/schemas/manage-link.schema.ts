import { z } from "zod";

import { createLinkSchema } from "./create-link.schema";

export const LINKS_PAGE_SIZE = 20;

export const listLinksSchema = z.object({
  q: z.string().trim().max(200).optional(),
  cursor: z.string().max(200).optional(),
  limit: z.number().int().min(1).max(50).optional(),
});

export type ListLinksInput = z.infer<typeof listLinksSchema>;

// Short codes are immutable after creation.
export const editLinkSchema = createLinkSchema.omit({ shortCode: true });

export type EditLinkInput = z.infer<typeof editLinkSchema>;

export const updateLinkSchema = editLinkSchema.extend({
  id: z.uuid(),
});

export type UpdateLinkInput = z.infer<typeof updateLinkSchema>;

export const setLinkActiveSchema = z.object({
  id: z.uuid(),
  isActive: z.boolean(),
});

export type SetLinkActiveInput = z.infer<typeof setLinkActiveSchema>;

export const linkIdSchema = z.object({
  id: z.uuid(),
});

export const fetchMetadataSchema = z.object({
  url: z.string().trim().max(2048),
});
