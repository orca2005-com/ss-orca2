import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { EditableProfile } from '../components/profile/EditableProfile';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { MutualConnections } from '../components/profile/MutualConnections';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useSupabaseData';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { profile, isLoading, error } = useProfile(id || '');
  const [isEditing, setIsEditing] = useState(false);
  const [mutualConnections, setMutualConnections] = useState([]);
  
  const isOwnProfile = user?.id === id;

  const handleSaveProfile = async (updatedProfile: any) => {
    if (!isOwnProfile) return;
    
    try {
      // Update profile in Supabase
      await user?.updateProfile(updatedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleUpdateAchievements = (achievements: string[]) => {
    if (!isOwnProfile || !profile) return;
    
    handleSaveProfile({
      ...profile,
      achievements
    });
  };

  const handleUpdateCertifications = (certifications: string[]) => {
    if (!isOwnProfile || !profile) return;
    
    handleSaveProfile({
      ...profile,
      certifications
    });
  };

  const handleUpdatePosts = (posts: any[]) => {
    if (!isOwnProfile || !profile) return;
    
    // In a real app, you'd delete the post from the database
    console.log('Updating posts:', posts);
  };

  const handleViewMutualConnection = (connectionId: string) => {
    navigate(`/profile/${connectionId}`);
  };

  const handleLogout = () => {
    logout();
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

  if (error || !profile) {
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

  return (
    <div className="min-h-screen bg-dark pb-8 mobile-optimized">
      <EditableProfile 
        profile={profile} 
        onSave={handleSaveProfile}
        isEditing={isEditing}
        onEditingChange={setIsEditing}
        canEdit={isOwnProfile}
      />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <ProfileTabs
              isPrivate={profile.isPrivate}
              posts={profile.posts}
              achievements={profile.achievements}
              certifications={profile.certifications || []}
              followers={profile.followers || []}
              following={profile.following || []}
              userRole={profile.role}
              profileId={profile.id}
              isEditing={isEditing && isOwnProfile}
              onUpdateAchievements={isOwnProfile ? handleUpdateAchievements : undefined}
              onUpdateCertifications={isOwnProfile ? handleUpdateCertifications : undefined}
              onUpdatePosts={isOwnProfile ? handleUpdatePosts : undefined}
            />
          </div>
          <div className="lg:col-span-1 space-y-4">
            {!isOwnProfile && (
              <MutualConnections
                connections={mutualConnections}
                onViewProfile={handleViewMutualConnection}
              />
            )}
            {isOwnProfile && (
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm border border-red-500 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors ml-auto ultra-touch"
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