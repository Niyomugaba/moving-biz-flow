
import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'lead' | 'job' | 'employee';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'lead' }) => {
  const getStatusStyles = () => {
    const baseStyles = 'px-2 py-1 rounded-full text-xs font-medium';
    
    switch (status.toLowerCase()) {
      case 'new':
        return `${baseStyles} bg-blue-100 text-blue-800`;
      case 'contacted':
        return `${baseStyles} bg-yellow-100 text-yellow-800`;
      case 'converted':
        return `${baseStyles} bg-green-100 text-green-800`;
      case 'lost':
        return `${baseStyles} bg-red-100 text-red-800`;
      case 'scheduled':
        return `${baseStyles} bg-purple-100 text-purple-800`;
      case 'in progress':
        return `${baseStyles} bg-orange-100 text-orange-800`;
      case 'completed':
        return `${baseStyles} bg-green-100 text-green-800`;
      case 'active':
        return `${baseStyles} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseStyles} bg-gray-100 text-gray-800`;
      default:
        return `${baseStyles} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <span className={getStatusStyles()}>
      {status}
    </span>
  );
};
