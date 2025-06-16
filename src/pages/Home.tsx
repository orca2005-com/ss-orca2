import React, { useState, useEffect, useRef } from 'react';
import { Filter, Image as ImageIcon, Send, X, Video, Plus, ChevronDown } from 'lucide-react';
import { FeedItem } from '../components/feed/FeedItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePosts } from '../hooks/useSupabaseData';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { posts, isLoading, createPost, deletePost, toggleLike } = usePosts();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [newPost, setNewPost] = useState({
    content: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [removedPosts, setRemovedPosts] = useState<Set<string>>(new Set());
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreatePost = async () => {
    if (!newPost.content.trim() && mediaFiles.length === 0) return;
    if (!user) {
      navigate('/login');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost(newPost.content, mediaFiles);
      
      // Reset form
      setNewPost({ content: '' });
      setMediaFiles([]);
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePost = async (postId: string) => {
    try {
      await deletePost(postId);
      setRemovedPosts(prev => new Set([...prev, postId]));
    } catch (error) {
      console.error('Error removing post:', error);
    }
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

  const filteredPosts = posts
    .filter(post => !removedPosts.has(post.id))
    .filter(post => {
      if (selectedRole === 'all') return true;
      if (selectedRole === 'player') return post.author.role.toLowerCase().includes('player');
      if (selectedRole === 'team') return post.author.role.toLowerCase().includes('team');
      if (selectedRole === 'coach') return post.author.role.toLowerCase().includes('coach');
      return post.author.role.toLowerCase().includes(selectedRole.toLowerCase());
    });

  if (isLoading) {
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
      {/* Mobile-first Layout */}
      <div className="max-w-4xl mx-auto mobile-padding pb-20 md:pb-8 pt-4 md:pt-8">
        
        {/* Mobile Profile Header */}
        <div className="card-mobile mb-4">
          <button
            onClick={handleCurrentUserProfileClick}
            className="flex items-center space-x-3 w-full hover:bg-dark/50 rounded-lg ultra-touch -m-2 transition-colors"
          >
            <div className="w-12 h-12 flex-shrink-0">
              <img
                src={user?.avatar_url || "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-dark-light cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-semibold text-white hover:text-accent transition-colors text-sm md:text-base truncate">{user?.full_name || 'User'}</h3>
              <p className="text-xs text-gray-400">{user?.role || 'Athlete'}</p>
            </div>
            {user?.user_profiles?.stats && (
              <div className="flex space-x-4 text-center flex-shrink-0">
                <div>
                  <p className="text-sm font-semibold text-white">{user.user_profiles.stats.followers || 0}</p>
                  <p className="text-xs text-gray-400">Followers</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.user_profiles.stats.following || 0}</p>
                  <p className="text-xs text-gray-400">Following</p>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Mobile-optimized Create Post */}
        <div className="card-mobile mb-4">
          <div className="space-y-4">
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ content: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full bg-dark text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent ultra-touch border border-dark-light"
              rows={3}
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
              disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Photo</span>
                </button>
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors ultra-touch"
                  disabled={isSubmitting}
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Video</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={(!newPost.content.trim() && mediaFiles.length === 0) || isSubmitting}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch text-sm font-medium"
              >
                {isSubmitting ? (
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
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Mobile-optimized Feed Filter */}
        <div className="card-mobile mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="heading-mobile">Feed</h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="relative" ref={filterDropdownRef}>
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
                      style={{ fontSize: '16px' }} // Prevent zoom on iOS
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

        {/* Mobile-optimized Posts */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post) => (
              <FeedItem 
                key={post.id}
                post={post} 
                onRemovePost={handleRemovePost}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto">
                  <ImageIcon className="w-8 h-8 text-gray-600" />
                </div>
                <div>
                  <p className="text-lg font-medium mb-2">No posts to show</p>
                  <p className="text-sm text-gray-500">
                    {selectedRole !== 'all' 
                      ? `No posts found for ${getFilterDisplayText().toLowerCase()}. Try adjusting your filters.`
                      : 'Be the first to share something with the community!'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}