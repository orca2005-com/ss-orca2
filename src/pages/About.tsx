import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Target, Heart, Award, Globe, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+' },
    { icon: Trophy, label: 'Success Stories', value: '1,200+' },
    { icon: Globe, label: 'Countries', value: '25+' },
    { icon: Award, label: 'Partnerships', value: '100+' },
  ];

  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Founder',
      bio: 'Former professional athlete with 15+ years in sports management.',
      avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO',
      bio: 'Tech innovator passionate about connecting athletes worldwide.',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Head of Community',
      bio: 'Building bridges between athletes, coaches, and teams globally.',
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'
    },
  ];

  return (
    <div className="min-h-screen bg-dark py-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white">About SportNet</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Connecting athletes, coaches, and teams worldwide to build the future of sports
          </p>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Target className="w-8 h-8 text-accent" />
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed">
            SportNet was founded with a simple yet powerful vision: to create a global platform where 
            athletes, coaches, and teams can connect, collaborate, and grow together. We believe that 
            sports have the power to unite people across all boundaries, and our platform serves as 
            the bridge that makes these meaningful connections possible.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-dark-lighter rounded-xl p-6 text-center"
            >
              <stat.icon className="w-8 h-8 text-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Heart className="w-8 h-8 text-accent" />
            <h2 className="text-2xl font-bold text-white">Our Story</h2>
          </div>
          <div className="space-y-4 text-gray-300">
            <p>
              SportNet began in 2020 when our founder, a former professional athlete, 
              experienced firsthand the challenges of finding the right connections in the sports world. 
              Whether it was discovering new talent, finding the perfect coach, or building a team, 
              the process was often fragmented and inefficient.
            </p>
            <p>
              Today, SportNet has grown into a thriving community of over 50,000 active users across 
              25 countries. We've facilitated thousands of meaningful connections, helped athletes 
              find their dream teams, and enabled coaches to discover exceptional talent.
            </p>
            <p>
              Our platform continues to evolve, driven by the feedback and needs of our incredible 
              community. We're not just building a network; we're building the future of sports collaboration.
            </p>
          </div>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Meet Our Team</h2>
            <p className="text-gray-400">
              Passionate individuals dedicated to revolutionizing sports networking
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="bg-dark-lighter rounded-xl p-6 text-center"
              >
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="text-xl font-semibold text-white mb-1">{member.name}</h3>
                <p className="text-accent text-sm mb-3">{member.role}</p>
                <p className="text-gray-400 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Excellence</h3>
              <p className="text-gray-400 text-sm">
                We strive for excellence in everything we do, from our platform to our community support.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community</h3>
              <p className="text-gray-400 text-sm">
                Our community is at the heart of everything. We foster connections that last a lifetime.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Integrity</h3>
              <p className="text-gray-400 text-sm">
                We operate with transparency, honesty, and respect for all members of our community.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Home Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate('/home')}
            className="w-16 h-16 bg-accent hover:bg-accent-dark rounded-full flex items-center justify-center transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-8 h-8 text-white" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}