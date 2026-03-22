import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";

const reportSchema = z.object({
  imageId: z.string().uuid(),
  reason: z.enum([
    "copyright",
    "illegal_content",
    "spam",
    "harassment",
    "misleading",
    "other",
  ]),
  description: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [report] = await db
    .insert(reports)
    .values({
      imageId: parsed.data.imageId,
      reporterId: session.user.id,
      reason: parsed.data.reason,
      description: parsed.data.description || null,
    })
    .returning({ id: reports.id });

  return NextResponse.json({ reportId: report.id });
}
