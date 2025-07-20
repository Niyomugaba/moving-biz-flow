
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  Target,
  Clock,
  Repeat,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface KPIData {
  totalRevenue: number;
  monthlyGrowth: number;
  profitMargin: number;
  conversionRate: number;
  averageJobValue: number;
  repeatCustomerRate: number;
  completionRate: number;
  activeJobs: number;
  monthlyRevenueData: Array<{ month: string; revenue: number; profit: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  topPerformingMetrics: Array<{ metric: string; value: string; trend: 'up' | 'down' | 'stable' }>;
}

interface AdvancedKPIDashboardProps {
  data: KPIData;
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

export const AdvancedKPIDashboard: React.FC<AdvancedKPIDashboardProps> = ({ data }) => {
  const kpiCards = [
    {
      title: 'Monthly Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: data.monthlyGrowth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Profit Margin',
      value: `${data.profitMargin.toFixed(1)}%`,
      target: 30,
      current: data.profitMargin,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Lead Conversion',
      value: `${data.conversionRate.toFixed(1)}%`,
      target: 40,
      current: data.conversionRate,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Avg Job Value',
      value: `$${data.averageJobValue.toFixed(0)}`,
      target: 500,
      current: data.averageJobValue,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Repeat Customers',
      value: `${data.repeatCustomerRate.toFixed(1)}%`,
      target: 25,
      current: data.repeatCustomerRate,
      icon: Repeat,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Completion Rate',
      value: `${data.completionRate.toFixed(1)}%`,
      target: 95,
      current: data.completionRate,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;
          const isOnTarget = kpi.target ? kpi.current >= kpi.target : true;
          
          return (
            <Card key={index} className={`${kpi.bgColor} border-l-4 border-l-current hover:shadow-lg transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{kpi.title}</CardTitle>
                <Icon className={`h-5 w-5 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-2">{kpi.value}</div>
                
                {kpi.target && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Target: {kpi.target}{kpi.title.includes('%') ? '%' : ''}</span>
                      <span className={isOnTarget ? 'text-green-600' : 'text-orange-600'}>
                        {isOnTarget ? '✓ On Track' : '⚠ Below Target'}
                      </span>
                    </div>
                    <Progress 
                      value={Math.min((kpi.current / kpi.target) * 100, 100)} 
                      className="h-2"
                    />
                  </div>
                )}
                
                {kpi.change !== undefined && (
                  <div className={`flex items-center text-sm ${kpi.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                    {Math.abs(kpi.change).toFixed(1)}% vs last month
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue & Profit Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Job Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Job Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Alerts */}
      <Card className="border-l-4 border-l-yellow-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.topPerformingMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{metric.metric}</div>
                  <div className="text-lg font-bold text-gray-700">{metric.value}</div>
                </div>
                <div className={`p-2 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100 text-green-600' :
                  metric.trend === 'down' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {metric.trend === 'up' && <TrendingUp className="h-4 w-4" />}
                  {metric.trend === 'down' && <TrendingDown className="h-4 w-4" />}
                  {metric.trend === 'stable' && <Clock className="h-4 w-4" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
