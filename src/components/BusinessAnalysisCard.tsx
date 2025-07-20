
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle, BarChart3, RefreshCw } from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useLeads } from '@/hooks/useLeads';
import { useClients } from '@/hooks/useClients';
import { useTimeEntries } from '@/hooks/useTimeEntries';

interface AnalysisInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  recommendation?: string;
}

export const BusinessAnalysisCard = () => {
  const { jobs } = useJobs();
  const { leads } = useLeads();
  const { clients } = useClients();
  const { timeEntries } = useTimeEntries();
  const [insights, setInsights] = useState<AnalysisInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateInsights = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    setTimeout(() => {
      const newInsights: AnalysisInsight[] = [];

      // Revenue Analysis
      const completedJobs = jobs.filter(job => job.status === 'completed');
      const paidJobs = completedJobs.filter(job => job.is_paid);
      const totalRevenue = paidJobs.reduce((sum, job) => sum + (job.actual_total || job.estimated_total), 0);
      const averageJobValue = completedJobs.length > 0 ? totalRevenue / completedJobs.length : 0;

      if (averageJobValue > 300) {
        newInsights.push({
          type: 'success',
          title: 'Strong Average Job Value',
          description: `Your average job value is $${averageJobValue.toFixed(0)}, which is excellent for the moving industry.`,
          recommendation: 'Continue targeting similar high-value clients and consider premium service offerings.'
        });
      } else if (averageJobValue < 200) {
        newInsights.push({
          type: 'warning',
          title: 'Low Average Job Value',
          description: `Your average job value is $${averageJobValue.toFixed(0)}, which may limit profitability.`,
          recommendation: 'Consider raising rates, upselling additional services, or targeting larger moves.'
        });
      }

      // Payment Analysis
      const paymentRate = completedJobs.length > 0 ? (paidJobs.length / completedJobs.length) * 100 : 0;
      if (paymentRate < 80) {
        newInsights.push({
          type: 'warning',
          title: 'Payment Collection Issues',
          description: `Only ${paymentRate.toFixed(1)}% of completed jobs are marked as paid.`,
          recommendation: 'Implement stricter payment terms, require deposits, or improve follow-up procedures.'
        });
      } else if (paymentRate > 95) {
        newInsights.push({
          type: 'success',
          title: 'Excellent Payment Collection',
          description: `${paymentRate.toFixed(1)}% of completed jobs are paid - excellent cash flow management!`,
        });
      }

      // Lead Conversion Analysis
      const convertedLeads = leads.filter(lead => lead.status === 'converted').length;
      const conversionRate = leads.length > 0 ? (convertedLeads / leads.length) * 100 : 0;
      
      if (conversionRate > 70) {
        newInsights.push({
          type: 'success',
          title: 'High Lead Conversion Rate',
          description: `${conversionRate.toFixed(1)}% conversion rate shows strong sales performance.`,
          recommendation: 'Document your successful conversion process and train others on these techniques.'
        });
      } else if (conversionRate < 30) {
        newInsights.push({
          type: 'warning',
          title: 'Low Lead Conversion Rate',
          description: `${conversionRate.toFixed(1)}% conversion rate suggests room for improvement.`,
          recommendation: 'Review lead qualification process, improve follow-up timing, or adjust pricing strategy.'
        });
      }

      // Client Retention Analysis
      const repeatClients = clients.filter(client => client.total_jobs_completed > 1).length;
      const retentionRate = clients.length > 0 ? (repeatClients / clients.length) * 100 : 0;
      
      if (retentionRate > 20) {
        newInsights.push({
          type: 'success',
          title: 'Good Client Retention',
          description: `${retentionRate.toFixed(1)}% of clients are repeat customers.`,
          recommendation: 'Implement a customer loyalty program to further increase retention.'
        });
      } else if (retentionRate < 10) {
        newInsights.push({
          type: 'info',
          title: 'Focus on Client Retention',
          description: `Only ${retentionRate.toFixed(1)}% of clients are repeat customers.`,
          recommendation: 'Implement follow-up campaigns, referral programs, and exceptional service to encourage repeat business.'
        });
      }

      // Operational Efficiency
      const activeJobs = jobs.filter(job => ['scheduled', 'in_progress'].includes(job.status)).length;
      if (activeJobs > 10) {
        newInsights.push({
          type: 'warning',
          title: 'High Active Job Volume',
          description: `You have ${activeJobs} active jobs. Monitor capacity carefully.`,
          recommendation: 'Consider hiring additional staff or implementing better scheduling to manage workload.'
        });
      }

      // Lead Cost Efficiency
      const leadsWithCost = leads.filter(lead => lead.lead_cost && lead.lead_cost > 0);
      const totalLeadCost = leadsWithCost.reduce((sum, lead) => sum + (lead.lead_cost || 0), 0);
      const costPerConversion = convertedLeads > 0 ? totalLeadCost / convertedLeads : 0;
      
      if (costPerConversion > 50) {
        newInsights.push({
          type: 'warning',
          title: 'High Lead Acquisition Cost',
          description: `Average cost per converted lead is $${costPerConversion.toFixed(0)}.`,
          recommendation: 'Analyze which lead sources provide the best ROI and focus marketing spend there.'
        });
      } else if (costPerConversion > 0 && costPerConversion < 25) {
        newInsights.push({
          type: 'success',
          title: 'Efficient Lead Acquisition',
          description: `Low cost per converted lead ($${costPerConversion.toFixed(0)}) shows efficient marketing.`,
          recommendation: 'Scale up your current marketing channels while maintaining this efficiency.'
        });
      }

      setInsights(newInsights);
      setIsAnalyzing(false);
    }, 1500);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default: return <Lightbulb className="h-4 w-4 text-blue-600" />;
    }
  };

  const getInsightBadge = (type: string) => {
    switch (type) {
      case 'success': return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Strength</Badge>;
      case 'warning': return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Opportunity</Badge>;
      default: return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Insight</Badge>;
    }
  };

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Business Intelligence Analysis
          </CardTitle>
          <Button 
            onClick={generateInsights} 
            disabled={isAnalyzing}
            variant="outline"
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
                Analyze Performance
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Click "Analyze Performance" to get AI-powered insights about your business metrics and personalized recommendations.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      {getInsightBadge(insight.type)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    {insight.recommendation && (
                      <div className="bg-white border border-gray-200 rounded p-3">
                        <p className="text-sm"><strong>Recommendation:</strong> {insight.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
