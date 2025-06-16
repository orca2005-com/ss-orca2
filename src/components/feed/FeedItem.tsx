import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { OptimizedImage } from '../ui/OptimizedImage';
import { MediaGrid } from '../ui/MediaGrid';
import { FollowButton } from '../ui/FollowButton';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
}

interface FeedItemProps {
  post: {
    id: string;
    author: {
      id: string;
      name: string;
      avatar: string;
      role: string;
    };
    content: string;
    media?: Array<{
      url: string;
      type: 'image' | 'video';
    }>;
    likes: number;
    comments: number;
    shares: number;
    timestamp: Date;
  };
  onRemovePost?: (id: string) => void;
  currentUserId?: string;
}

export function FeedItem({ post, onRemovePost, currentUserId = '1' }: FeedItemProps) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsCount, setCommentsCount] = useState(post.comments);
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [sharesCount, setSharesCount] = useState(post.shares);
  const [isRemoving, setIsRemoving] = useState(false);
  const postMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const isOwnPost = post.author.id === currentUserId;

  const handleLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
  };

  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/profile/${post.author.id}`);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: {
        id: currentUserId,
        name: 'You',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
      },
      timestamp: new Date()
    };

    setComments(prev => [...prev, comment]);
    setCommentsCount(prev => prev + 1);
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(prev => prev.filter(comment => comment.id !== commentId));
    setCommentsCount(prev => prev - 1);
  };

  const handleNotInterested = () => {
    setIsRemoving(true);
    setShowPostMenu(false);
    
    setTimeout(() => {
      if (onRemovePost) {
        onRemovePost(post.id);
      }
    }, 300);
  };

  // Enhanced Share Functionality
  const handleShare = async (platform?: 'facebook' | 'twitter' | 'linkedin' | 'copy' | 'native') => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    const shareText = `Check out this post by ${post.author.name}: "${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}"`;
    
    try {
      if (!platform) {
        // Try native share first, fallback to showing share menu
        if (navigator.share) {
          await navigator.share({
            title: `Post by ${post.author.name}`,
            text: shareText,
            url: postUrl
          });
          setSharesCount(prev => prev + 1);
          return;
        } else {
          setShowShareMenu(true);
          return;
        }
      }

      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank', 'width=600,height=400');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`, '_blank', 'width=600,height=400');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`, '_blank', 'width=600,height=400');
          break;
        case 'copy':
          await navigator.clipboard.writeText(postUrl);
          // Show success feedback
          const button = shareMenuRef.current?.querySelector('[data-platform="copy"]');
          if (button) {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
              button.textContent = originalText;
            }, 2000);
          }
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: `Post by ${post.author.name}`,
              text: shareText,
              url: postUrl
            });
          }
          break;
      }
      
      setSharesCount(prev => prev + 1);
      setShowShareMenu(false);
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
      } catch (copyError) {
        console.error('Copy failed:', copyError);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setShowPostMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    };

    if (showPostMenu || showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPostMenu, showShareMenu]);

  const mediaItems = post.media?.map((media, index) => ({
    id: `${post.id}-${index}`,
    url: media.url,
    type: media.type,
    title: `${post.author.name}'s ${media.type}`
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 1, scale: 1 }}
      animate={{ 
        opacity: isRemoving ? 0 : 1, 
        scale: isRemoving ? 0.95 : 1,
        y: isRemoving ? -20 : 0
      }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{ duration: 0.3 }}
      className="card-mobile"
    >
      <div className="flex items-center justify-between mb-4">
        <button 
          className="flex items-center space-x-3 ultra-touch hover:bg-dark/50 rounded-lg -m-2 transition-colors flex-1 min-w-0"
          onClick={handleViewProfile}
        >
          <OptimizedImage
            src={getOptimizedPexelsUrl(post.author.avatar, 'low')}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all flex-shrink-0"
            placeholder={createPlaceholderUrl(post.author.avatar)}
            priority={false}
          />
          <div className="text-left min-w-0 flex-1">
            <h3 className="font-semibold text-white hover:text-accent transition-colors cursor-pointer text-sm truncate">
              {post.author.name}
            </h3>
            <span className="text-xs text-gray-400">{post.author.role}</span>
          </div>
        </button>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {!isOwnPost && (
            <FollowButton 
              userId={post.author.id}
              currentUserId={currentUserId}
              size="sm"
              showTextOnMobile={false}
            />
          )}

          <div className="relative" ref={postMenuRef}>
            <button
              onClick={() => setShowPostMenu(!showPostMenu)}
              className="ultra-touch text-gray-400 hover:text-gray-300 hover:bg-dark/50 rounded-full transition-colors"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {showPostMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowPostMenu(false)}
                />
                
                <div className="absolute right-0 top-full mt-2 bg-dark-lighter/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden z-50 border border-white/10 min-w-[160px]">
                  <button
                    onClick={handleNotInterested}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors ultra-touch"
                  >
                    <EyeOff className="w-4 h-4" />
                    <span>Not Interested</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="text-gray-300 mb-4 text-responsive leading-relaxed">{post.content}</p>

      {mediaItems.length > 0 && (
        <div className="mb-4">
          <MediaGrid 
            media={mediaItems}
            maxItems={4}
            showViewAll={true}
          />
        </div>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-light">
        <button
          onClick={handleLike}
          className={clsx(
            'flex items-center space-x-2 ultra-touch rounded-lg',
            liked ? 'text-accent' : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <Heart className={clsx('w-5 h-5', liked && 'fill-current')} />
          <span className="text-sm">{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 ultra-touch rounded-lg"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm">{commentsCount}</span>
        </button>

        {/* Enhanced Share Button with Menu */}
        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => handleShare()}
            className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 ultra-touch rounded-lg"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-sm">{sharesCount}</span>
          </button>

          {showShareMenu && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowShareMenu(false)}
              />
              
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-dark-lighter/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden z-50 border border-white/10 min-w-[200px]">
                <div className="p-2">
                  <p className="text-xs text-gray-400 px-3 py-2 font-medium">Share this post</p>
                  
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors ultra-touch rounded-lg"
                  >
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                    <span>Facebook</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-sky-500/20 hover:text-sky-400 transition-colors ultra-touch rounded-lg"
                  >
                    <div className="w-4 h-4 bg-sky-500 rounded"></div>
                    <span>Twitter</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('linkedin')}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-blue-700/20 hover:text-blue-400 transition-colors ultra-touch rounded-lg"
                  >
                    <div className="w-4 h-4 bg-blue-700 rounded"></div>
                    <span>LinkedIn</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare('copy')}
                    data-platform="copy"
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600/20 hover:text-gray-300 transition-colors ultra-touch rounded-lg"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </button>
                  
                  {navigator.share && (
                    <button
                      onClick={() => handleShare('native')}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-accent/20 hover:text-accent transition-colors ultra-touch rounded-lg"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>More Options</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showComments && (
        <div className="space-y-4 border-t border-dark-light pt-4 mt-4">
          {comments.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto mobile-scroll">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3 group">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="bg-dark rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white">{comment.author.name}</span>
                        {comment.author.id === currentUserId && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs ultra-touch"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                    </div>
                    <span className="text-xs text-gray-500 ml-3 mt-1">
                      {formatDistanceToNow(comment.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Mobile-optimized Comment Input */}
          <form onSubmit={handleAddComment} className="space-y-3">
            <div className="flex items-start space-x-3">
              <img
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
                alt="Your avatar"
                className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
              />
              <div className="flex-1 min-w-0">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full bg-dark text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent ultra-touch text-sm placeholder-gray-400 resize-none border border-dark-light"
                  rows={2}
                  style={{ fontSize: '16px' }} // Prevent zoom on iOS
                />
              </div>
            </div>
            
            {/* Mobile-optimized Send Button */}
            <div className="flex justify-end pl-11">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed ultra-touch transition-colors flex items-center space-x-2 min-w-[80px] justify-center"
              >
                <Send className="h-4 w-4" />
                <span className="text-sm font-medium">Send</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}