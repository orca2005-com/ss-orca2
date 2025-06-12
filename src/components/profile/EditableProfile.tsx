import React, { useState, useRef, useEffect } from 'react';
import { Edit2, Check, X, Camera, MapPin, Link as LinkIcon, Share2, Star, Award, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { createPortal } from 'react-dom';
import { Profile } from '../../types';
import { OptimizedImage } from '../ui/OptimizedImage';
import { getOptimizedPexelsUrl, createPlaceholderUrl } from '../../utils/imageOptimization';

interface EditableProfileProps {
  profile: Profile;
  onSave: (updatedProfile: any) => void;
  isEditing: boolean;
  onEditingChange: (isEditing: boolean) => void;
  canEdit: boolean;
}

interface ShareDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onShare: (platform: 'facebook' | 'twitter' | 'linkedin' | 'copy') => void;
}

function ShareDropdown({ isOpen, onClose, buttonRef, onShare }: ShareDropdownProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.right - 192 // 192px is min-w-48 (12rem * 16px)
      });
    }
  }, [isOpen, buttonRef]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[9998]"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="fixed bg-dark-lighter/95 backdrop-blur-xl rounded-xl shadow-2xl overflow-hidden z-[9999] border border-white/10 min-w-48"
          style={{
            top: position.top,
            left: position.left
          }}
        >
          {[
            { label: 'Facebook', action: () => onShare('facebook') },
            { label: 'Twitter', action: () => onShare('twitter') },
            { label: 'LinkedIn', action: () => onShare('linkedin') },
            { label: 'Copy Link', action: () => onShare('copy') }
          ].map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={item.action}
              className="block w-full px-4 py-3 text-left hover:bg-white/10 text-white transition-colors font-medium"
            >
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      </AnimatePresence>
    </>,
    document.body
  );
}

