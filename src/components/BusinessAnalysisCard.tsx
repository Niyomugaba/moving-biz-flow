
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, BarChart3, RefreshCw, Target, DollarSign, Users, Calendar, Star } from 'lucide-react';
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
      const filteredJobs = filterDataByDateRange(jobs, startDate, endDate, 'job_date');
      const filteredLeads = filterDataByDateRange(leads, startDate, endDate, 'created_at');
      const filteredTimeEntries = filterDataByDateRange(timeEntries, startDate, endDate, 'entry_date');

      const metrics = BusinessAnalysisService.analyzeBusinessMetrics(
        filteredJobs,
        filteredLeads,
        clients,
        filteredTimeEntries,
        employees,
        selectedDateRange
      );

      const startupInsights = generateNewBusinessInsights(metrics, filteredJobs.length);
      setInsights(startupInsights);
      setIsAnalyzing(false);
    }, 1500);
  };

  const generateNewBusinessInsights = (metrics: any, totalJobs: number): BusinessInsight[] => {
    const insights: BusinessInsight[] = [];

    // Early Stage Business Assessment
    if (totalJobs < 15) {
      insights.push({
        category: 'operations',
        title: 'Early Growth Stage Assessment',
        description: `With ${totalJobs} jobs completed, you're building the foundation of your moving business.`,
        impact: 'This is the critical phase where service quality and customer satisfaction determine long-term success.',
        recommendation: 'Focus on perfecting your service delivery process. Document every successful job procedure and collect detailed customer feedback. Build a referral system early.',
        priority: 'high',
        expectedOutcome: 'Establish strong operational foundation for 30+ monthly jobs',
        timeframe: '3-6 months',
        metrics: [
          { label: 'Current Jobs', value: totalJobs.toString() },
          { label: 'Next Target', value: '30 jobs/month' },
          { label: 'Success Rate', value: `${Math.round((totalJobs / jobs.length) * 100)}%` }
        ]
      });
    }

    // Revenue Growth Analysis
    if (metrics.totalRevenue > 0) {
      const projectedAnnual = metrics.totalRevenue * 12;
      insights.push({
        category: 'revenue',
        title: 'Revenue Growth Trajectory',
        description: `Current revenue of $${metrics.totalRevenue.toLocaleString()} indicates ${projectedAnnual > 100000 ? 'strong' : 'developing'} market traction.`,
        impact: 'Revenue growth rate determines your ability to scale operations and invest in business expansion.',
        recommendation: 'Track weekly revenue trends, identify peak booking periods, and optimize pricing for maximum profitability. Consider service packages.',
        priority: 'critical',
        expectedOutcome: `Achieve $${Math.round(projectedAnnual * 1.5).toLocaleString()} annual revenue`,
        timeframe: '6-12 months',
        metrics: [
          { label: 'Monthly Revenue', value: `$${metrics.totalRevenue.toLocaleString()}` },
          { label: 'Annual Projection', value: `$${projectedAnnual.toLocaleString()}` },
          { label: 'Growth Target', value: `$${Math.round(projectedAnnual * 1.5).toLocaleString()}` }
        ]
      });
    }

    // Customer Development Strategy
    if (metrics.conversionRate > 0) {
      insights.push({
        category: 'marketing',
        title: 'Customer Acquisition Performance',
        description: `${metrics.conversionRate.toFixed(1)}% conversion rate with ${metrics.totalLeads} leads shows your sales effectiveness.`,
        impact: 'Higher conversion rates reduce marketing costs and accelerate business growth.',
        recommendation: 'Implement rapid response system (under 15 minutes), create compelling service packages, and follow up with unconverted leads monthly.',
        priority: 'high',
        expectedOutcome: 'Increase conversion rate to 45%+ within 3 months',
        timeframe: '2-4 months',
        metrics: [
          { label: 'Current Rate', value: `${metrics.conversionRate.toFixed(1)}%` },
          { label: 'Total Leads', value: metrics.totalLeads.toString() },
          { label: 'Target Rate', value: '45%+' }
        ]
      });
    }

    // Pricing Strategy Optimization
    if (metrics.averageJobValue > 0) {
      const industryBenchmark = 450;
      const pricingHealth = metrics.averageJobValue >= industryBenchmark ? 'strong' : 'needs improvement';
      
      insights.push({
        category: 'revenue',
        title: 'Pricing Strategy Analysis',
        description: `Average job value of $${metrics.averageJobValue.toFixed(0)} is ${pricingHealth} compared to industry standards.`,
        impact: `${pricingHealth === 'strong' ? 'Strong pricing supports healthy margins' : 'Underpricing limits growth capital and profitability'}`,
        recommendation: pricingHealth === 'strong' 
          ? 'Maintain current pricing strategy and consider premium service tiers for high-value customers.'
          : 'Research competitor pricing, implement minimum job values, and add value-added services to justify price increases.',
        priority: pricingHealth === 'strong' ? 'medium' : 'high',
        expectedOutcome: `Achieve $${Math.max(industryBenchmark, metrics.averageJobValue * 1.2).toFixed(0)} average job value`,
        timeframe: '2-4 months',
        metrics: [
          { label: 'Current Average', value: `$${metrics.averageJobValue.toFixed(0)}` },
          { label: 'Industry Benchmark', value: `$${industryBenchmark}` },
          { label: 'Pricing Health', value: pricingHealth }
        ]
      });
    }

    // Profitability Analysis
    if (metrics.profitMargin !== undefined) {
      const profitHealth = metrics.profitMargin >= 25 ? 'excellent' : metrics.profitMargin >= 15 ? 'good' : 'needs improvement';
      
      insights.push({
        category: 'profitability',
        title: 'Profit Margin Optimization',
        description: `${metrics.profitMargin.toFixed(1)}% profit margin indicates ${profitHealth} financial health.`,
        impact: 'Profit margins determine business sustainability and growth investment capacity.',
        recommendation: profitHealth === 'excellent' 
          ? 'Maintain current cost structure and explore expansion opportunities.'
          : 'Analyze job-specific costs, optimize routes, negotiate better supplier rates, and eliminate inefficiencies.',
        priority: profitHealth === 'needs improvement' ? 'critical' : 'medium',
        expectedOutcome: 'Achieve and maintain 25%+ profit margins',
        timeframe: '2-6 months',
        metrics: [
          { label: 'Current Margin', value: `${metrics.profitMargin.toFixed(1)}%` },
          { label: 'Target Margin', value: '25%+' },
          { label: 'Profit Health', value: profitHealth }
        ]
      });
    }

    // Operational Efficiency
    if (totalJobs > 10) {
      insights.push({
        category: 'operations',
        title: 'Operational Scaling Readiness',
        description: `With ${totalJobs} completed jobs, you're approaching the scaling phase of your business.`,
        impact: 'Efficient operations enable consistent service quality as you handle more jobs.',
        recommendation: 'Standardize job procedures, implement scheduling software, create training materials, and consider hiring additional team members.',
        priority: 'medium',
        expectedOutcome: 'Scale to 50+ jobs per month with consistent quality',
        timeframe: '4-8 months',
        metrics: [
          { label: 'Jobs Completed', value: totalJobs.toString() },
          { label: 'Scaling Target', value: '50+ monthly' },
          { label: 'Efficiency Score', value: `${Math.min(100, (totalJobs / 50) * 100).toFixed(0)}%` }
        ]
      });
    }

    return insights;
  };

  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'revenue': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'profitability': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'operations': return <Target className="h-5 w-5 text-purple-600" />;
      case 'marketing': return <Users className="h-5 w-5 text-orange-600" />;
      default: return <Lightbulb className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Business Growth Analysis - {getRangeLabel()}
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
                Generate Insights
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <BarChart3 className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Business Analysis</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get personalized insights tailored to your moving business stage and performance. 
              Our analysis focuses on actionable recommendations for growth.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center justify-center gap-2">
                <DollarSign className="h-4 w-4" />
                Revenue Analysis
              </div>
              <div className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Customer Insights
              </div>
              <div className="flex items-center justify-center gap-2">
                <Target className="h-4 w-4" />
                Growth Strategy
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Analysis Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Star className="h-6 w-6 text-yellow-500" />
                <h3 className="text-lg font-semibold">Business Health Overview</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {insights.filter(i => i.priority === 'critical').length}
                  </div>
                  <div className="text-sm text-gray-600">Critical Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {insights.filter(i => i.priority === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {insights.filter(i => i.category === 'revenue').length}
                  </div>
                  <div className="text-sm text-gray-600">Revenue Focus</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {insights.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Insights</div>
                </div>
              </div>
            </div>

            {/* Insights Cards */}
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {getInsightIcon(insight.category)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{insight.title}</h4>
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(insight.priority)}`} />
                          <Badge variant="secondary" className="text-xs">
                            {insight.category.charAt(0).toUpperCase() + insight.category.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-gray-700 mb-2">{insight.description}</p>
                            <div className="text-sm text-red-700 bg-red-50 p-3 rounded border-l-4 border-red-200">
                              <strong>Impact:</strong> {insight.impact}
                            </div>
                          </div>

                          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                            <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Action Plan
                            </h5>
                            <p className="text-blue-800 mb-3">{insight.recommendation}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <div className="font-medium text-blue-900">Expected Outcome:</div>
                                <p className="text-sm text-blue-700">{insight.expectedOutcome}</p>
                              </div>
                              <div>
                                <div className="font-medium text-blue-900">Timeline:</div>
                                <p className="text-sm text-blue-700">{insight.timeframe}</p>
                              </div>
                            </div>
                          </div>

                          {insight.metrics && insight.metrics.length > 0 && (
                            <div className="bg-white border rounded-lg p-4">
                              <h6 className="font-medium text-gray-900 mb-3">Key Metrics</h6>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {insight.metrics.map((metric, idx) => (
                                  <div key={idx} className="text-center p-3 bg-gray-50 rounded">
                                    <div className="font-semibold text-gray-900">{metric.value}</div>
                                    <div className="text-sm text-gray-600">{metric.label}</div>
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

            {/* Success Framework */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Moving Business Success Framework
              </h4>
              <p className="text-green-800 mb-4">
                These insights are specifically designed for growing moving businesses. Focus on addressing 
                critical and high-priority items first, then gradually work through medium-priority recommendations.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-medium text-green-900">Foundation</div>
                  <div className="text-green-700">Service Quality & Processes</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-900">Growth</div>
                  <div className="text-green-700">Customer Acquisition & Retention</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-green-900">Scale</div>
                  <div className="text-green-700">Operations & Profitability</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
