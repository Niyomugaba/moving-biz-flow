
import React from 'react';
import { MetricCard } from '../components/MetricCard';
import { useJobs } from '@/hooks/useJobs';
import { useLeads } from '@/hooks/useLeads';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useEmployees } from '@/hooks/useEmployees';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator,
  Briefcase
} from 'lucide-react';

export const Financials = () => {
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { timeEntries } = useTimeEntries();
  const { employees } = useEmployees();

  // Calculate real financial metrics
  const completedJobs = jobs.filter(job => job.status === 'Completed');
  const paidJobs = completedJobs.filter(job => job.paid);
  const unpaidJobs = completedJobs.filter(job => !job.paid);
  
  const monthlyRevenue = paidJobs.reduce((sum, job) => sum + (job.hourly_rate * job.actual_hours), 0);
  const unpaidRevenue = unpaidJobs.reduce((sum, job) => sum + (job.hourly_rate * job.actual_hours), 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTimeEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.entry_date);
    return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
  });
  
  const actualLaborCost = monthlyTimeEntries.reduce((sum, entry) => 
    sum + (entry.hours_worked * entry.hourly_rate), 0
  );
  
  const leadCost = leads.reduce((sum, lead) => sum + (lead.cost || 0), 0);
  const monthlyExpenses = actualLaborCost + leadCost;
  const monthlyProfit = monthlyRevenue - monthlyExpenses;
  const profitMargin = monthlyRevenue > 0 ? Math.round((monthlyProfit / monthlyRevenue) * 100) : 0;
  
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const conversionRate = leads.length > 0 ? Math.round((convertedLeads / leads.length) * 100) : 0;
  const averageJobValue = paidJobs.length > 0 ? Math.round(monthlyRevenue / paidJobs.length) : 0;

  // Recent job profitability
  const recentJobsWithProfitability = completedJobs.slice(0, 5).map(job => {
    const jobTimeEntries = timeEntries.filter(entry => entry.job_id === job.id);
    const actualLaborCost = jobTimeEntries.reduce((sum, entry) => 
      sum + (entry.hours_worked * entry.hourly_rate), 0
    );
    const revenue = job.hourly_rate * job.actual_hours;
    const profit = revenue - actualLaborCost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    
    return {
      ...job,
      revenue,
      actualLaborCost,
      profit,
      margin
    };
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600 mt-2">Real-time business performance and profitability tracking</p>
      </div>

      {/* Key Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Paid Revenue"
          value={`$${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={`From ${paidJobs.length} paid jobs`}
          changeType={monthlyRevenue > 0 ? "positive" : "neutral"}
          bgColor="bg-green-50"
        />
        <MetricCard
          title="Unpaid Revenue"
          value={`$${unpaidRevenue.toLocaleString()}`}
          icon={TrendingUp}
          change={`From ${unpaidJobs.length} unpaid jobs`}
          changeType={unpaidRevenue > 0 ? "neutral" : "positive"}
          bgColor="bg-orange-50"
        />
        <MetricCard
          title="Monthly Profit"
          value={`$${monthlyProfit.toLocaleString()}`}
          icon={Calculator}
          change={monthlyProfit > 0 ? `${profitMargin}% margin` : "Complete and get paid for jobs"}
          changeType={monthlyProfit > 0 ? "positive" : "neutral"}
        />
        <MetricCard
          title="Avg Paid Job Value"
          value={`$${averageJobValue}`}
          icon={Briefcase}
          change={paidJobs.length > 0 ? `From ${paidJobs.length} paid jobs` : "No paid jobs yet"}
          changeType={paidJobs.length > 0 ? "positive" : "neutral"}
        />
      </div>

      {/* Revenue vs Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid Revenue</span>
              <span className="font-semibold text-green-600">
                ${monthlyRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unpaid Revenue</span>
              <span className="font-semibold text-orange-600">
                ${unpaidRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Actual Labor Costs</span>
              <span className="font-semibold text-red-600">
                -${actualLaborCost.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Lead Acquisition Costs</span>
              <span className="font-semibold text-red-600">
                -${leadCost.toLocaleString()}
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Net Profit (Paid Only)</span>
                <span className={`text-lg font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${monthlyProfit.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Completed Jobs</span>
              <span className="font-semibold">{completedJobs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Paid Jobs</span>
              <span className="font-semibold text-green-600">{paidJobs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Unpaid Jobs</span>
              <span className="font-semibold text-red-600">{unpaidJobs.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Rate</span>
              <span className="font-semibold text-blue-600">
                {completedJobs.length > 0 ? Math.round((paidJobs.length / completedJobs.length) * 100) : 0}%
              </span>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Outstanding Amount</span>
                <span className="text-lg font-bold text-orange-600">
                  ${unpaidRevenue.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Job Profitability Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Job Profitability Analysis</h2>
          <p className="text-sm text-gray-600 mt-1">Real profitability based on actual hours worked</p>
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
                  Payment Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual Labor Cost
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
              {recentJobsWithProfitability.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.client_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.job_date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${job.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {job.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    ${job.actualLaborCost.toLocaleString()}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${job.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${job.profit.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.margin >= 50 ? 'bg-green-100 text-green-800' :
                      job.margin >= 30 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {job.margin}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {recentJobsWithProfitability.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No completed jobs with time entries yet. Complete some jobs and have employees log their hours to see profitability analysis.
          </div>
        )}
      </div>

      {/* Employee Productivity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Employee Productivity This Month</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {employees.map((employee) => {
            const employeeEntries = monthlyTimeEntries.filter(entry => entry.employee_id === employee.id);
            const totalHours = employeeEntries.reduce((sum, entry) => sum + entry.hours_worked, 0);
            const totalEarnings = employeeEntries.reduce((sum, entry) => sum + (entry.hours_worked * entry.hourly_rate), 0);
            
            return (
              <div key={employee.id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{employee.name}</p>
                <p className="text-sm text-gray-600">{totalHours}h worked</p>
                <p className="text-sm font-medium text-green-600">${totalEarnings.toLocaleString()} earned</p>
              </div>
            );
          })}
        </div>
        {employees.length === 0 && (
          <p className="text-gray-500 text-center">No employees added yet.</p>
        )}
      </div>
    </div>
  );
};
