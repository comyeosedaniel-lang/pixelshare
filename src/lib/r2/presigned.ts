import { supabase, STORAGE_BUCKET, STORAGE_PUBLIC_URL } from "./client";

export async function getUploadPresignedUrl(
  key: string,
  _contentType: string,
  _contentLength: number
) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUploadUrl(key);

  if (error || !data) throw new Error(`Failed to create upload URL: ${error?.message}`);

  return data.signedUrl;
}

export async function getDownloadPresignedUrl(key: string) {
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(key, 60); // 1 min expiry

  if (error || !data) throw new Error(`Failed to create download URL: ${error?.message}`);

  return data.signedUrl;
}

export function getPublicUrl(key: string) {
  return `${STORAGE_PUBLIC_URL}/${key}`;
}
