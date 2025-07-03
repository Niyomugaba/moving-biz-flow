
import React from 'react';
import { Badge } from './ui/badge';

interface StatusBadgeProps {
  status: string;
  variant?: 'job' | 'lead' | 'employee' | 'time_entry';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, variant = 'job' }) => {
  const getStatusConfig = (status: string, variant: string) => {
    if (variant === 'job') {
      switch (status) {
        case 'pending_schedule':
          return { text: 'Pending Schedule', className: 'bg-orange-100 text-orange-800 border-orange-200' };
        case 'scheduled':
          return { text: 'Scheduled', className: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'in_progress':
          return { text: 'In Progress', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'completed':
          return { text: 'Completed', className: 'bg-green-100 text-green-800 border-green-200' };
        case 'cancelled':
          return { text: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' };
        case 'rescheduled':
          return { text: 'Rescheduled', className: 'bg-purple-100 text-purple-800 border-purple-200' };
        default:
          return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
      }
    }

    if (variant === 'lead') {
      switch (status) {
        case 'new':
          return { text: 'New', className: 'bg-blue-100 text-blue-800 border-blue-200' };
        case 'contacted':
          return { text: 'Contacted', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'quoted':
          return { text: 'Quoted', className: 'bg-purple-100 text-purple-800 border-purple-200' };
        case 'converted':
          return { text: 'Converted', className: 'bg-green-100 text-green-800 border-green-200' };
        case 'lost':
          return { text: 'Lost', className: 'bg-red-100 text-red-800 border-red-200' };
        default:
          return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
      }
    }

    if (variant === 'employee') {
      switch (status) {
        case 'active':
          return { text: 'Active', className: 'bg-green-100 text-green-800 border-green-200' };
        case 'inactive':
          return { text: 'Inactive', className: 'bg-red-100 text-red-800 border-red-200' };
        case 'on_leave':
          return { text: 'On Leave', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        default:
          return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
      }
    }

    if (variant === 'time_entry') {
      switch (status) {
        case 'pending':
          return { text: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
        case 'approved':
          return { text: 'Approved', className: 'bg-green-100 text-green-800 border-green-200' };
        case 'rejected':
          return { text: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200' };
        default:
          return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
      }
    }

    return { text: status, className: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const config = getStatusConfig(status, variant);

  return (
    <Badge className={`${config.className} capitalize`}>
      {config.text}
    </Badge>
  );
};
