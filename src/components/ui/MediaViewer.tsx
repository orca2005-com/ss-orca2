import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Download, Share2, ZoomIn, ZoomOut, RotateCw, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';
import { sanitizeText } from '../../utils';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
}

interface MediaViewerProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  initialIndex?: number;
}

export function MediaViewer({ isOpen, onClose, media, initialIndex = 0 }: MediaViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(Math.max(0, Math.min(initialIndex, media.length - 1)));
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // Validate and sanitize media data
  const sanitizedMedia = media.filter(item => {
    if (!item || !item.url || !item.type) return false;
    
    try {
      new URL(item.url);
      return ['image', 'video'].includes(item.type);
    } catch {
      return false;
    }
  });

  const currentMedia = sanitizedMedia[currentIndex];

  // Reset states when media changes
  useEffect(() => {
    setZoomLevel(1);
    setRotation(0);
    setIsVideoPlaying(false);
  }, [currentIndex]);

  // Validate initial index
  useEffect(() => {
    const validIndex = Math.max(0, Math.min(initialIndex, sanitizedMedia.length - 1));
    setCurrentIndex(validIndex);
  }, [initialIndex, sanitizedMedia.length]);

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    setShowControls(true);
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default behavior for handled keys
      const handledKeys = ['Escape', 'ArrowLeft', 'ArrowRight', ' '];
      if (handledKeys.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (sanitizedMedia.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + sanitizedMedia.length) % sanitizedMedia.length);
          }
          break;
        case 'ArrowRight':
          if (sanitizedMedia.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % sanitizedMedia.length);
          }
          break;
        case ' ':
          if (currentMedia?.type === 'video') {
            toggleVideoPlay();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, currentMedia, sanitizedMedia.length, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isOpen, resetControlsTimeout]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleVideoPlay = useCallback(() => {
    if (videoRef.current) {
      try {
        if (isVideoPlaying) {
          videoRef.current.pause();
        } else {
          const playPromise = videoRef.current.play();
          if (playPromise) {
            playPromise.catch(error => {
              console.error('Video play failed:', error);
              setIsVideoPlaying(false);
            });
          }
        }
        setIsVideoPlaying(!isVideoPlaying);
      } catch (error) {
        console.error('Error toggling video play:', error);
      }
    }
  }, [isVideoPlaying]);

  const handleShare = async () => {
    if (!currentMedia) return;
    
    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: sanitizeText(currentMedia.title || 'Shared Media'),
          url: currentMedia.url
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(currentMedia.url);
        // You could show a toast notification here
      }
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback: try to copy to clipboard
      try {
        await navigator.clipboard.writeText(currentMedia.url);
      } catch (clipboardError) {
        console.error('Clipboard copy failed:', clipboardError);
      }
    }
  };

  const handleDownload = useCallback(() => {
    if (!currentMedia) return;
    
    try {
      const link = document.createElement('a');
      link.href = currentMedia.url;
      link.download = sanitizeText(currentMedia.title || `media-${currentMedia.id}`);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  }, [currentMedia]);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  if (!isOpen || !currentMedia || sanitizedMedia.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="relative w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          {/* Top Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={onClose} 
                      className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      aria-label="Close viewer"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <div className="text-white">
                      <p className="text-sm font-medium">{currentIndex + 1} of {sanitizedMedia.length}</p>
                      {currentMedia.title && (
                        <p className="text-xs text-gray-300">{sanitizeText(currentMedia.title)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {currentMedia.type === 'image' && (
                      <>
                        <button 
                          onClick={handleZoomOut} 
                          disabled={zoomLevel <= 0.5} 
                          className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                          aria-label="Zoom out"
                        >
                          <ZoomOut className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleResetZoom} 
                          className="px-3 py-1 bg-black/50 rounded-full text-white text-sm hover:bg-black/70 transition-colors"
                          aria-label="Reset zoom"
                        >
                          {Math.round(zoomLevel * 100)}%
                        </button>
                        <button 
                          onClick={handleZoomIn} 
                          disabled={zoomLevel >= 3} 
                          className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors disabled:opacity-50"
                          aria-label="Zoom in"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleRotate} 
                          className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                          aria-label="Rotate image"
                        >
                          <RotateCw className="w-5 h-5" />
                        </button>
                      </>
                    )}
                    <button 
                      onClick={handleDownload} 
                      className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      aria-label="Download media"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={handleShare} 
                      className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                      aria-label="Share media"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Arrows */}
          {sanitizedMedia.length > 1 && (
            <>
              <AnimatePresence>
                {showControls && (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + sanitizedMedia.length) % sanitizedMedia.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                    aria-label="Previous media"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </motion.button>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {showControls && (
                  <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % sanitizedMedia.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
                    aria-label="Next media"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </motion.button>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Media Content */}
          <div className="relative max-w-full max-h-full flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                {currentMedia.type === 'image' ? (
                  <OptimizedImage
                    src={getOptimizedPexelsUrl(currentMedia.url, 'high')}
                    alt={sanitizeText(currentMedia.title || 'Media')}
                    className="max-w-[90vw] max-h-[90vh] object-contain cursor-pointer"
                    placeholder={createPlaceholderUrl(currentMedia.url)}
                    priority={true}
                    style={{
                      transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                      transition: 'transform 0.3s ease-out'
                    }}
                    onClick={() => {
                      if (zoomLevel > 1) {
                        setZoomLevel(1);
                      } else {
                        setZoomLevel(2);
                      }
                    }}
                  />
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      src={currentMedia.url}
                      className="max-w-[90vw] max-h-[90vh] object-contain"
                      controls={false}
                      autoPlay={false}
                      muted={isVideoMuted}
                      playsInline
                      onPlay={() => setIsVideoPlaying(true)}
                      onPause={() => setIsVideoPlaying(false)}
                      onError={(e) => console.error('Video error:', e)}
                    />
                    
                    <AnimatePresence>
                      {showControls && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <button
                            onClick={toggleVideoPlay}
                            className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                            aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                          >
                            {isVideoPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                          </button>

                          <div className="absolute bottom-4 left-4">
                            <button
                              onClick={() => {
                                if (videoRef.current) {
                                  videoRef.current.muted = !isVideoMuted;
                                  setIsVideoMuted(!isVideoMuted);
                                }
                              }}
                              className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                              aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
                            >
                              {isVideoMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}