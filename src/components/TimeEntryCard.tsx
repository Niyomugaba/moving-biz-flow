
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Calendar, DollarSign } from 'lucide-react';
import { TimeEntry } from '@/hooks/useTimeEntries';
import { format } from 'date-fns';

interface TimeEntryCardProps {
  entry: TimeEntry;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onResetStatus: (id: string) => void;
  isApproving?: boolean;
  isRejecting?: boolean;
}

export const TimeEntryCard = ({ 
  entry, 
  onApprove, 
  onReject, 
  onResetStatus,
  isApproving = false,
  isRejecting = false 
}: TimeEntryCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatTime = (timeString: string) => {
    return format(new Date(timeString), 'h:mm a');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const totalHours = (entry.regular_hours || 0) + (entry.overtime_hours || 0);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">Employee ID: {entry.employee_id.slice(0, 8)}</span>
          </div>
          <Badge className={getStatusColor(entry.status)}>
            {entry.status.toUpperCase()}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span>{formatDate(entry.entry_date)}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>
              <strong>Clock In:</strong> {formatTime(entry.clock_in_time)}
              {entry.clock_out_time && (
                <>
                  {' • '}
                  <strong>Clock Out:</strong> {formatTime(entry.clock_out_time)}
                </>
              )}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-gray-500" />
            <span>
              <strong>Hours:</strong> {totalHours.toFixed(1)}h
              {entry.total_pay && (
                <>
                  {' • '}
                  <strong>Pay:</strong> ${entry.total_pay.toFixed(2)}
                </>
              )}
            </span>
          </div>

          {entry.notes && (
            <div className="text-gray-600 italic">
              <strong>Notes:</strong> {entry.notes}
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          {entry.status === 'pending' && (
            <>
              <Button
                size="sm"
                onClick={() => onApprove(entry.id)}
                disabled={isApproving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isApproving ? 'Approving...' : 'Approve'}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onReject(entry.id)}
                disabled={isRejecting}
              >
                {isRejecting ? 'Rejecting...' : 'Reject'}
              </Button>
            </>
          )}
          
          {(entry.status === 'approved' || entry.status === 'rejected') && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onResetStatus(entry.id)}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              Reset to Pending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
