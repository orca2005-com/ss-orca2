import React, { useState } from 'react';
import { Play, Image as ImageIcon, Maximize } from 'lucide-react';
import { motion } from 'framer-motion';
import { OptimizedImage } from './OptimizedImage';
import { MediaViewer } from './MediaViewer';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
  description?: string;
}

interface MediaGridProps {
  media: MediaItem[];
  className?: string;
  maxItems?: number;
  showViewAll?: boolean;
  onViewAll?: () => void;
}

export function MediaGrid({ 
  media, 
  className = '', 
  maxItems = 4,
  showViewAll = true,
  onViewAll 
}: MediaGridProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const displayedMedia = media.slice(0, maxItems);
  const remainingCount = media.length - maxItems;

  const handleMediaClick = (index: number) => {
    setSelectedIndex(index);
    setIsViewerOpen(true);
  };

  const getGridLayout = (count: number) => {
    if (count === 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-2';
    if (count === 3) return 'grid-cols-2';
    return 'grid-cols-2';
  };

  const getItemSpan = (index: number, count: number) => {
    if (count === 3 && index === 0) return 'col-span-2';
    return '';
  };

  if (media.length === 0) return null;

  return (
    <>
      <div className={`grid gap-2 ${getGridLayout(displayedMedia.length)} ${className}`}>
        {displayedMedia.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative group cursor-pointer overflow-hidden rounded-lg ${getItemSpan(index, displayedMedia.length)}`}
            onClick={() => handleMediaClick(index)}
          >
            <div className="relative aspect-square">
              {item.type === 'image' ? (
                <OptimizedImage
                  src={getOptimizedPexelsUrl(item.url, 'medium')}
                  alt={item.title || `Media ${index + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  placeholder={createPlaceholderUrl(item.url)}
                  priority={index < 2}
                />
              ) : (
                <div className="w-full h-full bg-dark-lighter flex items-center justify-center">
                  <video
                    src={item.url}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                  />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ opacity: 1, scale: 1 }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  {item.type === 'video' ? (
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-6 h-6 text-white ml-1" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Maximize className="w-6 h-6 text-white" />
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Media Type Indicator */}
              <div className="absolute top-2 left-2">
                <div className="w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
                  {item.type === 'video' ? (
                    <Play className="w-3 h-3 text-white" />
                  ) : (
                    <ImageIcon className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>

              {/* Remaining Count Overlay */}
              {index === maxItems - 1 && remainingCount > 0 && showViewAll && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="text-center text-white">
                    <p className="text-2xl font-bold">+{remainingCount}</p>
                    <p className="text-sm">more</p>
                  </div>
                </div>
              )}
            </div>

            {/* Title */}
            {item.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* View All Button */}
      {remainingCount > 0 && showViewAll && onViewAll && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onViewAll}
          className="mt-3 w-full py-2 text-sm text-accent hover:text-accent-light transition-colors font-medium"
        >
          View all {media.length} items
        </motion.button>
      )}

      {/* Media Viewer */}
      <MediaViewer
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        media={media}
        initialIndex={selectedIndex}
      />
    </>
  );
}