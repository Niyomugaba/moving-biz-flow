
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Switch } from './ui/switch';

interface AddEmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEmployee: (employeeData: any) => void;
}

export const AddEmployeeDialog = ({ open, onOpenChange, onAddEmployee }: AddEmployeeDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    hourlyWage: '',
    hireDate: new Date().toISOString().split('T')[0],
    position: 'mover',
    department: 'operations'
  });
  
  const [enablePortalAccess, setEnablePortalAccess] = useState(false);
  const [accessCode, setAccessCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prepare employee data
    const employeeData = {
      ...formData,
      accessCode: enablePortalAccess ? accessCode : null
    };
    
    onAddEmployee(employeeData);
    
    // Reset form
    setFormData({
      name: '',
      phone: '',
      email: '',
      hourlyWage: '',
      hireDate: new Date().toISOString().split('T')[0],
      position: 'mover',
      department: 'operations'
    });
    setEnablePortalAccess(false);
    setAccessCode('');
    onOpenChange(false);
  };

  const generateRandomCode = () => {
    const words = ['Tiger', 'Eagle', 'Lion', 'Shark', 'Wolf', 'Bear', 'Hawk', 'Fox'];
    const numbers = Math.floor(100 + Math.random() * 900).toString();
    const randomCode = words[Math.floor(Math.random() * words.length)] + numbers;
    setAccessCode(randomCode);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="mover">Mover</option>
                <option value="driver">Driver</option>
                <option value="team_lead">Team Lead</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="operations">Operations</option>
                <option value="logistics">Logistics</option>
                <option value="administration">Administration</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Wage ($)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.hourlyWage}
              onChange={(e) => setFormData({ ...formData, hourlyWage: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hire Date
            </label>
            <input
              type="date"
              required
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Portal Access Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Enable Portal Access
                </label>
                <p className="text-xs text-gray-500">
                  Allow employee to access the employee portal with an access code
                </p>
              </div>
              <Switch
                checked={enablePortalAccess}
                onCheckedChange={setEnablePortalAccess}
              />
            </div>
            
            {enablePortalAccess && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Portal Access Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter access code (word or phrase)"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
                    required={enablePortalAccess}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateRandomCode}
                    className="px-3"
                  >
                    Generate
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  This access code will be used by the employee to access their dashboard
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Employee
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
