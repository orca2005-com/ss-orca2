import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, MapPin, Users, Trophy } from 'lucide-react';
import { UserCard } from '../components/search/UserCard';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { mockProfiles } from '../data/mockProfiles';
import { motion, AnimatePresence } from 'framer-motion';

const mockUsers = Object.values(mockProfiles).map(profile => ({
  id: profile.id,
  name: profile.name,
  avatar: profile.avatar,
  role: profile.role,
  sport: profile.sport,
  location: profile.location,
  skillLevel: 'Professional'
}));

// Add some custom role users for demonstration
const additionalUsers = [
  {
    id: 'nutritionist1',
    name: 'Dr. Emma Wilson',
    avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg',
    role: 'Sports Nutritionist',
    sport: 'Nutrition & Wellness',
    location: 'Mumbai, India',
    skillLevel: 'Expert'
  },
  {
    id: 'physio1',
    name: 'Mark Thompson',
    avatar: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg',
    role: 'Physiotherapist',
    sport: 'Sports Medicine',
    location: 'Delhi, India',
    skillLevel: 'Certified'
  },
  {
    id: 'psychologist1',
    name: 'Dr. Sarah Chen',
    avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg',
    role: 'Sports Psychologist',
    sport: 'Mental Performance',
    location: 'Bangalore, India',
    skillLevel: 'PhD'
  },
  {
    id: 'journalist1',
    name: 'Alex Rivera',
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
    role: 'Sports Journalist',
    sport: 'Sports Media',
    location: 'Pune, India',
    skillLevel: 'Senior Reporter'
  },
  {
    id: 'agent1',
    name: 'Michael Foster',
    avatar: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg',
    role: 'Sports Agent',
    sport: 'Athlete Representation',
    location: 'Chennai, India',
    skillLevel: 'Licensed Agent'
  },
  {
    id: 'trainer1',
    name: 'Lisa Martinez',
    avatar: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg',
    role: 'Fitness Trainer',
    sport: 'Personal Training',
    location: 'Hyderabad, India',
    skillLevel: 'Certified'
  },
  {
    id: 'referee1',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
    role: 'Football Referee',
    sport: 'Football Officiating',
    location: 'Kolkata, India',
    skillLevel: 'FIFA Certified'
  }
];

const allUsers = [...mockUsers, ...additionalUsers];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<typeof allUsers>([]);
  const [selectedFilters, setSelectedFilters] = useState({
    role: 'all',
    location: 'all',
    sport: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(allUsers);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Enhanced search with filters
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim() && selectedFilters.role === 'all' && selectedFilters.location === 'all' && selectedFilters.sport === 'all') {
      return true;
    }
    
    const query = searchQuery.toLowerCase();
    const searchTerms = query.split(' ').filter(term => term.length > 0);
    
    // Create searchable text from user data
    const searchableText = [
      user.name,
      user.role,
      user.sport,
      user.location,
      user.skillLevel
    ].join(' ').toLowerCase();
    
    // Check search query
    const matchesSearch = searchTerms.length === 0 || searchTerms.every(term => 
      searchableText.includes(term)
    );

    // Check filters
    const matchesRole = selectedFilters.role === 'all' || 
      user.role.toLowerCase().includes(selectedFilters.role.toLowerCase());
    
    const matchesLocation = selectedFilters.location === 'all' || 
      user.location.toLowerCase().includes(selectedFilters.location.toLowerCase());
    
    const matchesSport = selectedFilters.sport === 'all' || 
      user.sport.toLowerCase().includes(selectedFilters.sport.toLowerCase());

    return matchesSearch && matchesRole && matchesLocation && matchesSport;
  });

  const handleFilterChange = (filterType: string, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      role: 'all',
      location: 'all',
      sport: 'all'
    });
    setSearchQuery('');
  };

  const getUniqueValues = (key: keyof typeof allUsers[0]) => {
    const values = [...new Set(allUsers.map(user => user[key]))];
    return values.filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Searching professionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark mobile-optimized">
      <div className="max-w-4xl mx-auto mobile-padding pb-20 md:pb-8 pt-4 md:pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="heading-mobile">Search Professionals</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 ultra-touch text-gray-400 hover:text-accent transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span className="text-sm">Filters</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, sport, location..."
            className="w-full pl-10 pr-4 py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-100 text-white placeholder-gray-400 text-responsive ultra-touch"
            style={{ fontSize: '16px' }}
          />
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card-mobile mb-4"
            >
              <h3 className="text-white font-medium mb-3">Filters</h3>
              
              <div className="space-y-4">
                {/* Role Filter */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Role</label>
                  <select
                    value={selectedFilters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    className="w-full bg-dark border border-dark-light rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="all">All Roles</option>
                    {getUniqueValues('role').map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Location</label>
                  <select
                    value={selectedFilters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className="w-full bg-dark border border-dark-light rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="all">All Locations</option>
                    {getUniqueValues('location').map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>

                {/* Sport Filter */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Sport</label>
                  <select
                    value={selectedFilters.sport}
                    onChange={(e) => handleFilterChange('sport', e.target.value)}
                    className="w-full bg-dark border border-dark-light rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    style={{ fontSize: '16px' }}
                  >
                    <option value="all">All Sports</option>
                    {getUniqueValues('sport').map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={clearFilters}
                  className="w-full py-2 text-sm text-accent hover:text-accent-light transition-colors ultra-touch"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div className="space-y-3 md:space-y-4">
          <AnimatePresence>
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <UserCard user={user} index={index} />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {filteredUsers.length === 0 && (searchQuery.trim() || selectedFilters.role !== 'all' || selectedFilters.location !== 'all' || selectedFilters.sport !== 'all') && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2 text-responsive">No results found</p>
              <p className="text-xs md:text-sm text-gray-500">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </div>

        {/* Search Tips */}
        <div className="card-mobile mt-6">
          <h3 className="text-white font-medium mb-3">💡 Search Tips</h3>
          <div className="mobile-grid gap-4 text-sm text-gray-300">
            <div>
              <h4 className="text-accent font-medium mb-2 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Role-based searches:
              </h4>
              <ul className="space-y-1 text-xs">
                <li>• "football player"</li>
                <li>• "basketball coach"</li>
                <li>• "nutritionist"</li>
                <li>• "physiotherapist"</li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent font-medium mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Location-based searches:
              </h4>
              <ul className="space-y-1 text-xs">
                <li>• "coach in Mumbai"</li>
                <li>• "player from Delhi"</li>
                <li>• "trainer in Bangalore"</li>
                <li>• "agent from Pune"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}