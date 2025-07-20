
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
  const [showMetrics, setShowMetrics] = useState(false);

  const { startDate, endDate } = useDateFilter(selectedDateRange);

  const generateAdvancedInsights = () => {
    setIsAnalyzing(true);
    
    setTimeout(() => {
      // Filter data by selected date range
      const filteredJobs = filterDataByDateRange(jobs, startDate, endDate, 'job_date');
      const filteredLeads = filterDataByDateRange(leads, startDate, endDate, 'created_at');
      const filteredTimeEntries = filterDataByDateRange(timeEntries, startDate, endDate, 'entry_date');

      // Calculate comprehensive business metrics
      const metrics = BusinessAnalysisService.analyzeBusinessMetrics(
        filteredJobs,
        filteredLeads,
        clients,
        filteredTimeEntries,
        employees,
        selectedDateRange
      );

      // Generate industry-specific insights
      const businessInsights = BusinessAnalysisService.generateIndustryInsights(
        metrics,
        selectedDateRange
      );

      setInsights(businessInsights);
      setIsAnalyzing(false);
    }, 2000);
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
      revenue: 'Revenue Strategy',
      profitability: 'Profit Optimization',
      operations: 'Operational Excellence',
      marketing: 'Marketing & Sales',
      workforce: 'Workforce Management',
      competitive: 'Market Positioning'
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
      since_inception: 'All Time'
    };
    return labels[selectedDateRange];
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Advanced Business Intelligence - {getRangeLabel()}
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowMetrics(!showMetrics)}
              variant="outline"
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showMetrics ? 'Hide' : 'Show'} Metrics
            </Button>
            <Button 
              onClick={generateAdvancedInsights} 
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
                  Generate Analysis
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium mb-2">Advanced Business Intelligence Ready</p>
            <p>Click "Generate Analysis" to get comprehensive insights about your moving business performance, industry benchmarks, and strategic recommendations.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
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
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.category === 'revenue').length}
                </div>
                <div className="text-sm text-gray-600">Revenue Insights</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {insights.filter(i => i.category === 'operations').length}
                </div>
                <div className="text-sm text-gray-600">Operational</div>
              </div>
            </div>

            {/* Insights List */}
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
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
                          <p className="text-gray-700 mb-2">{insight.description}</p>
                          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            <strong>Business Impact:</strong> {insight.impact}
                          </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                          <h5 className="font-medium text-blue-900 mb-2">Strategic Recommendation</h5>
                          <p className="text-blue-800 mb-3">{insight.recommendation}</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            <div>
                              <strong className="text-blue-900">Expected Outcome:</strong>
                              <p className="text-blue-700">{insight.expectedOutcome}</p>
                            </div>
                            <div>
                              <strong className="text-blue-900">Implementation Timeline:</strong>
                              <p className="text-blue-700">{insight.timeframe}</p>
                            </div>
                          </div>
                        </div>

                        {insight.metrics && insight.metrics.length > 0 && (
                          <div className="bg-gray-50 rounded p-3">
                            <h6 className="font-medium text-gray-900 mb-2">Key Metrics</h6>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              {insight.metrics.map((metric, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span className="text-gray-600">{metric.label}:</span>
                                  <span className="font-medium">{metric.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {insights.length > 0 && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Moving Industry Benchmarks Applied</h4>
                <p className="text-green-800 text-sm">
                  This analysis uses current moving industry standards: 25-35% profit margins, $400-600 average job values, 
                  35-45% lead conversion rates, and seasonal patterns specific to the moving business.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
