"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScroll({ hasMore, isLoading, onLoadMore }: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, isLoading, onLoadMore]);

  return (
    <div ref={observerRef} className="flex justify-center py-8">
      {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
    </div>
  );
}
