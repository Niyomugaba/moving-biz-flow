
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEmployeeRequests } from '@/hooks/useEmployeeRequests';
import { UserPlus, ArrowLeft, Phone, User, Eye } from 'lucide-react';

interface NewEmployeeRequestFormProps {
  onBack: () => void;
  onSuccess: () => void;
}

export const NewEmployeeRequestForm = ({ onBack, onSuccess }: NewEmployeeRequestFormProps) => {
  const { addEmployeeRequest, isAddingRequest } = useEmployeeRequests();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addEmployeeRequest({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      position_applied: 'mover',
      notes: 'Manual request submission'
    });

    // Show success message and reset form
    setTimeout(() => {
      onSuccess();
    }, 1000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
      {/* Tiger-themed header with gradient */}
      <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-purple-600 p-8 text-center relative overflow-hidden">
        {/* Tiger stripes pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-amber-900 to-transparent transform -skew-y-12"></div>
          <div className="absolute top-4 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-900 to-transparent transform -skew-y-12"></div>
          <div className="absolute top-8 left-0 w-full h-full bg-gradient-to-r from-transparent via-amber-900 to-transparent transform -skew-y-12"></div>
        </div>
        
        <div className="relative z-10">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Join Our Team</h1>
          <p className="text-amber-100 italic">Bantu Movers: Moving done for you</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white/40 rounded-full"></div>
            <div className="w-2 h-2 bg-white/60 rounded-full"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full"></div>
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Form content */}
      <div className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <User className="inline w-4 h-4 mr-2 text-purple-600" />
              Full Name
            </label>
            <Input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              className="border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg py-3 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Phone className="inline w-4 h-4 mr-2 text-purple-600" />
              Phone Number
            </label>
            <Input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Enter your phone number"
              className="border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg py-3 text-gray-800 placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Eye className="inline w-4 h-4 mr-2 text-purple-600" />
              Email Address
            </label>
            <Input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter your email address"
              className="border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-lg py-3 text-center text-gray-800 placeholder-gray-400"
            />
          </div>

          {/* Professional info box */}
          <div className="bg-gradient-to-r from-purple-50 to-amber-50 p-4 rounded-lg border-l-4 border-purple-400">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">What happens next:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Your application will be reviewed by our team</li>
                  <li>• Once approved, you can access the mover portal</li>
                  <li>• Create an account with email/password to get started</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="flex-1 border-2 border-gray-300 hover:border-purple-400 hover:bg-purple-50 py-3 font-semibold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isAddingRequest || !formData.name || !formData.phone || !formData.email}
              className="flex-1 bg-gradient-to-r from-purple-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              {isAddingRequest ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Tiger paw prints decoration */}
      <div className="absolute bottom-2 right-2 opacity-5">
        <div className="text-4xl text-amber-600">🐾</div>
      </div>
    </div>
  );
};
