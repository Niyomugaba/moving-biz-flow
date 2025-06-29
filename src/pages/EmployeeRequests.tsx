
import React, { useState } from 'react';
import { useEmployeeRequests } from '@/hooks/useEmployeeRequests';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { UserPlus, CheckCircle, XCircle, Phone, Calendar, DollarSign, Trash2, RotateCcw, Clock, Users, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const EmployeeRequests = () => {
  const { employeeRequests, isLoading, updateRequestStatus, deleteRequest, isDeletingRequest } = useEmployeeRequests();
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [managerNotes, setManagerNotes] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');

  const pendingRequests = employeeRequests.filter(request => request.status === 'pending');
  const approvedRequests = employeeRequests.filter(request => request.status === 'approved');
  const rejectedRequests = employeeRequests.filter(request => request.status === 'rejected');

  const handleReviewRequest = (request: any) => {
    setSelectedRequest(request);
    setManagerNotes(request.notes || '');
    setHourlyWage('');
    setIsReviewDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedRequest && hourlyWage) {
      updateRequestStatus({
        id: selectedRequest.id,
        status: 'approved',
        notes: managerNotes,
        hourlyWage: parseFloat(hourlyWage)
      });
      
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
      setHourlyWage('');
    }
  };

  const handleReject = () => {
    if (selectedRequest) {
      updateRequestStatus({
        id: selectedRequest.id,
        status: 'rejected',
        notes: managerNotes
      });
      
      setIsReviewDialogOpen(false);
      setSelectedRequest(null);
    }
  };

  const handleRecall = (request: any) => {
    updateRequestStatus({
      id: request.id,
      status: 'pending',
      notes: `Recalled from rejected status. Previous notes: ${request.notes || 'None'}`
    });
  };

  const handleDeleteRequest = (requestId: string) => {
    deleteRequest(requestId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderRequestCard = (request: any, showActions = true) => (
    <div key={request.id} className="bg-white p-6 rounded-lg border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {request.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{request.name}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <Phone className="h-3 w-3 mr-1" />
              {request.phone}
            </div>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Calendar className="h-3 w-3 mr-1" />
              Applied {new Date(request.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize border ${getStatusColor(request.status)}`}>
            {request.status}
          </span>
          
          {showActions && (
            <div className="flex items-center space-x-2">
              {request.status === 'pending' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewRequest(request)}
                  className="text-purple-600 border-purple-200 hover:bg-purple-50"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Review
                </Button>
              )}
              
              {request.status === 'rejected' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRecall(request)}
                  className="text-amber-600 border-amber-200 hover:bg-amber-50"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Recall
                </Button>
              )}
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    disabled={isDeletingRequest}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Employee Request</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to permanently delete {request.name}'s application? 
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleDeleteRequest(request.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete Permanently
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </div>
      
      {request.notes && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <p className="text-sm text-gray-700">{request.notes}</p>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div className="text-lg text-gray-600">Loading employee requests...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-amber-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Employee Requests</h1>
              <p className="text-purple-100 mt-1">Manage new team member applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-amber-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-600">{approvedRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{rejectedRequests.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({approvedRequests.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejectedRequests.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          {pendingRequests.length > 0 ? (
            pendingRequests.map((request) => renderRequestCard(request))
          ) : (
            <div className="text-center py-12">
              <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
              <p className="text-gray-500">All requests have been processed.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          {approvedRequests.length > 0 ? (
            approvedRequests.map((request) => renderRequestCard(request, false))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No approved requests</h3>
              <p className="text-gray-500">No requests have been approved yet.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="space-y-4">
          {rejectedRequests.length > 0 ? (
            rejectedRequests.map((request) => renderRequestCard(request))
          ) : (
            <div className="text-center py-12">
              <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rejected requests</h3>
              <p className="text-gray-500">No requests have been rejected yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
              <span>Review Application</span>
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-amber-50 p-4 rounded-lg border">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-amber-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {selectedRequest.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedRequest.name}</h3>
                    <p className="text-sm text-gray-600">Mover Position</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <p className="font-medium">{selectedRequest.phone}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Applied:</span>
                    <p className="font-medium">{new Date(selectedRequest.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              {selectedRequest.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Applicant Notes
                  </label>
                  <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                    {selectedRequest.notes}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set Hourly Wage <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={hourlyWage}
                    onChange={(e) => setHourlyWage(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="15.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manager Notes
                </label>
                <textarea
                  value={managerNotes}
                  onChange={(e) => setManagerNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Add notes about this application..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsReviewDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
                <Button 
                  onClick={handleApprove}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600"
                  disabled={!hourlyWage || parseFloat(hourlyWage) <= 0}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve & Hire
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
