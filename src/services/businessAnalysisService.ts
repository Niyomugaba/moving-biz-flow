export interface BusinessMetrics {
  totalRevenue: number;
  totalJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  averageJobValue: number;
  conversionRate: number;
  totalLeads: number;
  convertedLeads: number;
  totalLeadCost: number;
  profitMargin: number;
  totalExpenses: number;
  netProfit: number;
  averageJobDuration: number;
  employeeUtilization: number;
  repeatCustomerRate: number;
}

export interface BusinessInsight {
  category: 'revenue' | 'profitability' | 'operations' | 'marketing' | 'workforce' | 'competitive';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedOutcome: string;
  timeframe: string;
  metrics?: { label: string; value: string }[];
}

export class BusinessAnalysisService {
  static analyzeBusinessMetrics(
    jobs: any[],
    leads: any[],
    clients: any[],
    timeEntries: any[],
    employees: any[],
    dateRange: string
  ): BusinessMetrics {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const cancelledJobs = jobs.filter(job => job.status === 'cancelled');
    const convertedLeads = leads.filter(lead => lead.status === 'converted');
    
    // Calculate revenue - handle both pricing models
    const totalRevenue = completedJobs.reduce((sum, job) => {
      if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
        return sum + Number(job.total_amount_received || 0);
      }
      return sum + Number(job.actual_total || job.estimated_total || 0);
    }, 0);

    // Calculate expenses from employee payments and lead costs
    const totalEmployeePayments = completedJobs.reduce((sum, job) => {
      if (job.pricing_model === 'flat_rate') {
        // For flat rate jobs, calculate based on worker payments
        const workerPayment = Number(job.worker_hourly_rate || 0) * Number(job.hours_worked || 0) * Number(job.movers_needed || 1);
        return sum + workerPayment;
      } else {
        // For per-person jobs, use time entries
        const jobTimeEntries = timeEntries.filter(entry => entry.job_id === job.id);
        const jobPayroll = jobTimeEntries.reduce((entrySum, entry) => 
          entrySum + Number(entry.total_pay || 0), 0);
        return sum + jobPayroll;
      }
    }, 0);

    const totalLeadCost = completedJobs.reduce((sum, job) => sum + Number(job.lead_cost || 0), 0);
    const totalExpenses = totalEmployeePayments + totalLeadCost;
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Calculate average job duration using actual hours worked or time entries
    const jobsWithDuration = completedJobs.filter(job => {
      const hoursWorked = Number(job.hours_worked || 0);
      const actualDuration = Number(job.actual_duration_hours || 0);
      const estimatedDuration = Number(job.estimated_duration_hours || 0);
      return hoursWorked > 0 || actualDuration > 0 || estimatedDuration > 0;
    });
    
    const averageJobDuration = jobsWithDuration.length > 0 
      ? jobsWithDuration.reduce((sum, job) => {
          const hoursWorked = Number(job.hours_worked || 0);
          const actualDuration = Number(job.actual_duration_hours || 0);
          const estimatedDuration = Number(job.estimated_duration_hours || 0);
          return sum + (actualDuration || hoursWorked || estimatedDuration);
        }, 0) / jobsWithDuration.length
      : 0;

    // Calculate repeat customer rate
    const clientJobCounts = clients.reduce((acc, client) => {
      acc[client.id] = Number(client.total_jobs_completed || 0);
      return acc;
    }, {} as Record<string, number>);
    
    const repeatCustomers = Object.values(clientJobCounts).filter(count => Number(count) > 1).length;
    const repeatCustomerRate = clients.length > 0 ? (repeatCustomers / clients.length) * 100 : 0;

