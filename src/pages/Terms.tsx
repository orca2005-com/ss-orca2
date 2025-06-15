import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Users, Shield, AlertTriangle, Scale, Gavel, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: Users,
      title: 'User Accounts and Responsibilities',
      content: [
        'You must be at least 13 years old to create an account',
        'Provide accurate and complete information during registration',
        'Maintain the security of your account credentials',
        'You are responsible for all activities under your account',
        'Notify us immediately of any unauthorized use of your account'
      ]
    },
    {
      icon: Shield,
      title: 'Acceptable Use Policy',
      content: [
        'Use the platform for legitimate sports networking purposes only',
        'Respect other users and maintain professional conduct',
        'Do not share inappropriate, offensive, or harmful content',
        'Respect intellectual property rights of others',
        'Do not engage in spam, harassment, or fraudulent activities',
        'Do not attempt to hack, disrupt, or compromise platform security'
      ]
    },
    {
      icon: FileText,
      title: 'Content and Intellectual Property',
      content: [
        'You retain ownership of content you create and share',
        'By posting content, you grant us a license to display and distribute it',
        'You are responsible for ensuring you have rights to share content',
        'SportSYNC owns all platform features, design, and functionality',
        'Respect trademarks, copyrights, and other intellectual property rights'
      ]
    },
    {
      icon: Scale,
      title: 'Privacy and Data Protection',
      content: [
        'Your privacy is governed by our Privacy Policy',
        'We collect and use data as described in our Privacy Policy',
        'You can control your privacy settings and data sharing preferences',
        'We implement security measures to protect your information',
        'You have rights regarding your personal data under applicable laws'
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
            <Gavel className="w-8 h-8 text-accent" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Terms & Conditions</h1>
          </div>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Please read these terms carefully before using SportSYNC. By using our platform, you agree to these terms.
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
          <h2 className="text-2xl font-bold text-white mb-4">Agreement to Terms</h2>
          <p className="text-gray-300 leading-relaxed mb-4">
            These Terms and Conditions ("Terms") govern your use of SportSYNC, a sports networking platform 
            operated by SportSYNC Inc. ("Company," "we," "our," or "us"). By accessing or using our platform, 
            you agree to be bound by these Terms.
          </p>
          <p className="text-gray-300 leading-relaxed">
            If you do not agree to these Terms, please do not use our platform. We reserve the right to 
            modify these Terms at any time, and your continued use constitutes acceptance of any changes.
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

        {/* Prohibited Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <div className="flex items-center space-x-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Prohibited Activities</h2>
          </div>
          <p className="text-gray-300 mb-4">
            The following activities are strictly prohibited on SportSYNC:
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Content Violations</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Posting false or misleading information</li>
                <li>• Sharing copyrighted material without permission</li>
                <li>• Uploading inappropriate or offensive content</li>
                <li>• Impersonating other individuals or organizations</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Platform Abuse</h3>
              <ul className="space-y-2 text-gray-300">
                <li>• Creating multiple fake accounts</li>
                <li>• Attempting to hack or disrupt services</li>
                <li>• Sending spam or unsolicited messages</li>
                <li>• Engaging in fraudulent activities</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Termination */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Account Termination</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              We reserve the right to suspend or terminate your account at any time for violations of these Terms, 
              illegal activities, or behavior that harms our community.
            </p>
            <p>
              You may terminate your account at any time by contacting our support team or using the account 
              deletion feature in your settings.
            </p>
            <p>
              Upon termination, your access to the platform will cease, and we may delete your account data 
              in accordance with our Privacy Policy and applicable laws.
            </p>
          </div>
        </motion.div>

        {/* Disclaimers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Disclaimers and Limitations</h2>
          <div className="space-y-4 text-gray-300">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Service Availability</h3>
              <p>
                SportSYNC is provided "as is" without warranties of any kind. We do not guarantee uninterrupted 
                access or error-free operation of our platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">User Interactions</h3>
              <p>
                We are not responsible for interactions between users, including any agreements, disputes, 
                or transactions that may occur through our platform.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Third-Party Content</h3>
              <p>
                Our platform may contain links to third-party websites or services. We are not responsible 
                for the content or practices of these external sites.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Governing Law */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-dark-lighter rounded-xl p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-4">Governing Law and Disputes</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles. 
              Any disputes arising from these Terms or your use of SportSYNC will be resolved through binding arbitration.
            </p>
            <p>
              Before initiating any legal proceedings, you agree to first attempt to resolve disputes through 
              our customer support team.
            </p>
          </div>
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