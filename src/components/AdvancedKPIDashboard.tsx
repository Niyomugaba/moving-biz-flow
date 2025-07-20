
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, ComposedChart } from 'recharts';

interface KPIData {
  totalRevenue: number;
  monthlyGrowth: number;
  profitMargin: number;
  conversionRate: number;
  averageJobValue: number;
  repeatCustomerRate: number;
  completionRate: number;
  activeJobs: number;
  customerAcquisitionCost: number;
  revenuePerEmployee: number;
  monthlyRevenueData: Array<{ month: string; revenue: number; profit: number; jobs: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  financialMetrics: Array<{ metric: string; value: string; trend: 'up' | 'down' | 'stable'; description: string }>;
}

interface AdvancedKPIDashboardProps {
  data: KPIData;
}

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

export const AdvancedKPIDashboard: React.FC<AdvancedKPIDashboardProps> = ({ data }) => {
  const performanceMetrics = [
    {
      title: 'Monthly Revenue',
      value: `$${data.totalRevenue.toLocaleString()}`,
      change: data.monthlyGrowth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Total revenue this period'
    },
    {
      title: 'Profit Margin',
      value: `${data.profitMargin.toFixed(1)}%`,
      change: data.profitMargin > 20 ? 5.2 : -2.1,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Gross profit percentage'
    },
    {
      title: 'Lead Conversion',
      value: `${data.conversionRate.toFixed(1)}%`,
      change: data.conversionRate > 30 ? 8.3 : -1.5,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Leads converted to jobs'
    },
    {
      title: 'Avg Job Value',
      value: `$${data.averageJobValue.toFixed(0)}`,
      change: data.averageJobValue > 400 ? 12.1 : -3.2,
      icon: Calendar,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Average revenue per job'
    },
    {
      title: 'Customer Retention',
      value: `${data.repeatCustomerRate.toFixed(1)}%`,
      change: data.repeatCustomerRate > 20 ? 15.7 : -5.1,
      icon: Repeat,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Repeat customer rate'
    },
    {
      title: 'Job Completion',
      value: `${data.completionRate.toFixed(1)}%`,
      change: data.completionRate > 80 ? 3.5 : -1.8,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Jobs completed successfully'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.change >= 0;
          
          return (
            <Card key={index} className={`${metric.bgColor} border-l-4 border-l-current hover:shadow-lg transition-shadow`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{metric.title}</CardTitle>
                <Icon className={`h-5 w-5 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-xs text-gray-600 mb-2">{metric.description}</div>
                
                <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(metric.change).toFixed(1)}% vs last period
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue, Profit & Jobs Combined Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Revenue & Job Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={data.monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip formatter={(value, name) => {
                  if (name === 'Jobs') return [value, 'Jobs Completed'];
                  return [`$${value}`, name];
                }} />
                <Bar yAxisId="right" dataKey="jobs" fill="#8B5CF6" name="Jobs" />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} name="Revenue" />
                <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#3B82F6" strokeWidth={3} name="Profit" />
              </ComposedChart>
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

      {/* Financial Performance Insights */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Financial Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.financialMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{metric.metric}</div>
                  <div className="text-lg font-bold text-gray-700">{metric.value}</div>
                  <div className="text-xs text-gray-500">{metric.description}</div>
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

      {/* Key Business Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Key Business Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Revenue Metrics</h4>
              <div className="text-2xl font-bold text-green-600">${data.totalRevenue.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Monthly Revenue</div>
              <div className="text-lg font-semibold">${data.averageJobValue.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Average Job Value</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Customer Metrics</h4>
              <div className="text-2xl font-bold text-blue-600">{data.conversionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Conversion Rate</div>
              <div className="text-lg font-semibold">{data.repeatCustomerRate.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">Repeat Customer Rate</div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Operational Metrics</h4>
              <div className="text-2xl font-bold text-purple-600">{data.completionRate.toFixed(1)}%</div>
              <div className="text-sm text-gray-600">Job Completion Rate</div>
              <div className="text-lg font-semibold">${data.revenuePerEmployee.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Revenue per Employee</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
