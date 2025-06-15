import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useConnections, ConnectionRequest } from '../../context/ConnectionContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';

interface ConnectionRequestItemProps {
  request: ConnectionRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
}

export function ConnectionRequestItem({ 
  request, 
  onAccept, 
  onDecline 
}: ConnectionRequestItemProps) {
  const navigate = useNavigate();
  const { acceptConnectionRequest, declineConnectionRequest } = useConnections();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);

  const handleAccept = async () => {
    try {
      setIsAccepting(true);
      await acceptConnectionRequest(request.id);
      onAccept?.(request.id);
    } catch (error) {
      console.error('Failed to accept connection request:', error);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDecline = async () => {
    try {
      setIsDeclining(true);
      await declineConnectionRequest(request.id);
      onDecline?.(request.id);
    } catch (error) {
      console.error('Failed to decline connection request:', error);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${request.fromUser.id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className="bg-dark-lighter rounded-xl p-4 border border-dark-light hover:border-accent/30 transition-colors"
    >
      <div className="flex items-start space-x-4">
        <Avatar
          src={request.fromUser.avatar}
          alt={request.fromUser.name}
          size="md"
          onClick={handleProfileClick}
          className="cursor-pointer"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={handleProfileClick}
              className="text-left hover:text-accent transition-colors"
            >
              <h3 className="font-semibold text-white">{request.fromUser.name}</h3>
              <p className="text-sm text-gray-400">{request.fromUser.role}</p>
            </button>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(request.createdAt, { addSuffix: true })}
            </span>
          </div>

          {request.message && (
            <div className="mb-4 p-3 bg-dark rounded-lg border-l-4 border-accent">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium text-accent">Personal Message</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{request.message}</p>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Button
              variant="primary"
              size="sm"
              icon={Check}
              onClick={handleAccept}
              loading={isAccepting}
              disabled={isAccepting || isDeclining}
            >
              Accept
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={X}
              onClick={handleDecline}
              loading={isDeclining}
              disabled={isAccepting || isDeclining}
              className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
            >
              Decline
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
            >
              View Profile
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}