import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Camera, MapPin, Link as LinkIcon, Share2, Star, Award, Users, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../../types';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Input';
import { FollowButton } from '../ui/FollowButton';
import { StatsDisplay } from '../ui/StatsDisplay';
import { OptimizedImage } from '../ui/OptimizedImage';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';

interface EditableProfileProps {
  profile: Profile;
  onSave: (updatedProfile: any) => void;
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
  canEdit: boolean;
}

export function EditableProfile({ profile, onSave, isEditing, onEditingChange, canEdit }: EditableProfileProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(profile);
  const [newAvatar, setNewAvatar] = useState<File | null>(null);
  const [newCoverImage, setNewCoverImage] = useState<File | null>(null);
  const [isHoveringCover, setIsHoveringCover] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareButtonRef = useRef<HTMLButtonElement>(null);

  const { getRootProps: getAvatarProps, getInputProps: getAvatarInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setNewAvatar(acceptedFiles[0]),
    disabled: !isEditing
  });

  const { getRootProps: getCoverProps, getInputProps: getCoverInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => setNewCoverImage(acceptedFiles[0]),
    disabled: !isEditing
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.value.slice(0, 150);
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSave = () => {
    onSave({
      ...formData,
      avatar: newAvatar ? URL.createObjectURL(newAvatar) : formData.avatar,
      coverImage: newCoverImage ? URL.createObjectURL(newCoverImage) : formData.coverImage,
    });
  };

  const handleCancel = () => {
    setFormData(profile);
    setNewAvatar(null);
    setNewCoverImage(null);
    onEditingChange(false);
  };

  // Enhanced Share Functionality for Profiles
  const handleShare = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'copy' | 'native') => {
    const profileUrl = window.location.href;
    const shareText = `Check out ${profile.name}'s profile on SportSYNC! ${profile.role} specializing in ${profile.sport}.`;
    
    try {
      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`, '_blank', 'width=600,height=400');
          break;
        case 'copy':
          await navigator.clipboard.writeText(profileUrl);
          alert('Profile link copied to clipboard!');
          break;
        case 'native':
          if (navigator.share) {
            await navigator.share({
              title: `${profile.name} - SportSYNC Profile`,
              text: shareText,
              url: profileUrl
            });
          }
          break;
      }
      
      setShowShareOptions(false);
    } catch (error) {
      console.error('Share failed:', error);
      // Fallback to copy link
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert('Profile link copied to clipboard!');
      } catch (copyError) {
        console.error('Copy failed:', copyError);
        alert('Unable to share. Please copy the URL from your browser.');
      }
    }
  };

  // Try native share first, fallback to dropdown
  const handleShareClick = async () => {
    const profileUrl = window.location.href;
    const shareText = `Check out ${profile.name}'s profile on SportSYNC! ${profile.role} specializing in ${profile.sport}.`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.name} - SportSYNC Profile`,
          text: shareText,
          url: profileUrl
        });
      } else {
        setShowShareOptions(!showShareOptions);
      }
    } catch (error) {
      console.error('Native share failed:', error);
      setShowShareOptions(!showShareOptions);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'player': return Star;
      case 'coach': return Award;
      case 'team': return Users;
      default: return Star;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'player': return 'info';
      case 'coach': return 'warning';
      case 'team': return 'success';
      default: return 'accent';
    }
  };

  // Prepare stats for StatsDisplay component with click handlers
  const stats = [
    { 
      label: 'Followers', 
      value: formData.stats.followers,
      onClick: () => navigate(`/profile/${profile.id}/followers`)
    },
    { 
      label: 'Following', 
      value: formData.stats.following,
      onClick: () => navigate(`/profile/${profile.id}/following`)
    }
  ];

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareButtonRef.current && !shareButtonRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };

    if (showShareOptions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareOptions]);

  return (
    <div className="relative">
      {/* Enhanced Cover Image with Gradient Overlay */}
      <div 
        className="h-48 md:h-80 w-full relative cursor-pointer group overflow-hidden"
        {...(isEditing ? getCoverProps() : {})}
        onMouseEnter={() => setIsHoveringCover(true)}
        onMouseLeave={() => setIsHoveringCover(false)}
      >
        {isEditing && <input {...getCoverInputProps()} />}
        <OptimizedImage
          src={getOptimizedPexelsUrl(
            newCoverImage ? URL.createObjectURL(newCoverImage) : formData.coverImage,
            'high'
          )}
          alt="Cover"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          placeholder={createPlaceholderUrl(formData.coverImage)}
          priority={true}
          containerClassName="w-full h-full"
        />
        
        {/* Enhanced Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dark/30 via-transparent to-dark/30" />
        
        {/* Animated Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/20 via-transparent to-accent/20" />
        </div>

        {isEditing && isHoveringCover && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-white text-center">
              <div>
                <Camera className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg font-medium">Change Cover Photo</p>
                <p className="text-sm text-gray-300">Click or drag to upload</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Profile Content */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 md:-mt-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          {/* Glassmorphism Profile Card */}
          <Card padding="lg" className="bg-dark-lighter/80 backdrop-blur-xl shadow-2xl border border-white/10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Enhanced Avatar Section */}
              <div className="relative mx-auto lg:mx-0">
                <div 
                  className="relative cursor-pointer group"
                  {...(isEditing ? getAvatarProps() : {})}
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                >
                  {isEditing && <input {...getAvatarInputProps()} />}
                  
                  <Avatar
                    src={newAvatar ? URL.createObjectURL(newAvatar) : formData.avatar}
                    alt={formData.name}
                    size="2xl"
                    className="border-4 border-dark-lighter"
                    priority={true}
                    quality="medium"
                  />

                  {isEditing && isHoveringAvatar && (
                    <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced Profile Info */}
              <div className="flex-1 w-full lg:w-auto text-center lg:text-left">
                <div className="space-y-4">
                  
                  {/* Name and Role Section */}
                  <div className="space-y-3">
                    {isEditing ? (
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                        className="text-2xl md:text-4xl font-bold"
                      />
                    ) : (
                      <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl md:text-4xl font-bold text-white"
                      >
                        {formData.name}
                      </motion.h1>
                    )}

                    {/* Enhanced Role Badge */}
                    {isEditing ? (
                      <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          className="bg-dark/50 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                        >
                          <option value="player">Player</option>
                          <option value="team">Team</option>
                          <option value="coach">Coach</option>
                        </select>
                        <Input
                          name="sport"
                          value={formData.sport}
                          onChange={handleInputChange}
                          placeholder="Sport"
                        />
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center lg:justify-start space-x-3"
                      >
                        <Badge 
                          variant={getRoleColor(formData.role) as any}
                          icon={getRoleIcon(formData.role)}
                          size="md"
                        >
                          {formData.role}
                        </Badge>
                        <Badge variant="default" size="md">
                          {formData.sport}
                        </Badge>
                      </motion.div>
                    )}
                  </div>

                  {/* Bio Section */}
                  {isEditing ? (
                    <div className="space-y-4">
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        maxLength={150}
                        className="w-full h-24 bg-dark/50 text-white rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                        placeholder="Tell us about yourself..."
                      />
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          icon={MapPin}
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="Location"
                        />
                        <Input
                          icon={LinkIcon}
                          name="externalLink"
                          value={formData.externalLink || ''}
                          onChange={handleInputChange}
                          placeholder="Website"
                          type="url"
                        />
                      </div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-4"
                    >
                      <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">{formData.bio}</p>
                      
                      {(formData.location || formData.externalLink) && (
                        <div className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-6 text-sm">
                          {formData.location && (
                            <div className="flex items-center space-x-2 text-gray-400 hover:text-accent transition-colors">
                              <MapPin className="w-4 h-4" />
                              <span>{formData.location}</span>
                            </div>
                          )}
                          {formData.externalLink && (
                            <a
                              href={formData.externalLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-accent hover:text-accent-light transition-colors"
                            >
                              <LinkIcon className="w-4 h-4" />
                              <span>Website</span>
                            </a>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Enhanced Stats - Using StatsDisplay component with click handlers */}
                  <StatsDisplay 
                    stats={stats}
                    layout="horizontal"
                    size="md"
                  />
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col space-y-3 w-full lg:w-auto">
                {canEdit ? (
                  isEditing ? (
                    <div className="flex space-x-3">
                      <Button
                        variant="primary"
                        icon={Check}
                        onClick={handleSave}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="danger"
                        icon={X}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <Button
                        variant="secondary"
                        icon={Edit2}
                        onClick={() => onEditingChange(true)}
                      >
                        Edit Profile
                      </Button>
                      <div className="relative">
                        <Button
                          ref={shareButtonRef}
                          variant="outline"
                          icon={Share2}
                          onClick={handleShareClick}
                        >
                          Share
                        </Button>
                        
                        {/* Share Dropdown */}
                        {showShareOptions && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setShowShareOptions(false)}
                            />
                            
                            <div className="absolute right-0 top-full mt-2 bg-dark-lighter/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden z-50 border border-white/10 min-w-[200px]">
                              <div className="p-2">
                                <p className="text-xs text-gray-400 px-3 py-2 font-medium">Share {profile.name}'s profile</p>
                                
                                <button
                                  onClick={() => handleShare('facebook')}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors ultra-touch rounded-lg"
                                >
                                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                  <span>Facebook</span>
                                </button>
                                
                                <button
                                  onClick={() => handleShare('twitter')}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-sky-500/20 hover:text-sky-400 transition-colors ultra-touch rounded-lg"
                                >
                                  <div className="w-4 h-4 bg-sky-500 rounded"></div>
                                  <span>Twitter</span>
                                </button>
                                
                                <button
                                  onClick={() => handleShare('linkedin')}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-blue-700/20 hover:text-blue-400 transition-colors ultra-touch rounded-lg"
                                >
                                  <div className="w-4 h-4 bg-blue-700 rounded"></div>
                                  <span>LinkedIn</span>
                                </button>
                                
                                <button
                                  onClick={() => handleShare('copy')}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600/20 hover:text-gray-300 transition-colors ultra-touch rounded-lg"
                                >
                                  <Copy className="w-4 h-4" />
                                  <span>Copy Link</span>
                                </button>
                                
                                {navigator.share && (
                                  <button
                                    onClick={() => handleShare('native')}
                                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-accent/20 hover:text-accent transition-colors ultra-touch rounded-lg"
                                  >
                                    <ExternalLink className="w-4 h-4" />
                                    <span>More Options</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col space-y-3">
                    {/* Follow Button for Other Users */}
                    <FollowButton 
                      userId={profile.id}
                      size="lg"
                    />

                    {/* Share Button */}
                    <div className="relative">
                      <Button
                        ref={shareButtonRef}
                        variant="outline"
                        icon={Share2}
                        onClick={handleShareClick}
                      >
                        Share Profile
                      </Button>
                      
                      {/* Share Dropdown */}
                      {showShareOptions && (
                        <>
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setShowShareOptions(false)}
                          />
                          
                          <div className="absolute right-0 top-full mt-2 bg-dark-lighter/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden z-50 border border-white/10 min-w-[200px]">
                            <div className="p-2">
                              <p className="text-xs text-gray-400 px-3 py-2 font-medium">Share {profile.name}'s profile</p>
                              
                              <button
                                onClick={() => handleShare('facebook')}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-blue-600/20 hover:text-blue-400 transition-colors ultra-touch rounded-lg"
                              >
                                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                                <span>Facebook</span>
                              </button>
                              
                              <button
                                onClick={() => handleShare('twitter')}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-sky-500/20 hover:text-sky-400 transition-colors ultra-touch rounded-lg"
                              >
                                <div className="w-4 h-4 bg-sky-500 rounded"></div>
                                <span>Twitter</span>
                              </button>
                              
                              <button
                                onClick={() => handleShare('linkedin')}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-blue-700/20 hover:text-blue-400 transition-colors ultra-touch rounded-lg"
                              >
                                <div className="w-4 h-4 bg-blue-700 rounded"></div>
                                <span>LinkedIn</span>
                              </button>
                              
                              <button
                                onClick={() => handleShare('copy')}
                                className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-600/20 hover:text-gray-300 transition-colors ultra-touch rounded-lg"
                              >
                                <Copy className="w-4 h-4" />
                                <span>Copy Link</span>
                              </button>
                              
                              {navigator.share && (
                                <button
                                  onClick={() => handleShare('native')}
                                  className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:bg-accent/20 hover:text-accent transition-colors ultra-touch rounded-lg"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  <span>More Options</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}