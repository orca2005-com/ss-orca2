import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Upload, User, Users, GraduationCap, MapPin, Link as LinkIcon, Trophy, Award, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '../context/AuthContext';

interface ProfileData {
  role: string;
  name: string;
  bio: string;
  sport: string;
  location: string;
  website?: string;
  avatar?: File;
  banner?: File;
  achievements: string[];
  certifications?: string[];
  teamSize?: number;
  foundedYear?: number;
  position?: string;
  experience?: string;
}

export default function CreateProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData>({
    role: 'player',
    name: '',
    bio: '',
    sport: '',
    location: '',
    achievements: [],
    certifications: []
  });
  const [newAchievement, setNewAchievement] = useState('');
  const [newCertification, setNewCertification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get role from signup data or location state
  useEffect(() => {
    const signupData = localStorage.getItem('signupData');
    const roleFromState = location.state?.role;
    
    if (roleFromState) {
      setProfileData(prev => ({ ...prev, role: roleFromState }));
    } else if (signupData) {
      const data = JSON.parse(signupData);
      setProfileData(prev => ({ ...prev, role: data.role || 'player' }));
    }
  }, [location.state]);

  const { getRootProps: getAvatarProps, getInputProps: getAvatarInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setProfileData(prev => ({ ...prev, avatar: acceptedFiles[0] }));
    }
  });

  const { getRootProps: getBannerProps, getInputProps: getBannerInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setProfileData(prev => ({ ...prev, banner: acceptedFiles[0] }));
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfileData(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    if (newCertification.trim()) {
      setProfileData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const removeCertification = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index) || []
    }));
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Simulate profile creation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Clear signup data
    localStorage.removeItem('signupData');
    
    // Navigate to home
    navigate('/home');
  };

  const getRoleIcon = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('player') || lowerRole.includes('athlete')) return <User className="w-6 h-6" />;
    if (lowerRole.includes('team') || lowerRole.includes('club')) return <Users className="w-6 h-6" />;
    if (lowerRole.includes('coach') || lowerRole.includes('trainer')) return <GraduationCap className="w-6 h-6" />;
    return <User className="w-6 h-6" />;
  };

  const getRoleColor = (role: string) => {
    const lowerRole = role.toLowerCase();
    if (lowerRole.includes('player') || lowerRole.includes('athlete')) return 'from-blue-500 to-blue-600';
    if (lowerRole.includes('team') || lowerRole.includes('club')) return 'from-green-500 to-green-600';
    if (lowerRole.includes('coach') || lowerRole.includes('trainer')) return 'from-purple-500 to-purple-600';
    return 'from-accent to-accent-dark';
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return profileData.name.trim() && profileData.sport.trim();
      case 2:
        return profileData.bio.trim() && profileData.location.trim();
      case 3:
        return true; // Optional step
      default:
        return false;
    }
  };

  const shouldShowCertifications = () => {
    const role = profileData.role.toLowerCase();
    return role.includes('coach') || role.includes('trainer') || role.includes('nutritionist') || 
           role.includes('physiotherapist') || role.includes('psychologist') || role.includes('therapist');
  };

  return (
    <div className="min-h-screen bg-dark py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-4"
          >
            <div className={`w-12 h-12 bg-gradient-to-r ${getRoleColor(profileData.role)} rounded-full flex items-center justify-center`}>
              {getRoleIcon(profileData.role)}
            </div>
            <h1 className="text-3xl font-bold text-white">Create Your Profile</h1>
          </motion.div>
          <p className="text-gray-400">
            Set up your {profileData.role} profile to connect with the sports community
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step <= currentStep
                    ? 'bg-accent text-white'
                    : 'bg-dark-lighter text-gray-400'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
          <div className="w-full bg-dark-lighter rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Basic Info</span>
            <span>Details</span>
            <span>Media & Extras</span>
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-dark-lighter rounded-xl p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {profileData.role.toLowerCase().includes('team') ? 'Team Name' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    placeholder={profileData.role.toLowerCase().includes('team') ? 'Enter team name' : 'Enter your full name'}
                    className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Primary Sport/Field *
                  </label>
                  <input
                    type="text"
                    name="sport"
                    value={profileData.sport}
                    onChange={handleInputChange}
                    placeholder="e.g., Basketball, Soccer, Tennis, Nutrition, Psychology"
                    className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                  />
                </div>

                {profileData.role.toLowerCase().includes('player') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={profileData.position || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Point Guard, Striker, Midfielder"
                      className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    />
                  </div>
                )}

                {profileData.role.toLowerCase().includes('team') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Team Size
                      </label>
                      <input
                        type="number"
                        name="teamSize"
                        value={profileData.teamSize || ''}
                        onChange={handleInputChange}
                        placeholder="Number of players"
                        className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        name="foundedYear"
                        value={profileData.foundedYear || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., 2020"
                        className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}

                {(profileData.role.toLowerCase().includes('coach') || 
                  profileData.role.toLowerCase().includes('trainer') ||
                  profileData.role.toLowerCase().includes('nutritionist') ||
                  profileData.role.toLowerCase().includes('physiotherapist')) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Years of Experience
                    </label>
                    <input
                      type="text"
                      name="experience"
                      value={profileData.experience || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 years, 10+ years"
                      className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    />
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Profile Details</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio *
                  </label>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    placeholder={`Tell us about your ${profileData.role.toLowerCase().includes('team') ? 'team' : 'professional background'}...`}
                    rows={4}
                    className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={profileData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <LinkIcon className="w-4 h-4 inline mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profileData.website || ''}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-3 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                {/* Achievements */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Trophy className="w-4 h-4 inline mr-1" />
                    Achievements
                  </label>
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        placeholder="Add an achievement..."
                        className="flex-1 px-4 py-2 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={addAchievement}
                        className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {profileData.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center justify-between bg-dark p-3 rounded-lg">
                        <span className="text-gray-200">{achievement}</span>
                        <button
                          onClick={() => removeAchievement(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications for Professional Roles */}
                {shouldShowCertifications() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Award className="w-4 h-4 inline mr-1" />
                      Certifications & Qualifications
                    </label>
                    <div className="space-y-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Add a certification..."
                          className="flex-1 px-4 py-2 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={addCertification}
                          className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {profileData.certifications?.map((cert, index) => (
                        <div key={index} className="flex items-center justify-between bg-dark p-3 rounded-lg">
                          <span className="text-gray-200">{cert}</span>
                          <button
                            onClick={() => removeCertification(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Media & Photos */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Photos & Media</h2>
                
                {/* Banner Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cover Photo
                  </label>
                  <div
                    {...getBannerProps()}
                    className="relative h-32 bg-dark border-2 border-dashed border-dark-light rounded-lg cursor-pointer hover:border-accent transition-colors group"
                  >
                    <input {...getBannerInputProps()} />
                    {profileData.banner ? (
                      <img
                        src={URL.createObjectURL(profileData.banner)}
                        alt="Banner preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-accent transition-colors" />
                          <p className="text-gray-400 text-sm">Click or drag to upload cover photo</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Photo
                  </label>
                  <div className="flex items-center space-x-4">
                    <div
                      {...getAvatarProps()}
                      className="relative w-24 h-24 bg-dark border-2 border-dashed border-dark-light rounded-full cursor-pointer hover:border-accent transition-colors group"
                    >
                      <input {...getAvatarInputProps()} />
                      {profileData.avatar ? (
                        <img
                          src={URL.createObjectURL(profileData.avatar)}
                          alt="Avatar preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Camera className="w-6 h-6 text-gray-400 group-hover:text-accent transition-colors" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">Upload your photo</p>
                      <p className="text-gray-400 text-sm">JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div className="bg-dark p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-2">Profile Preview</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-400">Name:</span> <span className="text-white">{profileData.name || 'Not set'}</span></p>
                    <p><span className="text-gray-400">Role:</span> <span className="text-white">{profileData.role}</span></p>
                    <p><span className="text-gray-400">Sport/Field:</span> <span className="text-white">{profileData.sport || 'Not set'}</span></p>
                    <p><span className="text-gray-400">Location:</span> <span className="text-white">{profileData.location || 'Not set'}</span></p>
                    <p><span className="text-gray-400">Achievements:</span> <span className="text-white">{profileData.achievements.length} added</span></p>
                    {shouldShowCertifications() && (
                      <p><span className="text-gray-400">Certifications:</span> <span className="text-white">{profileData.certifications?.length || 0} added</span></p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-dark-light text-white rounded-lg hover:bg-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Profile...</span>
                  </>
                ) : (
                  <span>Complete Profile</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}