
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';
import { AddEmployeeDialog } from '@/components/AddEmployeeDialog';
import { EditEmployeeDialog } from '@/components/EditEmployeeDialog';
import { PaginationControls } from '@/components/PaginationControls';
import { 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Edit,
  Plus,
  Search,
  UserCheck,
  UserX,
  Clock,
  Shield
} from 'lucide-react';
import { Employee } from '@/integrations/supabase/types';

const ITEMS_PER_PAGE = 12;

export const Employees = () => {
  const { employees, loading, addEmployee, updateEmployee, deleteEmployee } = useEmployees();
  const { canAccess } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'rate' | 'status'>('name');

  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(employee => {
      const matchesSearch = employee.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           employee.employee_number?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    // Sort employees
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'rate':
          return (b.hourly_rate || 0) - (a.hourly_rate || 0);
        case 'status':
          return (a.status || '').localeCompare(b.status || '');
        default:
          return 0;
      }
    });

    return filtered;
  }, [employees, searchTerm, statusFilter, sortBy]);

  const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddEmployee = async (employeeData: Partial<Employee>) => {
    await addEmployee(employeeData);
    setShowAddDialog(false);
  };

  const handleEditEmployee = async (employeeData: Partial<Employee>) => {
    if (selectedEmployee) {
      await updateEmployee(selectedEmployee.id, employeeData);
      setShowEditDialog(false);
      setSelectedEmployee(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <UserX className="h-4 w-4 text-red-600" />;
      case 'on_leave':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-background">
      <ScrollArea className="h-full w-full">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
              <p className="text-gray-600">Manage your team members</p>
            </div>
            {canAccess(['owner', 'admin', 'manager']) && (
              <Button 
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'name' | 'date' | 'rate' | 'status')}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Date Added</SelectItem>
                <SelectItem value="rate">Hourly Rate</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employees Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                        {employee.first_name} {employee.last_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {employee.employee_number}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(employee.status)}`}>
                          {employee.status?.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {canAccess(['owner', 'admin', 'manager']) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setShowEditDialog(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {employee.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm truncate">{employee.email}</span>
                      </div>
                    )}
                    
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    )}
                    
                    {employee.address && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm leading-relaxed">{employee.address}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        ${employee.hourly_rate || 0}/hr
                      </p>
                      <p className="text-xs text-gray-500">Hourly Rate</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(employee.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">Joined</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          {/* Dialogs */}
          {showAddDialog && (
            <AddEmployeeDialog
              isOpen={showAddDialog}
              onClose={() => setShowAddDialog(false)}
              onAdd={handleAddEmployee}
            />
          )}

          {showEditDialog && selectedEmployee && (
            <EditEmployeeDialog
              isOpen={showEditDialog}
              onClose={() => {
                setShowEditDialog(false);
                setSelectedEmployee(null);
              }}
              employee={selectedEmployee}
              onUpdate={handleEditEmployee}
            />
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
