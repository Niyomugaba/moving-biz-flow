
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Users, DollarSign } from 'lucide-react';

interface DummyEmployeeSummaryProps {
  count: number;
  hourlyRate: number;
  hours: number;
  jobId: string;
}

export const DummyEmployeeSummary = ({ count, hourlyRate, hours, jobId }: DummyEmployeeSummaryProps) => {
  const totalWorkerCost = count * hourlyRate * hours;

  return (
    <Card className="border-dashed border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
          <Users className="h-4 w-4" />
          Dummy Employees Summary
          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700">
            Negotiated Job
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Workers:</span>
            <span className="font-medium ml-2">{count} dummy employees</span>
          </div>
          <div>
            <span className="text-gray-600">Rate:</span>
            <span className="font-medium ml-2">${hourlyRate}/hour each</span>
          </div>
          <div>
            <span className="text-gray-600">Hours:</span>
            <span className="font-medium ml-2">{hours} hours</span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3 text-red-600" />
            <span className="text-gray-600">Total Cost:</span>
            <span className="font-semibold text-red-600">${totalWorkerCost.toFixed(2)}</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Dummy employees will be auto-created when this job uses negotiated pricing.
        </p>
      </CardContent>
    </Card>
  );
};
