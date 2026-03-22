"use client";

import { useEffect, useRef, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface InfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
}

export function InfiniteScroll({ hasMore, isLoading, onLoadMore }: InfiniteScrollProps) {
  const observerRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  const handleIntersect = useCallback((entries: IntersectionObserverEntry[]) => {
    if (entries[0].isIntersecting) {
      onLoadMoreRef.current();
    }
  }, []);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: "400px",
      threshold: 0,
    });

    const current = observerRef.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, isLoading, handleIntersect]);

  if (!hasMore && !isLoading) return null;

  return (
    <div ref={observerRef} className="flex justify-center py-8">
      {isLoading && <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />}
    </div>
  );
}
