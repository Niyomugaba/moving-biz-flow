
import React from 'react';
import { DollarSign, TrendingUp, Clock, Users, Calendar, CheckCircle } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useLeads } from '@/hooks/useLeads';

export const Financials = () => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const { timeEntries } = useTimeEntries();
  const { leads } = useLeads();

  // Financial calculations
  const totalRevenue = jobs
    .filter(job => job.status === 'completed' && job.is_paid)
    .reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0);

  const pendingPayments = jobs
    .filter(job => job.status === 'completed' && !job.is_paid)
    .reduce((sum, job) => sum + (job.hourly_rate * (job.actual_duration_hours || 0)), 0);

  const monthlyPayroll = timeEntries
    .filter(entry => {
      const entryDate = new Date(entry.entry_date);
      const currentDate = new Date();
      return entryDate.getMonth() === currentDate.getMonth() && 
             entryDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, entry) => sum + (entry.hourly_rate * (entry.regular_hours || 0)), 0);

  const totalLeadValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

  const unpaidPayroll = timeEntries
    .filter(entry => !entry.is_paid)
    .reduce((sum, entry) => sum + (entry.hourly_rate * (entry.regular_hours || 0)), 0);

  const netProfit = totalRevenue - monthlyPayroll;
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0;

  // Recent transactions
  const recentJobs = jobs
    .filter(job => job.status === 'completed')
    .sort((a, b) => new Date(b.job_date).getTime() - new Date(a.job_date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Overview</h1>
        <p className="text-gray-600 mt-2">Track revenue, expenses, and financial performance</p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-orange-600">${pendingPayments.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
              <p className="text-2xl font-bold text-blue-600">${monthlyPayroll.toLocaleString()}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${netProfit.toLocaleString()}
              </p>
            </div>
            <TrendingUp className={`h-8 w-8 ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
              <p className="text-2xl font-bold text-purple-600">${totalLeadValue.toLocaleString()}</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unpaid Payroll</p>
              <p className="text-2xl font-bold text-red-600">${unpaidPayroll.toLocaleString()}</p>
            </div>
            <Clock className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitMargin.toFixed(1)}%
              </p>
            </div>
            <CheckCircle className={`h-8 w-8 ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Completed Jobs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentJobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{job.client_name}</div>
                      <div className="text-sm text-gray-500">{job.client_phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.job_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.actual_duration_hours || 0}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${job.hourly_rate}/hr
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(job.hourly_rate * (job.actual_duration_hours || 0)).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.is_paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {job.is_paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recentJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No completed jobs yet</div>
          <p className="text-gray-400 mt-2">Financial data will appear here once you complete some jobs</p>
        </div>
      )}
    </div>
  );
};
