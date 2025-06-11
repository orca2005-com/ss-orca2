import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image, Paperclip, X, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageItem } from './MessageItem';
import { useAuth } from '../../context/AuthContext';

interface ReplyToMessage {
  id: string;
  content: string;
  sender: {
    name: string;
  };
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  media?: Array<{
    url: string;
    type: 'image' | 'video';
    name: string;
  }>;
  isRead: boolean;
  replyTo?: ReplyToMessage;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  isTyping: boolean;
  lastSeen: Date;
  messages: Message[];
  participants: string[];
}

interface MessageListProps {
  chat: Chat;
  currentUserId: string | undefined;
  onDeleteMessage?: (messageId: string) => void;
}

// Emoji data
const emojiCategories = {
  'Smileys': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
  'Gestures': ['👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
  'Sports': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌'],
  'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
};

export function MessageList({ chat, currentUserId, onDeleteMessage }: MessageListProps) {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState('Smileys');
  const [messages, setMessages] = useState<Message[]>(chat.messages);
  const [replyingTo, setReplyingTo] = useState<ReplyToMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);
  const { canModify } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages(chat.messages);
  }, [chat.messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const canViewMessages = chat.participants.includes(currentUserId || '');
  const visibleMessages = canViewMessages ? messages : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canViewMessages || (!newMessage.trim() && selectedFiles.length === 0)) return;
    
    // Process media files
    const mediaItems = selectedFiles.map(file => ({
      url: URL.createObjectURL(file),
      type: file.type.startsWith('video/') ? 'video' as const : 'image' as const,
      name: file.name
    }));
    
    // Create new message
    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      timestamp: new Date(),
      sender: {
        id: currentUserId || '',
        name: 'You',
        avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
      },
      media: mediaItems.length > 0 ? mediaItems : undefined,
      isRead: false,
      replyTo: replyingTo || undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setSelectedFiles([]);
    setReplyingTo(null);
    setShowEmojiPicker(false);
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
  };

  const handleReplyToMessage = (replyMessage: { id: string; content: string; sender: { name: string } }) => {
    setReplyingTo({
      id: replyMessage.id,
      content: replyMessage.content,
      sender: { name: replyMessage.sender.name }
    });
    // Focus the input
    messageInputRef.current?.focus();
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    const input = messageInputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newText = newMessage.slice(0, start) + emoji + newMessage.slice(end);
      setNewMessage(newText);
      
      // Set cursor position after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setNewMessage(prev => prev + emoji);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      // Allow documents, images, videos, audio
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/',
        'video/',
        'audio/'
      ];
      
      return allowedTypes.some(type => file.type.startsWith(type)) && file.size <= 50 * 1024 * 1024; // 50MB limit
    });
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    if (e.target) e.target.value = '';
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024 // 10MB limit for images
    );
    
    setSelectedFiles(prev => [...prev, ...imageFiles]);
    if (e.target) e.target.value = '';
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.startsWith('audio/')) return '🎵';
    if (file.type.includes('pdf')) return '📄';
    if (file.type.includes('word')) return '📝';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!canViewMessages) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        You don't have permission to view this conversation
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark">
      {/* Scrollable Messages Area - Full height minus input */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 md:p-4 space-y-2 md:space-y-3 min-h-full">
          <AnimatePresence>
            {visibleMessages.map((message) => (
              <MessageItem
                key={message.id}
                message={message}
                isOwn={message.sender.id === currentUserId}
                onDelete={message.sender.id === currentUserId ? handleDeleteMessage : undefined}
                onReply={handleReplyToMessage}
              />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input Area at Bottom */}
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-dark-light bg-dark-lighter relative">
        {/* Reply Preview */}
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-3 p-3 bg-dark rounded-lg border-l-4 border-accent"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-accent font-medium mb-1">
                  Replying to {replyingTo.sender.name}
                </p>
                <p className="text-sm text-gray-300 truncate">
                  {replyingTo.content}
                </p>
              </div>
              <button
                onClick={handleCancelReply}
                className="ml-2 p-1 text-gray-400 hover:text-gray-300 transition-colors ultra-touch"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {/* File Previews */}
        {selectedFiles.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative bg-dark rounded-lg p-2 flex items-center space-x-2 max-w-xs"
              >
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : file.type.startsWith('video/') ? (
                  <div className="relative w-12 h-12 rounded bg-dark-light flex items-center justify-center">
                    <video
                      src={URL.createObjectURL(file)}
                      className="w-full h-full rounded object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded bg-dark-light flex items-center justify-center">
                    <span className="text-lg">{getFileIcon(file)}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        )}

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              ref={emojiPickerRef}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full left-3 right-3 mb-2 bg-dark border border-dark-light rounded-lg shadow-lg overflow-hidden z-50"
            >
              {/* Emoji Categories */}
              <div className="flex border-b border-dark-light">
                {Object.keys(emojiCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() => setActiveEmojiCategory(category)}
                    className={`flex-1 px-2 py-2 text-xs font-medium transition-colors ${
                      activeEmojiCategory === category
                        ? 'bg-accent text-white'
                        : 'text-gray-400 hover:text-white hover:bg-dark-light'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Emoji Grid */}
              <div className="p-3 max-h-48 overflow-y-auto">
                <div className="grid grid-cols-8 gap-1">
                  {emojiCategories[activeEmojiCategory as keyof typeof emojiCategories].map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="p-2 text-lg hover:bg-dark-light rounded transition-colors ultra-touch"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message Input Form */}
        <form onSubmit={handleSendMessage}>
          <div className="flex items-center space-x-2 bg-dark rounded-full px-3 py-2">
            {/* Action Buttons */}
            <div className="flex space-x-1">
              {/* Emoji Button */}
              <button 
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 transition-colors ultra-touch ${
                  showEmojiPicker ? 'text-accent' : 'text-gray-400 hover:text-accent'
                }`}
              >
                <Smile className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Image Upload Button */}
              <button 
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-accent transition-colors ultra-touch"
              >
                <Image className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* File Upload Button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-gray-400 hover:text-accent transition-colors ultra-touch"
              >
                <Paperclip className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>

            {/* Text Input */}
            <input
              ref={messageInputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={replyingTo ? `Reply to ${replyingTo.sender.name}...` : "Type a message..."}
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none min-w-0"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!newMessage.trim() && selectedFiles.length === 0}
              className="p-1.5 text-accent hover:text-accent-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed ultra-touch"
            >
              <Send className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </form>

        {/* Hidden File Inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageSelect}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,image/*,video/*,audio/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </div>
  );
}