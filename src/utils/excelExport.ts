
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

export interface FinancialExportData {
  jobs: any[];
  leads: any[];
  clients: any[];
  timeEntries: any[];
  employees: any[];
  dateRange: string;
}

export const exportFinancialDataToExcel = (data: FinancialExportData) => {
  const workbook = XLSX.utils.book_new();

  // 1. Financial Summary Sheet
  const summaryData = createFinancialSummary(data);
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWS, 'Financial Summary');

  // 2. Revenue Analysis Sheet
  const revenueData = createRevenueAnalysis(data);
  const revenueWS = XLSX.utils.aoa_to_sheet(revenueData);
  XLSX.utils.book_append_sheet(workbook, revenueWS, 'Revenue Analysis');

  // 3. Jobs Details Sheet
  const jobsData = createJobsSheet(data.jobs);
  const jobsWS = XLSX.utils.json_to_sheet(jobsData);
  XLSX.utils.book_append_sheet(workbook, jobsWS, 'Jobs Details');

  // 4. Leads Analysis Sheet
  const leadsData = createLeadsSheet(data.leads);
  const leadsWS = XLSX.utils.json_to_sheet(leadsData);
  XLSX.utils.book_append_sheet(workbook, leadsWS, 'Leads Analysis');

  // 5. Client Performance Sheet
  const clientsData = createClientsSheet(data.clients);
  const clientsWS = XLSX.utils.json_to_sheet(clientsData);
  XLSX.utils.book_append_sheet(workbook, clientsWS, 'Client Performance');

  // 6. Payroll Details Sheet
  const payrollData = createPayrollSheet(data.timeEntries, data.employees);
  const payrollWS = XLSX.utils.json_to_sheet(payrollData);
  XLSX.utils.book_append_sheet(workbook, payrollWS, 'Payroll Details');

  // 7. Expense Breakdown Sheet
  const expenseData = createExpenseBreakdown(data);
  const expenseWS = XLSX.utils.aoa_to_sheet(expenseData);
  XLSX.utils.book_append_sheet(workbook, expenseWS, 'Expense Breakdown');

  // Generate filename with date
  const filename = `Bantu_Movers_Financial_Report_${data.dateRange}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
  
  // Write and download
  XLSX.writeFile(workbook, filename);
  
  return filename;
};

const createFinancialSummary = (data: FinancialExportData) => {
  const paidJobs = data.jobs.filter(job => job.status === 'completed' && job.is_paid);
  const unpaidJobs = data.jobs.filter(job => job.status === 'completed' && !job.is_paid);
  
  const paidRevenue = paidJobs.reduce((sum, job) => sum + (job.actual_total || job.estimated_total || 0), 0);
  const unpaidRevenue = unpaidJobs.reduce((sum, job) => sum + (job.actual_total || job.estimated_total || 0), 0);
  const totalLeadCosts = data.leads.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0);
  const totalPayroll = data.timeEntries
    .filter(entry => entry.is_paid)
    .reduce((sum, entry) => {
      const regularPay = (entry.regular_hours || 0) * (entry.hourly_rate || 0);
      const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate || 0);
      return sum + regularPay + overtimePay;
    }, 0);
  const totalEmployeeTips = data.timeEntries
    .filter(entry => entry.is_paid)
    .reduce((sum, entry) => sum + (entry.tip_amount || 0), 0);

  return [
    ['BANTU MOVERS - FINANCIAL SUMMARY', '', ''],
    ['Report Period:', data.dateRange, ''],
    ['Generated:', format(new Date(), 'yyyy-MM-dd HH:mm:ss'), ''],
    ['', '', ''],
    ['REVENUE METRICS', '', ''],
    ['Paid Revenue', `$${paidRevenue.toLocaleString()}`, '✅'],
    ['Unpaid Revenue', `$${unpaidRevenue.toLocaleString()}`, '⏳'],
    ['Total Revenue', `$${(paidRevenue + unpaidRevenue).toLocaleString()}`, '💰'],
    ['', '', ''],
    ['EXPENSE METRICS', '', ''],
    ['Marketing/Lead Costs', `$${totalLeadCosts.toLocaleString()}`, '📈'],
    ['Payroll (Wages)', `$${totalPayroll.toLocaleString()}`, '👥'],
    ['Employee Tips', `$${totalEmployeeTips.toLocaleString()}`, '💡'],
    ['Total Expenses', `$${(totalLeadCosts + totalPayroll + totalEmployeeTips).toLocaleString()}`, '💸'],
    ['', '', ''],
    ['PROFITABILITY', '', ''],
    ['Net Profit', `$${(paidRevenue - (totalLeadCosts + totalPayroll + totalEmployeeTips)).toLocaleString()}`, paidRevenue > (totalLeadCosts + totalPayroll + totalEmployeeTips) ? '✅' : '❌'],
    ['Profit Margin', `${paidRevenue > 0 ? (((paidRevenue - (totalLeadCosts + totalPayroll + totalEmployeeTips)) / paidRevenue) * 100).toFixed(1) : 0}%`, ''],
    ['ROI on Marketing', `${totalLeadCosts > 0 ? (((paidRevenue - (totalLeadCosts + totalPayroll + totalEmployeeTips)) / totalLeadCosts) * 100).toFixed(0) : 0}%`, ''],
    ['', '', ''],
    ['OPERATIONAL METRICS', '', ''],
    ['Total Jobs Completed', data.jobs.filter(j => j.status === 'completed').length.toString(), ''],
    ['Jobs Paid', paidJobs.length.toString(), ''],
    ['Payment Rate', `${data.jobs.filter(j => j.status === 'completed').length > 0 ? ((paidJobs.length / data.jobs.filter(j => j.status === 'completed').length) * 100).toFixed(1) : 0}%`, ''],
    ['Average Job Value', `$${paidJobs.length > 0 ? (paidRevenue / paidJobs.length).toFixed(0) : 0}`, ''],
    ['Total Leads', data.leads.length.toString(), ''],
    ['Converted Leads', data.leads.filter(l => l.status === 'converted').length.toString(), ''],
    ['Conversion Rate', `${data.leads.length > 0 ? ((data.leads.filter(l => l.status === 'converted').length / data.leads.length) * 100).toFixed(1) : 0}%`, '']
  ];
};

const createRevenueAnalysis = (data: FinancialExportData) => {
  const sourceBreakdown: Record<string, { revenue: number; jobs: number; leads: number }> = {};
  
  // Calculate revenue by source
  data.jobs.filter(job => job.status === 'completed' && job.is_paid).forEach(job => {
    const lead = data.leads.find(l => l.id === job.lead_id);
    const source = lead?.source || 'direct';
    
    if (!sourceBreakdown[source]) {
      sourceBreakdown[source] = { revenue: 0, jobs: 0, leads: 0 };
    }
    
    sourceBreakdown[source].revenue += job.actual_total || job.estimated_total || 0;
    sourceBreakdown[source].jobs++;
  });

  // Count leads by source
  data.leads.forEach(lead => {
    const source = lead.source;
    if (!sourceBreakdown[source]) {
      sourceBreakdown[source] = { revenue: 0, jobs: 0, leads: 0 };
    }
    sourceBreakdown[source].leads++;
  });

  const analysisData = [
    ['REVENUE BY LEAD SOURCE ANALYSIS', '', '', '', ''],
    ['Source', 'Total Revenue', 'Jobs Completed', 'Total Leads', 'Conversion Rate'],
    ['', '', '', '', '']
  ];

  Object.entries(sourceBreakdown)
    .sort(([,a], [,b]) => b.revenue - a.revenue)
    .forEach(([source, data]) => {
      const conversionRate = data.leads > 0 ? ((data.jobs / data.leads) * 100).toFixed(1) : '0';
      analysisData.push([
        source.replace('_', ' ').toUpperCase(),
        `$${data.revenue.toLocaleString()}`,
        data.jobs.toString(),
        data.leads.toString(),
        `${conversionRate}%`
      ]);
    });

  return analysisData;
};

const createJobsSheet = (jobs: any[]) => {
  return jobs.map(job => ({
    'Job Number': job.job_number,
    'Client Name': job.client_name,
    'Client Phone': job.client_phone,
    'Job Date': job.job_date,
    'Status': job.status,
    'Origin Address': job.origin_address,
    'Destination Address': job.destination_address,
    'Movers Needed': job.movers_needed,
    'Estimated Hours': job.estimated_duration_hours,
    'Actual Hours': job.actual_duration_hours,
    'Hourly Rate': `$${job.hourly_rate}`,
    'Estimated Total': `$${job.estimated_total}`,
    'Actual Total': `$${job.actual_total || 0}`,
    'Is Paid': job.is_paid ? 'Yes' : 'No',
    'Payment Method': job.payment_method || 'N/A',
    'Paid At': job.paid_at ? format(new Date(job.paid_at), 'yyyy-MM-dd') : 'Not Paid'
  }));
};

const createLeadsSheet = (leads: any[]) => {
  return leads.map(lead => ({
    'Lead Name': lead.name,
    'Phone': lead.phone,
    'Email': lead.email || 'N/A',
    'Source': lead.source.replace('_', ' ').toUpperCase(),
    'Status': lead.status.toUpperCase(),
    'Lead Cost': `$${lead.lead_cost || 0}`,
    'Estimated Value': `$${lead.estimated_value || 0}`,
    'Created Date': format(new Date(lead.created_at), 'yyyy-MM-dd'),
    'Follow Up Date': lead.follow_up_date ? format(new Date(lead.follow_up_date), 'yyyy-MM-dd') : 'None',
    'Notes': lead.notes || 'None'
  }));
};

const createClientsSheet = (clients: any[]) => {
  return clients.map(client => ({
    'Client Name': client.name,
    'Phone': client.phone,
    'Email': client.email || 'N/A',
    'Company': client.company_name || 'Individual',
    'Primary Address': client.primary_address,
    'Total Jobs Completed': client.total_jobs_completed || 0,
    'Total Revenue': `$${client.total_revenue || 0}`,
    'Rating': client.rating || 'Not Rated',
    'Created Date': format(new Date(client.created_at), 'yyyy-MM-dd'),
    'Preferred Contact': client.preferred_contact_method || 'Phone'
  }));
};

const createPayrollSheet = (timeEntries: any[], employees: any[]) => {
  return timeEntries.filter(entry => entry.is_paid).map(entry => {
    const employee = employees.find(emp => emp.id === entry.employee_id);
    const regularPay = (entry.regular_hours || 0) * (entry.hourly_rate || 0);
    const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate || 0);
    
    return {
      'Employee Name': employee?.name || 'Unknown',
      'Employee Number': employee?.employee_number || 'N/A',
      'Entry Date': format(new Date(entry.entry_date), 'yyyy-MM-dd'),
      'Clock In': format(new Date(entry.clock_in_time), 'HH:mm'),
      'Clock Out': entry.clock_out_time ? format(new Date(entry.clock_out_time), 'HH:mm') : 'Still Working',
      'Regular Hours': entry.regular_hours || 0,
      'Overtime Hours': entry.overtime_hours || 0,
      'Hourly Rate': `$${entry.hourly_rate}`,
      'Overtime Rate': `$${entry.overtime_rate || entry.hourly_rate}`,
      'Regular Pay': `$${regularPay.toFixed(2)}`,
      'Overtime Pay': `$${overtimePay.toFixed(2)}`,
      'Tips': `$${entry.tip_amount || 0}`,
      'Total Pay': `$${entry.total_pay || (regularPay + overtimePay + (entry.tip_amount || 0)).toFixed(2)}`,
      'Status': entry.status.toUpperCase(),
      'Paid At': entry.paid_at ? format(new Date(entry.paid_at), 'yyyy-MM-dd') : 'Pending'
    };
  });
};

const createExpenseBreakdown = (data: FinancialExportData) => {
  const totalLeadCosts = data.leads.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0);
  const totalPayroll = data.timeEntries
    .filter(entry => entry.is_paid)
    .reduce((sum, entry) => {
      const regularPay = (entry.regular_hours || 0) * (entry.hourly_rate || 0);
      const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate || 0);
      return sum + regularPay + overtimePay;
    }, 0);
  const totalEmployeeTips = data.timeEntries
    .filter(entry => entry.is_paid)
    .reduce((sum, entry) => sum + (entry.tip_amount || 0), 0);

  // Lead costs by source
  const leadCostsBySource: Record<string, number> = {};
  data.leads.forEach(lead => {
    const source = lead.source;
    leadCostsBySource[source] = (leadCostsBySource[source] || 0) + (lead.lead_cost || 0);
  });

  const expenseData = [
    ['DETAILED EXPENSE BREAKDOWN', '', ''],
    ['', '', ''],
    ['MARKETING/LEAD COSTS BY SOURCE', '', ''],
    ['Source', 'Total Cost', 'Percentage'],
    ['', '', '']
  ];

  Object.entries(leadCostsBySource)
    .sort(([,a], [,b]) => b - a)
    .forEach(([source, cost]) => {
      const percentage = totalLeadCosts > 0 ? ((cost / totalLeadCosts) * 100).toFixed(1) : '0';
      expenseData.push([
        source.replace('_', ' ').toUpperCase(),
        `$${cost.toLocaleString()}`,
        `${percentage}%`
      ]);
    });

  expenseData.push(
    ['', '', ''],
    ['PAYROLL SUMMARY', '', ''],
    ['Category', 'Amount', 'Notes'],
    ['Total Wages', `$${totalPayroll.toLocaleString()}`, 'Regular + Overtime'],
    ['Employee Tips', `$${totalEmployeeTips.toLocaleString()}`, 'Tips paid to employees'],
    ['Total Payroll Expense', `$${(totalPayroll + totalEmployeeTips).toLocaleString()}`, 'Including tips'],
    ['', '', ''],
    ['OVERALL EXPENSE SUMMARY', '', ''],
    ['Marketing/Lead Costs', `$${totalLeadCosts.toLocaleString()}`, `${totalLeadCosts + totalPayroll + totalEmployeeTips > 0 ? ((totalLeadCosts / (totalLeadCosts + totalPayroll + totalEmployeeTips)) * 100).toFixed(1) : 0}%`],
    ['Payroll Expenses', `$${(totalPayroll + totalEmployeeTips).toLocaleString()}`, `${totalLeadCosts + totalPayroll + totalEmployeeTips > 0 ? (((totalPayroll + totalEmployeeTips) / (totalLeadCosts + totalPayroll + totalEmployeeTips)) * 100).toFixed(1) : 0}%`],
    ['TOTAL EXPENSES', `$${(totalLeadCosts + totalPayroll + totalEmployeeTips).toLocaleString()}`, '100%']
  );

  return expenseData;
};
