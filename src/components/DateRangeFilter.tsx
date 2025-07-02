
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export type DateRange = 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'since_inception';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  onRefresh?: () => void;
  className?: string;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  selectedRange,
  onRangeChange,
  onRefresh,
  className
}) => {
  const dateRangeOptions = [
    { value: 'today' as DateRange, label: 'Today' },
    { value: 'this_week' as DateRange, label: 'This Week' },
    { value: 'this_month' as DateRange, label: 'This Month' },
    { value: 'this_quarter' as DateRange, label: 'This Quarter' },
    { value: 'this_year' as DateRange, label: 'This Year' },
    { value: 'since_inception' as DateRange, label: 'Since Inception' }
  ];

  const getCurrentRangeLabel = () => {
    const option = dateRangeOptions.find(opt => opt.value === selectedRange);
    return option?.label || 'Select Range';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Date Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedRange} onValueChange={onRangeChange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select range">
                  {getCurrentRangeLabel()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {dateRangeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Refresh
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
