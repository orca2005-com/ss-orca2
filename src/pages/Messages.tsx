import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, ArrowLeft } from 'lucide-react';
import { MessageList } from '../components/messages/MessageList';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../hooks/useApi';
import { apiService } from '../services/api';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Use API hook for chats
  const {
    data: chatsData,
    loading: isLoading,
    error: chatsError,
    refetch: refetchChats
  } = useApi(() => apiService.getChats());

  const chats = chatsData?.chats || [];

  // Handle starting a new chat from profile
  useEffect(() => {
    if (location.state?.startChatWith) {
      const { startChatWith } = location.state;
      
      // Check if chat already exists
      const existingChat = chats.find((chat: any) => 
        chat.participants.some((p: any) => p.id === startChatWith.id)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create new chat
        const createNewChat = async () => {
          try {
            const newChat = await apiService.createChat([user?.id || '', startChatWith.id]);
            setSelectedChat(newChat);
            refetchChats();
          } catch (error) {
            console.error('Error creating chat:', error);
          }
        };
        
        createNewChat();
      }
      
      // Clear the state
      navigate('/messages', { replace: true });
    }
  }, [location.state, chats, user?.id, navigate, refetchChats]);

  const filteredChats = chats.filter((chat: any) =>
    chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.participants.some((p: any) => 
      p.name?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const handleChatProfileClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = chats.find((c: any) => c.id === chatId);
    if (chat) {
      const otherParticipant = chat.participants.find((p: any) => p.id !== user?.id);
      if (otherParticipant) {
        navigate(`/profile/${otherParticipant.id}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-dark flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleLoader size="lg" />
          <p className="text-accent text-lg font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  // Mobile chat view
  if (selectedChat && window.innerWidth < 768) {
    return (
      <div className="h-screen bg-dark flex flex-col mobile-optimized">
        {/* Mobile chat header */}
        <div className="flex items-center p-3 border-b border-dark-light bg-dark-lighter flex-shrink-0 safe-area-inset-top">
          <button 
            onClick={() => setSelectedChat(null)}
            className="ultra-touch text-gray-400 hover:text-white -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleChatProfileClick(selectedChat.id, e)}
            className="flex items-center space-x-3 ml-1 hover:bg-dark/50 rounded-lg ultra-touch -m-2 transition-colors flex-1"
          >
            <Avatar
              src={selectedChat.avatar}
              alt={selectedChat.name}
              size="sm"
            />
            <div className="text-left">
              <h3 className="font-medium text-sm text-white hover:text-accent transition-colors">
                {selectedChat.name}
              </h3>
              <div className="flex items-center space-x-2">
                {selectedChat.isTyping ? (
                  <span className="text-xs text-accent">Typing...</span>
                ) : (
                  <span className="text-xs text-gray-400">
                    {selectedChat.isOnline ? 'Online' : 'Offline'}
                  </span>
                )}
              </div>
            </div>
          </button>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 overflow-hidden">
          <MessageList 
            chat={selectedChat} 
            currentUserId={user?.id} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark flex flex-col md:flex-row mobile-optimized">
      {/* Chat list */}
      <div className="w-full md:w-80 border-r border-dark-light flex-shrink-0 flex flex-col">
        <div className="p-3 md:p-4 border-b border-dark-light bg-dark-lighter flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <button className="ultra-touch text-gray-400 hover:text-accent transition-colors">
                <Plus className="w-5 h-5" />
              </button>
              {user?.role === 'team' && (
                <button className="ultra-touch text-gray-400 hover:text-accent transition-colors">
                  <Users className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <Input
            icon={Search}
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0 mobile-scroll">
          {chatsError ? (
            <div className="p-4 text-center text-red-400">
              <p>Error loading chats: {chatsError}</p>
              <button
                onClick={refetchChats}
                className="mt-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors ultra-touch"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="divide-y divide-dark-light">
              {filteredChats.map((chat: any) => (
                <motion.div
                  key={chat.id}
                  whileHover={{ backgroundColor: 'rgba(45, 45, 45, 0.5)' }}
                  className={`w-full p-3 flex items-center space-x-3 transition-colors ultra-touch ${
                    selectedChat?.id === chat.id ? 'bg-dark' : ''
                  }`}
                >
                  <button
                    onClick={(e) => handleChatProfileClick(chat.id, e)}
                    className="relative flex-shrink-0 hover:scale-105 transition-transform"
                  >
                    <Avatar
                      src={chat.avatar}
                      alt={chat.name}
                      size="md"
                    />
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-dark-lighter" />
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedChat(chat)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-white truncate hover:text-accent transition-colors">
                        {chat.name}
                      </h3>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {chat.lastMessage?.timestamp ? 
                          new Date(chat.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) :
                          ''
                        }
                      </span>
                    </div>
                    <p className={`text-xs truncate ${chat.isTyping ? 'text-accent' : 'text-gray-400'}`}>
                      {chat.isTyping ? 'Typing...' : chat.lastMessage?.content || 'No messages yet'}
                    </p>
                  </button>
                  {chat.unreadCount > 0 && (
                    <span className="bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </motion.div>
              ))}
              
              {filteredChats.length === 0 && !isLoading && (
                <div className="p-4 text-center text-gray-400">
                  <p>No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-1">Start a conversation by visiting someone's profile</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop chat view */}
      <div className="hidden md:flex flex-1 flex-col h-screen">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-dark-light bg-dark-lighter flex-shrink-0">
              <button
                onClick={(e) => handleChatProfileClick(selectedChat.id, e)}
                className="flex items-center space-x-3 hover:bg-dark/50 rounded-lg ultra-touch -m-2 transition-colors"
              >
                <Avatar
                  src={selectedChat.avatar}
                  alt={selectedChat.name}
                  size="md"
                />
                <div className="text-left">
                  <h3 className="font-semibold text-white hover:text-accent transition-colors">
                    {selectedChat.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {selectedChat.isTyping ? (
                      <span className="text-sm text-accent">Typing...</span>
                    ) : (
                      <span className="text-sm text-gray-400">
                        {selectedChat.isOnline ? 'Online' : 'Offline'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <MessageList 
                chat={selectedChat} 
                currentUserId={user?.id} 
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
}