import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ImageOff, Loader } from 'lucide-react';
import { sanitizeText, validateUrl } from '../../utils';

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
  const [retryCount, setRetryCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Enhanced sanitization and validation
  const sanitizedSrc = sanitizeText(src || '');
  const sanitizedAlt = sanitizeText(alt || '');
  const sanitizedPlaceholder = placeholder ? sanitizeText(placeholder) : undefined;

  // Enhanced URL validation with security checks
  const isValidUrl = useCallback((url: string): boolean => {
    try {
      if (!url || typeof url !== 'string') return false;
      
      // Basic URL validation
      if (!validateUrl(url)) return false;
      
      const urlObj = new URL(url);
      
      // Additional security checks
      if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Block suspicious domains in production
      if (process.env.NODE_ENV === 'production') {
        const suspiciousDomains = ['localhost', '127.0.0.1', '0.0.0.0'];
        if (suspiciousDomains.some(domain => urlObj.hostname.includes(domain))) {
          return false;
        }
      }
      
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          if (isValidUrl(sanitizedSrc)) {
            setCurrentSrc(sanitizedSrc);
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
  }, [sanitizedSrc, priority, isValidUrl]);

  // Validate src on mount for priority images
  useEffect(() => {
    if (priority && !isValidUrl(sanitizedSrc)) {
      setHasError(true);
      setIsLoading(false);
    }
  }, [priority, sanitizedSrc, isValidUrl]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    
    // Enhanced retry logic with exponential backoff
    if (retryCount < 2 && currentSrc) {
      const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 5000);
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsLoading(true);
        // Force reload by adding timestamp
        try {
          const url = new URL(currentSrc);
          url.searchParams.set('retry', retryCount.toString());
          url.searchParams.set('t', Date.now().toString());
          setCurrentSrc(url.toString());
        } catch {
          setHasError(true);
        }
      }, retryDelay);
      return;
    }
    
    setHasError(true);
    onError?.();
  }, [onError, retryCount, currentSrc]);

  // Enhanced security: Prevent loading of potentially malicious URLs
  const shouldBlockUrl = useCallback((url: string): boolean => {
    if (!url) return true;
    
    try {
      const urlObj = new URL(url);
      
      // Block non-HTTP(S) protocols except data URLs for placeholders
      if (!['http:', 'https:', 'data:'].includes(urlObj.protocol)) {
        return true;
      }
      
      // Enhanced security checks
      const hostname = urlObj.hostname.toLowerCase();
      
      // Block localhost and private IPs in production
      if (process.env.NODE_ENV === 'production') {
        if (
          hostname === 'localhost' ||
          hostname.startsWith('127.') ||
          hostname.startsWith('192.168.') ||
          hostname.startsWith('10.') ||
          hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./) ||
          hostname === '0.0.0.0' ||
          hostname.includes('..') // Path traversal attempt
        ) {
          return true;
        }
      }
      
      // Block suspicious patterns
      const suspiciousPatterns = [
        /javascript:/i,
        /vbscript:/i,
        /data:text\/html/i,
        /data:application/i
      ];
      
      if (suspiciousPatterns.some(pattern => pattern.test(url))) {
        return true;
      }
      
      return false;
    } catch {
      return true;
    }
  }, []);

  const defaultFallback = (
    <div className={`flex items-center justify-center bg-dark-lighter ${className}`}>
      <ImageOff className="w-8 h-8 text-gray-500" />
    </div>
  );

  // Block malicious URLs
  if (currentSrc && shouldBlockUrl(currentSrc)) {
    console.warn('Blocked potentially malicious image URL:', currentSrc);
    return fallback || defaultFallback;
  }

  if (hasError) {
    return fallback || defaultFallback;
  }

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${containerClassName}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center bg-dark-lighter ${className}`}>
          {sanitizedPlaceholder ? (
            <img 
              src={sanitizedPlaceholder} 
              alt="" 
              className={`w-full h-full object-cover filter blur-sm ${className}`}
              onError={() => setHasError(true)}
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
          crossOrigin="anonymous" // Security: Prevent CORS issues
          referrerPolicy="no-referrer" // Security: Don't send referrer
          decoding="async" // Performance: Async decoding
          {...props}
        />
      )}
    </div>
  );
}