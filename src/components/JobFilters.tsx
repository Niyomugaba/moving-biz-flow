
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Filter, 
  Calendar, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Archive,
  Eye,
  RotateCcw
} from 'lucide-react';

interface JobFiltersProps {
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  showArchived: boolean;
  onToggleArchive: () => void;
  archivedCount: number;
  activeCount: number;
}

const statusOptions = [
  { value: 'all', label: 'All Jobs', icon: Eye, color: 'bg-gray-100 text-gray-800' },
  { value: 'pending_schedule', label: 'Pending', icon: Clock, color: 'bg-orange-100 text-orange-800' },
  { value: 'scheduled', label: 'Scheduled', icon: Calendar, color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', icon: RotateCcw, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'completed', label: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', icon: XCircle, color: 'bg-red-100 text-red-800' },
];

export const JobFilters: React.FC<JobFiltersProps> = ({
  selectedStatus,
  onStatusChange,
  showArchived,
  onToggleArchive,
  archivedCount,
  activeCount
}) => {
  return (
    <div className="space-y-4">
      {/* Archive Toggle */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-purple-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Job View</h3>
            <p className="text-sm text-gray-600">
              {showArchived ? 'Viewing archived jobs' : 'Viewing active jobs'}
            </p>
          </div>
        </div>
        <Button
          onClick={onToggleArchive}
          variant={showArchived ? "default" : "outline"}
          className={showArchived 
            ? "bg-purple-600 hover:bg-purple-700" 
            : "border-purple-200 text-purple-700 hover:bg-purple-50"
          }
        >
          <Archive className="h-4 w-4 mr-2" />
          {showArchived ? `Active (${activeCount})` : `Archive (${archivedCount})`}
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2">
        {statusOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedStatus === option.value;
          
          return (
            <Button
              key={option.value}
              onClick={() => onStatusChange(option.value)}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={isSelected 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "border-gray-200 hover:bg-gray-50"
              }
            >
              <Icon className="h-4 w-4 mr-2" />
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
