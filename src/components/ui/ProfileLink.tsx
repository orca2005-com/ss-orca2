import React from 'react';
import { useNavigate } from 'react-router-dom';

interface ProfileLinkProps {
  userId: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function ProfileLink({ userId, children, className = '', onClick }: ProfileLinkProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
    navigate(`/profile/${userId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-200 ${className}`}
    >
      {children}
    </button>
  );
}