    return {
      totalRevenue: Math.round(totalRevenue),
      totalJobs: jobs.length,
      completedJobs: completedJobs.length,
      cancelledJobs: cancelledJobs.length,
      averageJobValue: completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0,
      conversionRate: leads.length > 0 ? (convertedLeads.length / leads.length) * 100 : 0,
      totalLeads: leads.length,
      convertedLeads: convertedLeads.length,
      totalLeadCost: Math.round(totalLeadCost),
      profitMargin: Math.round(profitMargin * 100) / 100,
      totalExpenses: Math.round(totalExpenses),
      netProfit: Math.round(netProfit),
      averageJobDuration: Math.round(averageJobDuration * 100) / 100,
      employeeUtilization: employees.filter(emp => emp.status === 'active').length,
      repeatCustomerRate: Math.round(repeatCustomerRate * 100) / 100
    };
  }

  static generateIndustryInsights(metrics: BusinessMetrics, dateRange: string): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    // Revenue Analysis
    if (metrics.averageJobValue < 400) {
      insights.push({
        category: 'revenue',
        title: 'Below Industry Average Job Value',
        description: `Your average job value of $${metrics.averageJobValue.toFixed(0)} is below the moving industry standard of $400-600.`,
        impact: 'This could limit growth potential and profitability. Low job values may indicate underpricing or focus on smaller moves.',
        recommendation: 'Consider implementing minimum job values, upselling additional services, or targeting larger residential/commercial moves.',
        priority: 'high',
        expectedOutcome: 'Increase average job value by 20-30% within 3 months',
        timeframe: '2-3 months',
        metrics: [
          { label: 'Current Average', value: `$${metrics.averageJobValue.toFixed(0)}` },
          { label: 'Industry Standard', value: '$400-600' }
        ]
      });
    }

    // Profitability Analysis
    if (metrics.profitMargin < 25) {
      insights.push({
        category: 'profitability',
        title: 'Low Profit Margins',
        description: `Your profit margin of ${metrics.profitMargin}% is below the moving industry standard of 25-35%.`,
        impact: 'Low margins reduce business sustainability and growth capacity. This limits reinvestment opportunities.',
        recommendation: 'Review pricing strategy, optimize labor costs, and negotiate better supplier rates. Consider premium service tiers.',
        priority: 'critical',
        expectedOutcome: 'Achieve 25%+ profit margins within 6 months',
        timeframe: '3-6 months',
        metrics: [
          { label: 'Current Margin', value: `${metrics.profitMargin}%` },
          { label: 'Target Margin', value: '25-35%' }
        ]
      });
    }

    // Conversion Rate Analysis
    if (metrics.conversionRate < 35) {
      insights.push({
        category: 'marketing',
        title: 'Low Lead Conversion Rate',
        description: `Your conversion rate of ${metrics.conversionRate}% is below industry average of 35-45%.`,
        impact: 'Poor conversion means higher customer acquisition costs and missed revenue opportunities.',
        recommendation: 'Improve sales process, follow-up procedures, and quote response times. Train staff on closing techniques.',
        priority: 'high',
        expectedOutcome: 'Increase conversion rate to 40%+ within 4 months',
        timeframe: '2-4 months',
        metrics: [
          { label: 'Current Rate', value: `${metrics.conversionRate}%` },
          { label: 'Industry Average', value: '35-45%' }
        ]
      });
    }

    // Repeat Customer Analysis
    if (metrics.repeatCustomerRate < 20) {
      insights.push({
        category: 'operations',
        title: 'Low Customer Retention',
        description: `Only ${metrics.repeatCustomerRate}% of customers return for repeat business.`,
        impact: 'Low retention increases marketing costs and reduces predictable revenue streams.',
        recommendation: 'Implement customer follow-up programs, loyalty discounts, and quality assurance measures.',
        priority: 'medium',
        expectedOutcome: 'Achieve 25%+ repeat customer rate',
        timeframe: '6-12 months',
        metrics: [
          { label: 'Current Rate', value: `${metrics.repeatCustomerRate}%` },
          { label: 'Target Rate', value: '25%+' }
        ]
      });
    }

    // Growth Opportunities
    if (metrics.totalJobs > 50 && metrics.completedJobs > 40) {
      insights.push({
        category: 'operations',
        title: 'Ready for Scaling',
        description: `With ${metrics.completedJobs} completed jobs, you're positioned for business expansion.`,
        impact: 'Strong operational foundation enables strategic growth and market expansion.',
        recommendation: 'Consider expanding service area, adding specialized services, or increasing team size.',
        priority: 'medium',
        expectedOutcome: 'Scale operations by 30-50% within 12 months',
        timeframe: '6-12 months',
        metrics: [
          { label: 'Completed Jobs', value: metrics.completedJobs.toString() },
          { label: 'Success Rate', value: `${Math.round((metrics.completedJobs / metrics.totalJobs) * 100)}%` }
        ]
      });
    }

    return insights;
  }
}
