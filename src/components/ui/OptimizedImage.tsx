import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageOff, Loader } from 'lucide-react';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: React.ReactNode;
  placeholder?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  className?: string;
  containerClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallback,
  placeholder,
  priority = false,
  onLoad,
  onError,
  className = '',
  containerClassName = '',
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [currentSrc, setCurrentSrc] = useState<string | null>(priority ? src : null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setCurrentSrc(src);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [src, priority]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  const defaultFallback = (
    <div className={`flex items-center justify-center bg-dark-lighter ${className}`}>
      <ImageOff className="w-8 h-8 text-gray-500" />
    </div>
  );

  if (hasError) {
    return fallback || defaultFallback;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-dark-lighter ${className}`}>
          {placeholder ? (
            <img src={placeholder} alt="" className={`w-full h-full object-cover filter blur-sm ${className}`} />
          ) : (
            <Loader className="w-6 h-6 text-accent animate-spin" />
          )}
        </div>
      )}

      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
    </div>
  );
}