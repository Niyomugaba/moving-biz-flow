
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployeeRequests } from '@/hooks/useEmployeeRequests';
import { UserPlus, ArrowLeft } from 'lucide-react';

interface NewEmployeeRequestFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const NewEmployeeRequestForm = ({ onBack, onSuccess }: NewEmployeeRequestFormProps) => {
  const { addEmployeeRequest, isAddingRequest } = useEmployeeRequests();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addEmployeeRequest({
      name: formData.name,
      phone: formData.phone,
      notes: formData.notes || undefined
    });

    // Show success message and reset form
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">New Employee Request</h1>
          <p className="text-gray-600 mt-2">We'll add you to the system for time tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows={3}
              placeholder="Any additional information..."
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-xs text-blue-700 mt-2 space-y-1">
              <li>• Your request will be sent to management</li>
              <li>• Once approved, you can log hours using this portal</li>
              <li>• You'll receive the same PIN verification process</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isAddingRequest}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isAddingRequest ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
