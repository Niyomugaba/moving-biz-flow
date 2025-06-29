
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployeeRequests } from '@/hooks/useEmployeeRequests';
import { UserPlus, ArrowLeft, Hash, Phone } from 'lucide-react';

interface NewEmployeeRequestFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const NewEmployeeRequestForm = ({ onBack, onSuccess }: NewEmployeeRequestFormProps) => {
  const { addEmployeeRequest, isAddingRequest } = useEmployeeRequests();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pin: '',
    position_applied: 'mover',
    expected_hourly_wage: 20,
    availability: '',
    experience_years: 0,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addEmployeeRequest({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone,
      position_applied: formData.position_applied || undefined,
      expected_hourly_wage: formData.expected_hourly_wage || undefined,
      availability: formData.availability || undefined,
      experience_years: formData.experience_years || undefined,
      notes: `PIN: ${formData.pin}${formData.notes ? ' | ' + formData.notes : ''}`
    });

    // Show success message and reset form
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">New Mover Request</h1>
        <p className="text-gray-600 mt-2 italic">Bantu Movers: Moving done for you</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
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
            Phone Number *
          </label>
          <div className="relative">
            <Input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="pl-10"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <p className="text-xs text-gray-600 mt-1">
            We'll use this to contact you about jobs and schedules
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Your PIN *
          </label>
          <div className="relative">
            <Input
              type="password"
              required
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              placeholder="Create a secure PIN"
              className="pl-10"
            />
            <Hash className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>
          <p className="text-xs text-blue-600 mt-1">
            This PIN will be used to log into the mover portal
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="your.email@example.com (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position Applied For
          </label>
          <select
            value={formData.position_applied}
            onChange={(e) => setFormData({ ...formData, position_applied: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="mover">Mover</option>
            <option value="driver">Driver</option>
            <option value="team_lead">Team Lead</option>
            <option value="supervisor">Supervisor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Hourly Wage ($)
          </label>
          <Input
            type="number"
            min="15"
            max="50"
            value={formData.expected_hourly_wage}
            onChange={(e) => setFormData({ ...formData, expected_hourly_wage: Number(e.target.value) })}
            placeholder="20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Years of Experience
          </label>
          <Input
            type="number"
            min="0"
            max="30"
            value={formData.experience_years}
            onChange={(e) => setFormData({ ...formData, experience_years: Number(e.target.value) })}
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability
          </label>
          <textarea
            value={formData.availability}
            onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            rows={2}
            placeholder="e.g., Weekdays 8am-5pm, Weekends available"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes
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
            <li>• Your mover request will be sent to management for review</li>
            <li>• Once approved, you can access the mover portal</li>
            <li>• You'll be able to login using your PIN</li>
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
  );
};
