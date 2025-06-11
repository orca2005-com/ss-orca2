import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image, Trophy, Users, Plus, X, ChevronRight, Award, Sparkles, TrendingUp } from 'lucide-react';
import { MediaGrid } from '../ui/MediaGrid';

interface ProfileTabsProps {
  isPrivate?: boolean;
  posts: any[];
  achievements: string[];
  connections: any[];
  certifications?: string[];
  isEditing?: boolean;
  onUpdateAchievements?: (achievements: string[]) => void;
  onUpdatePosts?: (posts: any[]) => void;
  onUpdateCertifications?: (certifications: string[]) => void;
  userRole?: 'player' | 'team' | 'coach';
}

const containerAnimation = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.95, opacity: 0 },
  transition: { type: "spring", stiffness: 300, damping: 30 }
};

export function ProfileTabs({
  isPrivate = false,
  posts,
  achievements,
  connections,
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
  const [showAllConnections, setShowAllConnections] = useState(false);
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
  const visibleConnections = showAllConnections ? connections : connections.slice(0, 3);
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

  baseTabs.push({ 
    name: 'Connections', 
    icon: <Users className="w-4 h-4 md:w-5 md:h-5" />,
    color: 'text-green-400',
    count: connections.length
  });

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
            {/* Posts Tab - Enhanced */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <motion.div {...containerAnimation}>
                <div className="space-y-4 md:space-y-6">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-400/20 rounded-xl flex items-center justify-center">
                      <Image className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Posts & Media</h3>
                      <p className="text-sm text-gray-400">{posts.length} posts shared</p>
                    </div>
                  </div>

                  {visiblePosts.length > 0 ? (
                    visiblePosts.map((post) => {
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
                    })
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Image className="w-8 h-8 text-blue-400" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No posts yet</p>
                      <p className="text-gray-500 text-sm">Share your first post to get started</p>
                    </div>
                  )}

                  {posts.length > 2 && (
                    <motion.button
                      onClick={() => setShowAllPosts(!showAllPosts)}
                      className="flex items-center justify-center space-x-2 w-full py-3 text-accent hover:text-accent-light transition-colors font-medium bg-accent/10 hover:bg-accent/20 rounded-xl"
                    >
                      <span>{showAllPosts ? 'Show Less' : `Show All ${posts.length} Posts`}</span>
                      <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllPosts ? 'rotate-90' : ''}`} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </Tab.Panel>

            {/* Achievements Tab - Enhanced */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <motion.div {...containerAnimation}>
                <div className="space-y-4 md:space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">Achievements</h3>
                        <p className="text-sm text-gray-400">{achievements.length} accomplishments</p>
                      </div>
                    </div>
                    {achievements.length > 0 && (
                      <div className="flex items-center space-x-2 text-yellow-400">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">Verified</span>
                      </div>
                    )}
                  </div>

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

                  {visibleAchievements.length > 0 ? (
                    <div className="space-y-3">
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
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Trophy className="w-8 h-8 text-yellow-400" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No achievements yet</p>
                      <p className="text-gray-500 text-sm">Add your accomplishments to showcase your success</p>
                    </div>
                  )}

                  {achievements.length > 3 && (
                    <motion.button
                      onClick={() => setShowAllAchievements(!showAllAchievements)}
                      className="flex items-center justify-center space-x-2 w-full py-3 text-yellow-400 hover:text-yellow-300 transition-colors font-medium bg-yellow-400/10 hover:bg-yellow-400/20 rounded-xl"
                    >
                      <span>{showAllAchievements ? 'Show Less' : `Show All ${achievements.length} Achievements`}</span>
                      <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllAchievements ? 'rotate-90' : ''}`} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </Tab.Panel>

            {/* Certifications Tab (Only for Coaches) - Enhanced */}
            {userRole === 'coach' && (
              <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
                <motion.div {...containerAnimation}>
                  <div className="space-y-4 md:space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-400/20 rounded-xl flex items-center justify-center">
                          <Award className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Professional Certifications</h3>
                          <p className="text-sm text-gray-400">{certifications.length} credentials</p>
                        </div>
                      </div>
                      {certifications.length > 0 && (
                        <div className="flex items-center space-x-2 text-purple-400">
                          <TrendingUp className="w-4 h-4" />
                          <span className="text-sm font-medium">Certified</span>
                        </div>
                      )}
                    </div>

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
                    
                    {visibleCertifications.length > 0 ? (
                      <div className="space-y-3">
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
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-purple-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-purple-400" />
                        </div>
                        <p className="text-gray-400 text-lg font-medium">No certifications added</p>
                        <p className="text-gray-500 text-sm">Showcase your professional credentials</p>
                      </div>
                    )}
                    
                    {certifications.length > 3 && (
                      <motion.button
                        onClick={() => setShowAllCertifications(!showAllCertifications)}
                        className="flex items-center justify-center space-x-2 w-full py-3 text-purple-400 hover:text-purple-300 transition-colors font-medium bg-purple-400/10 hover:bg-purple-400/20 rounded-xl"
                      >
                        <span>{showAllCertifications ? 'Show Less' : `Show All ${certifications.length} Certifications`}</span>
                        <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllCertifications ? 'rotate-90' : ''}`} />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </Tab.Panel>
            )}

            {/* Connections Tab - Enhanced */}
            <Tab.Panel className="rounded-2xl bg-dark-lighter/60 backdrop-blur-xl p-4 md:p-6 border border-white/10">
              <motion.div {...containerAnimation}>
                <div className="space-y-4 md:space-y-6">
                  {/* Header */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Network</h3>
                      <p className="text-sm text-gray-400">{connections.length} connections</p>
                    </div>
                  </div>

                  {visibleConnections.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {visibleConnections.map((connection) => (
                        <motion.div
                          key={connection.id}
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.95, opacity: 0 }}
                          whileHover={{ scale: 1.02 }}
                          className="flex items-center space-x-4 bg-dark/50 rounded-xl p-4 border border-white/5 hover:border-green-400/30 transition-all cursor-pointer group"
                        >
                          <div className="relative">
                            <img 
                              src={connection.avatar} 
                              alt="" 
                              className="w-12 h-12 rounded-xl object-cover border-2 border-white/10 group-hover:border-green-400/50 transition-colors" 
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-dark-lighter" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-white group-hover:text-green-400 transition-colors truncate">{connection.name}</p>
                            <p className="text-sm text-gray-400">{connection.role}</p>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="w-5 h-5 text-green-400" />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-400/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-green-400" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">No connections yet</p>
                      <p className="text-gray-500 text-sm">Start connecting with other athletes and coaches</p>
                    </div>
                  )}

                  {connections.length > 3 && (
                    <motion.button
                      onClick={() => setShowAllConnections(!showAllConnections)}
                      className="flex items-center justify-center space-x-2 w-full py-3 text-green-400 hover:text-green-300 transition-colors font-medium bg-green-400/10 hover:bg-green-400/20 rounded-xl"
                    >
                      <span>{showAllConnections ? 'Show Less' : `Show All ${connections.length} Connections`}</span>
                      <ChevronRight className={`w-4 h-4 transform transition-transform ${showAllConnections ? 'rotate-90' : ''}`} />
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </Tab.Panel>
          </AnimatePresence>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}