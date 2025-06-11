import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, Lock, Database, UserCheck, AlertTriangle, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        'Personal information you provide when creating an account (name, email, profile details)',
        'Content you share on the platform (posts, messages, media)',
        'Usage data and analytics to improve our services',
        'Device information and technical data for security purposes'
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        'To provide and maintain our sports networking services',
        'To facilitate connections between athletes, coaches, and teams',
        'To send important updates and notifications about your account',
        'To improve our platform based on user feedback and usage patterns',
        'To ensure platform security and prevent fraudulent activities'
      ]
    },
    {
      icon: UserCheck,
      title: 'Information Sharing',
      content: [
        'We never sell your personal information to third parties',
        'Profile information is shared according to your privacy settings',
        'We may share aggregated, non-personal data for research purposes',
        'Legal compliance may require disclosure in specific circumstances',
        'Service providers may access data solely to provide our services'
      ]
    },
    {
      icon: Lock,
      title: 'Data Security',
      content: [
        'Industry-standard encryption protects your data in transit and at rest',
        'Regular security audits and monitoring systems',
        'Secure authentication and access controls',
        'Data backup and recovery procedures',
        'Incident response protocols for any security concerns'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-dark py-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-8 h-8 text-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Introduction</h2>
          <p className="text-gray-300 leading-relaxed">
            SportNet ("we," "our," or "us") is committed to protecting your privacy and ensuring you have a 
            positive experience on our platform. This Privacy Policy explains how we collect, use, disclose, 
            and safeguard your information when you use our sports networking platform and related services.
          </p>
        </motion.div>

        {/* Main Sections */}
        {sections.map((section, index) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="bg-dark-lighter rounded-xl p-8"
          >
            <div className="flex items-center space-x-3 mb-6">
              <section.icon className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-white">{section.title}</h2>
            </div>
            <ul className="space-y-3">
              {section.content.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300">{item}</p>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        {/* Your Rights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <UserCheck className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Your Rights and Choices</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Access and Control</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• View and update your profile information</li>
                <li>• Download your data</li>
                <li>• Delete your account</li>
                <li>• Control privacy settings</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Communication Preferences</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Opt out of marketing emails</li>
                <li>• Manage notification settings</li>
                <li>• Control message visibility</li>
                <li>• Block or report users</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Cookies */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Cookies and Tracking</h2>
          <p className="text-gray-300 mb-4">
            We use cookies and similar technologies to enhance your experience, analyze usage, and provide 
            personalized content. You can control cookie settings through your browser preferences.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-dark p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Essential Cookies</h4>
              <p className="text-sm text-gray-400">Required for basic platform functionality</p>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Analytics Cookies</h4>
              <p className="text-sm text-gray-400">Help us understand how you use our platform</p>
            </div>
            <div className="bg-dark p-4 rounded-lg">
              <h4 className="font-semibold text-white mb-2">Preference Cookies</h4>
              <p className="text-sm text-gray-400">Remember your settings and preferences</p>
            </div>
          </div>
        </motion.div>

        {/* Children's Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-white">Children's Privacy</h2>
          </div>
          <p className="text-gray-300">
            SportNet is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you believe we have collected information 
            from a child under 13, please contact us immediately so we can take appropriate action.
          </p>
        </motion.div>

        {/* Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Policy Updates</h2>
          <p className="text-gray-300 mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices or 
            applicable laws. We will notify you of any material changes by posting the updated policy 
            on our platform and updating the "Last updated" date.
          </p>
          <p className="text-gray-300">
            Your continued use of SportNet after any changes indicates your acceptance of the updated policy.
          </p>
        </motion.div>

        {/* Home Icon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
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