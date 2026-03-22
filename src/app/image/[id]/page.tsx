import type { Metadata } from "next";
import { ImageDetail } from "@/components/images/image-detail";
import { getImageById } from "@/lib/db/queries/images";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const image = await getImageById(id);

  if (!image) {
    return { title: "Image not found" };
  }

  const title = image.title;
  const description = image.description || `AI-generated image by ${image.userName || "Anonymous"}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: image.originalUrl.startsWith("http")
        ? [
            {
              url: image.thumbnailUrl,
              width: image.width,
              height: image.height,
              alt: image.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image.originalUrl.startsWith("http") ? [image.thumbnailUrl] : undefined,
    },
  };
}

export default async function ImagePage({ params }: Props) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <ImageDetail imageId={id} />
    </div>
  );
}
