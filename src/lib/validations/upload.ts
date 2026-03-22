import { z } from "zod";
import {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
} from "@/lib/utils/constants";

export const completeUploadSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(2000).optional(),
  tags: z.array(z.string().min(1).max(50)).max(20).default([]),
  category: z.string().default("other"),
  prompt: z.string().max(5000).optional(),

  // Cloudinary upload result
  cloudinaryPublicId: z.string().min(1),
  cloudinaryUrl: z.string().url(),
  fileName: z.string().min(1).max(500),
  mimeType: z.enum(ALLOWED_MIME_TYPES as unknown as [string, ...string[]]),
  fileSize: z.number().positive().max(MAX_FILE_SIZE_BYTES),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type CompleteUploadInput = z.infer<typeof completeUploadSchema>;
