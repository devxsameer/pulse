import { z } from "zod";

const shortCodeSchema = z
  .string()
  .trim()
  .min(3, "Short code must be at least 3 characters")
  .max(64, "Short code must be at most 64 characters")
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only letters, numbers, hyphens, and underscores are allowed",
  );

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
    .max(64, "Short code must be at most 64 characters")
    .refine(
      (value) => value.length === 0 || shortCodeSchema.safeParse(value).success,
      {
        message: "Use at least 3 letters, numbers, hyphens, or underscores",
      },
    ),

  title: z
    .string()
    .trim()
    .max(120, "Title must be at most 120 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),

  expiresAt: z.date().optional(),
});

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
