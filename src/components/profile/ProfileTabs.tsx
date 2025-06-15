import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Trophy, Users, Plus, X, Award, UserPlus } from 'lucide-react';
import { MediaGrid } from '../ui/MediaGrid';
import { TabSection } from '../ui/TabSection';
import { UserListItem } from '../ui/UserListItem';

interface ProfileTabsProps {
  isPrivate?: boolean;
  posts: any[];
  achievements: string[];
  followers: any[];
  following: any[];
  certifications?: string[];
  isEditing?: boolean;
  onUpdateAchievements?: (achievements: string[]) => void;
  onUpdatePosts?: (posts: any[]) => void;
  onUpdateCertifications?: (certifications: string[]) => void;
  userRole?: 'player' | 'team' | 'coach';
}

export function ProfileTabs({
  isPrivate = false,
  posts,
  achievements,
  followers,
  following,
  certifications = [],
  isEditing = false,
  onUpdateAchievements,
  onUpdatePosts,
  onUpdateCertifications,
  userRole = 'player'
}: ProfileTabsProps) {
  const [newAchievement, setNewAchievement] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [showAllPosts, setShowAllPosts] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);
  const [showAllFollowers, setShowAllFollowers] = useState(false);
  const [showAllFollowing, setShowAllFollowing] = useState(false);
  const [showAllCertifications, setShowAllCertifications] = useState(false);

  const handleAddAchievement = () => {
    if (newAchievement.trim() && onUpdateAchievements) {
      onUpdateAchievements([...achievements, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    if (onUpdateAchievements) {
      onUpdateAchievements(achievements.filter((_, i) => i !== index));
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim() && onUpdateCertifications) {
      onUpdateCertifications([...certifications, newCertification.trim()]);
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    if (onUpdateCertifications) {
      onUpdateCertifications(certifications.filter((_, i) => i !== index));
    }
  };

  const handleRemovePost = (id: string) => {
    if (onUpdatePosts) {
      onUpdatePosts(posts.filter(post => post.id !== id));
    }
  };

  const visiblePosts = showAllPosts ? posts : posts.slice(0, 2);
  const visibleAchievements = showAllAchievements ? achievements : achievements.slice(0, 3);
  const visibleFollowers = showAllFollowers ? followers : followers.slice(0, 3);
  const visibleFollowing = showAllFollowing ? following : following.slice(0, 3);
  const visibleCertifications = showAllCertifications ? certifications : certifications.slice(0, 3);

  // Convert posts to media format for MediaGrid
  const getPostMedia = (post: any) => {
    if (!post.media || post.media.length === 0) return [];
    
    return post.media.map((media: any, index: number) => ({
      id: `${post.id}-${index}`,
      url: media.url || media,
      type: media.type || 'image',
      title: `${post.content?.slice(0, 50)}...` || 'Post media'
    }));
  };

  // Define tabs based on user role - Enhanced with icons and colors
  const baseTabs = [
    { 
      name: 'Posts', 
      icon: <Image className="w-4 h-4 md:w-5 md:h-5" />,
      color: 'text-blue-400',
      count: posts.length
    },
    { 
      name: 'Achievements', 
      icon: <Trophy className="w-4 h-4 md:w-5 md:h-5" />,
      color: 'text-yellow-400',
      count: achievements.length
    },
  ];

  // Add certifications tab for coaches
  if (userRole === 'coach') {
    baseTabs.push({ 
      name: 'Certifications', 
      icon: <Award className="w-4 h-4 md:w-5 md:h-5" />,
      color: 'text-purple-400',
      count: certifications.length
    });
  }

  // Add followers and following tabs
  baseTabs.push(
    { 
      name: 'Followers', 
      icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
      color: 'text-green-400',
      count: followers.length
    },
    { 
      name: 'Following', 
      icon: <UserPlus className="w-4 h-4 md:w-5 md:h-5" />,
      color: 'text-blue-400',
      count: following.length
    }
  );

  const tabs = baseTabs;

  return (
    <div className="space-y-6">
      <Tab.Group>
        {/* Enhanced Tab List with Glassmorphism */}
        <Tab.List className="flex space-x-1 rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-2 border border-white/10 overflow-x-auto">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                `flex-shrink-0 rounded-xl py-3 px-4 md:py-3 md:px-6 text-xs md:text-sm font-medium leading-5 transition-all duration-300 relative overflow-hidden group
                ${selected
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ selected }) => (
                <div className="flex items-center justify-center space-x-2 md:space-x-3 relative z-10">
                  <div className={`transition-colors duration-300 ${selected ? 'text-white' : tab.color}`}>
                    {tab.icon}
                  </div>
                  <span className="whitespace-nowrap font-semibold">{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-bold transition-colors duration-300 ${
                      selected 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                  {selected && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-accent to-accent-light rounded-xl -z-10"
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              )}
            </Tab>
          ))}
        </Tab.List>

        {/* Enhanced Tab Panels */}
        <Tab.Panels className="mt-6">
          <AnimatePresence mode="wait">
            {/* Posts Tab */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <TabSection
                icon={Image}
                title="Posts & Media"
                subtitle={`${posts.length} posts shared`}
                iconColor="blue"
                emptyState={{
                  icon: Image,
                  title: "No posts yet",
                  subtitle: "Share your first post to get started"
                }}
                showAllButton={posts.length > 2 ? {
                  totalCount: posts.length,
                  isExpanded: showAllPosts,
                  onToggle: () => setShowAllPosts(!showAllPosts),
                  itemName: "Posts"
                } : undefined}
              >
                {visiblePosts.map((post) => {
                  const mediaItems = getPostMedia(post);
                  
                  return (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-dark/50 rounded-xl p-4 md:p-6 relative space-y-4 border border-white/5 hover:border-white/10 transition-colors group"
                    >
                      <p className="text-gray-200 text-sm md:text-base leading-relaxed">{post.content}</p>
                      
                      {mediaItems.length > 0 && (
                        <MediaGrid 
                          media={mediaItems}
                          maxItems={4}
                          showViewAll={true}
                        />
                      )}
                      
                      {isEditing && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemovePost(post.id)}
                          className="absolute top-3 right-3 p-2 bg-red-500/20 rounded-lg text-red-400 hover:bg-red-500/30 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      )}
                    </motion.div>
                  );
                })}
              </TabSection>
            </Tab.Panel>

            {/* Achievements Tab */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <TabSection
                icon={Trophy}
                title="Achievements"
                subtitle={`${achievements.length} accomplishments`}
                iconColor="yellow"
                emptyState={{
                  icon: Trophy,
                  title: "No achievements yet",
                  subtitle: "Add your accomplishments to showcase your success"
                }}
                showAllButton={achievements.length > 3 ? {
                  totalCount: achievements.length,
                  isExpanded: showAllAchievements,
                  onToggle: () => setShowAllAchievements(!showAllAchievements),
                  itemName: "Achievements"
                } : undefined}
              >
                {isEditing && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="space-y-3 p-4 bg-dark/30 rounded-xl border border-white/10"
                  >
                    <input
                      type="text"
                      value={newAchievement}
                      onChange={(e) => setNewAchievement(e.target.value)}
                      placeholder="Add new achievement..."
                      className="w-full bg-dark/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddAchievement}
                      className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors font-medium flex items-center justify-center space-x-2"
                    >
                      <Plus className="w-5 h-5" />
                      <span>Add Achievement</span>
                    </motion.button>
                  </motion.div>
                )}

                {visibleAchievements.map((achievement, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="group flex items-start space-x-4 bg-dark/50 rounded-xl p-4 border border-white/5 hover:border-yellow-400/30 transition-colors"
                  >
                    <div className="w-8 h-8 bg-yellow-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 leading-relaxed">{achievement}</p>
                    </div>
                    {isEditing && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveAchievement(index)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </motion.button>
                    )}
                  </motion.div>
                ))}
              </TabSection>
            </Tab.Panel>

            {/* Certifications Tab (Only for Coaches) */}
            {userRole === 'coach' && (
              <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
                <TabSection
                  icon={Award}
                  title="Professional Certifications"
                  subtitle={`${certifications.length} credentials`}
                  iconColor="purple"
                  emptyState={{
                    icon: Award,
                    title: "No certifications added",
                    subtitle: "Showcase your professional credentials"
                  }}
                  showAllButton={certifications.length > 3 ? {
                    totalCount: certifications.length,
                    isExpanded: showAllCertifications,
                    onToggle: () => setShowAllCertifications(!showAllCertifications),
                    itemName: "Certifications"
                  } : undefined}
                >
                  {isEditing && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-3 p-4 bg-dark/30 rounded-xl border border-white/10"
                    >
                      <input
                        type="text"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        placeholder="Add new certification..."
                        className="w-full bg-dark/50 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddCertification}
                        className="w-full px-4 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add Certification</span>
                      </motion.button>
                    </motion.div>
                  )}
                  
                  {visibleCertifications.map((certification, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="group bg-dark/50 rounded-xl p-4 border border-white/5 hover:border-purple-400/30 transition-colors"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-purple-400/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Award className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 leading-relaxed break-words">{certification}</p>
                        </div>
                        {isEditing && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleRemoveCertification(index)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </TabSection>
              </Tab.Panel>
            )}

            {/* Followers Tab */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <TabSection
                icon={Users}
                title="Followers"
                subtitle={`${followers.length} followers`}
                iconColor="green"
                emptyState={{
                  icon: Users,
                  title: "No followers yet",
                  subtitle: "Start connecting with other athletes and coaches"
                }}
                showAllButton={followers.length > 3 ? {
                  totalCount: followers.length,
                  isExpanded: showAllFollowers,
                  onToggle: () => setShowAllFollowers(!showAllFollowers),
                  itemName: "Followers"
                } : undefined}
              >
                {visibleFollowers.map((follower, index) => (
                  <UserListItem
                    key={follower.id}
                    user={follower}
                    index={index}
                    hoverColor="green"
                  />
                ))}
              </TabSection>
            </Tab.Panel>

            {/* Following Tab */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <TabSection
                icon={UserPlus}
                title="Following"
                subtitle={`${following.length} following`}
                iconColor="blue"
                emptyState={{
                  icon: UserPlus,
                  title: "Not following anyone yet",
                  subtitle: "Start following other athletes and coaches"
                }}
                showAllButton={following.length > 3 ? {
                  totalCount: following.length,
                  isExpanded: showAllFollowing,
                  onToggle: () => setShowAllFollowing(!showAllFollowing),
                  itemName: "Following"
                } : undefined}
              >
                {visibleFollowing.map((followingUser, index) => (
                  <UserListItem
                    key={followingUser.id}
                    user={followingUser}
                    index={index}
                    hoverColor="blue"
                  />
                ))}
              </TabSection>
            </Tab.Panel>
          </AnimatePresence>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}