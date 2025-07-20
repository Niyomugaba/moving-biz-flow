
import { Job } from '@/hooks/useJobs';
import { Lead } from '@/hooks/useLeads';
import { Client } from '@/hooks/useClients';
import { TimeEntry } from '@/hooks/useTimeEntries';
import { Employee } from '@/hooks/useEmployees';

export interface BusinessMetrics {
  revenue: {
    total: number;
    paid: number;
    unpaid: number;
    averageJobValue: number;
    revenuePerHour: number;
    seasonalTrends: Array<{ period: string; revenue: number; jobCount: number }>;
  };
  profitability: {
    grossProfit: number;
    netProfit: number;
    profitMargin: number;
    costPerJob: number;
    laborCostRatio: number;
    marketingROI: number;
  };
  operations: {
    jobCompletionRate: number;
    averageJobDuration: number;
    utilizationRate: number;
    customerSatisfactionAverage: number;
    repeatCustomerRate: number;
    cancellationRate: number;
  };
  marketing: {
    leadConversionRate: number;
    costPerLead: number;
    costPerAcquisition: number;
    bestPerformingSources: Array<{ source: string; conversionRate: number; revenue: number }>;
    seasonalLeadPatterns: Array<{ period: string; leads: number; conversions: number }>;
  };
  workforce: {
    averageHourlyRate: number;
    overtimePercentage: number;
    productivityPerEmployee: number;
    employeeTurnover: number;
    averageJobsPerEmployee: number;
  };
}

export interface BusinessInsight {
  category: 'revenue' | 'profitability' | 'operations' | 'marketing' | 'workforce' | 'competitive';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  expectedOutcome: string;
  timeframe: string;
  metrics?: Array<{ label: string; value: string | number }>;
}

export class BusinessAnalysisService {
  static analyzeBusinessMetrics(
    jobs: Job[],
    leads: Lead[],
    clients: Client[],
    timeEntries: TimeEntry[],
    employees: Employee[],
    dateRange: string
  ): BusinessMetrics {
    const completedJobs = jobs.filter(job => job.status === 'completed');
    const paidJobs = completedJobs.filter(job => job.is_paid);
    
    const totalRevenue = completedJobs.reduce((sum, job) => {
      if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
        return sum + job.total_amount_received;
      }
      return sum + (job.actual_total || job.estimated_total);
    }, 0);

    const paidRevenue = paidJobs.reduce((sum, job) => {
      if (job.pricing_model === 'flat_rate' && job.total_amount_received) {
        return sum + job.total_amount_received;
      }
      return sum + (job.actual_total || job.estimated_total);
    }, 0);

