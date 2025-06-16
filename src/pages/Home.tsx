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

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<typeof mockPosts>([]);
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
                src="https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg"
                alt="Profile"
                className="w-full h-full rounded-full object-cover border-2 border-dark-light cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-semibold text-white hover:text-accent transition-colors text-sm md:text-base truncate">{user?.name || 'Current User'}</h3>
              <p className="text-xs text-gray-400">{user?.role || 'Professional Athlete'}</p>
            </div>
            <div className="flex space-x-4 text-center flex-shrink-0">
              <div>
                <p className="text-sm font-semibold text-white">8.5k</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">2.1k</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>
          </button>
        </div>

        {/* Mobile-optimized Create Post */}
        <div className="card-mobile mb-4">
          <div className="space-y-4">
            <textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="What's on your mind?"
              className="w-full bg-dark text-white placeholder-gray-400 rounded-lg px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent ultra-touch border border-dark-light"
              rows={3}
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
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
                >
                  <ImageIcon className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Photo</span>
                </button>
                <button
                  onClick={() => document.getElementById('media-upload')?.click()}
                  className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors ultra-touch"
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm hidden sm:inline">Video</span>
                </button>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={!newPost.content.trim() && mediaFiles.length === 0}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch text-sm font-medium"
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
              {removedPosts.size > 0 ? 'No more posts to show' : 'No posts to show'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}