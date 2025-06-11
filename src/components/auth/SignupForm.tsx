import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Users, GraduationCap, Mail, Lock, UserCircle, Plus, X } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
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
  };

  const handleCustomRoleSubmit = () => {
    if (customRole.trim()) {
      setSelectedRole(customRole.trim());
      setShowCustomInput(false);
    }
  };

  const handleSuggestedRoleClick = (role: string) => {
    setCustomRole(role);
    setSelectedRole(role);
    setShowCustomInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword || !selectedRole) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const signupData = {
      ...formData,
      role: selectedRole
    };
    
    localStorage.setItem('signupData', JSON.stringify(signupData));
    navigate('/create-profile', { state: { role: selectedRole } });
  };

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-4 md:space-y-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className="space-y-3 md:space-y-4">
        <div className="relative">
          <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base"
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
            className="w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base"
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className="w-full pl-8 md:pl-10 pr-4 py-2.5 md:py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base"
          />
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
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative overflow-hidden group p-4 rounded-lg border transition-all duration-200 text-left
                ${selectedRole === role.id
                  ? 'border-accent bg-accent/20'
                  : 'border-dark-light bg-dark-lighter hover:border-accent'
                }`}
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden group p-4 rounded-lg border transition-all duration-200 text-left
              ${showCustomInput
                ? 'border-accent bg-accent/20'
                : 'border-dark-light bg-dark-lighter hover:border-accent'
              }`}
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
                onChange={(e) => setCustomRole(e.target.value)}
                placeholder="Enter your role (e.g., Nutritionist, Sports Psychologist)"
                className="flex-1 px-4 py-2.5 md:py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 text-white placeholder-gray-400 text-sm md:text-base"
                onKeyPress={(e) => e.key === 'Enter' && handleCustomRoleSubmit()}
              />
              <button
                type="button"
                onClick={handleCustomRoleSubmit}
                disabled={!customRole.trim()}
                className="px-4 py-2.5 md:py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => handleSuggestedRoleClick(role)}
                    className="px-3 py-1 text-xs bg-dark border border-dark-light rounded-full text-gray-300 hover:border-accent hover:text-accent transition-colors"
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
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-xs md:text-sm text-center animate-shake">{error}</p>
      )}

      <button
        type="submit"
        className="w-full bg-accent hover:bg-accent-dark text-white font-medium py-2.5 md:py-3 px-4 rounded-lg transition-colors duration-200 text-sm md:text-base"
      >
        Continue to Profile Setup
      </button>
    </motion.form>
  );
}