    const totalHours = jobs.reduce((sum, job) => sum + (job.actual_duration_hours || job.estimated_duration_hours), 0);
    const totalLabor = timeEntries.reduce((sum, entry) => {
      const regularPay = (entry.regular_hours || 0) * (entry.hourly_rate || 0);
      const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate || 0);
      const tips = entry.tip_amount || 0;
      return sum + regularPay + overtimePay + tips;
    }, 0);

    const totalLeadCosts = leads.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0);
    const convertedLeads = leads.filter(lead => lead.status === 'converted').length;

    return {
      revenue: {
        total: totalRevenue,
        paid: paidRevenue,
        unpaid: totalRevenue - paidRevenue,
        averageJobValue: completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0,
        revenuePerHour: totalHours > 0 ? totalRevenue / totalHours : 0,
        seasonalTrends: this.calculateSeasonalTrends(jobs)
      },
      profitability: {
        grossProfit: paidRevenue - totalLabor - totalLeadCosts,
        netProfit: paidRevenue - totalLabor - totalLeadCosts,
        profitMargin: paidRevenue > 0 ? ((paidRevenue - totalLabor - totalLeadCosts) / paidRevenue) * 100 : 0,
        costPerJob: completedJobs.length > 0 ? (totalLabor + totalLeadCosts) / completedJobs.length : 0,
        laborCostRatio: paidRevenue > 0 ? (totalLabor / paidRevenue) * 100 : 0,
        marketingROI: totalLeadCosts > 0 ? ((paidRevenue - totalLabor) / totalLeadCosts) * 100 : 0
      },
      operations: {
        jobCompletionRate: jobs.length > 0 ? (completedJobs.length / jobs.length) * 100 : 0,
        averageJobDuration: completedJobs.length > 0 ? 
          completedJobs.reduce((sum, job) => sum + (job.actual_duration_hours || 0), 0) / completedJobs.length : 0,
        utilizationRate: this.calculateUtilizationRate(timeEntries, employees),
        customerSatisfactionAverage: this.calculateAverageRating(jobs),
        repeatCustomerRate: this.calculateRepeatCustomerRate(clients),
        cancellationRate: jobs.length > 0 ? (jobs.filter(j => j.status === 'cancelled').length / jobs.length) * 100 : 0
      },
      marketing: {
        leadConversionRate: leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0,
        costPerLead: leads.length > 0 ? totalLeadCosts / leads.length : 0,
        costPerAcquisition: convertedLeads > 0 ? totalLeadCosts / convertedLeads : 0,
        bestPerformingSources: this.analyzeBestSources(leads, jobs),
        seasonalLeadPatterns: this.calculateLeadPatterns(leads)
      },
      workforce: {
        averageHourlyRate: this.calculateAverageHourlyRate(timeEntries),
        overtimePercentage: this.calculateOvertimePercentage(timeEntries),
        productivityPerEmployee: employees.length > 0 ? totalRevenue / employees.length : 0,
        employeeTurnover: this.calculateTurnoverRate(employees),
        averageJobsPerEmployee: employees.length > 0 ? completedJobs.length / employees.length : 0
      }
    };
  }

  static generateIndustryInsights(
    metrics: BusinessMetrics,
    dateRange: string,
    historicalData?: BusinessMetrics
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = [];

    // Revenue Analysis
    if (metrics.revenue.averageJobValue < 300) {
      insights.push({
        category: 'revenue',
        priority: 'high',
        title: 'Below Industry Average Job Value',
        description: `Your average job value of $${metrics.revenue.averageJobValue.toFixed(0)} is below the moving industry average of $400-600.`,
        impact: 'Limiting revenue growth potential and profit margins',
        recommendation: 'Implement tiered pricing strategy: Basic ($350), Standard ($450), Premium ($600+). Add value-added services like packing, storage, and assembly.',
        expectedOutcome: '25-40% increase in average job value within 3 months',
        timeframe: '2-3 months',
        metrics: [
          { label: 'Current Average', value: `$${metrics.revenue.averageJobValue.toFixed(0)}` },
          { label: 'Industry Target', value: '$450-600' }
        ]
      });
    }

    // Profitability Analysis
    if (metrics.profitability.profitMargin < 20) {
      insights.push({
        category: 'profitability',
        priority: 'critical',
        title: 'Low Profit Margins - Industry Risk',
        description: `${metrics.profitability.profitMargin.toFixed(1)}% profit margin is below healthy moving company standards (25-35%).`,
        impact: 'Business sustainability at risk, limited growth capital',
        recommendation: 'Immediate action: 1) Increase rates by 15-20%, 2) Optimize crew efficiency, 3) Reduce overtime through better scheduling, 4) Negotiate better supply costs.',
        expectedOutcome: 'Target 25% profit margin within 90 days',
        timeframe: '60-90 days'
      });
    }

    // Labor Cost Analysis
    if (metrics.profitability.laborCostRatio > 60) {
      insights.push({
        category: 'workforce',
        priority: 'high',
        title: 'High Labor Cost Ratio',
        description: `Labor costs at ${metrics.profitability.laborCostRatio.toFixed(1)}% of revenue exceed industry optimal range (45-55%).`,
        impact: 'Eroding profit margins and limiting competitive pricing',
        recommendation: 'Implement performance-based pay structure, cross-train employees for efficiency, consider subcontracting during peak periods.',
        expectedOutcome: 'Reduce labor ratio to 50-55% of revenue',
        timeframe: '3-4 months'
      });
    }

    // Marketing ROI Analysis
    if (metrics.marketing.costPerAcquisition > 75) {
      insights.push({
        category: 'marketing',
        priority: 'medium',
        title: 'High Customer Acquisition Cost',
        description: `$${metrics.marketing.costPerAcquisition.toFixed(0)} cost per customer exceeds moving industry benchmark ($40-60).`,
        impact: 'Marketing budget inefficiency reducing profitability',
        recommendation: 'Focus on highest-converting channels, implement referral program (20% of customers should come from referrals), improve Google My Business presence.',
        expectedOutcome: 'Reduce acquisition cost to $50 or less',
        timeframe: '2-3 months'
      });
    }

    // Conversion Rate Analysis
    if (metrics.marketing.leadConversionRate < 30) {
      insights.push({
        category: 'marketing',
        priority: 'high',
        title: 'Low Lead Conversion Rate',
        description: `${metrics.marketing.leadConversionRate.toFixed(1)}% conversion rate is below moving industry average (35-45%).`,
        impact: 'Wasting marketing spend and losing potential revenue',
        recommendation: 'Improve quote response time (within 2 hours), create competitive pricing calculator, implement follow-up sequences, train staff on objection handling.',
        expectedOutcome: 'Increase conversion rate to 35%+',
        timeframe: '6-8 weeks'
      });
    }

    // Seasonal Insights
    if (dateRange === 'this_month' || dateRange === 'this_quarter') {
      const currentMonth = new Date().getMonth();
      const isPeakSeason = [4, 5, 6, 7, 8].includes(currentMonth); // May-September
      
      if (isPeakSeason && metrics.revenue.total < metrics.revenue.total * 1.3) {
        insights.push({
          category: 'operations',
          priority: 'high',
          title: 'Missing Peak Season Opportunity',
          description: 'Currently in peak moving season (May-September) but revenue doesn\'t reflect seasonal premium.',
          impact: 'Missing 30-50% additional revenue potential',
          recommendation: 'Implement peak season pricing (+20-30%), extend operating hours, hire temporary staff, create urgency in marketing.',
          expectedOutcome: '30-40% revenue increase during peak months',
          timeframe: 'Immediate'
        });
      }
    }

    // Customer Retention
    if (metrics.operations.repeatCustomerRate < 15) {
      insights.push({
        category: 'operations',
        priority: 'medium',
        title: 'Low Customer Retention',
        description: `${metrics.operations.repeatCustomerRate.toFixed(1)}% repeat rate is below moving industry target (20-25%).`,
        impact: 'Higher acquisition costs and missed revenue opportunities',
        recommendation: 'Implement post-move follow-up system, create corporate moving partnerships, offer storage services, seasonal move reminders.',
        expectedOutcome: 'Increase repeat business to 20%+',
        timeframe: '4-6 months'
      });
    }

    // Operational Efficiency
    if (metrics.operations.averageJobDuration > 6) {
      insights.push({
        category: 'operations',
        priority: 'medium',
        title: 'Job Duration Above Industry Standard',
        description: `Average job duration of ${metrics.operations.averageJobDuration.toFixed(1)} hours exceeds efficient standards (4-5 hours).`,
        impact: 'Reduced daily job capacity and higher labor costs',
        recommendation: 'Implement pre-move surveys, standardize packing procedures, invest in proper equipment, create efficiency incentives for crews.',
        expectedOutcome: 'Reduce average job time by 15-20%',
        timeframe: '2-3 months'
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static calculateSeasonalTrends(jobs: Job[]) {
    // Group jobs by month for seasonal analysis
    const monthlyData: { [key: string]: { revenue: number; jobCount: number } } = {};
    
    jobs.forEach(job => {
      if (job.status === 'completed') {
        const month = new Date(job.job_date).toLocaleString('default', { month: 'long' });
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, jobCount: 0 };
        }
        const revenue = job.pricing_model === 'flat_rate' && job.total_amount_received 
          ? job.total_amount_received 
          : (job.actual_total || job.estimated_total);
        monthlyData[month].revenue += revenue;
        monthlyData[month].jobCount += 1;
      }
    });

    return Object.entries(monthlyData).map(([period, data]) => ({
      period,
      revenue: data.revenue,
      jobCount: data.jobCount
    }));
  }

  private static calculateUtilizationRate(timeEntries: TimeEntry[], employees: Employee[]): number {
    if (employees.length === 0) return 0;
    const totalHours = timeEntries.reduce((sum, entry) => 
      sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0), 0);
    const potentialHours = employees.length * 40 * 4; // 40 hours/week * 4 weeks
    return potentialHours > 0 ? (totalHours / potentialHours) * 100 : 0;
  }

  private static calculateAverageRating(jobs: Job[]): number {
    const ratedJobs = jobs.filter(job => job.customer_satisfaction);
    return ratedJobs.length > 0 
      ? ratedJobs.reduce((sum, job) => sum + (job.customer_satisfaction || 0), 0) / ratedJobs.length 
      : 0;
  }

  private static calculateRepeatCustomerRate(clients: Client[]): number {
    const repeatClients = clients.filter(client => (client.total_jobs_completed || 0) > 1);
    return clients.length > 0 ? (repeatClients.length / clients.length) * 100 : 0;
  }

  private static analyzeBestSources(leads: Lead[], jobs: Job[]) {
    const sourceData: { [key: string]: { leads: number; conversions: number; revenue: number } } = {};
    
    leads.forEach(lead => {
      const source = lead.source;
      if (!sourceData[source]) {
        sourceData[source] = { leads: 0, conversions: 0, revenue: 0 };
      }
      sourceData[source].leads += 1;
      
      if (lead.status === 'converted') {
        sourceData[source].conversions += 1;
        // Find associated job revenue
        const associatedJob = jobs.find(job => job.lead_id === lead.id);
        if (associatedJob && associatedJob.status === 'completed') {
          const revenue = associatedJob.pricing_model === 'flat_rate' && associatedJob.total_amount_received
            ? associatedJob.total_amount_received
            : (associatedJob.actual_total || associatedJob.estimated_total);
          sourceData[source].revenue += revenue;
        }
      }
    });

    return Object.entries(sourceData)
      .map(([source, data]) => ({
        source,
        conversionRate: data.leads > 0 ? (data.conversions / data.leads) * 100 : 0,
        revenue: data.revenue
      }))
      .sort((a, b) => b.conversionRate - a.conversionRate);
  }

  private static calculateLeadPatterns(leads: Lead[]) {
    const monthlyLeads: { [key: string]: { leads: number; conversions: number } } = {};
    
    leads.forEach(lead => {
      const month = new Date(lead.created_at).toLocaleString('default', { month: 'long' });
      if (!monthlyLeads[month]) {
        monthlyLeads[month] = { leads: 0, conversions: 0 };
      }
      monthlyLeads[month].leads += 1;
      if (lead.status === 'converted') {
        monthlyLeads[month].conversions += 1;
      }
    });

    return Object.entries(monthlyLeads).map(([period, data]) => ({
      period,
      leads: data.leads,
      conversions: data.conversions
    }));
  }

  private static calculateAverageHourlyRate(timeEntries: TimeEntry[]): number {
    const validEntries = timeEntries.filter(entry => entry.hourly_rate > 0);
    return validEntries.length > 0
      ? validEntries.reduce((sum, entry) => sum + entry.hourly_rate, 0) / validEntries.length
      : 0;
  }

  private static calculateOvertimePercentage(timeEntries: TimeEntry[]): number {
    const totalRegular = timeEntries.reduce((sum, entry) => sum + (entry.regular_hours || 0), 0);
    const totalOvertime = timeEntries.reduce((sum, entry) => sum + (entry.overtime_hours || 0), 0);
    const totalHours = totalRegular + totalOvertime;
    return totalHours > 0 ? (totalOvertime / totalHours) * 100 : 0;
  }

  private static calculateTurnoverRate(employees: Employee[]): number {
    const activeEmployees = employees.filter(emp => emp.status === 'active').length;
    const inactiveEmployees = employees.filter(emp => emp.status !== 'active').length;
    const totalEmployees = employees.length;
    return totalEmployees > 0 ? (inactiveEmployees / totalEmployees) * 100 : 0;
  }
}
