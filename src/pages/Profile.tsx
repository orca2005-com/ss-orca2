import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { EditableProfile } from '../components/profile/EditableProfile';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { MutualConnections } from '../components/profile/MutualConnections';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [mutualConnections, setMutualConnections] = useState([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);

  const isOwnProfile = user?.id === id;

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        navigate('/home');
        return;
      }

      try {
        setIsLoading(true);
        
        // Get profile data
        const profileData = await profileService.getProfile(id);
        setProfile(profileData);
        
        // Get achievements
        const achievementsData = await profileService.getAchievements(id);
        setAchievements(achievementsData);
        
        // Get connections
        const connectionsData = await profileService.getConnections(id);
        setConnections(connectionsData);
        
        // Get mutual connections if not own profile
        if (!isOwnProfile && user) {
          // This would be a real API call in production
          setMutualConnections([]);
        }
        
        setIsLoading(false);
        setIsEditing(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate, user, isOwnProfile]);

  const handleSaveProfile = async (updatedProfile: any) => {
    if (!isOwnProfile || !user) return;
    
    try {
      await profileService.updateProfile(user.id, updatedProfile);
      setProfile({ ...profile, ...updatedProfile });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleUpdateAchievements = async (achievements: string[]) => {
    if (!isOwnProfile || !user) return;
    
    try {
      // This would be a real API call in production
      setAchievements(achievements.map((title, index) => ({
        id: `temp-${index}`,
        title,
        user_id: user.id
      })));
    } catch (error) {
      console.error('Error updating achievements:', error);
    }
  };

  const handleUpdateCertifications = async (certifications: string[]) => {
    if (!isOwnProfile || !user) return;
    
    // This would be a real API call in production
    console.log('Updating certifications:', certifications);
  };

  const handleViewMutualConnection = (connectionId: string) => {
    navigate(`/profile/${connectionId}`);
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Profile Not Found</h1>
          <p className="text-gray-400 mb-6">The profile you're looking for doesn't exist.</p>
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

  // Format profile data for the EditableProfile component
  const formattedProfile = {
    id: profile.id,
    name: profile.full_name,
    role: profile.users?.role || 'player',
    avatar: profile.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    coverImage: profile.cover_image_url || 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
    sport: profile.sport || '',
    location: profile.location || '',
    bio: profile.bio || '',
    stats: {
      followers: 0,
      connections: connections.length || 0
    },
    externalLink: profile.website_url,
    isPrivate: profile.is_private || false
  };

  // Format posts for the ProfileTabs component
  const formattedPosts = posts.map(post => ({
    id: post.id,
    content: post.content,
    status: post.status,
    createdAt: new Date(post.created_at),
    updatedAt: new Date(post.updated_at)
  }));

  // Format achievements for the ProfileTabs component
  const formattedAchievements = achievements.map(achievement => achievement.title);

  // Format connections for the ProfileTabs component
  const formattedConnections = connections.map(connection => {
    const isRequester = connection.requester_id === profile.user_id;
    const otherUser = isRequester ? connection.addressee : connection.requester;
    
    return {
      id: isRequester ? connection.addressee_id : connection.requester_id,
      name: otherUser?.full_name || 'User',
      role: 'Connection',
      avatar: otherUser?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
    };
  });

  return (
    <div className="min-h-screen bg-dark pb-8">
      <EditableProfile 
        profile={formattedProfile} 
        onSave={handleSaveProfile}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        canEdit={isOwnProfile}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ProfileTabs
              isPrivate={profile.is_private}
              posts={formattedPosts}
              achievements={formattedAchievements}
              certifications={[]}
              connections={formattedConnections}
              userRole={profile.users?.role || 'player'}
              isEditing={isEditing && isOwnProfile}
              onUpdateAchievements={isOwnProfile ? handleUpdateAchievements : undefined}
              onUpdateCertifications={isOwnProfile ? handleUpdateCertifications : undefined}
            />
          </div>
          <div className="lg:col-span-1 space-y-4">
            {!isOwnProfile && mutualConnections.length > 0 && (
              <MutualConnections
                connections={mutualConnections}
                onViewProfile={handleViewMutualConnection}
              />
            )}
            {isOwnProfile && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors ml-auto"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}