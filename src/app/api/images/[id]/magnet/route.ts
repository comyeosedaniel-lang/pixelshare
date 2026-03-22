import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { images } from "@/lib/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { magnetUri } = await request.json();

  if (!magnetUri || typeof magnetUri !== "string") {
    return NextResponse.json({ error: "Invalid magnetUri" }, { status: 400 });
  }

  // Only the uploader can set the magnet URI
  const image = await db.query.images.findFirst({
    where: eq(images.id, id),
    columns: { userId: true, magnetUri: true },
  });

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  if (image.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update magnet URI
  await db
    .update(images)
    .set({ magnetUri })
    .where(eq(images.id, id));

  return NextResponse.json({ ok: true });
}
