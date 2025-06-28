
import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Briefcase,
  Calculator
} from 'lucide-react';

export const Financials = () => {
  // Mock financial data
  const financialData = {
    monthlyRevenue: 18750,
    monthlyExpenses: 9200,
    monthlyProfit: 9550,
    leadCost: 680,
    payrollCost: 7850,
    conversionRate: 62,
    profitMargin: 51,
    averageJobValue: 875,
    revenueGrowth: 18,
    profitGrowth: 22
  };

  const jobBreakdown = [
    {
      client: 'Johnson Residence',
      date: '2024-01-15',
      revenue: 850,
      laborCost: 360,
      profit: 490,
      profitMargin: 58
    },
    {
      client: 'Smith Office Move',
      date: '2024-01-14',
      revenue: 1200,
      laborCost: 480,
      profit: 720,
      profitMargin: 60
    },
    {
      client: 'Davis Family',
      date: '2024-01-13',
      revenue: 950,
      laborCost: 320,
      profit: 630,
      profitMargin: 66
    }
  ];

  const monthlyTrends = [
    { month: 'Sep', revenue: 15200, profit: 7800 },
    { month: 'Oct', revenue: 16800, profit: 8600 },
    { month: 'Nov', revenue: 17500, profit: 9100 },
    { month: 'Dec', revenue: 18750, profit: 9550 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600 mt-2">Track your business performance and profitability</p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Monthly Revenue"
          value={`$${financialData.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={`+${financialData.revenueGrowth}% from last month`}
          changeType="positive"
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Monthly Profit"
          value={`$${financialData.monthlyProfit.toLocaleString()}`}
          icon={TrendingUp}
          change={`+${financialData.profitGrowth}% from last month`}
          changeType="positive"
          bgColor="bg-blue-50"
        />
        <MetricCard
          title="Profit Margin"
          value={`${financialData.profitMargin}%`}
          icon={Calculator}
          change="+3% from last month"
          changeType="positive"
        />
        <MetricCard
          title="Avg Job Value"
          value={`$${financialData.averageJobValue}`}
          icon={Briefcase}
          change="+$50 from last month"
          changeType="positive"
        />
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Revenue</span>
              <span className="font-semibold text-green-600">
                ${financialData.monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Labor Costs</span>
              <span className="font-semibold text-red-600">
                -${financialData.payrollCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lead Costs</span>
              <span className="font-semibold text-red-600">
                -${financialData.leadCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Other Expenses</span>
              <span className="font-semibold text-red-600">
                -${(financialData.monthlyExpenses - financialData.payrollCost - financialData.leadCost).toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Net Profit</span>
                <span className="text-lg font-bold text-green-600">
                  ${financialData.monthlyProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Lead Performance</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Leads</span>
              <span className="font-semibold">45</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Converted Leads</span>
              <span className="font-semibold text-green-600">28</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-blue-600">{financialData.conversionRate}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost Per Lead</span>
              <span className="font-semibold">${Math.round(financialData.leadCost / 45)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cost Per Conversion</span>
              <span className="font-semibold">${Math.round(financialData.leadCost / 28)}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">ROI on Leads</span>
                <span className="text-lg font-bold text-green-600">
                  {Math.round((financialData.monthlyRevenue / financialData.leadCost) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Job Profitability */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Job Profitability Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Detailed breakdown of recent completed jobs</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Labor Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Margin
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobBreakdown.map((job, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${job.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${job.laborCost.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ${job.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {job.profitMargin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">4-Month Trend</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {monthlyTrends.map((month, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{month.month} 2023</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                ${month.revenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 font-medium">
                ${month.profit.toLocaleString()} profit
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Reports</h2>
        <div className="flex flex-wrap gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Export Monthly Report (PDF)
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Export Financial Data (CSV)
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Export Lead Analysis (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};
