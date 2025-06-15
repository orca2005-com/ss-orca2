import React from 'react';
import { ProfileLink } from './ProfileLink';

interface UserNameProps {
  userId: string;
  name: string;
  className?: string;
  clickable?: boolean;
}

export function UserName({ userId, name, className = '', clickable = true }: UserNameProps) {
  if (!clickable) {
    return <span className={className}>{name}</span>;
  }

  return (
    <ProfileLink 
      userId={userId} 
      className={`hover:text-accent transition-colors ${className}`}
    >
      {name}
    </ProfileLink>
  );
}