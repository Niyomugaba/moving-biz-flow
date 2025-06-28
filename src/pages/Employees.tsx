
import React, { useState } from 'react';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Phone, Mail, DollarSign } from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  phone: string;
  email: string;
  hourlyWage: number;
  status: 'Active' | 'Inactive';
  hireDate: string;
  totalHoursThisMonth: number;
  totalEarningsThisMonth: number;
}

export const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: 1,
      name: 'Mike Johnson',
      phone: '(555) 111-2222',
      email: 'mike.j@company.com',
      hourlyWage: 18,
      status: 'Active',
      hireDate: '2023-03-15',
      totalHoursThisMonth: 145,
      totalEarningsThisMonth: 2610
    },
    {
      id: 2,
      name: 'Sarah Davis',
      phone: '(555) 222-3333',
      email: 'sarah.d@company.com',
      hourlyWage: 20,
      status: 'Active',
      hireDate: '2023-01-20',
      totalHoursThisMonth: 160,
      totalEarningsThisMonth: 3200
    },
    {
      id: 3,
      name: 'Tom Wilson',
      phone: '(555) 333-4444',
      email: 'tom.w@company.com',
      hourlyWage: 16,
      status: 'Active',
      hireDate: '2023-07-10',
      totalHoursThisMonth: 120,
      totalEarningsThisMonth: 1920
    },
    {
      id: 4,
      name: 'Alex Brown',
      phone: '(555) 444-5555',
      email: 'alex.b@company.com',
      hourlyWage: 19,
      status: 'Active',
      hireDate: '2023-11-05',
      totalHoursThisMonth: 135,
      totalEarningsThisMonth: 2565
    }
  ]);

  const activeEmployees = employees.filter(emp => emp.status === 'Active').length;
  const totalPayrollThisMonth = employees.reduce((sum, emp) => sum + emp.totalEarningsThisMonth, 0);
  const averageHoursPerEmployee = employees.length > 0 
    ? Math.round(employees.reduce((sum, emp) => sum + emp.totalHoursThisMonth, 0) / employees.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
          <p className="text-gray-600 mt-2">Manage your moving crew and track payroll</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </button>
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
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <p className="text-sm text-gray-600">Avg Hours/Employee</p>
          <p className="text-2xl font-bold text-blue-600">{averageHoursPerEmployee}h</p>
        </div>
      </div>

      {/* Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <div key={employee.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-500">Since {employee.hireDate}</p>
                </div>
                <StatusBadge status={employee.status} variant="employee" />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  {employee.phone}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  {employee.email}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <DollarSign className="h-4 w-4 mr-2" />
                  ${employee.hourlyWage}/hour
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold text-gray-900">{employee.totalHoursThisMonth}h</p>
                    <p className="text-xs text-gray-500">Hours This Month</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-green-600">
                      ${employee.totalEarningsThisMonth.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Earnings This Month</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="flex-1 bg-blue-50 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                  Edit Profile
                </button>
                <button className="flex-1 bg-green-50 text-green-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors">
                  View Hours
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Time Submissions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Time Submissions</h2>
          <p className="text-sm text-gray-600 mt-1">Hours submitted by employees this week</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Mike Johnson</p>
                <p className="text-sm text-gray-600">Johnson Residence Move - 8 hours</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">$144.00</p>
                <p className="text-sm text-gray-500">Jan 15, 2024</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Sarah Davis</p>
                <p className="text-sm text-gray-600">Office Relocation - 6.5 hours</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">$130.00</p>
                <p className="text-sm text-gray-500">Jan 14, 2024</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Tom Wilson</p>
                <p className="text-sm text-gray-600">Davis Family Move - 7 hours</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">$112.00</p>
                <p className="text-sm text-gray-500">Jan 13, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
