import React, { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Generate srcset for responsive images
  const generateSrcSet = (originalSrc: string) => {
    const widths = [400, 800, 1200, 1600];
    return widths
      .map(w => `${originalSrc}?w=${w}&q=80 ${w}w`)
      .join(', ');
  };

  // Convert to WebP if possible
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');

  return (
    <picture className={className}>
      {/* WebP source for modern browsers */}
      <source
        srcSet={generateSrcSet(webpSrc)}
        sizes={sizes}
        type="image/webp"
      />
      {/* Fallback for older browsers */}
      <source
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        type="image/jpeg"
      />
      <img
        src={src}
        srcSet={generateSrcSet(src)}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
        style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
      />
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </picture>
  );
};

export default OptimizedImage;

