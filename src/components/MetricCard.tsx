
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | negative' | 'neutral';
  bgColor?: string;
  textColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  bgColor = 'bg-white',
  textColor = 'text-gray-900'
}) => {
  const changeColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <div className={`${bgColor} rounded-xl shadow-lg p-6 border-2 border-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor} opacity-90`}>{title}</p>
          <p className={`text-3xl font-bold ${textColor} mt-2`}>{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${textColor} opacity-80`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-white bg-opacity-20 rounded-full">
          <Icon className={`h-8 w-8 ${textColor}`} />
        </div>
      </div>
    </div>
  );
};
