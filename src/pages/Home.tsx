import React, { useState, useEffect, useRef } from 'react';
import { Filter, Image as ImageIcon, Send, X, Video, Plus, ChevronDown } from 'lucide-react';
import { FeedItem } from '../components/feed/FeedItem';
import { SuggestedConnections } from '../components/feed/SuggestedConnections';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { postService } from '../services/postService';
import { profileService } from '../services/profileService';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [connectedUsers, setConnectedUsers] = useState<Set<string>>(new Set());
  const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());
  const [newPost, setNewPost] = useState({
    content: '',
    media: [] as File[],
  });
  const [lastPostTime, setLastPostTime] = useState<Date | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [removedPosts, setRemovedPosts] = useState<Set<string>>(new Set());
  const filterDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Load posts feed
      const feedData = await postService.getFeed(user.id);
      setPosts(feedData || []);
      
      // Load suggested connections (simplified for now)
      const connectionsData = await profileService.getConnections(user.id);
      setConnections(connectionsData.slice(0, 6) || []);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (connectionId: string) => {
    if (connectedUsers.has(connectionId) || connectingUsers.has(connectionId) || !user) return;

    setConnectingUsers(prev => new Set([...prev, connectionId]));

    try {
      await profileService.sendConnectionRequest(user.id, connectionId);
      
      setConnectedUsers(prev => new Set([...prev, connectionId]));
      
      // Remove from suggestions after connecting
      setTimeout(() => {
        setConnections(prev => prev.filter(conn => conn.id !== connectionId));
      }, 2000);
    } catch (error) {
      console.error('Error connecting:', error);
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
    }
  };

  const handleSeeMoreConnections = () => {
    navigate('/search');
  };

  const handleCreatePost = async () => {
    if (!user || (!newPost.content.trim() && mediaFiles.length === 0)) return;

    if (lastPostTime) {
      const timeDiff = Date.now() - lastPostTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      if (minutesDiff < 1) { // Reduced to 1 minute for better UX
        alert(`Please wait ${Math.ceil(1 - minutesDiff)} minute(s) before posting again.`);
        return;
      }
    }

    try {
      const postData = {
        content: newPost.content,
        post_type: mediaFiles.length > 0 ? 'image' : 'text',
        visibility: 'public',
        media: mediaFiles
      };

      await postService.createPost(user.id, postData);
      
      // Reload the feed
      await loadData();
      
      setNewPost({ content: '', media: [] });
      setMediaFiles([]);
      setLastPostTime(new Date());
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setMediaFiles(prev => [...prev, ...files]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemovePost = (postId: string) => {
    setRemovedPosts(prev => new Set([...prev, postId]));
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
      if (selectedRole === 'player') return post.author_role?.toLowerCase().includes('player');
      if (selectedRole === 'team') return post.author_role?.toLowerCase().includes('team');
      if (selectedRole === 'coach') return post.author_role?.toLowerCase().includes('coach');
      return post.author_role?.toLowerCase().includes(selectedRole.toLowerCase());
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
    <div className="min-h-screen bg-dark py-4 md:py-8 pb-20 md:pb-8">
      {/* Mobile Layout */}
      <div className="block lg:hidden max-w-4xl mx-auto px-4 space-y-4">
        {/* User Profile Header */}
        <div className="bg-dark-lighter rounded-xl p-3 md:p-4">
          <button
            onClick={handleCurrentUserProfileClick}
            className="flex items-center space-x-3 w-full hover:bg-dark/50 rounded-lg p-2 -m-2 transition-colors"
          >
            <div className="w-10 h-10 md:w-12 md:h-12">
              <img
                src={user?.profile?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'}
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-dark-light cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm md:text-base font-semibold text-white hover:text-accent transition-colors">
                {user?.profile?.full_name || user?.email || 'User'}
              </h3>
              <p className="text-xs text-gray-400">{user?.role || 'Professional Athlete'}</p>
            </div>
            <div className="flex space-x-3 text-center">
              <div>
                <p className="text-sm font-semibold text-white">0</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">0</p>
                <p className="text-xs text-gray-400">Connections</p>
              </div>
            </div>
          </button>
        </div>

        {/* Create Post */}
        <div className="bg-dark-lighter rounded-xl overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <button onClick={handleCurrentUserProfileClick}>
                <img
                  src={user?.profile?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'}
                  alt="Profile"
                  className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                />
              </button>
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                placeholder="What's on your mind?"
                className="flex-1 bg-dark text-white placeholder-gray-400 rounded-lg px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-accent ultra-touch"
                rows={1}
              />
            </div>

            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {mediaFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ultra-touch"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-dark-light p-4">
            <div className="flex items-center justify-between">
              <div className="flex space-x-4">
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors ultra-touch"
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm">Photo</span>
                </button>
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors ultra-touch"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm">Video</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.content.trim() && mediaFiles.length === 0}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch"
              >
                Post
              </button>
            </div>
            <input
              id="media-upload"
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={handleMediaUpload}
            />
          </div>
        </div>

        {/* Enhanced Mobile Feed Filter */}
        <div className="bg-dark-lighter rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Feed</h2>
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
                    className="text-gray-400 hover:text-gray-300 transition-colors ultra-touch p-1"
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
                post={{
                  id: post.id,
                  author: {
                    id: post.author_id,
                    name: post.author_name,
                    avatar: post.author_avatar || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
                    role: post.author_role
                  },
                  content: post.content,
                  likes: post.like_count || 0,
                  comments: post.comment_count || 0,
                  shares: 0,
                  timestamp: new Date(post.created_at)
                }}
                onRemovePost={handleRemovePost}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {posts.length === 0 ? 'No posts yet. Create your first post!' : 'No posts match your filter'}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3 space-y-6">
            <div className="bg-dark-lighter rounded-xl overflow-hidden">
              <div className="h-20 bg-gradient-to-r from-accent to-accent-dark"></div>
              <div className="p-4 -mt-10">
                <button
                  onClick={handleCurrentUserProfileClick}
                  className="block w-full text-left hover:bg-dark/50 rounded-lg p-2 -m-2 transition-colors"
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={user?.profile?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'}
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-dark-lighter object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                    />
                    <h3 className="mt-3 text-lg font-semibold text-white hover:text-accent transition-colors">
                      {user?.profile?.full_name || user?.email || 'User'}
                    </h3>
                    <p className="text-sm text-gray-400">{user?.role || 'Professional Athlete'}</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">
                      {user?.profile?.sport || 'Sports'} • {user?.profile?.location || 'Location'}
                    </p>
                  </div>
                </button>
                
                <div className="mt-4 pt-4 border-t border-dark-light">
                  <div className="flex justify-between text-center">
                    <div>
                      <p className="text-lg font-semibold text-white">0</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">0</p>
                      <p className="text-xs text-gray-400">Connections</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">{posts.length}</p>
                      <p className="text-xs text-gray-400">Posts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Feed */}
          <div className="col-span-6 space-y-6">
            {/* Create Post */}
            <div className="bg-dark-lighter rounded-xl overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="flex items-center space-x-3">
                  <button onClick={handleCurrentUserProfileClick}>
                    <img
                      src={user?.profile?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'}
                      alt="Profile"
                      className="w-12 h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                    />
                  </button>
                  <textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="Share your sports journey..."
                    className="flex-1 bg-dark text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent"
                    rows={3}
                  />
                </div>

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {mediaFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Upload preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-dark-light p-4">
                <div className="flex items-center justify-between">
                  <div className="flex space-x-6">
                    <button
                      onClick={() => document.getElementById('desktop-media-upload')?.click()}
                      className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-sm">Photo</span>
                    </button>
                    <button
                      onClick={() => document.getElementById('desktop-media-upload')?.click()}
                      className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors"
                    >
                      <Video className="w-5 h-5" />
                      <span className="text-sm">Video</span>
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() && mediaFiles.length === 0}
                    className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post
                  </button>
                </div>
                <input
                  id="desktop-media-upload"
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={handleMediaUpload}
                />
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
              <AnimatePresence>
                {filteredPosts.map((post) => (
                  <FeedItem 
                    key={post.id}
                    post={{
                      id: post.id,
                      author: {
                        id: post.author_id,
                        name: post.author_name,
                        avatar: post.author_avatar || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
                        role: post.author_role
                      },
                      content: post.content,
                      likes: post.like_count || 0,
                      comments: post.comment_count || 0,
                      shares: 0,
                      timestamp: new Date(post.created_at)
                    }}
                    onRemovePost={handleRemovePost}
                    currentUserId={user?.id}
                  />
                ))}
              </AnimatePresence>
              {filteredPosts.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  {posts.length === 0 ? 'No posts yet. Create your first post!' : 'No posts match your filter'}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Restored SuggestedConnections */}
          <div className="col-span-3 space-y-6">
            {connections.length > 0 && (
              <SuggestedConnections connections={connections} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}