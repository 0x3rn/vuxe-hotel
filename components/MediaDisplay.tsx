import React from 'react';
import Image from 'next/image';

type MediaDisplayProps = {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
};

// Helper to check if URL is a video
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  try {
    // 1. Direct extension check
    if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) return true;
    
    // 2. Firebase Storage specific check (the path before ?alt=media)
    const urlObj = new URL(url);
    const pathname = decodeURIComponent(urlObj.pathname);
    if (pathname.match(/\.(mp4|webm|ogg|mov)$/i)) return true;

    return false;
  } catch (e) {
    // Basic fallback string check
    return !!url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i);
  }
}

export default function MediaDisplay({ 
  src, 
  alt = "Media", 
  className = "", 
  fill = false, 
  priority = false, 
  sizes,
  width,
  height
}: MediaDisplayProps) {
  if (!src) return null;

  const isVideo = isVideoUrl(src);

  if (isVideo) {
    return (
      <video
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={`pointer-events-none object-cover ${className} ${fill ? 'absolute inset-0 w-full h-full' : ''}`}
      />
    );
  }

  // Next/Image requires width/height if fill is false
  if (!fill && !width && !height) {
    // Fallback if they didn't provide dimensions but fill is false
    // we just use an img tag to avoid Next.js error
    return (
      <img 
        src={src} 
        alt={alt} 
        className={`object-cover ${className}`} 
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className}`}
    />
  );
}
