import React, { useState, useEffect, useRef } from 'react';
import { Filter, Image as ImageIcon, Send, X, Video, Plus, ChevronDown } from 'lucide-react';
import { FeedItem } from '../components/feed/FeedItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { mockProfiles } from '../data/mockProfiles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const mockPosts = [
  {
    id: '1',
    author: {
      id: '1',
      name: mockProfiles['1'].name,
      avatar: mockProfiles['1'].avatar,
      role: mockProfiles['1'].role
    },
    content: 'Just finished an amazing training session! Working on improving my game every day. 💪',
    media: [
      {
        url: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
        type: 'image' as const
      },
      {
        url: 'https://images.pexels.com/photos/3076514/pexels-photo-3076514.jpeg',
        type: 'image' as const
      },
    ],
    likes: 42,
    comments: 8,
    shares: 3,
    timestamp: new Date(),
  },
  {
    id: '2',
    author: {
      id: '2',
      name: mockProfiles['2'].name,
      avatar: mockProfiles['2'].avatar,
      role: mockProfiles['2'].role
    },
    content: 'Big win today! Thanks to all our supporters who came out to cheer us on! 🏆',
    likes: 128,
    comments: 24,
    shares: 12,
    timestamp: new Date(),
  },
  {
    id: '3',
    author: {
      id: '3',
      name: mockProfiles['3'].name,
      avatar: mockProfiles['3'].avatar,
      role: mockProfiles['3'].role
    },
    content: 'Another successful training camp completed! Proud of everyone\'s progress. 🎾',
    likes: 89,
    comments: 15,
    shares: 7,
    timestamp: new Date(),
  },
  {
    id: '4',
    author: {
      id: '4',
      name: mockProfiles['4'].name,
      avatar: mockProfiles['4'].avatar,
      role: mockProfiles['4'].role
    },
    content: 'Training hard for the upcoming season! ⚽ The dedication is paying off.',
    likes: 67,
    comments: 12,
    shares: 5,
    timestamp: new Date(),
  },
  {
    id: '5',
    author: {
      id: 'nutritionist1',
      name: 'Dr. Emma Wilson',
      avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg',
      role: 'Sports Nutritionist'
    },
    content: 'Proper nutrition is key to peak performance! Here are my top 5 pre-workout meal tips for athletes. 🥗',
    likes: 156,
    comments: 32,
    shares: 18,
    timestamp: new Date(),
  },
  {
    id: '6',
    author: {
      id: 'physio1',
      name: 'Mark Thompson',
      avatar: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg',
      role: 'Physiotherapist'
    },
    content: 'Recovery is just as important as training! Remember to listen to your body and take rest days when needed. 💪',
    likes: 98,
    comments: 21,
    shares: 9,
    timestamp: new Date(),
  },
];

