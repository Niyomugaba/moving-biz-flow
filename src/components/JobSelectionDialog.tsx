
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, Users, DollarSign } from 'lucide-react';
import { Job, useJobs } from '@/hooks/useJobs';
import { useEmployees } from '@/hooks/useEmployees';
import { format } from 'date-fns';

interface JobSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobSelected: (job: Job) => void;
}

export const JobSelectionDialog = ({ open, onOpenChange, onJobSelected }: JobSelectionDialogProps) => {
  const { jobs } = useJobs();
  const { employees } = useEmployees();
  const [searchTerm, setSearchTerm] = useState('');

  // Filter jobs that have dummy employees and completed status
  const eligibleJobs = jobs.filter(job => {
    const hasDummyEmployees = employees.some(emp => 
      emp.notes?.includes(`Dummy employee created for job ${job.id}`) ||
      emp.position === 'dummy_worker'
    );
    
    const matchesSearch = !searchTerm || 
      job.job_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client_name.toLowerCase().includes(searchTerm.toLowerCase());

    return hasDummyEmployees && matchesSearch && job.status === 'completed';
  });

  const handleJobSelect = (job: Job) => {
    onJobSelected(job);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Select Job for Payment Processing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by job number or client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Jobs List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {eligibleJobs.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No completed jobs with dummy employees found.</p>
                  <p className="text-sm mt-2">Jobs must be completed and have dummy employees to process payments.</p>
                </CardContent>
              </Card>
            ) : (
              eligibleJobs.map((job) => {
                const dummyEmployeeCount = employees.filter(emp => 
                  emp.notes?.includes(`Dummy employee created for job ${job.id}`) ||
                  emp.position === 'dummy_worker'
                ).length;

                return (
                  <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleJobSelect(job)}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div class="flex items-center gap-2">
                            <span className="font-medium text-lg">{job.job_number}</span>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              {job.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(job.job_date), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {dummyEmployeeCount} dummy employees
                            </div>
                          </div>

                          <div className="text-sm">
                            <strong>Client:</strong> {job.client_name}
                          </div>

                          {job.hours_worked && job.worker_hourly_rate && (
                            <div className="text-sm text-green-600">
                              <strong>Payment Ready:</strong> {job.hours_worked}h @ ${job.worker_hourly_rate}/hr
                            </div>
                          )}
                        </div>

                        <Button size="sm" onClick={() => handleJobSelect(job)}>
                          Process Payment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
