import React, { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { UserCard } from '../components/search/UserCard';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { mockProfiles } from '../data/mockProfiles';

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
    location: 'Los Angeles, USA',
    skillLevel: 'Expert'
  },
  {
    id: 'physio1',
    name: 'Mark Thompson',
    avatar: 'https://images.pexels.com/photos/6975474/pexels-photo-6975474.jpeg',
    role: 'Physiotherapist',
    sport: 'Sports Medicine',
    location: 'London, UK',
    skillLevel: 'Certified'
  },
  {
    id: 'psychologist1',
    name: 'Dr. Sarah Chen',
    avatar: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg',
    role: 'Sports Psychologist',
    sport: 'Mental Performance',
    location: 'Toronto, Canada',
    skillLevel: 'PhD'
  },
  {
    id: 'journalist1',
    name: 'Alex Rivera',
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg',
    role: 'Sports Journalist',
    sport: 'Sports Media',
    location: 'New York, USA',
    skillLevel: 'Senior Reporter'
  },
  {
    id: 'agent1',
    name: 'Michael Foster',
    avatar: 'https://images.pexels.com/photos/3778876/pexels-photo-3778876.jpeg',
    role: 'Sports Agent',
    sport: 'Athlete Representation',
    location: 'Miami, USA',
    skillLevel: 'Licensed Agent'
  },
  {
    id: 'trainer1',
    name: 'Lisa Martinez',
    avatar: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg',
    role: 'Fitness Trainer',
    sport: 'Personal Training',
    location: 'Austin, USA',
    skillLevel: 'Certified'
  },
  {
    id: 'referee1',
    name: 'David Kim',
    avatar: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
    role: 'Football Referee',
    sport: 'Football Officiating',
    location: 'Manchester, UK',
    skillLevel: 'FIFA Certified'
  }
];

const allUsers = [...mockUsers, ...additionalUsers];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<typeof allUsers>([]);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      setUsers(allUsers);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Enhanced natural language search
  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    
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
    
    // Check if all search terms are found in the searchable text
    const matchesAllTerms = searchTerms.every(term => 
      searchableText.includes(term)
    );
    
    // Additional natural language patterns
    const matchesNaturalLanguage = 
      // "football player" -> matches role containing "player" and sport containing "football"
      (query.includes('football player') && user.role.toLowerCase().includes('player') && user.sport.toLowerCase().includes('football')) ||
      (query.includes('basketball coach') && user.role.toLowerCase().includes('coach') && user.sport.toLowerCase().includes('basketball')) ||
      (query.includes('tennis player') && user.role.toLowerCase().includes('player') && user.sport.toLowerCase().includes('tennis')) ||
      (query.includes('soccer player') && user.role.toLowerCase().includes('player') && (user.sport.toLowerCase().includes('soccer') || user.sport.toLowerCase().includes('football'))) ||
      
      // Professional roles
      (query.includes('nutritionist') && user.role.toLowerCase().includes('nutritionist')) ||
      (query.includes('physiotherapist') && user.role.toLowerCase().includes('physiotherapist')) ||
      (query.includes('psychologist') && user.role.toLowerCase().includes('psychologist')) ||
      (query.includes('journalist') && user.role.toLowerCase().includes('journalist')) ||
      (query.includes('agent') && user.role.toLowerCase().includes('agent')) ||
      (query.includes('trainer') && user.role.toLowerCase().includes('trainer')) ||
      (query.includes('referee') && user.role.toLowerCase().includes('referee')) ||
      
      // Location-based searches
      (query.includes('in ') && user.location.toLowerCase().includes(query.split('in ')[1]?.trim() || '')) ||
      (query.includes('from ') && user.location.toLowerCase().includes(query.split('from ')[1]?.trim() || ''));

    return matchesAllTerms || matchesNaturalLanguage;
  });

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

        <div className="space-y-3 md:space-y-4">
          {filteredUsers.map((user, index) => (
            <UserCard key={user.id} user={user} index={index} />
          ))}
          {filteredUsers.length === 0 && searchQuery.trim() && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-2 text-sm md:text-base">No results found for "{searchQuery}"</p>
              <p className="text-xs md:text-sm text-gray-500">
                Try searching for specific roles like "nutritionist", "football player", or "coach in London"
              </p>
            </div>
          )}
        </div>

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
                <li>• "coach in India"</li>
                <li>• "player from Pune"</li>
                <li>• "trainer in Delhi"</li>
                <li>• "agent from Mumbai"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}