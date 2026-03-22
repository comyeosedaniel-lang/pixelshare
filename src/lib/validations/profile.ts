import { z } from "zod";

const optionalUrl = z
  .string()
  .url("Please enter a valid URL (e.g. https://...)")
  .max(500)
  .or(z.literal(""))
  .optional();

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  bio: z.string().max(500).or(z.literal("")).optional(),
  youtubeUrl: optionalUrl,
  twitterUrl: optionalUrl,
  instagramUrl: optionalUrl,
  websiteUrl: optionalUrl,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
