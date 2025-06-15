import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Image, Trash2, Play, Maximize, Reply } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaViewer } from '../ui/MediaViewer';
import { UserAvatar } from '../ui/UserAvatar';

interface ReplyToMessage {
  id: string;
  content: string;
  sender: {
    name: string;
  };
}

interface MessageItemProps {
  message: {
    id: string;
    content: string;
    timestamp: Date;
    sender: {
      id: string;
      name: string;
      avatar: string;
    };
    media?: Array<{
      url: string;
      type: 'image' | 'video';
      name: string;
    }>;
    isRead: boolean;
    replyTo?: ReplyToMessage;
  };
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (message: { id: string; content: string; sender: { name: string } }) => void;
}

export function MessageItem({ message, isOwn, onDelete, onReply }: MessageItemProps) {
  const navigate = useNavigate();
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isMediaViewerOpen, setIsMediaViewerOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    showActionMenu(e.clientX, e.clientY);
  };

  const showActionMenu = (x: number, y: number) => {
    setContextMenuPosition({ x, y });
    setShowContextMenu(true);
  };

  const handleReply = () => {
    if (onReply) {
      onReply({
        id: message.id,
        content: message.content,
        sender: { name: message.sender.name }
      });
    }
    setShowContextMenu(false);
  };

  // Touch event handlers for long press
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsLongPressing(true);
    
    longPressTimerRef.current = setTimeout(() => {
      // Get touch position
      const touch = e.touches[0];
      const rect = messageRef.current?.getBoundingClientRect();
      
      if (touch && rect) {
        // Add haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
        
        showActionMenu(touch.clientX, touch.clientY);
      }
      setIsLongPressing(false);
    }, 500); // 500ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    // Cancel long press if user moves finger
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setIsLongPressing(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    setShowContextMenu(false);
  };

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setIsMediaViewerOpen(true);
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target as Node)) {
        setShowContextMenu(false);
      }
    };

    const handleScroll = () => {
      setShowContextMenu(false);
    };

    if (showContextMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('scroll', handleScroll, true);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [showContextMenu]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, []);

  // Convert media to MediaViewer format - Fixed type checking
  const mediaItems = message.media?.map((mediaItem, index) => ({
    id: `${message.id}-${index}`,
    url: mediaItem.url,
    type: mediaItem.type,
    title: mediaItem.name || `Media ${index + 1}`
  })) || [];

  return (
    <>
      <motion.div
        ref={messageRef}
        initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -10 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2 group relative`}
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
      >
        {!isOwn && (
          <UserAvatar
            userId={message.sender.id}
            src={message.sender.avatar}
            alt={message.sender.name}
            size="sm"
            className="mr-2"
          />
        )}
        
        <div className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} relative`}>
          <div
            className={`rounded-lg p-2 relative cursor-pointer transition-all duration-200 ${
              isOwn
                ? 'bg-accent text-white'
                : 'bg-dark-lighter text-white'
            } ${
              isLongPressing ? 'scale-95 opacity-80' : ''
            }`}
            title="Right-click or long press for options"
          >
            {/* Reply indicator */}
            {message.replyTo && (
              <div className={`mb-2 p-2 rounded border-l-2 ${
                isOwn ? 'border-white/30 bg-white/10' : 'border-accent/50 bg-accent/10'
              }`}>
                <p className="text-xs opacity-75 font-medium">{message.replyTo.sender.name}</p>
                <p className="text-xs opacity-60 truncate">{message.replyTo.content}</p>
              </div>
            )}

            {message.content && (
              <p className="text-sm mb-2">{message.content}</p>
            )}
            
            {message.media && message.media.length > 0 && (
              <div className="grid grid-cols-2 gap-1">
                {message.media.map((mediaItem, index) => (
                  <div key={index} className="relative group cursor-pointer" onClick={() => handleMediaClick(index)}>
                    <div className="relative w-full h-20 rounded-lg overflow-hidden">
                      {mediaItem.type === 'video' ? (
                        <div className="w-full h-full bg-dark flex items-center justify-center">
                          <video
                            src={mediaItem.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      ) : (
                        <img
                          src={mediaItem.url}
                          alt="Media"
                          className="w-full h-full object-cover"
                        />
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                        <Maximize className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Long press indicator */}
            {isLongPressing && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center"
              >
                <Reply className="w-4 h-4 text-blue-400" />
              </motion.div>
            )}
          </div>
          
          <div className="flex items-center mt-1 space-x-1">
            <span className="text-[10px] text-gray-400">
              {format(message.timestamp, 'HH:mm')}
            </span>
            {isOwn && message.isRead && (
              <span className="text-[10px] text-accent">Read</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Context Menu */}
      <AnimatePresence>
        {showContextMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowContextMenu(false)}
            />
            
            {/* Context Menu */}
            <motion.div
              ref={contextMenuRef}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed z-50 bg-dark-lighter border border-dark-light rounded-lg shadow-lg overflow-hidden min-w-[140px]"
              style={{
                left: Math.min(contextMenuPosition.x, window.innerWidth - 160),
                top: Math.min(contextMenuPosition.y, window.innerHeight - 100),
                transform: 'translate(-50%, -10px)'
              }}
            >
              <button
                onClick={handleReply}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors ultra-touch"
              >
                <Reply className="w-4 h-4" />
                <span>Reply</span>
              </button>
              
              {isOwn && onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors ultra-touch"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Message</span>
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Media Viewer */}
      {mediaItems.length > 0 && (
        <MediaViewer
          isOpen={isMediaViewerOpen}
          onClose={() => setIsMediaViewerOpen(false)}
          media={mediaItems}
          initialIndex={selectedMediaIndex}
        />
      )}
    </>
  );
}