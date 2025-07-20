
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, BarChart3, RefreshCw, Target, DollarSign, Users, Calendar } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useEmployees } from '@/hooks/useEmployees';
import { BusinessAnalysisService, BusinessInsight } from '@/services/businessAnalysisService';
import { useDateFilter, filterDataByDateRange } from '@/hooks/useDateFilter';

interface BusinessAnalysisCardProps {
  selectedDateRange?: 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'since_inception';
}

export const BusinessAnalysisCard: React.FC<BusinessAnalysisCardProps> = ({ 
  selectedDateRange = 'this_month' 
}) => {
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();
  const { employees } = useEmployees();
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { startDate, endDate } = useDateFilter(selectedDateRange);

  const generateStartupFocusedInsights = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Filter data by selected date range
      const filteredJobs = filterDataByDateRange(jobs, startDate, endDate, 'job_date');
      const filteredLeads = filterDataByDateRange(leads, startDate, endDate, 'created_at');
      const filteredTimeEntries = filterDataByDateRange(timeEntries, startDate, endDate, 'entry_date');

      // Calculate business metrics
      const metrics = BusinessAnalysisService.analyzeBusinessMetrics(
        filteredJobs,
        filteredLeads,
        clients,
        filteredTimeEntries,
        employees,
        selectedDateRange
      );

      // Generate startup-specific insights
      const startupInsights = generateNewBusinessInsights(metrics, filteredJobs.length);

      setInsights(startupInsights);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateNewBusinessInsights = (metrics: any, totalJobs: number): BusinessInsight[] => {
    const insights: BusinessInsight[] = [];

    // Early Stage Business Assessment
    if (totalJobs < 10) {
      insights.push({
        category: 'operations',
        title: 'Early Stage Growth Phase',
        description: `With ${totalJobs} jobs completed, you're in the crucial early growth phase of your moving business.`,
        impact: 'This is the foundation-building stage where every job and customer interaction shapes your reputation.',
        recommendation: 'Focus on delivering exceptional service quality, collecting customer testimonials, and building word-of-mouth referrals. Document your processes and track key metrics religiously.',
        priority: 'high',
        expectedOutcome: 'Strong foundation for scaling to 25+ jobs per month',
        timeframe: '3-6 months',
        metrics: [
          { label: 'Current Job Count', value: totalJobs.toString() },
          { label: 'Next Milestone', value: '25 jobs' }
        ]
      });
    }

    // Cash Flow Focus for New Business
    if (metrics.totalRevenue > 0) {
      const monthlyRunRate = metrics.totalRevenue;
      insights.push({
        category: 'revenue',
        title: 'Cash Flow & Revenue Tracking',
        description: `Your current revenue of $${metrics.totalRevenue.toLocaleString()} shows early traction in the market.`,
        impact: 'Consistent cash flow is critical for new businesses to cover operating expenses and invest in growth.',
        recommendation: 'Set up a dedicated business account, track daily cash flow, and maintain a 3-month expense buffer. Consider offering payment terms that improve cash flow (deposits, same-day payment).',
        priority: 'critical',
        expectedOutcome: 'Predictable monthly cash flow of $15,000+',
        timeframe: '2-4 months',
        metrics: [
          { label: 'Current Revenue', value: `$${metrics.totalRevenue.toLocaleString()}` },
          { label: 'Target Monthly', value: '$15,000' }
        ]
      });
    }

    // Customer Base Building
    if (metrics.repeatCustomerRate < 30 && totalJobs > 5) {
      insights.push({
        category: 'marketing',
        title: 'Customer Retention Strategy',
        description: `${metrics.repeatCustomerRate.toFixed(1)}% repeat customer rate indicates opportunity to build loyal customer base.`,
        impact: 'Repeat customers cost 5x less to acquire and typically spend 67% more than new customers.',
        recommendation: 'Implement a customer follow-up system within 48 hours post-move, create a referral program with incentives, and maintain contact for seasonal moving needs.',
        priority: 'high',
        expectedOutcome: 'Achieve 40%+ repeat customer rate within 6 months',
        timeframe: '3-6 months',
        metrics: [
          { label: 'Current Rate', value: `${metrics.repeatCustomerRate.toFixed(1)}%` },
          { label: 'Industry Target', value: '40%+' }
        ]
      });
    }

    // Pricing Strategy for New Business
    if (metrics.averageJobValue < 350) {
      insights.push({
        category: 'revenue',
        title: 'Pricing Optimization Opportunity',
        description: `Average job value of $${metrics.averageJobValue.toFixed(0)} suggests room for pricing improvement.`,
        impact: 'Underpricing is common among new businesses but limits growth capital and sustainability.',
        recommendation: 'Research local competitor pricing, create service tiers (basic, standard, premium), and don\'t compete solely on price. Add value through insurance, supplies, or extra services.',
        priority: 'high',
        expectedOutcome: 'Increase average job value to $450+ within 4 months',
        timeframe: '2-4 months',
        metrics: [
          { label: 'Current Average', value: `$${metrics.averageJobValue.toFixed(0)}` },
          { label: 'Target Average', value: '$450+' }
        ]
      });
    }

    // Lead Generation Focus
    if (metrics.conversionRate < 40 && metrics.totalLeads > 10) {
      insights.push({
        category: 'marketing',
        title: 'Lead Conversion Improvement',
        description: `${metrics.conversionRate.toFixed(1)}% conversion rate shows potential to improve sales process.`,
        impact: 'Higher conversion rates reduce customer acquisition costs and accelerate growth.',
        recommendation: 'Respond to leads within 15 minutes, create a phone script, offer free estimates, and follow up with non-converting leads after 30 days.',
        priority: 'medium',
        expectedOutcome: 'Achieve 50%+ conversion rate within 3 months',
        timeframe: '1-3 months',
        metrics: [
          { label: 'Current Rate', value: `${metrics.conversionRate.toFixed(1)}%` },
          { label: 'Target Rate', value: '50%+' }
        ]
      });
    }

    // Operational Efficiency for Small Business
    if (totalJobs > 5 && metrics.profitMargin < 20) {
      insights.push({
        category: 'operations',
        title: 'Profit Margin Optimization',
        description: `${metrics.profitMargin.toFixed(1)}% profit margin needs improvement for sustainable growth.`,
        impact: 'Low margins limit your ability to invest in equipment, marketing, and team expansion.',
        recommendation: 'Track all job costs (labor, fuel, equipment), optimize routes, negotiate supplier discounts, and consider minimum job values to ensure profitability.',
        priority: 'high',
        expectedOutcome: 'Achieve 25%+ profit margins consistently',
        timeframe: '2-3 months',
        metrics: [
          { label: 'Current Margin', value: `${metrics.profitMargin.toFixed(1)}%` },
          { label: 'Target Margin', value: '25%+' }
        ]
      });
    }

    // Growth Readiness Assessment
    if (totalJobs > 15 && metrics.completedJobs > 12) {
      insights.push({
        category: 'operations',
        title: 'Scale-Up Readiness Assessment',
        description: `With ${metrics.completedJobs} completed jobs, you're approaching readiness for scaling operations.`,
        impact: 'Strategic growth planning prevents operational chaos and maintains service quality.',
        recommendation: 'Standardize processes, consider hiring part-time help, invest in scheduling software, and create employee training materials for consistent service delivery.',
        priority: 'medium',
        expectedOutcome: 'Successfully scale to 40+ jobs per month',
        timeframe: '4-8 months',
        metrics: [
          { label: 'Completed Jobs', value: metrics.completedJobs.toString() },
          { label: 'Scale Target', value: '40+ monthly' }
        ]
      });
    }

    return insights;
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'profitability': return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'operations': return <Target className="h-4 w-4 text-purple-600" />;
      case 'marketing': return <Users className="h-4 w-4 text-orange-600" />;
      case 'workforce': return <Users className="h-4 w-4 text-indigo-600" />;
      default: return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': 
        return <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">Critical</Badge>;
      case 'high': 
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">High Priority</Badge>;
      case 'medium': 
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Medium</Badge>;
      default: 
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Low Priority</Badge>;
    }
  };

  const getCategoryName = (category: string) => {
    const names = {
      revenue: 'Revenue Growth',
      profitability: 'Profit Optimization',
      operations: 'Operations',
      marketing: 'Customer Development',
      workforce: 'Team Building',
      competitive: 'Market Position'
    };
    return names[category as keyof typeof names] || category;
  };

  const getRangeLabel = () => {
    const labels = {
      today: 'Today',
      this_week: 'This Week',
      this_month: 'This Month',
      this_quarter: 'This Quarter',
      this_year: 'This Year',
      since_inception: 'Since Launch'
    };
    return labels[selectedDateRange];
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Startup Business Intelligence - {getRangeLabel()}
          </CardTitle>
          <Button 
            onClick={generateStartupFocusedInsights} 
            disabled={isAnalyzing}
            size="sm"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4 mr-2" />
                Get Growth Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-lg font-medium mb-2">Startup-Focused Business Analysis</p>
            <p className="text-sm">Get tailored insights for your growing moving business. Click "Get Growth Insights" to receive customized recommendations based on your current performance and stage of growth.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Action Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.priority === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Actions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {insights.filter(i => i.priority === 'high').length}
                </div>
                <div className="text-sm text-muted-foreground">High Priority</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.category === 'revenue').length}
                </div>
                <div className="text-sm text-muted-foreground">Revenue Focus</div>
              </div>
            </div>

            {/* Growth Insights */}
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Card key={index} className="border border-border/50 hover:border-border transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {getInsightIcon(insight.category)}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="font-semibold text-lg">{insight.title}</h4>
                          {getPriorityBadge(insight.priority)}
                          <Badge variant="outline" className="text-xs">
                            {getCategoryName(insight.category)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="text-foreground mb-2">{insight.description}</p>
                            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded border border-destructive/20">
                              <strong>Business Impact:</strong> {insight.impact}
                            </div>
                          </div>

                          <div className="bg-primary/5 border border-primary/20 rounded p-4">
                            <h5 className="font-medium text-primary mb-2">Recommended Action Plan</h5>
                            <p className="text-primary/90 mb-3">{insight.recommendation}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                              <div>
                                <strong className="text-primary">Expected Outcome:</strong>
                                <p className="text-primary/80">{insight.expectedOutcome}</p>
                              </div>
                              <div>
                                <strong className="text-primary">Timeline:</strong>
                                <p className="text-primary/80">{insight.timeframe}</p>
                              </div>
                            </div>
                          </div>

                          {insight.metrics && insight.metrics.length > 0 && (
                            <div className="bg-muted/50 rounded p-3">
                              <h6 className="font-medium text-foreground mb-2">Key Metrics</h6>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {insight.metrics.map((metric, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <span className="text-muted-foreground">{metric.label}:</span>
                                    <span className="font-medium">{metric.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {insights.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">New Business Success Framework</h4>
                <p className="text-green-800 text-sm">
                  These insights are specifically tailored for growing moving businesses. Focus on 1-2 critical items first, 
                  then tackle high-priority recommendations. Success in the moving industry comes from consistent service quality, 
                  efficient operations, and strong customer relationships.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
