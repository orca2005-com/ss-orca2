import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { UserCard } from '../components/search/UserCard';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { profileService } from '../services/profileService';

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setUsers([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      const results = await profileService.searchUsers(searchQuery);
      setUsers(results || []);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark py-4 md:py-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-white">Search Professionals</h1>
        </div>

        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, sport, location... (e.g., 'football player', 'nutritionist', 'coach in London')"
            className="w-full pl-10 pr-4 py-3 bg-dark-lighter border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-100 text-white placeholder-gray-400 text-sm md:text-base ultra-touch"
          />
        </div>

        {isLoading && (
          <div className="flex justify-center py-8">
            <SimpleLoader size="md" />
          </div>
        )}

        <div className="space-y-3 md:space-y-4">
          {users.map((user, index) => (
            <UserCard 
              key={user.id} 
              user={{
                id: user.id,
                name: user.full_name,
                avatar: user.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
                role: user.role,
                sport: user.sport || 'Sports',
                location: user.location || 'Location not specified',
                skillLevel: 'Professional'
              }} 
              index={index} 
            />
          ))}
          
          {hasSearched && users.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2 text-sm md:text-base">No results found for "{searchQuery}"</p>
              <p className="text-xs md:text-sm text-gray-500">
                Try searching for specific roles like "nutritionist", "football player", or "coach in London"
              </p>
            </div>
          )}
        </div>

        {/* Search Suggestions */}
        {!hasSearched && searchQuery === '' && (
          <div className="bg-dark-lighter p-4 rounded-lg">
            <h3 className="text-white font-medium mb-3">Try searching for:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'football player', 
                'basketball coach', 
                'nutritionist', 
                'physiotherapist', 
                'sports psychologist', 
                'tennis player',
                'coach in London',
                'trainer',
                'sports journalist',
                'referee',
                'agent',
                'player in New York'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-2 text-xs bg-dark border border-dark-light rounded-lg text-gray-300 hover:border-accent hover:text-accent transition-colors text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Natural Language Search Tips */}
        <div className="bg-dark-lighter p-4 rounded-lg">
          <h3 className="text-white font-medium mb-3">💡 Search Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="text-accent font-medium mb-2">Role-based searches:</h4>
              <ul className="space-y-1 text-xs">
                <li>• "football player"</li>
                <li>• "basketball coach"</li>
                <li>• "nutritionist"</li>
                <li>• "physiotherapist"</li>
              </ul>
            </div>
            <div>
              <h4 className="text-accent font-medium mb-2">Location-based searches:</h4>
              <ul className="space-y-1 text-xs">
                <li>• "coach in London"</li>
                <li>• "player from New York"</li>
                <li>• "trainer in Toronto"</li>
                <li>• "agent from Miami"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}