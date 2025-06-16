import { Post } from '../types';

export interface Profile {
  id: string;
  name: string;
  role: string; // Changed from union type to string for flexibility
  avatar: string;
  coverImage: string;
  sport: string;
  location: string;
  bio: string;
  stats: {
    followers: number;
    following: number; // Changed from connections to following
  };
  achievements: string[];
  certifications?: string[]; // Add certifications for coaches
  posts: Post[];
  media: { id: string; url: string; type: 'image' | 'video'; title: string }[];
  externalLink?: string;
  isPrivate: boolean;
  followers: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  }[];
  following: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  }[];
}

export const mockProfiles: Record<string, Profile> = {
  '1': {
    id: '1',
    name: 'John Smith',
    role: 'player',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    coverImage: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
    sport: 'Basketball',
    location: 'New York, USA',
    bio: 'Professional basketball player with 5+ years of experience. Love the game and always pushing to improve.',
    stats: {
      followers: 1234,
      following: 89 // Changed from connections
    },
    achievements: [
      'Regional Championship MVP 2023',
      'All-Star Team Selection 2022',
      '1000+ Career Points'
    ],
    posts: [
      {
        id: '1',
        content: 'Great game today! Thanks to all the supporters!',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    media: [
      { 
        id: '1',
        url: 'https://images.pexels.com/photos/3076509/pexels-photo-3076509.jpeg',
        type: 'image',
        title: 'Game highlights'
      }
    ],
    isPrivate: false,
    followers: [
      {
        id: '2',
        name: 'Elite Sports Academy',
        role: 'Team',
        avatar: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'
      },
      {
        id: '3',
        name: 'Sarah Johnson',
        role: 'Coach',
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
      },
      {
        id: '4',
        name: 'Mike Rodriguez',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'
      }
    ],
    following: [
      {
        id: '3',
        name: 'Sarah Johnson',
        role: 'Coach',
        avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
      },
      {
        id: '6',
        name: 'Coach Martinez',
        role: 'Coach',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg'
      }
    ]
  },
  '2': {
    id: '2',
    name: 'Elite Sports Academy',
    role: 'team',
    avatar: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg',
    coverImage: 'https://images.pexels.com/photos/869258/pexels-photo-869258.jpeg',
    sport: 'Multiple',
    location: 'Los Angeles, USA',
    bio: 'Premier sports academy focused on developing young talent across multiple sports.',
    stats: {
      followers: 5678,
      following: 234
    },
    achievements: [
      'Best Youth Academy 2023',
      '100+ Professional Athletes Trained',
      'National Training Center of the Year'
    ],
    posts: [
      {
        id: '1',
        content: 'New training programs starting next month! Register now.',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    media: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg',
        type: 'image',
        title: 'Training facility'
      }
    ],
    isPrivate: false,
    followers: [
      {
        id: '1',
        name: 'John Smith',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      }
    ],
    following: []
  },
  '3': {
    id: '3',
    name: 'Sarah Johnson',
    role: 'coach',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    coverImage: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg',
    sport: 'Tennis',
    location: 'London, UK',
    bio: 'Professional tennis coach with 10+ years of experience. Specialized in youth development.',
    stats: {
      followers: 3456,
      following: 156
    },
    achievements: [
      'Coach of the Year 2022',
      'Former National Team Coach',
      'Level 4 Certified Trainer'
    ],
    certifications: [
      'ITF Level 4 Coaching Certification',
      'Sports Psychology Diploma',
      'Youth Development Specialist',
      'First Aid & CPR Certified',
      'Strength & Conditioning Level 2',
      'Mental Performance Coaching Certificate'
    ],
    posts: [
      {
        id: '1',
        content: 'Another successful training camp completed! Proud of everyone\'s progress.',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    media: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/8224691/pexels-photo-8224691.jpeg',
        type: 'image',
        title: 'Training session'
      }
    ],
    isPrivate: false,
    followers: [
      {
        id: '1',
        name: 'John Smith',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      },
      {
        id: '2',
        name: 'Elite Sports Academy',
        role: 'Team',
        avatar: 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'
      }
    ],
    following: [
      {
        id: '1',
        name: 'John Smith',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      }
    ]
  },
  // Add more profiles for suggested connections
  '4': {
    id: '4',
    name: 'Mike Rodriguez',
    role: 'player',
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg',
    coverImage: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
    sport: 'Soccer',
    location: 'Madrid, Spain',
    bio: 'Professional soccer player passionate about the beautiful game.',
    stats: {
      followers: 2890,
      following: 145
    },
    achievements: [
      'La Liga Young Player Award 2023',
      'UEFA Youth Championship Winner',
      'Top Scorer Regional League'
    ],
    posts: [
      {
        id: '1',
        content: 'Training hard for the upcoming season! ⚽',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    media: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg',
        type: 'image',
        title: 'Soccer training'
      }
    ],
    isPrivate: false,
    followers: [
      {
        id: '1',
        name: 'John Smith',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      }
    ],
    following: []
  },
  '5': {
    id: '5',
    name: 'Thunder Basketball Club',
    role: 'team',
    avatar: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg',
    coverImage: 'https://images.pexels.com/photos/1544775/pexels-photo-1544775.jpeg',
    sport: 'Basketball',
    location: 'Chicago, USA',
    bio: 'Professional basketball team competing in the national league.',
    stats: {
      followers: 8920,
      following: 67
    },
    achievements: [
      'National Championship 2022',
      'Conference Champions 2023',
      'Best Team Spirit Award'
    ],
    posts: [
      {
        id: '1',
        content: 'Game day! Come support us at the arena! 🏀',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    media: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/1544775/pexels-photo-1544775.jpeg',
        type: 'image',
        title: 'Team photo'
      }
    ],
    isPrivate: false,
    followers: [],
    following: []
  },
  // Add a coach profile for demonstration
  '6': {
    id: '6',
    name: 'Coach Martinez',
    role: 'coach',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg',
    coverImage: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
    sport: 'Basketball',
    location: 'Miami, USA',
    bio: 'Elite basketball coach specializing in player development and team strategy. 15+ years of coaching experience.',
    stats: {
      followers: 4200,
      following: 189
    },
    achievements: [
      'State Championship Coach 2023',
      'Coach of the Year Award 2022',
      'Developed 20+ College Scholarship Athletes',
      'Regional Tournament Champions 2021'
    ],
    certifications: [
      'USA Basketball Gold License',
      'NFHS Coaching Certification',
      'Sports Psychology Certificate',
      'Positive Coaching Alliance Certified',
      'First Aid & CPR Certified',
      'Strength & Conditioning Specialist',
      'Youth Development Expert',
      'Leadership in Sports Certificate'
    ],
    posts: [
      {
        id: '1',
        content: 'Great practice session today! The team is really coming together for the championship.',
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ],
    media: [
      {
        id: '1',
        url: 'https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg',
        type: 'image',
        title: 'Team practice'
      }
    ],
    isPrivate: false,
    followers: [
      {
        id: '1',
        name: 'John Smith',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      },
      {
        id: '5',
        name: 'Thunder Basketball Club',
        role: 'Team',
        avatar: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg'
      }
    ],
    following: [
      {
        id: '1',
        name: 'John Smith',
        role: 'Player',
        avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
      }
    ]
  }
};