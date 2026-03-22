import type { Metadata } from "next";
import { ImageDetail } from "@/components/images/image-detail";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Image ${id.slice(0, 8)}` };
}

export default async function ImagePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ImageDetail imageId={id} />
    </div>
  );
}
