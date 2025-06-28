
import React, { useState } from 'react';
import { useEmployees } from '@/hooks/useEmployees';
import { useJobs } from '@/hooks/useJobs';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Clock, CheckCircle, UserPlus } from 'lucide-react';

export const EmployeePortal = () => {
  const { employees } = useEmployees();
  const { jobs } = useJobs();
  const { addTimeEntry } = useTimeEntries();
  const [step, setStep] = useState<'phone' | 'pin' | 'timeEntry' | 'success' | 'newEmployee' | 'requestSubmitted'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [timeEntryData, setTimeEntryData] = useState({
    jobId: '',
    startTime: '',
    endTime: '',
    totalHours: 0,
    notes: ''
  });

  // Generate random 6-digit PIN
  const generatePin = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Normalize phone number by removing all non-digits
  const normalizePhoneNumber = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  // Calculate hours between start and end time
  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const startTime = new Date(`2000-01-01 ${start}`);
    const endTime = new Date(`2000-01-01 ${end}`);
    
    if (endTime <= startTime) {
      // Handle next day scenario
      endTime.setDate(endTime.getDate() + 1);
    }
    
    const diffMs = endTime.getTime() - startTime.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.round(diffHours * 4) / 4; // Round to nearest 0.25
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Looking for phone number:', phoneNumber);
    console.log('Available employees:', employees);
    
    // Normalize the input phone number
    const normalizedInput = normalizePhoneNumber(phoneNumber);
    console.log('Normalized input:', normalizedInput);
    
    // Find employee by normalized phone number
    const employee = employees.find(emp => {
      const normalizedEmpPhone = normalizePhoneNumber(emp.phone);
      console.log('Checking employee phone:', emp.phone, 'normalized:', normalizedEmpPhone);
      return normalizedEmpPhone === normalizedInput;
    });
    
    console.log('Found employee:', employee);
    
    if (employee) {
      const newPin = generatePin();
      setGeneratedPin(newPin);
      setSelectedEmployee(employee);
      
      // In a real app, you would send SMS here
      console.log(`SMS PIN for ${phoneNumber}: ${newPin}`);
      alert(`SMS sent to ${phoneNumber}! PIN: ${newPin} (In production, this would be sent via SMS)`);
      
      setStep('pin');
    } else {
      // Redirect to new employee request
      setStep('newEmployee');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === generatedPin) {
      setStep('timeEntry');
    } else {
      alert('Invalid PIN. Please try again.');
      setPin('');
    }
  };

  const handleTimeChange = () => {
    const hours = calculateHours(timeEntryData.startTime, timeEntryData.endTime);
    setTimeEntryData(prev => ({ ...prev, totalHours: hours }));
  };

  const handleTimeEntrySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedJob = jobs.find(job => job.id === timeEntryData.jobId);
    
    if (selectedJob && selectedEmployee && timeEntryData.totalHours > 0) {
      addTimeEntry({
        employee_id: selectedEmployee.id,
        job_id: timeEntryData.jobId,
        hours_worked: timeEntryData.totalHours,
        hourly_rate: selectedEmployee.hourly_wage,
        entry_date: new Date().toISOString().split('T')[0],
        notes: timeEntryData.notes || null
      });
      
      setStep('success');
    } else {
      alert('Please fill in all required fields and ensure times are valid.');
    }
  };

  const resetForm = () => {
    setStep('phone');
    setPhoneNumber('');
    setPin('');
    setGeneratedPin('');
    setSelectedEmployee(null);
    setTimeEntryData({
      jobId: '',
      startTime: '',
      endTime: '',
      totalHours: 0,
      notes: ''
    });
  };

  const completedJobs = jobs.filter(job => job.status === 'Completed');

  // Handle new employee request form
  if (step === 'newEmployee') {
    return (
      <NewEmployeeRequestForm 
        onBack={() => setStep('phone')} 
        onSuccess={() => setStep('requestSubmitted')}
      />
    );
  }

  // Handle request submitted confirmation
  if (step === 'requestSubmitted') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
          <div className="text-center space-y-6">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Submitted!</h2>
              <p className="text-gray-600">
                Your employee request has been sent to management for approval. Once approved, you can return here to log your hours.
              </p>
            </div>
            <Button onClick={resetForm} className="w-full bg-blue-600 hover:bg-blue-700">
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Employee Time Entry</h1>
          <p className="text-gray-600 mt-2">Submit your work hours securely</p>
        </div>

        {step === 'phone' && (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Your Phone Number
              </label>
              <Input
                type="tel"
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="(555) 123-4567"
                className="text-center"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter any format: (555) 123-4567, 555-123-4567, or 5551234567
              </p>
            </div>
            
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Send Verification Code
            </Button>

            <div className="text-center pt-4 border-t">
              <p className="text-sm text-gray-600 mb-3">New employee?</p>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setStep('newEmployee')}
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Request Access
              </Button>
            </div>
          </form>
        )}

        {step === 'pin' && (
          <form onSubmit={handlePinSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter 6-Digit Verification Code
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Check your phone for the verification code
              </p>
              <Input
                type="text"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="text-center text-2xl tracking-widest"
              />
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                Verify
              </Button>
            </div>
          </form>
        )}

        {step === 'timeEntry' && selectedEmployee && (
          <form onSubmit={handleTimeEntrySubmit} className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-800">
                Welcome, <strong>{selectedEmployee.name}</strong>!
              </p>
              <p className="text-xs text-green-600">Rate: ${selectedEmployee.hourly_wage}/hour</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Job/Client
              </label>
              <select
                required
                value={timeEntryData.jobId}
                onChange={(e) => setTimeEntryData({ ...timeEntryData, jobId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a job...</option>
                {completedJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.client_name} - {job.job_date}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <Input
                  type="time"
                  required
                  value={timeEntryData.startTime}
                  onChange={(e) => {
                    setTimeEntryData({ ...timeEntryData, startTime: e.target.value });
                    setTimeout(handleTimeChange, 0);
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <Input
                  type="time"
                  required
                  value={timeEntryData.endTime}
                  onChange={(e) => {
                    setTimeEntryData({ ...timeEntryData, endTime: e.target.value });
                    setTimeout(handleTimeChange, 0);
                  }}
                />
              </div>
            </div>

            {timeEntryData.totalHours > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Total Hours: {timeEntryData.totalHours}h</strong>
                </p>
                <p className="text-xs text-blue-600">
                  Estimated Pay: ${(timeEntryData.totalHours * selectedEmployee.hourly_wage).toFixed(2)}
                </p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={timeEntryData.notes}
                onChange={(e) => setTimeEntryData({ ...timeEntryData, notes: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Any additional notes about your work..."
              />
            </div>
            
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep('pin')} className="flex-1">
                Back
              </Button>
              <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700">
                Submit Hours
              </Button>
            </div>
          </form>
        )}

        {step === 'success' && (
          <div className="text-center space-y-6">
            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Hours Submitted!</h2>
              <p className="text-gray-600">
                Your {timeEntryData.totalHours} hours have been submitted for approval.
              </p>
            </div>
            <Button onClick={resetForm} className="w-full bg-blue-600 hover:bg-blue-700">
              Submit More Hours
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