const suggestedConnections = [
  {
    id: '3',
    name: 'Sarah Johnson',
    role: 'Coach',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    mutualConnections: 15,
  },
  {
    id: '4',
    name: 'Mike Rodriguez',
    role: 'Player',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
    mutualConnections: 8,
  },
  {
    id: '5',
    name: 'Thunder Basketball Club',
    role: 'Team',
    avatar: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    mutualConnections: 12,
  },
  {
    id: '6',
    name: 'Coach Martinez',
    role: 'Coach',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    mutualConnections: 6,
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<typeof mockPosts>([]);
  const [connections, setConnections] = useState<typeof suggestedConnections>([]);
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
    
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setPosts(mockPosts);
      setConnections(suggestedConnections);
      setIsLoading(false);
    };

    loadData();
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

  const handleConnect = async (connectionId: string) => {
    if (connectedUsers.has(connectionId) || connectingUsers.has(connectionId)) return;

    setConnectingUsers(prev => new Set([...prev, connectionId]));

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setConnectedUsers(prev => new Set([...prev, connectionId]));
    setConnectingUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(connectionId);
      return newSet;
    });

    // Remove from suggestions after connecting
    setTimeout(() => {
      setConnections(prev => prev.filter(conn => conn.id !== connectionId));
    }, 2000);
  };

  const handleSeeMoreConnections = () => {
    navigate('/search');
  };

  const handleCreatePost = () => {
    if (!newPost.content.trim() && mediaFiles.length === 0) return;

    if (lastPostTime) {
      const timeDiff = Date.now() - lastPostTime.getTime();
      const minutesDiff = timeDiff / (1000 * 60);
      if (minutesDiff < 30) {
        alert(`Please wait ${Math.ceil(30 - minutesDiff)} minutes before posting again.`);
        return;
      }
    }

    const post = {
      id: Date.now().toString(),
      author: {
        id: user?.id || '1',
        name: user?.name || 'Current User',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
        role: user?.role || 'player',
      },
      content: newPost.content,
      media: mediaFiles.map(file => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' as const : 'image' as const
      })),
      likes: 0,
      comments: 0,
      shares: 0,
      timestamp: new Date(),
    };

    setPosts([post, ...posts]);
    setNewPost({ content: '', media: [] });
    setMediaFiles([]);
    setLastPostTime(new Date());
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
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-dark-light cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              />
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-sm md:text-base font-semibold text-white hover:text-accent transition-colors">{user?.name || 'Current User'}</h3>
              <p className="text-xs text-gray-400">{user?.role || 'Professional Athlete'}</p>
            </div>
            <div className="flex space-x-3 text-center">
              <div>
                <p className="text-sm font-semibold text-white">8.5k</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">2.1k</p>
                <p className="text-xs text-gray-400">Connections</p>
              </div>
            </div>
          </button>
        </div>

        {/* Compact Suggested Connections - Mobile Only */}
        {connections.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-lighter rounded-xl p-3"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Suggested for you</h3>
              <span className="text-xs text-gray-400 bg-dark px-2 py-1 rounded-full">
                {connections.length}
              </span>
            </div>
            
            <div className="flex space-x-2 overflow-x-auto pb-1">
              {connections.slice(0, 4).map((connection, index) => (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex-shrink-0 bg-dark rounded-lg p-2 w-24"
                >
                  <div className="text-center">
                    <button
                      onClick={() => navigate(`/profile/${connection.id}`)}
                      className="block mx-auto mb-2 hover:scale-105 transition-transform"
                    >
                      <img
                        src={connection.avatar}
                        alt={connection.name}
                        className="w-10 h-10 rounded-full object-cover border border-dark-light hover:border-accent transition-colors"
                      />
                    </button>
                    <h4 className="text-xs font-medium text-white truncate mb-1">{connection.name.split(' ')[0]}</h4>
                    <p className="text-xs text-gray-400 truncate mb-2">{connection.role}</p>
                    
                    {connectedUsers.has(connection.id) ? (
                      <div className="w-full bg-green-500/20 text-green-400 text-xs py-1 rounded-md font-medium border border-green-500/30">
                        Connected
                      </div>
                    ) : connectingUsers.has(connection.id) ? (
                      <div className="w-full bg-accent/20 text-accent text-xs py-1 rounded-md font-medium flex items-center justify-center">
                        <div className="w-2.5 h-2.5 border border-accent border-t-transparent rounded-full animate-spin mr-1" />
                        <span>...</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleConnect(connection.id)}
                        className="w-full bg-accent text-white text-xs py-1 rounded-md hover:bg-accent-dark transition-colors font-medium"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              
              {/* See More Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * Math.min(connections.length, 4) }}
                className="flex-shrink-0 bg-dark rounded-lg p-2 w-24"
              >
                <div className="text-center h-full flex flex-col justify-center">
                  <button
                    onClick={handleSeeMoreConnections}
                    className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-2 hover:bg-accent/30 transition-colors"
                  >
                    <Plus className="w-4 h-4 text-accent" />
                  </button>
                  <button 
                    onClick={handleSeeMoreConnections}
                    className="text-xs text-accent font-medium hover:text-accent-light transition-colors"
                  >
                    See More
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Create Post */}
        <div className="bg-dark-lighter rounded-xl overflow-hidden">
          <div className="p-4 space-y-4">
            <div className="flex items-center space-x-3">
              <button onClick={handleCurrentUserProfileClick}>
                <img
                  src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
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
                post={post} 
                onRemovePost={handleRemovePost}
                currentUserId={user?.id}
              />
            ))}
          </AnimatePresence>
          {filteredPosts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {removedPosts.size > 0 ? 'No more posts to show' : 'No posts to show'}
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
                      src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
                      alt="Profile"
                      className="w-20 h-20 rounded-full border-4 border-dark-lighter object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                    />
                    <h3 className="mt-3 text-lg font-semibold text-white hover:text-accent transition-colors">{user?.name || 'Current User'}</h3>
                    <p className="text-sm text-gray-400">{user?.role || 'Professional Athlete'}</p>
                    <p className="text-xs text-gray-500 mt-1 text-center">Basketball • New York, USA</p>
                  </div>
                </button>
                
                <div className="mt-4 pt-4 border-t border-dark-light">
                  <div className="flex justify-between text-center">
                    <div>
                      <p className="text-lg font-semibold text-white">8.5k</p>
                      <p className="text-xs text-gray-400">Followers</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">2.1k</p>
                      <p className="text-xs text-gray-400">Connections</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-white">156</p>
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
                      src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
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

            {/* Feed Filter */}
            <div className="bg-dark-lighter rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Latest Updates</h2>
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              
              <div className="space-y-3">
                <select
                  value={selectedRole === 'all' && !customRole ? 'all' : selectedRole}
                  onChange={(e) => handleRoleFilterChange(e.target.value)}
                  className="bg-dark text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="all">All Posts</option>
                  <option value="player">Players</option>
                  <option value="team">Teams</option>
                  <option value="coach">Coaches</option>
                  <option value="other">Other (Custom)</option>
                </select>

                {showCustomInput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={customRole}
                        onChange={(e) => setCustomRole(e.target.value)}
                        placeholder="Enter role (e.g., nutritionist, physiotherapist)"
                        className="flex-1 px-3 py-2 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400 text-sm"
                        onKeyPress={(e) => e.key === 'Enter' && handleCustomRoleSubmit()}
                      />
                      <button
                        onClick={handleCustomRoleSubmit}
                        disabled={!customRole.trim()}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 text-sm"
                      >
                        Apply
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {['nutritionist', 'physiotherapist', 'psychologist', 'journalist', 'agent', 'trainer'].map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setCustomRole(role);
                            setSelectedRole(role);
                            setShowCustomInput(false);
                          }}
                          className="px-3 py-1 text-xs bg-dark border border-dark-light rounded text-gray-300 hover:border-accent hover:text-accent transition-colors"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {selectedRole !== 'all' && selectedRole !== 'player' && selectedRole !== 'team' && selectedRole !== 'coach' && (
                  <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg">
                    <span className="text-sm text-accent font-medium">Filtering by: {selectedRole}</span>
                    <button
                      onClick={clearCustomFilter}
                      className="text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-6">
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
                  {removedPosts.size > 0 ? 'No more posts to show' : 'No posts to show'}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Removed SuggestedConnections component */}
          <div className="col-span-3 space-y-6">
            {/* Empty for now - can add other widgets here */}
          </div>
        </div>
      </div>
    </div>
  );
}