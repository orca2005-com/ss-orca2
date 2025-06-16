import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, ArrowLeft, Send, Smile, Image, Paperclip } from 'lucide-react';
import { MessageList } from '../components/messages/MessageList';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db, subscriptions } from '../lib/supabase';

export default function Messages() {
  const { user, sendMessage } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get conversations
        const conversationsData = await db.getConversations(user.id);
        
        // Transform data to match component expectations
        const transformedChats = await Promise.all(conversationsData.map(async (item) => {
          const conversation = item.conversation;
          
          // For direct conversations, get the other participant
          const otherParticipant = conversation.conversation_participants
            .find(cp => cp.user.id !== user.id)?.user;
          
          // Get messages
          const messages = await db.getMessages(conversation.id);
          
          // Get last message
          const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
          
          return {
            id: conversation.id,
            name: conversation.type === 'direct' ? otherParticipant?.full_name : conversation.name,
            avatar: otherParticipant?.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
            lastMessage: lastMessage?.content || '',
            timestamp: new Date(lastMessage?.created_at || conversation.updated_at),
            unreadCount: 0, // Would need a separate query to calculate this
            isOnline: false, // Would need a separate system to track this
            isTyping: false, // Would need a separate system to track this
            lastSeen: new Date(),
            participants: conversation.conversation_participants.map(cp => cp.user.id),
            isGroup: conversation.type !== 'direct',
            messages: messages.map(msg => ({
              id: msg.id,
              content: msg.content || '',
              timestamp: new Date(msg.created_at),
              sender: {
                id: msg.sender.id,
                name: msg.sender.full_name,
                avatar: msg.sender.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
              },
              isRead: true, // Would need a separate system to track this
              media: msg.media_urls?.map((url, index) => ({
                url,
                type: msg.media_types?.[index] || 'image',
                name: `Media ${index + 1}`
              }))
            }))
          };
        }));
        
        setChats(transformedChats);
      } catch (err: any) {
        console.error('Error loading conversations:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Handle starting a new chat from profile
  useEffect(() => {
    if (location.state?.startChatWith && user) {
      const { startChatWith } = location.state;
      
      // Check if chat already exists
      const existingChat = chats.find(chat => 
        chat.participants.includes(startChatWith.id)
      );
      
      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        // Create new chat
        (async () => {
          try {
            const conversationId = await db.createOrGetConversation(user.id, startChatWith.id);
            
            // Get the new conversation
            const messages = await db.getMessages(conversationId);
            
            const newChat = {
              id: conversationId,
              name: startChatWith.name,
              avatar: startChatWith.avatar,
              lastMessage: '',
              timestamp: new Date(),
              unreadCount: 0,
              isOnline: false,
              isTyping: false,
              lastSeen: new Date(),
              participants: [user.id, startChatWith.id],
              isGroup: false,
              messages: messages.map(msg => ({
                id: msg.id,
                content: msg.content || '',
                timestamp: new Date(msg.created_at),
                sender: {
                  id: msg.sender.id,
                  name: msg.sender.full_name,
                  avatar: msg.sender.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
                },
                isRead: true
              }))
            };
            
            setChats(prev => [newChat, ...prev]);
            setSelectedChat(newChat);
          } catch (err) {
            console.error('Error creating conversation:', err);
          }
        })();
      }
      
      // Clear the state
      navigate('/messages', { replace: true });
    }
  }, [location.state, chats, user, navigate]);

  // Subscribe to new messages
  useEffect(() => {
    if (!user || !selectedChat) return;
    
    const subscription = subscriptions.subscribeToMessages(selectedChat.id, (payload) => {
      // Update the chat with the new message
      const newMessage = payload.new;
      
      // Fetch sender details
      db.getUser(newMessage.sender_id).then(sender => {
        const transformedMessage = {
          id: newMessage.id,
          content: newMessage.content || '',
          timestamp: new Date(newMessage.created_at),
          sender: {
            id: sender.id,
            name: sender.full_name,
            avatar: sender.avatar_url || 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
          },
          isRead: false
        };
        
        setChats(prev => prev.map(chat => {
          if (chat.id === selectedChat.id) {
            return {
              ...chat,
              messages: [...chat.messages, transformedMessage],
              lastMessage: newMessage.content || '',
              timestamp: new Date(newMessage.created_at)
            };
          }
          return chat;
        }));
        
        setSelectedChat(prev => ({
          ...prev,
          messages: [...prev.messages, transformedMessage],
          lastMessage: newMessage.content || '',
          timestamp: new Date(newMessage.created_at)
        }));
      });
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user, selectedChat]);

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatProfileClick = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      const otherParticipant = chat.participants.find(p => p !== user?.id);
      if (otherParticipant) {
        navigate(`/profile/${otherParticipant}`);
      }
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    if (selectedChat) {
      const updatedChat = {
        ...selectedChat,
        messages: selectedChat.messages.filter(msg => msg.id !== messageId)
      };
      setSelectedChat(updatedChat);
      setChats(prev => prev.map(chat => 
        chat.id === selectedChat.id ? updatedChat : chat
      ));
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || isSending || !user) return;

    setIsSending(true);
    
    try {
      // Get recipient ID
      const recipientId = selectedChat.participants.find(p => p !== user.id);
      if (!recipientId) throw new Error('Recipient not found');
      
      // Send message
      await sendMessage(recipientId, newMessage.trim());
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error Loading Messages</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/home')}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            Go Home
          </button>
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
              <h3 className="font-medium text-sm text-white hover:text-accent transition-colors">{selectedChat.name}</h3>
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
            onDeleteMessage={handleDeleteMessage}
          />
        </div>

        {/* Mobile message input */}
        <div className="flex-shrink-0 p-3 border-t border-dark-light bg-dark-lighter safe-area-inset-bottom">
          <form onSubmit={handleSendMessage}>
            <div className="flex items-center space-x-2 bg-dark rounded-full px-3 py-2">
              <button 
                type="button"
                className="ultra-touch text-gray-400 hover:text-accent transition-colors"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none min-w-0"
                style={{ fontSize: '16px' }}
                disabled={isSending}
              />

              <button 
                type="button"
                className="ultra-touch text-gray-400 hover:text-accent transition-colors"
              >
                <Image className="w-5 h-5" />
              </button>

              <button 
                type="button"
                className="ultra-touch text-gray-400 hover:text-accent transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <button
                type="submit"
                disabled={!newMessage.trim() || isSending}
                className="ultra-touch text-accent hover:text-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </form>
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
              <button 
                className="ultra-touch text-gray-400 hover:text-accent transition-colors"
                onClick={() => {
                  // In a real app, this would open a new chat dialog
                  console.log('New chat');
                }}
              >
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
          <div className="divide-y divide-dark-light">
            {filteredChats.map((chat) => (
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
                    <h3 className="font-medium text-sm text-white truncate hover:text-accent transition-colors">{chat.name}</h3>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${chat.isTyping ? 'text-accent' : 'text-gray-400'}`}>
                    {chat.isTyping ? 'Typing...' : chat.lastMessage}
                  </p>
                </button>
                {chat.unreadCount > 0 && (
                  <span className="bg-accent text-white text-xs rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {chat.unreadCount}
                  </span>
                )}
              </motion.div>
            ))}
            
            {filteredChats.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-2">No conversations yet</p>
                <p className="text-xs text-gray-500">Start connecting with other users</p>
              </div>
            )}
          </div>
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
                  <h3 className="font-semibold text-white hover:text-accent transition-colors">{selectedChat.name}</h3>
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
                onDeleteMessage={handleDeleteMessage}
              />
            </div>

            {/* Desktop message input */}
            <div className="flex-shrink-0 p-4 border-t border-dark-light bg-dark-lighter">
              <form onSubmit={handleSendMessage}>
                <div className="flex items-center space-x-2 bg-dark rounded-full px-3 py-2">
                  <button 
                    type="button"
                    className="ultra-touch text-gray-400 hover:text-accent transition-colors"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                  
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none min-w-0"
                    disabled={isSending}
                  />

                  <button 
                    type="button"
                    className="ultra-touch text-gray-400 hover:text-accent transition-colors"
                  >
                    <Image className="w-5 h-5" />
                  </button>

                  <button 
                    type="button"
                    className="ultra-touch text-gray-400 hover:text-accent transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>

                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="ultra-touch text-accent hover:text-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </form>
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