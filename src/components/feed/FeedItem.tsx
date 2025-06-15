import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { OptimizedImage } from '../ui/OptimizedImage';
import { MediaGrid } from '../ui/MediaGrid';
import { FollowButton } from '../ui/FollowButton';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils';

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
  const [isRemoving, setIsRemoving] = useState(false);
  const postMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (postMenuRef.current && !postMenuRef.current.contains(event.target as Node)) {
        setShowPostMenu(false);
      }
    };

    if (showPostMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPostMenu]);

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
      className="bg-dark-lighter rounded-xl p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <button 
          className="flex items-center space-x-3 ultra-touch hover:bg-dark/50 rounded-lg p-2 -m-2 transition-colors"
          onClick={handleViewProfile}
        >
          <OptimizedImage
            src={getOptimizedPexelsUrl(post.author.avatar, 'low')}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
            placeholder={createPlaceholderUrl(post.author.avatar)}
            priority={false}
          />
          <div className="text-left">
            <h3 className="font-semibold text-white hover:text-accent transition-colors cursor-pointer">
              {post.author.name}
            </h3>
            <span className="text-sm text-gray-400">{post.author.role}</span>
          </div>
        </button>

        <div className="flex items-center space-x-2">
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
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-dark/50 rounded-full transition-colors ultra-touch"
              title="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showPostMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowPostMenu(false)}
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 bg-dark-lighter/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden z-50 border border-white/10 min-w-[160px]"
                  >
                    <button
                      onClick={handleNotInterested}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark hover:text-white transition-colors ultra-touch"
                    >
                      <EyeOff className="w-4 h-4" />
                      <span>Not Interested</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="text-gray-300">{post.content}</p>

      {mediaItems.length > 0 && (
        <MediaGrid 
          media={mediaItems}
          maxItems={4}
          showViewAll={true}
        />
      )}

      <div className="flex items-center justify-between pt-2 border-t border-dark-light">
        <button
          onClick={handleLike}
          className={clsx(
            'flex items-center space-x-2 ultra-touch',
            liked ? 'text-accent' : 'text-gray-400 hover:text-gray-300'
          )}
        >
          <Heart className={clsx('w-5 h-5', liked && 'fill-current')} />
          <span>{likesCount}</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 ultra-touch"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{commentsCount}</span>
        </button>

        <button className="flex items-center space-x-2 text-gray-400 hover:text-gray-300 ultra-touch">
          <Share2 className="w-5 h-5" />
          <span>{post.shares}</span>
        </button>
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-4 border-t border-dark-light pt-4"
        >
          {comments.length > 0 && (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start space-x-3 group"
                >
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
                            className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
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
                </motion.div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddComment} className="flex items-center space-x-2">
            <img
              src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
              alt="Your avatar"
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-dark text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent ultra-touch text-sm placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="p-2 text-accent hover:text-accent-light disabled:opacity-50 disabled:cursor-not-allowed ultra-touch transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </motion.div>
  );
}