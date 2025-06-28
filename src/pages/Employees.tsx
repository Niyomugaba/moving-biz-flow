
import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { AddEmployeeDialog } from '../components/AddEmployeeDialog';
import { EmployeeTimeTrackingDialog } from '../components/EmployeeTimeTrackingDialog';
import { EditEmployeeDialog } from '../components/EditEmployeeDialog';
import { Plus, Phone, Mail, DollarSign, Clock, UserCheck, Eye, Edit } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';

export const Employees = () => {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee, isUpdatingEmployee, isDeletingEmployee } = useEmployees();
  const { timeEntries } = useTimeEntries();
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isTimeTrackingDialogOpen, setIsTimeTrackingDialogOpen] = useState(false);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleAddEmployee = (employeeData: any) => {
    addEmployee({
      name: employeeData.name,
      phone: employeeData.phone,
      email: employeeData.email || null,
      hourly_wage: parseFloat(employeeData.hourlyWage),
      status: 'Active',
      hire_date: employeeData.hireDate
    });
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditEmployeeDialogOpen(true);
  };

  const calculateMonthlyStats = (employeeId: string) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Only count approved time entries for payroll calculations
    const monthlyEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date);
      return entry.employee_id === employeeId && 
             entry.status === 'approved' &&
             entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    });

    const totalHours = monthlyEntries.reduce((sum, entry) => sum + entry.hours_worked, 0);
    const totalEarnings = monthlyEntries.reduce((sum, entry) => sum + (entry.hours_worked * entry.hourly_rate), 0);

    // Also get pending hours for display
    const pendingEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date);
      return entry.employee_id === employeeId && 
             entry.status === 'pending' &&
             entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    });
    
    const pendingHours = pendingEntries.reduce((sum, entry) => sum + entry.hours_worked, 0);

    return { totalHours, totalEarnings, pendingHours };
  };

  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  const totalPayrollThisMonth = employees.reduce((sum, emp) => {
    const { totalEarnings } = calculateMonthlyStats(emp.id);
    return sum + totalEarnings;
  }, 0);
  const averageHoursPerEmployee = employees.length > 0 
    ? Math.round(employees.reduce((sum, emp) => {
        const { totalHours } = calculateMonthlyStats(emp.id);
        return sum + totalHours;
      }, 0) / employees.length)
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading employees...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-2">Manage your moving crew and track payroll</p>
        </div>
        <div className="flex gap-2">
          <Link to="/employee-requests">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              View Requests
            </Button>
          </Link>
          <button 
            onClick={() => setIsTimeTrackingDialogOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Track Time
          </button>
          <button 
            onClick={() => setIsAddEmployeeDialogOpen(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Employee
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Total Employees</p>
          <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Active Employees</p>
          <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Monthly Payroll</p>
          <p className="text-2xl font-bold text-red-600">${totalPayrollThisMonth.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Approved hours only</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Avg Hours/Employee</p>
          <p className="text-2xl font-bold text-purple-600">{averageHoursPerEmployee}h</p>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button 
          variant={viewMode === 'cards' ? 'default' : 'outline'}
          onClick={() => setViewMode('cards')}
          size="sm"
        >
          Card View
        </Button>
        <Button 
          variant={viewMode === 'table' ? 'default' : 'outline'}
          onClick={() => setViewMode('table')}
          size="sm"
        >
          Table View
        </Button>
      </div>

      {viewMode === 'cards' ? (
        // Employee Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {employees.map((employee) => {
            const { totalHours, totalEarnings, pendingHours } = calculateMonthlyStats(employee.id);
            return (
              <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">Since {employee.hire_date}</p>
                    </div>
                    <StatusBadge status={employee.status} variant="employee" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      {employee.phone}
                    </div>
                    
                    {employee.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {employee.email}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${employee.hourly_wage}/hour
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{totalHours}h</p>
                        <p className="text-xs text-gray-500">Approved Hours</p>
                        {pendingHours > 0 && (
                          <p className="text-xs text-yellow-600">+{pendingHours}h pending</p>
                        )}
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-green-600">
                          ${totalEarnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Approved Earnings</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button 
                      onClick={() => handleEditEmployee(employee)}
                      className="flex-1 bg-purple-50 text-purple-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </button>
                    <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                      View Hours
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Employee Table
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Monthly Hours</TableHead>
                <TableHead>Monthly Earnings</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => {
                const { totalHours, totalEarnings, pendingHours } = calculateMonthlyStats(employee.id);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.phone}</TableCell>
                    <TableCell>{employee.email || 'N/A'}</TableCell>
                    <TableCell>
                      <StatusBadge status={employee.status} variant="employee" />
                    </TableCell>
                    <TableCell>${employee.hourly_wage}/hr</TableCell>
                    <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span className="font-medium">{totalHours}h</span>
                      {pendingHours > 0 && (
                        <span className="text-yellow-600 text-sm"> (+{pendingHours}h pending)</span>
                      )}
                    </TableCell>
                    <TableCell className="text-green-600 font-medium">
                      ${totalEarnings.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {employees.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No employees found. Add your first employee to get started.
            </div>
          )}
        </div>
      )}

      <AddEmployeeDialog 
        open={isAddEmployeeDialogOpen} 
        onOpenChange={setIsAddEmployeeDialogOpen}
        onAddEmployee={handleAddEmployee}
      />
      
      <EmployeeTimeTrackingDialog 
        open={isTimeTrackingDialogOpen} 
        onOpenChange={setIsTimeTrackingDialogOpen}
      />

      <EditEmployeeDialog
        open={isEditEmployeeDialogOpen}
        onOpenChange={setIsEditEmployeeDialogOpen}
        employee={selectedEmployee}
        onUpdateEmployee={updateEmployee}
        onDeleteEmployee={deleteEmployee}
        isUpdating={isUpdatingEmployee}
        isDeleting={isDeletingEmployee}
      />
    </div>
  );
};
