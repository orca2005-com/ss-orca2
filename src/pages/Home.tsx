import React, { useState, useEffect } from 'react';
import { Filter, Image as ImageIcon, Send, X, Video, Plus, ChevronDown } from 'lucide-react';
import { FeedItem } from '../components/feed/FeedItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePaginatedApi } from '../hooks/useApi';
import { apiService } from '../services/api';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
    media: [] as File[],
  });
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // Use paginated API hook for feed
  const {
    data: posts,
    loading: isLoading,
    error: feedError,
    hasMore,
    loadMore,
    refresh
  } = usePaginatedApi(
    (page, limit) => apiService.getFeed(page, limit),
    10
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.content.trim() && mediaFiles.length === 0) return;
    if (isCreatingPost) return;

    setIsCreatingPost(true);

    try {
      // Upload media files if any
      const mediaUrls = [];
      for (const file of mediaFiles) {
        const uploadResult = await apiService.uploadFile(file, 'post');
        mediaUrls.push(uploadResult.url);
      }

      // Create post
      await apiService.createPost({
        content: newPost.content,
        mediaUrls
      });

      // Reset form
      setNewPost({ content: '', media: [] });
      setMediaFiles([]);

      // Refresh feed
      refresh();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCurrentUserProfileClick = () => {
    if (user?.id) {
      navigate(`/profile/${user.id}`);
    }
  };

  const handleRoleFilterChange = (role: string) => {
    if (role === 'other') {
      setShowCustomInput(true);
      setSelectedRole('all');
      setShowFilterDropdown(false);
    } else {
      setSelectedRole(role);
      setShowCustomInput(false);
      setCustomRole('');
      setShowFilterDropdown(false);
    }
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim()) {
      setSelectedRole(customRole.trim().toLowerCase());
      setShowCustomInput(false);
    }
  };

  const clearCustomFilter = () => {
    setSelectedRole('all');
    setCustomRole('');
    setShowCustomInput(false);
  };

  const getFilterDisplayText = () => {
    if (selectedRole === 'all') return 'All Posts';
    if (selectedRole === 'player') return 'Players';
    if (selectedRole === 'team') return 'Teams';
    if (selectedRole === 'coach') return 'Coaches';
    return selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
  };

  // Filter posts based on selected role
  const filteredPosts = posts.filter(post => {
    if (selectedRole === 'all') return true;
    if (selectedRole === 'player') return post.author.role.toLowerCase().includes('player');
    if (selectedRole === 'team') return post.author.role.toLowerCase().includes('team');
    if (selectedRole === 'coach') return post.author.role.toLowerCase().includes('coach');
    return post.author.role.toLowerCase().includes(selectedRole.toLowerCase());
  });

  if (isLoading && posts.length === 0) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark mobile-optimized">
      <div className="max-w-4xl mx-auto mobile-padding pb-20 md:pb-8 pt-4 md:pt-8">
        
        {/* User Profile Header */}
        <div className="card-mobile mb-4">
          <button
            onClick={handleCurrentUserProfileClick}
            className="flex items-center space-x-3 w-full hover:bg-dark/50 rounded-lg ultra-touch -m-2 transition-colors"
          >
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src={user?.avatar || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-dark-light cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-semibold text-white hover:text-accent transition-colors text-sm md:text-base truncate">
                {user?.name || 'Current User'}
              </h3>
              <p className="text-xs text-gray-400">{user?.role || 'Professional Athlete'}</p>
            </div>
          </button>
        </div>

        {/* Create Post */}
        <div className="card-mobile mb-4">
          <div className="space-y-4">
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full bg-dark text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent ultra-touch border border-dark-light"
              rows={3}
              style={{ fontSize: '16px' }}
              disabled={isCreatingPost}
            />

            {mediaFiles.length > 0 && (
              <div className="mobile-grid">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 ultra-touch bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={isCreatingPost}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-dark-light pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors ultra-touch"
                  disabled={isCreatingPost}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Photo</span>
                </button>
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors ultra-touch"
                  disabled={isCreatingPost}
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Video</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={(!newPost.content.trim() && mediaFiles.length === 0) || isCreatingPost}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch text-sm font-medium min-w-[80px] flex items-center justify-center"
              >
                {isCreatingPost ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Post'
                )}
              </button>
            </div>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleMediaUpload}
              disabled={isCreatingPost}
            />
          </div>
        </div>

        {/* Feed Filter */}
        <div className="card-mobile mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-mobile">Feed</h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="w-full flex items-center justify-between bg-dark text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent ultra-touch border border-dark-light"
              >
                <span>{getFilterDisplayText()}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-dark-lighter border border-dark-light rounded-lg shadow-xl overflow-hidden z-50"
                  >
                    {[
                      { value: 'all', label: 'All Posts' },
                      { value: 'player', label: 'Players' },
                      { value: 'team', label: 'Teams' },
                      { value: 'coach', label: 'Coaches' },
                      { value: 'other', label: 'Other (Custom)' }
                    ].map((option, index) => (
                      <motion.button
                        key={option.value}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleRoleFilterChange(option.value)}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors ultra-touch ${
                          selectedRole === option.value
                            ? 'bg-accent text-white'
                            : 'text-gray-300 hover:bg-dark hover:text-white'
                        }`}
                      >
                        {option.label}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {showCustomInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 bg-dark rounded-lg p-3 border border-dark-light"
                >
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      placeholder="Enter role (e.g., nutritionist)"
                      className="flex-1 px-3 py-2 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400 text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomRoleSubmit()}
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      onClick={handleCustomRoleSubmit}
                      disabled={!customRole.trim()}
                      className="px-3 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 text-sm ultra-touch"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-gray-400">Quick suggestions:</p>
                    <div className="flex flex-wrap gap-2">
                      {['nutritionist', 'physiotherapist', 'psychologist', 'journalist'].map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setCustomRole(role);
                            setSelectedRole(role);
                            setShowCustomInput(false);
                          }}
                          className="px-3 py-1 text-xs bg-dark-lighter border border-dark-light rounded-full text-gray-300 hover:border-accent hover:text-accent transition-colors ultra-touch"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedRole !== 'all' && selectedRole !== 'player' && selectedRole !== 'team' && selectedRole !== 'coach' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-accent rounded-full"></div>
                    <span className="text-sm text-accent font-medium">Filtering by: {selectedRole}</span>
                  </div>
                  <button
                    onClick={clearCustomFilter}
                    className="text-gray-400 hover:text-gray-300 transition-colors ultra-touch"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <FeedItem 
                key={post.id}
                post={post} 
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={loadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch font-medium"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  'Load More'
                )}
              </button>
            </div>
          )}
          
          {filteredPosts.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-400">
              <p>No posts to show</p>
              <p className="text-sm text-gray-500 mt-2">Be the first to share something!</p>
            </div>
          )}

          {feedError && (
            <div className="text-center py-8 text-red-400">
              <p>Error loading feed: {feedError}</p>
              <button
                onClick={refresh}
                className="mt-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors ultra-touch"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}