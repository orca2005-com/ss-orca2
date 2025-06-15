import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Inbox, Send, Clock } from 'lucide-react';
import { useConnections } from '../context/ConnectionContext';
import { ConnectionRequestItem } from '../components/notifications/ConnectionRequestItem';
import { SimpleLoader } from '../components/ui/SimpleLoader';

export default function ConnectionRequests() {
  const { 
    pendingRequests, 
    sentRequests, 
    connectionRequests,
    isLoading 
  } = useConnections();
  
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  const handleRequestUpdate = (requestId: string) => {
    // Request will be automatically updated through context
    console.log('Request updated:', requestId);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading connection requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark py-4 md:py-8 pb-24 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Users className="w-8 h-8 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Connection Requests</h1>
          </div>
          <p className="text-gray-400">
            Manage your incoming and outgoing connection requests
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-dark-lighter rounded-xl p-2">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'received'
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark'
              }`}
            >
              <Inbox className="w-5 h-5" />
              <span className="font-medium">Received</span>
              {pendingRequests.length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg transition-all duration-200 ${
                activeTab === 'sent'
                  ? 'bg-accent text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark'
              }`}
            >
              <Send className="w-5 h-5" />
              <span className="font-medium">Sent</span>
              {sentRequests.length > 0 && (
                <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                  {sentRequests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'received' && (
            <motion.div
              key="received"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Inbox className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold text-white">
                  Received Requests ({pendingRequests.length})
                </h2>
              </div>

              {pendingRequests.length > 0 ? (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <ConnectionRequestItem
                      key={request.id}
                      request={request}
                      onAccept={handleRequestUpdate}
                      onDecline={handleRequestUpdate}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Inbox className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
                  <p className="text-gray-400">
                    You don't have any connection requests at the moment.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'sent' && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 mb-4">
                <Send className="w-5 h-5 text-accent" />
                <h2 className="text-xl font-semibold text-white">
                  Sent Requests ({sentRequests.length})
                </h2>
              </div>

              {sentRequests.length > 0 ? (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-lighter rounded-xl p-4 border border-dark-light"
                    >
                      <div className="flex items-center space-x-4">
                        <img
                          src={request.toUser.avatar}
                          alt={request.toUser.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{request.toUser.name}</h3>
                          <p className="text-sm text-gray-400">{request.toUser.role}</p>
                          {request.message && (
                            <p className="text-sm text-gray-300 mt-2 italic">"{request.message}"</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-yellow-400">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm font-medium">Pending</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Send className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No sent requests</h3>
                  <p className="text-gray-400">
                    You haven't sent any connection requests yet.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}