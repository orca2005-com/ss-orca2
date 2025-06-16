import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageOff, Loader } from 'lucide-react';
import { sanitizeText, isValidUrl } from '../../utils';

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

const DEFAULT_FALLBACK_IMAGE = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg';

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
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Enhanced sanitization and validation
  const sanitizedAlt = alt ? sanitizeText(alt) : '';

  // Validate and sanitize src
  const getValidSrc = useCallback((inputSrc: string): string | null => {
    if (!inputSrc || typeof inputSrc !== 'string') {
      return null;
    }

    const sanitized = sanitizeText(inputSrc);
    if (!sanitized) {
      return null;
    }

    // Check if it's a valid URL
    if (!isValidUrl(sanitized)) {
      console.warn('Invalid image URL:', sanitized);
      return null;
    }

    return sanitized;
  }, []);

  // Validate and sanitize placeholder
  const getValidPlaceholder = useCallback((inputPlaceholder?: string): string | null => {
    if (!inputPlaceholder || typeof inputPlaceholder !== 'string') {
      return null;
    }

    const sanitized = sanitizeText(inputPlaceholder);
    if (!sanitized || !isValidUrl(sanitized)) {
      return null;
    }

    return sanitized;
  }, []);

  const validSrc = getValidSrc(src);
  const validPlaceholder = getValidPlaceholder(placeholder);

  useEffect(() => {
    if (priority) {
      if (validSrc) {
        setCurrentSrc(validSrc);
      } else {
        setHasError(true);
        setIsLoading(false);
      }
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (validSrc) {
            setCurrentSrc(validSrc);
          } else {
            setHasError(true);
            setIsLoading(false);
          }
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [validSrc, priority]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    
    // Enhanced retry logic with exponential backoff
    if (retryCount < 2 && validSrc) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        // Try with default fallback if original fails
        if (retryCount === 1) {
          setCurrentSrc(DEFAULT_FALLBACK_IMAGE);
        } else {
          // Force reload by adding timestamp
          try {
            if (isValidUrl(validSrc)) {
              const url = new URL(validSrc);
              url.searchParams.set('retry', retryCount.toString());
              url.searchParams.set('t', Date.now().toString());
              setCurrentSrc(url.toString());
            } else {
              setCurrentSrc(DEFAULT_FALLBACK_IMAGE);
            }
          } catch {
            setCurrentSrc(DEFAULT_FALLBACK_IMAGE);
          }
        }
      }, retryDelay);
      return;
    }
    
    setHasError(true);
    onError?.();
  }, [onError, retryCount, validSrc]);

  const defaultFallback = (
    <div className={`flex items-center justify-center bg-dark-lighter ${className}`}>
      <ImageOff className="w-8 h-8 text-gray-500" />
    </div>
  );

  // If no valid source and no fallback, show error
  if (!validSrc && !fallback) {
    return defaultFallback;
  }

  if (hasError) {
    return fallback || defaultFallback;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-dark-lighter ${className}`}>
          {validPlaceholder ? (
            <img 
              src={validPlaceholder} 
              alt="" 
              className={`w-full h-full object-cover filter blur-sm ${className}`}
              onError={() => {
                console.warn('Placeholder image failed to load');
              }}
            />
          ) : (
            <Loader className="w-4 h-4 text-accent animate-spin" />
          )}
        </div>
      )}

      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={sanitizedAlt}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
}