export function EditableProfile({ profile, onSave, isEditing, onEditingChange, canEdit }: EditableProfileProps) {
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

  const handleShare = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'copy') => {
    const shareUrl = window.location.href;
    const shareText = `Check out ${profile.name}'s profile on SportNet!`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(shareUrl);
          alert('Profile link copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy link:', err);
        }
        break;
    }
    setShowShareOptions(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'player': return <Star className="w-4 h-4" />;
      case 'coach': return <Award className="w-4 h-4" />;
      case 'team': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'player': return 'text-blue-400 bg-blue-400/10';
      case 'coach': return 'text-purple-400 bg-purple-400/10';
      case 'team': return 'text-green-400 bg-green-400/10';
      default: return 'text-accent bg-accent/10';
    }
  };

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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm"
          >
            <div className="text-white text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Camera className="w-12 h-12 mx-auto mb-3" />
                <p className="text-lg font-medium">Change Cover Photo</p>
                <p className="text-sm text-gray-300">Click or drag to upload</p>
              </motion.div>
            </div>
          </motion.div>
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
          <div className="bg-dark-lighter/80 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl border border-white/10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
              
              {/* Enhanced Avatar Section - Removed green circle and dot */}
              <div className="relative mx-auto lg:mx-0">
                <div 
                  className="relative cursor-pointer group"
                  {...(isEditing ? getAvatarProps() : {})}
                  onMouseEnter={() => setIsHoveringAvatar(true)}
                  onMouseLeave={() => setIsHoveringAvatar(false)}
                >
                  {isEditing && <input {...getAvatarInputProps()} />}
                  
                  <OptimizedImage
                    src={getOptimizedPexelsUrl(
                      newAvatar ? URL.createObjectURL(newAvatar) : formData.avatar,
                      'medium'
                    )}
                    alt={formData.name}
                    className="relative w-28 h-28 md:w-36 md:h-36 rounded-full border-4 border-dark-lighter object-cover transition-transform duration-300 group-hover:scale-105"
                    placeholder={createPlaceholderUrl(formData.avatar)}
                    priority={true}
                    containerClassName="w-28 h-28 md:w-36 md:h-36"
                  />

                  {isEditing && isHoveringAvatar && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Enhanced Profile Info */}
              <div className="flex-1 w-full lg:w-auto text-center lg:text-left">
                <div className="space-y-4">
                  
                  {/* Name and Role Section */}
                  <div className="space-y-3">
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          maxLength={150}
                          className="text-2xl md:text-4xl font-bold bg-dark/50 text-white rounded-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                          placeholder="Your name"
                        />
                        <span className="absolute right-3 bottom-3 text-xs text-gray-400">
                          {formData.name.length}/150
                        </span>
                      </div>
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
                        <input
                          type="text"
                          name="sport"
                          value={formData.sport}
                          onChange={handleInputChange}
                          placeholder="Sport"
                          className="bg-dark/50 text-white rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                        />
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-center lg:justify-start space-x-3"
                      >
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${getRoleColor(formData.role)}`}>
                          {getRoleIcon(formData.role)}
                          <span className="font-medium capitalize">{formData.role}</span>
                        </div>
                        <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-sm">
                          <span className="text-white font-medium">{formData.sport}</span>
                        </div>
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
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                            placeholder="Location"
                            className="w-full pl-10 pr-4 py-3 bg-dark/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                          />
                        </div>
                        <div className="relative">
                          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <input
                            type="url"
                            name="externalLink"
                            value={formData.externalLink || ''}
                            onChange={handleInputChange}
                            placeholder="Website"
                            className="w-full pl-10 pr-4 py-3 bg-dark/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-accent border border-white/10 backdrop-blur-sm"
                          />
                        </div>
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

                  {/* Enhanced Stats */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex items-center justify-center lg:justify-start space-x-8"
                  >
                    <div className="text-center group cursor-pointer">
                      <div className="relative">
                        <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-accent transition-colors">
                          {formData.stats.followers}
                        </p>
                        <div className="absolute -inset-2 bg-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Followers</p>
                    </div>
                    <div className="w-px h-12 bg-white/20" />
                    <div className="text-center group cursor-pointer">
                      <div className="relative">
                        <p className="text-2xl md:text-3xl font-bold text-white group-hover:text-accent transition-colors">
                          {formData.stats.connections}
                        </p>
                        <div className="absolute -inset-2 bg-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                      </div>
                      <p className="text-sm text-gray-400 font-medium">Connections</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="flex flex-col space-y-3 w-full lg:w-auto">
                {canEdit ? (
                  isEditing ? (
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className="flex items-center space-x-2 px-6 py-3 bg-accent text-white rounded-xl hover:bg-accent-dark transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        <Check className="w-5 h-5" />
                        <span>Save Changes</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCancel}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-all duration-200 font-medium border border-red-500/30"
                      >
                        <X className="w-5 h-5" />
                        <span>Cancel</span>
                      </motion.button>
                    </div>
                  ) : (
                    <div className="flex space-x-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onEditingChange(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all duration-200 font-medium backdrop-blur-sm border border-white/20"
                      >
                        <Edit2 className="w-5 h-5" />
                        <span>Edit Profile</span>
                      </motion.button>
                      <motion.button
                        ref={shareButtonRef}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowShareOptions(!showShareOptions)}
                        className="flex items-center space-x-2 px-6 py-3 bg-accent/20 text-accent rounded-xl hover:bg-accent/30 transition-all duration-200 font-medium border border-accent/30"
                      >
                        <Share2 className="w-5 h-5" />
                        <span>Share</span>
                      </motion.button>
                      <ShareDropdown
                        isOpen={showShareOptions}
                        onClose={() => setShowShareOptions(false)}
                        buttonRef={shareButtonRef}
                        onShare={handleShare}
                      />
                    </div>
                  )
                ) : (
                  <motion.button
                    ref={shareButtonRef}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareOptions(!showShareOptions)}
                    className="flex items-center space-x-2 px-6 py-3 bg-accent/20 text-accent rounded-xl hover:bg-accent/30 transition-all duration-200 font-medium border border-accent/30"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Profile</span>
                  </motion.button>
                )}
                
                {/* Share dropdown for non-editing mode */}
                {!canEdit && (
                  <ShareDropdown
                    isOpen={showShareOptions}
                    onClose={() => setShowShareOptions(false)}
                    buttonRef={shareButtonRef}
                    onShare={handleShare}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}