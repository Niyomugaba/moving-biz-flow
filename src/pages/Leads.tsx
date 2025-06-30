
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLeads } from "@/hooks/useLeads";
import { AddLeadDialog } from "@/components/AddLeadDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Search, 
  Filter, 
  Download, 
  TrendingUp, 
  Users, 
  Phone, 
  Mail, 
  Calendar, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  Activity,
  Target,
  Clock,
  Star
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type LeadStatus = 'new' | 'contacted' | 'quoted' | 'converted' | 'lost';

export const Leads = () => {
  const { leads, updateLead, isUpdatingLead } = useLeads();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const isMobile = useIsMobile();

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let filtered = leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    // Sort leads
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'estimated_value':
          return (b.estimated_value || 0) - (a.estimated_value || 0);
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return filtered;
  }, [leads, searchTerm, statusFilter, sortBy]);

  // Calculate metrics
  const leadMetrics = useMemo(() => {
    const total = leads.length;
    const newLeads = leads.filter(l => l.status === 'new').length;
    const contacted = leads.filter(l => l.status === 'contacted').length;
    const quoted = leads.filter(l => l.status === 'quoted').length;
    const converted = leads.filter(l => l.status === 'converted').length;
    const lost = leads.filter(l => l.status === 'lost').length;
    
    const conversionRate = total > 0 ? (converted / total) * 100 : 0;
    const totalValue = leads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
    const avgValue = total > 0 ? totalValue / total : 0;
    
    // Calculate cost per lead (assuming marketing cost)
    const estimatedMarketingCost = totalValue * 0.05; // 5% of total value as marketing cost
    const costPerLead = total > 0 ? estimatedMarketingCost / total : 0;

    return {
      total,
      newLeads,
      contacted,
      quoted,
      converted,
      lost,
      conversionRate,
      totalValue,
      avgValue,
      costPerLead,
      estimatedMarketingCost
    };
  }, [leads]);

  const handleStatusUpdate = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await updateLead({ id: leadId, updates: { status: newStatus } });
      toast.success(`Lead status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update lead status');
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Name', 'Phone', 'Email', 'Status', 'Estimated Value', 'Cost Per Lead', 'Created Date'],
      ...filteredLeads.map(lead => [
        lead.name,
        lead.phone,
        lead.email || '',
        lead.status,
        lead.estimated_value || 0,
        leadMetrics.costPerLead.toFixed(2),
        format(new Date(lead.created_at), 'yyyy-MM-dd')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Leads data exported successfully!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'quoted':
        return 'bg-purple-100 text-purple-800';
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (value: number) => {
    if (value >= 5000) return <Star className="h-4 w-4 text-gold-500" />;
    if (value >= 2000) return <TrendingUp className="h-4 w-4 text-purple-500" />;
    return <Target className="h-4 w-4 text-gray-400" />;
  };

  if (isMobile) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
        {/* Mobile Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">Track your sales pipeline</p>
        </div>

        {/* Mobile Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-700">{leadMetrics.total}</div>
              <div className="text-xs text-gray-600">Total Leads</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-green-700">{leadMetrics.converted}</div>
              <div className="text-xs text-gray-600">Converted</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-700">${leadMetrics.totalValue.toLocaleString()}</div>
              <div className="text-xs text-gray-600">Total Value</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-xl font-bold text-red-700">${leadMetrics.costPerLead.toFixed(0)}</div>
              <div className="text-xs text-gray-600">Cost/Lead</div>
            </div>
          </Card>
        </div>

        {/* Mobile Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Mobile Lead Cards */}
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <Card key={lead.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">{lead.name}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {lead.phone}
                  </div>
                  {lead.email && (
                    <div className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {lead.email}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(lead.status)}>
                    {lead.status}
                  </Badge>
                  <div className="text-sm font-semibold text-purple-700 mt-1">
                    ${(lead.estimated_value || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-red-600">
                    Cost: ${leadMetrics.costPerLead.toFixed(0)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <AddLeadDialog 
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-purple-25 to-gold-25 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your sales pipeline
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleExportData} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button 
            onClick={() => setShowAddDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Leads</CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-700">{leadMetrics.total}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">New Leads</CardTitle>
            <TrendingUp className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-700">{leadMetrics.newLeads}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Converted</CardTitle>
            <Target className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-700">{leadMetrics.converted}</div>
            <p className="text-xs text-gray-500 mt-1">
              {leadMetrics.conversionRate.toFixed(1)}% rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-700">${leadMetrics.totalValue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">
              ${leadMetrics.avgValue.toFixed(0)} avg
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cost Per Lead</CardTitle>
            <DollarSign className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-700">${leadMetrics.costPerLead.toFixed(0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              Est. marketing cost
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-gold-500 hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pipeline</CardTitle>
            <Activity className="h-5 w-5 text-gold-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gold-700">{leadMetrics.quoted}</div>
            <p className="text-xs text-gray-500 mt-1">
              Quoted leads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search leads by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Created Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="estimated_value">Value</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lead Pipeline Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Lead Pipeline
          </CardTitle>
          <CardDescription>Visual overview of your sales funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { status: 'new', count: leadMetrics.newLeads, color: 'bg-blue-500' },
              { status: 'contacted', count: leadMetrics.contacted, color: 'bg-yellow-500' },
              { status: 'quoted', count: leadMetrics.quoted, color: 'bg-purple-500' },
              { status: 'converted', count: leadMetrics.converted, color: 'bg-green-500' },
              { status: 'lost', count: leadMetrics.lost, color: 'bg-red-500' }
            ].map((stage) => (
              <div key={stage.status} className="text-center">
                <div className={`${stage.color} rounded-lg p-6 text-white mb-2`}>
                  <div className="text-2xl font-bold">{stage.count}</div>
                  <div className="text-sm capitalize">{stage.status}</div>
                </div>
                <Progress 
                  value={leadMetrics.total > 0 ? (stage.count / leadMetrics.total) * 100 : 0} 
                  className="h-2" 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            All Leads ({filteredLeads.length})
          </CardTitle>
          <CardDescription>
            {searchTerm && `Filtered by: "${searchTerm}"`}
            {statusFilter !== 'all' && ` | Status: ${statusFilter}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50">
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Name & Contact</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Estimated Value</TableHead>
                  <TableHead className="font-semibold">Created Date</TableHead>
                  <TableHead className="font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      No leads found matching your criteria
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLeads.map((lead, index) => (
                    <TableRow key={lead.id} className={index % 2 === 0 ? 'bg-white' : 'bg-purple-25'}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(lead.estimated_value || 0)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </div>
                          {lead.email && (
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusUpdate(lead.id, value as LeadStatus)}
                          disabled={isUpdatingLead}
                        >
                          <SelectTrigger className="w-32">
                            <Badge className={getStatusColor(lead.status)}>
                              {lead.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="quoted">Quoted</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="lost">Lost</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          ${(lead.estimated_value || 0).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(lead.created_at), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AddLeadDialog 
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />
    </div>
  );
};
