import React, { useState } from 'react';
import { User, Users, GraduationCap, Mail, Lock, UserCircle, Plus, X, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { validateEmail, validatePassword, sanitizeText } from '../../utils';
import { ERROR_MESSAGES, NAME_MAX_LENGTH } from '../../constants';

interface RoleCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const predefinedRoles: RoleCard[] = [
  { 
    id: 'player', 
    icon: <User className="h-6 w-6 md:h-8 md:w-8" />, 
    title: 'Player',
    description: 'Individual athlete looking to connect and grow'
  },
  { 
    id: 'team', 
    icon: <Users className="h-6 w-6 md:h-8 md:w-8" />, 
    title: 'Team',
    description: 'Sports team or organization'
  },
  { 
    id: 'coach', 
    icon: <GraduationCap className="h-6 w-6 md:h-8 md:w-8" />, 
    title: 'Coach/Scout',
    description: 'Coach, trainer, or talent scout'
  },
];

const suggestedCustomRoles = [
  'Nutritionist', 'Physiotherapist', 'Sports Psychologist', 'Sports Journalist',
  'Equipment Supplier', 'Sports Agent', 'Referee', 'Sports Photographer',
  'Fitness Trainer', 'Sports Analyst', 'Sports Broadcaster', 'Sports Fan'
];

export function SignupForm() {
  const { signup, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Apply length limits based on field
    let sanitizedValue = value;
    if (name === 'fullName' && value.length > NAME_MAX_LENGTH) {
      return; // Don't update if exceeds limit
    }
    if (name === 'email' && value.length > 254) { // RFC 5321 limit
      return;
    }
    if ((name === 'password' || name === 'confirmPassword') && value.length > 128) {
      return;
    }

    setFormData({ ...formData, [name]: sanitizedValue });
    setLocalError(null);
    clearError();
  };

  const handleRoleSelect = (roleId: string) => {
    if (roleId === 'custom') {
      setShowCustomInput(true);
      setSelectedRole(null);
    } else {
      setSelectedRole(roleId);
      setShowCustomInput(false);
      setCustomRole('');
    }
    setLocalError(null);
    clearError();
  };

  const handleCustomRoleSubmit = () => {
    const sanitizedRole = sanitizeText(customRole.trim());
    if (sanitizedRole && sanitizedRole.length <= 50) {
      setSelectedRole(sanitizedRole);
      setShowCustomInput(false);
    } else {
      setLocalError('Role name must be between 1 and 50 characters');
    }
  };

  const handleSuggestedRoleClick = (role: string) => {
    const sanitizedRole = sanitizeText(role);
    setCustomRole(sanitizedRole);
    setSelectedRole(sanitizedRole);
    setShowCustomInput(false);
    setLocalError(null);
    clearError();
  };

  const validateForm = (): string | null => {
    // Check required fields
    if (!formData.fullName.trim()) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Full Name)';
    }
    if (!formData.email.trim()) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Email)';
    }
    if (!formData.password) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Password)';
    }
    if (!formData.confirmPassword) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Confirm Password)';
    }
    if (!selectedRole) {
      return ERROR_MESSAGES.REQUIRED_FIELD + ' (Role)';
    }

    // Validate email
    if (!validateEmail(formData.email)) {
      return ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      return passwordValidation.errors[0] || ERROR_MESSAGES.WEAK_PASSWORD;
    }

    // Check password confirmation
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    // Validate name length and content
    const sanitizedName = sanitizeText(formData.fullName.trim());
    if (sanitizedName.length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (sanitizedName.length > NAME_MAX_LENGTH) {
      return `Full name must be less than ${NAME_MAX_LENGTH} characters`;
    }

    // Basic name validation (letters, spaces, hyphens, apostrophes)
    if (!/^[a-zA-Z\s\-']+$/.test(sanitizedName)) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);

    try {
      // Sanitize all input data
      const sanitizedData = {
        fullName: sanitizeText(formData.fullName.trim()),
        email: sanitizeText(formData.email.trim().toLowerCase()),
        password: formData.password, // Don't sanitize password
        role: selectedRole ? sanitizeText(selectedRole) : ''
      };

      // Additional security checks
      if (sanitizedData.email.includes('script') || sanitizedData.fullName.includes('<')) {
        setLocalError(ERROR_MESSAGES.MALICIOUS_CONTENT);
        return;
      }

      await signup(sanitizedData);
    } catch (err: any) {
      // Error is handled by AuthContext
      console.error('Signup error:', err);
    }
  };

  const displayError = localError || error;

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4 md:space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {displayError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-500 text-sm"
        >
          {displayError}
        </motion.div>
      )}

      <div className="space-y-3 md:space-y-4">
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="name"
            required
            maxLength={NAME_MAX_LENGTH}
            aria-label="Full name"
            className={`w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 bg-dark-lighter border ${
              displayError && !formData.fullName.trim() ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ fontSize: '16px' }}
          />
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="email"
            required
            aria-label="Email address"
            className={`w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 bg-dark-lighter border ${
              displayError && (!formData.email.trim() || !validateEmail(formData.email)) ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ fontSize: '16px' }}
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="new-password"
            required
            aria-label="Password"
            className={`w-full pl-8 md:pl-10 pr-12 py-2.5 md:py-3 bg-dark-lighter border ${
              displayError && !validatePassword(formData.password).isValid ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ fontSize: '16px' }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 ultra-touch"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
          </button>
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            disabled={isLoading}
            autoComplete="new-password"
            required
            aria-label="Confirm password"
            className={`w-full pl-8 md:pl-10 pr-12 py-2.5 md:py-3 bg-dark-lighter border ${
              displayError && formData.password !== formData.confirmPassword ? 'border-red-500' : 'border-dark-light'
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ fontSize: '16px' }}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 ultra-touch"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4 md:h-5 md:w-5" /> : <Eye className="h-4 w-4 md:h-5 md:w-5" />}
          </button>
        </div>
      </div>

      <div className="space-y-2 md:space-y-3">
        <label className="text-xs md:text-sm text-gray-300">Select your role:</label>
        
        <div className="grid grid-cols-1 gap-3">
          {predefinedRoles.map((role) => (
            <motion.button
              key={role.id}
              type="button"
              onClick={() => handleRoleSelect(role.id)}
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className={`relative overflow-hidden group p-4 rounded-lg border transition-all duration-200 text-left ${
                selectedRole === role.id
                  ? 'border-accent bg-accent/20'
                  : 'border-dark-light bg-dark-lighter hover:border-accent'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${selectedRole === role.id ? 'bg-accent/30' : 'bg-dark'}`}>
                  {role.icon}
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-medium text-gray-300">{role.title}</h3>
                  <p className="text-xs text-gray-400">{role.description}</p>
                </div>
              </div>
            </motion.button>
          ))}

          <motion.button
            type="button"
            onClick={() => handleRoleSelect('custom')}
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            className={`relative overflow-hidden group p-4 rounded-lg border transition-all duration-200 text-left ${
              showCustomInput
                ? 'border-accent bg-accent/20'
                : 'border-dark-light bg-dark-lighter hover:border-accent'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${showCustomInput ? 'bg-accent/30' : 'bg-dark'}`}>
                <Plus className="h-6 w-6 md:h-8 md:w-8" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-medium text-gray-300">Other</h3>
                <p className="text-xs text-gray-400">Custom role in sports industry</p>
              </div>
            </div>
          </motion.button>
        </div>

        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 space-y-3"
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value.slice(0, 50))}
                placeholder="Enter your role (e.g., Nutritionist, Sports Psychologist)"
                disabled={isLoading}
                maxLength={50}
                className={`flex-1 px-4 py-2.5 md:py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleCustomRoleSubmit()}
                style={{ fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={handleCustomRoleSubmit}
                disabled={!customRole.trim() || isLoading}
                className="px-4 py-2.5 md:py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch"
              >
                Add
              </button>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-2">Popular roles:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedCustomRoles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => !isLoading && handleSuggestedRoleClick(role)}
                    disabled={isLoading}
                    className={`px-3 py-1 text-xs bg-dark border border-dark-light rounded-full text-gray-300 hover:border-accent hover:text-accent transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedRole && !predefinedRoles.find(r => r.id === selectedRole) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-accent/30 rounded-full flex items-center justify-center">
                <User className="w-3 h-3 text-accent" />
              </div>
              <span className="text-sm text-accent font-medium">{selectedRole}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedRole(null);
                setCustomRole('');
              }}
              disabled={isLoading}
              className={`text-gray-400 hover:text-gray-300 transition-colors ultra-touch ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full bg-accent hover:bg-accent-dark text-white font-medium py-2.5 md:py-3 px-4 rounded-lg transition-colors duration-200 text-sm md:text-base flex items-center justify-center space-x-2 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Account...</span>
          </>
        ) : (
          <span>Continue to Profile Setup</span>
        )}
      </button>
    </motion.form>
  );
}