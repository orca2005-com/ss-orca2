import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserListItem } from '../components/ui/UserListItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { Input } from '../components/ui/Input';
import { mockProfiles } from '../data/mockProfiles';

export default function FollowersList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(mockProfiles[id || '']);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !mockProfiles[id]) {
        navigate('/home');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));
      setProfile(mockProfiles[id]);
      setIsLoading(false);
    };

    loadData();
  }, [id, navigate]);

  const filteredFollowers = profile?.followers?.filter(follower =>
    follower.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    follower.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading followers...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-4 md:py-8 pb-24 md:pb-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/profile/${id}`)}
            className="p-2 text-gray-400 hover:text-white transition-colors ultra-touch"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{profile.name}'s Followers</h1>
            <p className="text-gray-400">{profile.followers?.length || 0} followers</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-dark-lighter rounded-xl p-4">
          <Input
            icon={Search}
            placeholder="Search followers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
          />
        </div>

        {/* Followers List */}
        <div className="bg-dark-lighter rounded-xl p-4 md:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-green-400/20 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Followers</h2>
              <p className="text-sm text-gray-400">
                {filteredFollowers.length} of {profile.followers?.length || 0} followers
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFollowers.length > 0 ? (
              filteredFollowers.map((follower, index) => (
                <motion.div
                  key={follower.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <UserListItem
                    user={follower}
                    index={index}
                    hoverColor="green"
                  />
                </motion.div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No followers found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No followers yet</p>
                <p className="text-gray-500 text-sm">Start connecting with other athletes and coaches</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}