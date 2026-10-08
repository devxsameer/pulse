import { z } from "zod";

import {
  CUSTOM_SHORT_CODE_MAX_LENGTH,
  CUSTOM_SHORT_CODE_MIN_LENGTH,
  validateCustomShortCode,
} from "../lib/short-code";
import { ASSET_URL_MAX_LENGTH } from "../lib/html-metadata";

const shortCodeMessages = {
  length: `Use ${CUSTOM_SHORT_CODE_MIN_LENGTH}–${CUSTOM_SHORT_CODE_MAX_LENGTH} characters`,
  format:
    "Start with a letter or number; use only letters, numbers, hyphens, and underscores",
  reserved: "This short code is reserved",
} as const;

const assetUrlSchema = z
  .string()
  .trim()
  .max(ASSET_URL_MAX_LENGTH)
  .refine((value) => value === "" || isHttpsUrl(value), {
    message: "Only HTTPS image URLs are allowed",
  });

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

// Every field is a string because that's what form inputs produce;
// the service normalizes empty strings to null.
export const createLinkSchema = z.object({
  destinationUrl: z.url("Enter a valid destination URL").refine(
    (url) => {
      const protocol = new URL(url).protocol;

      return protocol === "http:" || protocol === "https:";
    },
    {
      message: "Only HTTP and HTTPS URLs are allowed",
    },
  ),

  shortCode: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      if (value.length === 0) return;

      const result = validateCustomShortCode(value);

      if (!result.ok) {
        ctx.addIssue({
          code: "custom",
          message: shortCodeMessages[result.reason],
        });
      }
    }),

  title: z.string().trim().max(120, "Title must be at most 120 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters"),

  expiresAt: z.string(),

  // Prefilled from fetchMetadataFn; the server only stores them, never fetches them.
  faviconUrl: assetUrlSchema,
  imageUrl: assetUrlSchema,
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
