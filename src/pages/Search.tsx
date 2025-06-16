import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, MapPin, Users } from 'lucide-react';
import { UserCard } from '../components/search/UserCard';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../hooks/useSupabaseData';

export default function Search() {
  const { results, isLoading, error, search } = useSearch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    role: 'all',
    location: 'all',
    sport: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueValues, setUniqueValues] = useState<{
    role: string[];
    location: string[];
    sport: string[];
  }>({
    role: [],
    location: [],
    sport: []
  });

  // Initial search on component mount
  useEffect(() => {
    search('');
  }, []);

  // Extract unique values for filters
  useEffect(() => {
    if (results.length > 0) {
      const roles = [...new Set(results.map(user => user.role))].filter(Boolean);
      const locations = [...new Set(results.map(user => user.location))].filter(Boolean);
      const sports = [...new Set(results.map(user => user.sport))].filter(Boolean);
      
      setUniqueValues({
        role: roles,
        location: locations,
        sport: sports
      });
    }
  }, [results]);

  // Handle search when query or filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      search(searchQuery, selectedFilters);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, selectedFilters]);

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
    search('');
  };

  if (isLoading && results.length === 0) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Searching professionals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <SearchIcon className="w-8 h-8 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Search Error</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => search('')}
              className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
            >
              Try Again
            </button>
          </div>
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
                    {uniqueValues.role.map(role => (
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
                    {uniqueValues.location.map(location => (
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
                    {uniqueValues.sport.map(sport => (
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
          {isLoading && results.length > 0 && (
            <div className="text-center py-4">
              <SimpleLoader size="md" />
            </div>
          )}
          
          <AnimatePresence>
            {results.map((user, index) => (
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
          
          {results.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-gray-400 mb-2 text-responsive">No users found</p>
              <p className="text-xs md:text-sm text-gray-500">
                {searchQuery.trim() || selectedFilters.role !== 'all' || selectedFilters.location !== 'all' || selectedFilters.sport !== 'all'
                  ? 'Try adjusting your search terms or filters'
                  : 'Be the first to join our community!'
                }
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