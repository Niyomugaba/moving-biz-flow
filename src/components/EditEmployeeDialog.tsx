
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Employee } from '@/hooks/useEmployees';
import { Trash2, DollarSign, User, Phone, Mail } from 'lucide-react';

interface EditEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onUpdateEmployee: (data: { id: string; updates: Partial<Employee> }) => void;
  onDeleteEmployee: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

export const EditEmployeeDialog = ({
  open,
  onOpenChange,
  employee,
  onUpdateEmployee,
  onDeleteEmployee,
  isUpdating,
  isDeleting
}: EditEmployeeDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hourly_wage: '',
    status: 'active' as 'active' | 'inactive' | 'terminated' | 'on_leave'
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        phone: employee.phone,
        email: employee.email || '',
        hourly_wage: employee.hourly_wage.toString(),
        status: employee.status
      });
    }
  }, [employee]);

  const handleSave = () => {
    if (!employee) return;

    onUpdateEmployee({
      id: employee.id,
      updates: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        hourly_wage: parseFloat(formData.hourly_wage),
        status: formData.status
      }
    });
  };

  const handleDelete = () => {
    if (!employee) return;
    onDeleteEmployee(employee.id);
    setShowDeleteConfirm(false);
  };

  if (!employee) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="inline h-4 w-4 mr-1" />
              Full Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Employee name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="inline h-4 w-4 mr-1" />
              Phone Number
            </label>
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="inline h-4 w-4 mr-1" />
              Email (Optional)
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="employee@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <DollarSign className="inline h-4 w-4 mr-1" />
              Hourly Wage
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={formData.hourly_wage}
              onChange={(e) => setFormData({ ...formData, hourly_wage: e.target.value })}
              placeholder="15.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' | 'terminated' | 'on_leave' })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!showDeleteConfirm ? (
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
              <Button 
                onClick={handleSave}
                disabled={isUpdating || !formData.name || !formData.phone || !formData.hourly_wage}
                className="flex-1"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-800 mb-3">
                Are you sure you want to remove <strong>{employee.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  {isDeleting ? 'Removing...' : 'Yes, Remove Employee'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
