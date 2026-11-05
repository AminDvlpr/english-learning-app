"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

// Zero-CLS Skeleton for the motion scenes
const SkeletonPlaceholder = () => (
  <div className="w-full aspect-video bg-muted/20 animate-pulse rounded-xl flex items-center justify-center border border-border">
    <div className="text-muted-foreground/50 text-sm font-medium flex flex-col items-center gap-2">
      <svg className="w-8 h-8 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Loading Interactive Engine...
    </div>
  </div>
);

// Lazy load the Rive scene with SSR disabled
const LazyRiveSceneController = dynamic(
  () => import("./RiveSceneController").then((mod) => mod.RiveSceneController),
  { ssr: false, loading: () => <SkeletonPlaceholder /> }
);

// Lazy load the Vector fallback scene with SSR disabled
const LazyCafeInteractiveVectorScene = dynamic(
  () => import("./CafeInteractiveVectorScene").then((mod) => mod.CafeInteractiveVectorScene),
  { ssr: false, loading: () => <SkeletonPlaceholder /> }
);

interface LazyMotionSceneProps {
  useRive?: boolean;
  className?: string;
  // Generic prop pass-through for the underlying scenes
  assetPath?: string;
  isCorrect?: boolean | null;
  difficultyLevel?: number;
  triggerName?: string | null;
  resetCounter?: number;
  currentTimeSec?: number;
  motionSceneId?: string;
}

export function LazyMotionScene({ useRive = true, className, ...props }: LazyMotionSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShouldLoad(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "200px" } // Trigger load 200px before the element comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("w-full relative", className)}>
      {shouldLoad ? (
        useRive ? (
          <LazyRiveSceneController
            assetPath={props.assetPath || ''}
            isCorrect={props.isCorrect ?? null}
            difficultyLevel={props.difficultyLevel ?? 1}
            triggerName={props.triggerName ?? null}
            resetCounter={props.resetCounter ?? 0}
            currentTimeSec={props.currentTimeSec ?? 0}
            motionSceneId={props.motionSceneId}
            {...props}
          />
        ) : (
          <LazyCafeInteractiveVectorScene
            currentTimeSec={props.currentTimeSec ?? 0}
            isCorrect={props.isCorrect ?? null}
            difficultyLevel={props.difficultyLevel ?? 1}
            triggerName={props.triggerName ?? null}
            resetCounter={props.resetCounter ?? 0}
            {...props}
          />
        )
      ) : (
        <SkeletonPlaceholder />
      )}
    </div>
  );
}
