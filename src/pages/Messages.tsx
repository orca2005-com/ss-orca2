import React, { useState, useEffect } from 'react';
import { Search, Plus, Users, ArrowLeft } from 'lucide-react';
import { MessageList } from '../components/messages/MessageList';
import { SimpleLoader } from '../components/ui/SimpleLoader';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const mockChats = [
  {
    id: '1',
    name: 'Sarah Johnson',
    avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg',
    lastMessage: 'Great game yesterday!',
    timestamp: new Date(),
    unreadCount: 2,
    isOnline: true,
    isTyping: false,
    lastSeen: new Date(),
    participants: ['1', '3'],
    isGroup: false,
    messages: [
      {
        id: '1',
        content: 'Hey, how was the game?',
        timestamp: new Date(Date.now() - 3600000),
        sender: {
          id: '3',
          name: 'Sarah Johnson',
          avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
        },
        isRead: true
      },
      {
        id: '2',
        content: 'It was amazing! We won 3-1. The team played really well together.',
        timestamp: new Date(Date.now() - 3500000),
        sender: {
          id: '1',
          name: 'You',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
        },
        isRead: true
      },
      {
        id: '3',
        content: 'That\'s awesome! I saw the highlights. Your goal in the second half was incredible!',
        timestamp: new Date(Date.now() - 3400000),
        sender: {
          id: '3',
          name: 'Sarah Johnson',
          avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
        },
        isRead: true,
        replyTo: {
          id: '2',
          content: 'It was amazing! We won 3-1. The team played really well together.',
          sender: { name: 'You' }
        }
      },
      {
        id: '4',
        content: 'Thanks! The coach has been working with us on those plays. Want to grab lunch tomorrow to celebrate?',
        timestamp: new Date(Date.now() - 3300000),
        sender: {
          id: '1',
          name: 'You',
          avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
        },
        isRead: true
      },
      {
        id: '5',
        content: 'Absolutely! How about that new sports bar downtown? I heard they have great food.',
        timestamp: new Date(Date.now() - 1800000),
        sender: {
          id: '3',
          name: 'Sarah Johnson',
          avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg'
        },
        isRead: false
      }
    ]
  }
];

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<typeof mockChats[0] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState<typeof mockChats>([]);

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const userChats = mockChats.filter(chat => 
        chat.participants.includes(user?.id || '')
      );
      setChats(userChats);
      setIsLoading(false);
    };

    loadData();
  }, [user?.id]);

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

  if (selectedChat && window.innerWidth < 768) {
    return (
      <div className="h-screen bg-dark flex flex-col">
        <div className="flex items-center p-3 border-b border-dark-light bg-dark-lighter flex-shrink-0">
          <button 
            onClick={() => setSelectedChat(null)}
            className="p-2 -ml-2 text-gray-400 hover:text-white ultra-touch"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => handleChatProfileClick(selectedChat.id, e)}
            className="flex items-center space-x-3 ml-1 hover:bg-dark/50 rounded-lg p-2 -m-2 transition-colors flex-1"
          >
            <div className="relative">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-8 h-8 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
              />
              {selectedChat.isOnline && (
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-accent rounded-full border border-dark-lighter" />
              )}
            </div>
            <div className="text-left">
              <h3 className="font-medium text-sm text-white hover:text-accent transition-colors">{selectedChat.name}</h3>
              <p className="text-xs text-gray-400">
                {selectedChat.isTyping ? (
                  <span className="text-accent">Typing...</span>
                ) : selectedChat.isOnline ? (
                  'Online'
                ) : (
                  'Last seen recently'
                )}
              </p>
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
      </div>
    );
  }

  return (
    <div className="h-screen bg-dark flex flex-col md:flex-row">
      <div className="w-full md:w-80 border-r border-dark-light flex-shrink-0 flex flex-col">
        <div className="p-3 md:p-4 border-b border-dark-light bg-dark-lighter flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Messages</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-accent transition-colors ultra-touch">
                <Plus className="w-5 h-5" />
              </button>
              {user?.role === 'team' && (
                <button className="p-2 text-gray-400 hover:text-accent transition-colors ultra-touch">
                  <Users className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-9 pr-3 py-2 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-100 text-white placeholder-gray-400 text-sm ultra-touch"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <div className="divide-y divide-dark-light">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={`w-full p-3 flex items-center space-x-3 hover:bg-dark transition-colors ultra-touch ${
                  selectedChat?.id === chat.id ? 'bg-dark' : ''
                }`}
              >
                <button
                  onClick={(e) => handleChatProfileClick(chat.id, e)}
                  className="relative flex-shrink-0 hover:scale-105 transition-transform"
                >
                  <img
                    src={chat.avatar}
                    alt={chat.name}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                  />
                  {chat.isOnline && !chat.isGroup && (
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-dark-lighter" />
                  )}
                  {chat.isGroup && (
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-accent rounded-full border-2 border-dark-lighter flex items-center justify-center">
                      <Users className="w-2.5 h-2.5 text-white" />
                    </div>
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
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col h-screen">
        {selectedChat ? (
          <div className="flex flex-col h-full">
            <div className="flex items-center p-4 border-b border-dark-light bg-dark-lighter flex-shrink-0">
              <button
                onClick={(e) => handleChatProfileClick(selectedChat.id, e)}
                className="flex items-center space-x-3 hover:bg-dark/50 rounded-lg p-2 -m-2 transition-colors"
              >
                <div className="relative">
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.name}
                    className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-accent transition-all"
                  />
                  {selectedChat.isOnline && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-dark-lighter" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-white hover:text-accent transition-colors">{selectedChat.name}</h3>
                  <p className="text-sm text-gray-400">
                    {selectedChat.isTyping ? (
                      <span className="text-accent">Typing...</span>
                    ) : selectedChat.isOnline ? (
                      'Online'
                    ) : (
                      'Last seen recently'
                    )}
                  </p>
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