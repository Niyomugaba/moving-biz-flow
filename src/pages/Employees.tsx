
import React, { useState, useMemo } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { AddEmployeeDialog } from '../components/AddEmployeeDialog';
import { EmployeeTimeTrackingDialog } from '../components/EmployeeTimeTrackingDialog';
import { EditEmployeeDialog } from '../components/EditEmployeeDialog';
import { EmployeeContactCard } from '../components/EmployeeContactCard';
import { Plus, Phone, Mail, DollarSign, Clock, UserCheck, Eye, Edit, Search, Filter, Download, Users, TrendingUp, AlertCircle, Calendar } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useJobs } from '@/hooks/useJobs';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';

export const Employees = () => {
  const { employees, isLoading, addEmployee, updateEmployee, deleteEmployee, isUpdatingEmployee, isDeletingEmployee } = useEmployees();
  const { timeEntries } = useTimeEntries();
  const { jobs } = useJobs();
  const { toast } = useToast();
  const [isAddEmployeeDialogOpen, setIsAddEmployeeDialogOpen] = useState(false);
  const [isTimeTrackingDialogOpen, setIsTimeTrackingDialogOpen] = useState(false);
  const [isEditEmployeeDialogOpen, setIsEditEmployeeDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [positionFilter, setPositionFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  const handleAddEmployee = (employeeData: any) => {
    addEmployee({
      name: employeeData.name,
      phone: employeeData.phone,
      email: employeeData.email || undefined,
      hourly_wage: parseFloat(employeeData.hourlyWage),
      status: 'active',
      hire_date: employeeData.hireDate,
      position: employeeData.position || 'mover',
      department: employeeData.department || 'operations'
    });
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditEmployeeDialogOpen(true);
  };

  const handleViewEmployeeDetails = (employee: any) => {
    // Navigate to detailed employee view
    console.log('View employee details:', employee.id);
    toast({
      title: "Employee Details",
      description: `Viewing details for ${employee.name}`,
    });
  };

  const handleBulkAction = (action: string) => {
    toast({
      title: "Bulk Action",
      description: `${action} action will be implemented soon`,
    });
  };

  const exportEmployeeData = () => {
    const csvData = filteredEmployees.map(emp => ({
      Name: emp.name,
      Phone: emp.phone,
      Email: emp.email || 'N/A',
      Status: emp.status,
      Position: emp.position || 'N/A',
      Department: emp.department || 'N/A',
      'Hourly Rate': `$${emp.hourly_wage}`,
      'Hire Date': emp.hire_date,
      'Employee Number': emp.employee_number
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Employee data has been exported to CSV",
    });
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

    const totalHours = monthlyEntries.reduce((sum, entry) => {
      return sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0);
    }, 0);
    
    const totalEarnings = monthlyEntries.reduce((sum, entry) => {
      const regularPay = (entry.regular_hours || 0) * entry.hourly_rate;
      const overtimePay = (entry.overtime_hours || 0) * (entry.overtime_rate || entry.hourly_rate * 1.5);
      return sum + regularPay + overtimePay;
    }, 0);

    // Also get pending hours for display
    const pendingEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.entry_date);
      return entry.employee_id === employeeId && 
             entry.status === 'pending' &&
             entryDate.getMonth() === currentMonth && 
             entryDate.getFullYear() === currentYear;
    });
    
    const pendingHours = pendingEntries.reduce((sum, entry) => {
      return sum + (entry.regular_hours || 0) + (entry.overtime_hours || 0);
    }, 0);

    // Calculate job assignments this month
    const jobAssignments = jobs.filter(job => {
      const jobDate = new Date(job.job_date);
      return jobDate.getMonth() === currentMonth && 
             jobDate.getFullYear() === currentYear &&
             timeEntries.some(entry => entry.job_id === job.id && entry.employee_id === employeeId);
    }).length;

    return { totalHours, totalEarnings, pendingHours, jobAssignments };
  };

  // Filter employees based on search and filter criteria
  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.phone.includes(searchQuery) ||
        (employee.email && employee.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        employee.employee_number.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;

      // Position filter
      const matchesPosition = positionFilter === 'all' || 
        (employee.position && employee.position.toLowerCase() === positionFilter.toLowerCase());

      // Department filter
      const matchesDepartment = departmentFilter === 'all' || 
        (employee.department && employee.department.toLowerCase() === departmentFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesPosition && matchesDepartment;
    });
  }, [employees, searchQuery, statusFilter, positionFilter, departmentFilter]);

  // Get unique values for filter dropdowns
  const uniquePositions = useMemo(() => {
    const positions = employees.map(emp => emp.position).filter(Boolean);
    return [...new Set(positions)];
  }, [employees]);

  const uniqueDepartments = useMemo(() => {
    const departments = employees.map(emp => emp.department).filter(Boolean);
    return [...new Set(departments)];
  }, [employees]);

  // Calculate enhanced stats
  const activeEmployees = filteredEmployees.filter(emp => emp.status === 'active').length;
  const totalPayrollThisMonth = filteredEmployees.reduce((sum, emp) => {
    const { totalEarnings } = calculateMonthlyStats(emp.id);
    return sum + totalEarnings;
  }, 0);
  const averageHoursPerEmployee = filteredEmployees.length > 0 
    ? Math.round(filteredEmployees.reduce((sum, emp) => {
        const { totalHours } = calculateMonthlyStats(emp.id);
        return sum + totalHours;
      }, 0) / filteredEmployees.length)
    : 0;
  
  const pendingTimeEntries = timeEntries.filter(entry => entry.status === 'pending').length;
  const averageWage = filteredEmployees.length > 0 
    ? filteredEmployees.reduce((sum, emp) => sum + emp.hourly_wage, 0) / filteredEmployees.length
    : 0;

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPositionFilter('all');
    setDepartmentFilter('all');
  };

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
          <p className="text-gray-600 mt-2">Manage your moving crew and track performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={exportEmployeeData}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Link to="/employee-requests">
            <Button variant="outline" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              View Requests
              {pendingTimeEntries > 0 && (
                <Badge variant="destructive" className="ml-1">
                  {pendingTimeEntries}
                </Badge>
              )}
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

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredEmployees.length}</p>
              <p className="text-xs text-gray-500">of {employees.length} total</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Employees</p>
              <p className="text-2xl font-bold text-green-600">{activeEmployees}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monthly Payroll</p>
              <p className="text-2xl font-bold text-red-600">${totalPayrollThisMonth.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Approved hours only</p>
            </div>
            <DollarSign className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Hours/Employee</p>
              <p className="text-2xl font-bold text-purple-600">{averageHoursPerEmployee}h</p>
            </div>
            <Clock className="h-8 w-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-blue-600">${averageWage.toFixed(2)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Reviews</p>
              <p className="text-2xl font-bold text-orange-600">{pendingTimeEntries}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="ml-auto text-purple-600 hover:text-purple-700"
          >
            Clear All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, phone, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Position Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <Select value={positionFilter} onValueChange={setPositionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Positions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Positions</SelectItem>
                {uniquePositions.map(position => (
                  <SelectItem key={position} value={position.toLowerCase()}>
                    {position}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(department => (
                  <SelectItem key={department} value={department.toLowerCase()}>
                    {department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* View Toggle and Bulk Actions */}
      <div className="flex justify-between items-center">
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
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleBulkAction('Update Status')}
          >
            Bulk Actions
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleBulkAction('Send Notifications')}
          >
            Send Notifications
          </Button>
        </div>
      </div>

      {viewMode === 'cards' ? (
        // Enhanced Employee Cards
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEmployees.map((employee) => {
            const { totalHours, totalEarnings, pendingHours, jobAssignments } = calculateMonthlyStats(employee.id);
            return (
              <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <EmployeeContactCard employee={employee}>
                        <h3 className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors">
                          {employee.name}
                        </h3>
                      </EmployeeContactCard>
                      <p className="text-sm text-gray-500">#{employee.employee_number}</p>
                      <p className="text-sm text-gray-500">Since {new Date(employee.hire_date).toLocaleDateString()}</p>
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
                      {employee.overtime_rate && (
                        <span className="text-xs text-purple-600 ml-2">
                          (OT: ${employee.overtime_rate})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {jobAssignments} jobs this month
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
                    <button 
                      onClick={() => handleViewEmployeeDetails(employee)}
                      className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Enhanced Employee Table
        <div className="bg-white rounded-lg shadow-sm border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Hourly Rate</TableHead>
                <TableHead>Monthly Stats</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => {
                const { totalHours, totalEarnings, pendingHours, jobAssignments } = calculateMonthlyStats(employee.id);
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      <EmployeeContactCard employee={employee}>
                        <div className="cursor-pointer hover:text-purple-600 transition-colors">
                          <div className="font-semibold">{employee.name}</div>
                          <div className="text-xs text-gray-500">#{employee.employee_number}</div>
                        </div>
                      </EmployeeContactCard>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{employee.phone}</div>
                        {employee.email && (
                          <div className="text-xs text-gray-600">{employee.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={employee.status} variant="employee" />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{employee.position || 'Mover'}</div>
                        <div className="text-xs text-gray-500">{employee.department || 'Operations'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold">${employee.hourly_wage}/hr</div>
                        {employee.overtime_rate && (
                          <div className="text-xs text-purple-600">OT: ${employee.overtime_rate}/hr</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Hours:</span>
                          <span className="font-medium">{totalHours}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Earnings:</span>
                          <span className="font-medium text-green-600">${totalEarnings.toLocaleString()}</span>
                        </div>
                        {pendingHours > 0 && (
                          <div className="text-xs text-yellow-600">+{pendingHours}h pending</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="flex justify-between">
                          <span>Jobs:</span>
                          <span className="font-medium">{jobAssignments}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Hired:</span>
                          <span className="text-xs">{new Date(employee.hire_date).toLocaleDateString()}</span>
                        </div>
                      </div>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewEmployeeDetails(employee)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredEmployees.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              {employees.length === 0 
                ? "No employees found. Add your first employee to get started."
                : "No employees match your current filters. Try adjusting your search criteria."
              }
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
