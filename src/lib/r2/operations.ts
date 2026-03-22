import { supabase, STORAGE_BUCKET } from "./client";

export async function uploadToStorage(
  key: string,
  body: Buffer,
  contentType: string
) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(key, body, {
      contentType,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);
}

export async function getFromStorage(key: string): Promise<Buffer> {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(key);

  if (error || !data) throw new Error(`Download failed: ${error?.message}`);

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function deleteFromStorage(key: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([key]);

  if (error) throw new Error(`Delete failed: ${error.message}`);
}
