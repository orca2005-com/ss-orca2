import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { UserListItem } from '../components/ui/UserListItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { Input } from '../components/ui/Input';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function FollowingList() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [following, setFollowing] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileName, setProfileName] = useState('');

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        navigate('/home');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get user profile to display name
        const userData = await db.getUser(id);
        setProfileName(userData.full_name);
        
        // Get following
        const followingData = await db.getFollowing(id);
        setFollowing(followingData);
      } catch (err: any) {
        console.error('Error loading following:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const filteredFollowing = following.filter(followedUser =>
    followedUser.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    followedUser.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading following...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <UserPlus className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Error Loading Following</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => navigate('/home')}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
            >
              Go Home
            </button>
          </div>
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
            <h1 className="text-2xl font-bold text-white">{profileName}'s Following</h1>
            <p className="text-gray-400">{following.length} following</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-dark-lighter rounded-xl p-4">
          <Input
            icon={Search}
            placeholder="Search following..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="md"
          />
        </div>

        {/* Following List */}
        <div className="bg-dark-lighter rounded-xl p-4 md:p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-blue-400/20 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Following</h2>
              <p className="text-sm text-gray-400">
                {filteredFollowing.length} of {following.length} following
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {filteredFollowing.length > 0 ? (
              filteredFollowing.map((followedUser, index) => (
                <motion.div
                  key={followedUser.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <UserListItem
                    user={{
                      id: followedUser.id,
                      name: followedUser.full_name,
                      role: followedUser.role,
                      avatar: followedUser.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
                    }}
                    index={index}
                    hoverColor="blue"
                  />
                </motion.div>
              ))
            ) : searchQuery ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">No following found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-2">Not following anyone yet</p>
                <p className="text-gray-500 text-sm">Start following other athletes and coaches</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}