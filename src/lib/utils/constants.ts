export const APP_NAME = "Pixelshare";
export const APP_DESCRIPTION = "Free AI-generated image sharing platform. Upload, share, and discover amazing AI creations with the world.";

export const CATEGORIES = [
  { value: "character", label: "Character" },
  { value: "landscape", label: "Landscape" },
  { value: "abstract", label: "Abstract" },
  { value: "architecture", label: "Architecture" },
  { value: "portrait", label: "Portrait" },
  { value: "sci_fi", label: "Sci-Fi" },
  { value: "fantasy", label: "Fantasy" },
  { value: "nature", label: "Nature" },
  { value: "concept_art", label: "Concept Art" },
  { value: "illustration", label: "Illustration" },
  { value: "photo_realistic", label: "Photo Realistic" },
  { value: "other", label: "Other" },
] as const;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"] as const;

export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const THUMBNAIL_WIDTH = 400;
export const THUMBNAIL_QUALITY = 80;

export const IMAGES_PER_PAGE = 30;
