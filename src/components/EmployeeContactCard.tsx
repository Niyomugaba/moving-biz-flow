
import React from 'react';
import { Phone, Mail, Calendar, DollarSign, FileText, MapPin, User } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Button } from "@/components/ui/button";
import { Employee } from '@/hooks/useEmployees';
import { StatusBadge } from './StatusBadge';

interface EmployeeContactCardProps {
  employee: Employee;
  children: React.ReactNode;
}

export const EmployeeContactCard = ({ employee, children }: EmployeeContactCardProps) => {
  const handleCall = () => {
    window.open(`tel:${employee.phone}`, '_self');
  };

  const handleEmail = () => {
    if (employee.email) {
      window.open(`mailto:${employee.email}`, '_self');
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-80" side="top">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">{employee.name}</h4>
              <p className="text-sm text-gray-600">#{employee.employee_number}</p>
              <p className="text-sm text-gray-600 capitalize">
                {employee.position} • {employee.department}
              </p>
            </div>
            <StatusBadge status={employee.status} variant="employee" />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                {employee.phone}
              </div>
              <Button variant="outline" size="sm" onClick={handleCall}>
                Call
              </Button>
            </div>

            {employee.email && (
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.email}
                </div>
                <Button variant="outline" size="sm" onClick={handleEmail}>
                  Email
                </Button>
              </div>
            )}

            {employee.address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                {employee.address}
              </div>
            )}

            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              Hired: {new Date(employee.hire_date).toLocaleDateString()}
            </div>

            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="h-4 w-4 mr-2" />
              ${employee.hourly_wage}/hour
              {employee.overtime_rate && (
                <span className="ml-2 text-xs">
                  (OT: ${employee.overtime_rate}/hr)
                </span>
              )}
            </div>

            {employee.emergency_contact_name && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Emergency Contact:</p>
                    <p className="mt-1">{employee.emergency_contact_name}</p>
                    {employee.emergency_contact_phone && (
                      <p className="text-xs">{employee.emergency_contact_phone}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {employee.notes && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-start text-sm text-gray-600">
                  <FileText className="h-4 w-4 mr-2 mt-0.5" />
                  <div>
                    <p className="font-medium">Notes:</p>
                    <p className="mt-1">{employee.notes}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-gray-200">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Created: {new Date(employee.created_at).toLocaleDateString()}</span>
              <span>Updated: {new Date(employee.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};
