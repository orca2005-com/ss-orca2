import React, { useState } from 'react';
import { UserPlus, UserCheck, Clock, UserX, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConnections } from '../../context/ConnectionContext';
import { Button } from './Button';

interface ConnectionButtonProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ConnectionButton({ 
  userId, 
  size = 'md', 
  showLabel = true, 
  className = '' 
}: ConnectionButtonProps) {
  const {
    getConnectionStatus,
    sendConnectionRequest,
    removeConnection,
    isLoading
  } = useConnections();
  
  const [showMessageInput, setShowMessageInput] = useState(false);
  const [message, setMessage] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const status = getConnectionStatus(userId);

  const handleConnect = async () => {
    if (status === 'connected') {
      // Disconnect
      try {
        setIsActionLoading(true);
        await removeConnection(userId);
      } catch (error) {
        console.error('Failed to remove connection:', error);
      } finally {
        setIsActionLoading(false);
      }
    } else if (status === 'none') {
      // Show message input or send request directly
      if (showMessageInput) {
        try {
          setIsActionLoading(true);
          await sendConnectionRequest(userId, message.trim() || undefined);
          setMessage('');
          setShowMessageInput(false);
        } catch (error) {
          console.error('Failed to send connection request:', error);
        } finally {
          setIsActionLoading(false);
        }
      } else {
        setShowMessageInput(true);
      }
    }
  };

  const getButtonConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: UserCheck,
          label: 'Connected',
          variant: 'outline' as const,
          color: 'text-green-400 border-green-400 hover:bg-green-400 hover:text-white'
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Respond',
          variant: 'outline' as const,
          color: 'text-yellow-400 border-yellow-400 hover:bg-yellow-400 hover:text-white'
        };
      case 'sent':
        return {
          icon: Clock,
          label: 'Pending',
          variant: 'outline' as const,
          color: 'text-gray-400 border-gray-400'
        };
      default:
        return {
          icon: UserPlus,
          label: 'Connect',
          variant: 'primary' as const,
          color: ''
        };
    }
  };

  const config = getButtonConfig();
  const Icon = config.icon;

  if (showMessageInput && status === 'none') {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-3 p-4 bg-dark-lighter rounded-lg border border-dark-light"
      >
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-white">Send Connection Request</span>
        </div>
        
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a personal message (optional)..."
          className="w-full px-3 py-2 bg-dark border border-dark-light rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-white placeholder-gray-400 text-sm resize-none"
          rows={3}
          maxLength={200}
        />
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {message.length}/200 characters
          </span>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowMessageInput(false);
                setMessage('');
              }}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConnect}
              loading={isActionLoading}
              disabled={isActionLoading}
            >
              Send Request
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <Button
      variant={config.variant}
      size={size}
      onClick={handleConnect}
      disabled={isLoading || isActionLoading || status === 'sent' || status === 'pending'}
      loading={isActionLoading}
      className={`${config.color} ${className}`}
      icon={Icon}
    >
      {showLabel && config.label}
    </Button>
  );
}