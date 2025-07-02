
import React from 'react';
import { MetricCard } from '@/components/MetricCard';
import { WelcomeMessage } from '@/components/WelcomeMessage';
import { QuickAccessLinks } from '@/components/QuickAccessLinks';
import { useAuth } from '@/hooks/useAuth';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export const Dashboard = () => {
  const { profile, userRole } = useAuth();

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <WelcomeMessage />
      
      {/* Quick Access Links - Only show for owners/admins */}
      {(userRole?.role === 'owner' || userRole?.role === 'admin') && (
        <QuickAccessLinks />
      )}
      
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Active Jobs"
          value="12"
          icon={Calendar}
          trend={{ value: 8, isPositive: true }}
          className="bg-blue-50 border-blue-200"
        />
        <MetricCard
          title="Total Revenue"
          value="$15,420"
          icon={DollarSign}
          trend={{ value: 12, isPositive: true }}
          className="bg-green-50 border-green-200"
        />
        <MetricCard
          title="Active Employees"
          value="8"
          icon={Users}
          trend={{ value: 2, isPositive: true }}
          className="bg-purple-50 border-purple-200"
        />
        <MetricCard
          title="New Leads"
          value="24"
          icon={Phone}
          trend={{ value: 5, isPositive: false }}
          className="bg-orange-50 border-orange-200"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Hours Logged"
          value="156"
          icon={Clock}
          className="bg-gray-50 border-gray-200"
        />
        <MetricCard
          title="Completed Jobs"
          value="89"
          icon={CheckCircle}
          className="bg-emerald-50 border-emerald-200"
        />
        <MetricCard
          title="Pending Tasks"
          value="7"
          icon={AlertCircle}
          className="bg-yellow-50 border-yellow-200"
        />
        <MetricCard
          title="Growth Rate"
          value="23%"
          icon={TrendingUp}
          className="bg-indigo-50 border-indigo-200"
        />
      </div>
    </div>
  );
};
