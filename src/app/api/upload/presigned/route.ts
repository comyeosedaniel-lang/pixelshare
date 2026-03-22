import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth/auth";
import { presignedUploadSchema } from "@/lib/validations/upload";
import { getUploadPresignedUrl } from "@/lib/r2/presigned";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = presignedUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { fileName, mimeType, fileSize } = parsed.data;
  const ext = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const key = `originals/${session.user.id}/${nanoid()}.${ext}`;

  const uploadUrl = await getUploadPresignedUrl(key, mimeType, fileSize);

  return NextResponse.json({ uploadUrl, key });
}
