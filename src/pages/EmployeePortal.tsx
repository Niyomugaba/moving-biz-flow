import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';

export const EmployeePortal = () => {
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify' | 'request'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const { toast } = useToast();

  const handleSendVerification = async () => {
    if (!phone) {
      toast({
        title: "Phone Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Checking for employee with phone:', phone);

    try {
      // Check if employee exists in the employees table (approved employees)
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('phone', phone)
        .eq('status', 'Active')
        .maybeSingle();

      if (employeeError) {
        console.error('Employee lookup error:', employeeError);
        throw employeeError;
      }

      console.log('Employee found:', employee);

      if (employee) {
        // Employee exists - they can access the portal
        setEmployeeData(employee);
        setStep('verify');
        toast({
          title: "Verification Sent",
          description: "Enter the verification code sent to your phone.",
        });
      } else {
        // Employee doesn't exist - show request form
        console.log('No employee found, showing request form');
        setStep('request');
        toast({
          title: "Employee Not Found",
          description: "You'll need to request access as a new employee.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during phone verification:', error);
      toast({
        title: "Error",
        description: "Failed to verify phone number. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, accept any 4-digit code
      if (verificationCode.length === 4) {
        toast({
          title: "Welcome!",
          description: `Welcome back, ${employeeData?.name}!`,
        });
        
        // Here you would typically redirect to the employee dashboard
        // For now, we'll just show a success message
        console.log('Employee verified successfully:', employeeData);
      } else {
        toast({
          title: "Invalid Code",
          description: "Please enter a valid 4-digit verification code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestSubmitted = () => {
    toast({
      title: "Request Submitted",
      description: "Your employee access request has been submitted for approval.",
    });
    
    // Reset to phone step after successful submission
    setStep('phone');
    setPhone('');
    setVerificationCode('');
    setEmployeeData(null);
  };

  if (step === 'request') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Request Employee Access</h1>
            <p className="text-gray-600 mt-2">Fill out the form below to request access</p>
          </div>
          
          <NewEmployeeRequestForm 
            phoneNumber={phone}
            onBack={() => setStep('phone')}
            onSuccess={handleRequestSubmitted}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Employee Portal
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your phone number to access your dashboard'
              : `Enter the verification code sent to ${phone}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'phone' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Button 
                onClick={handleSendVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Checking...' : 'Send Verification Code'}
              </Button>
              
              <div className="text-center">
                <button 
                  onClick={() => setStep('request')}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  Request access as new employee
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 4-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={4}
                  className="w-full text-center text-lg tracking-widest"
                />
              </div>
              
              <Button 
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Verifying...' : 'Verify & Access Dashboard'}
              </Button>
              
              <div className="text-center space-y-2">
                <button 
                  onClick={() => setStep('phone')}
                  className="text-gray-600 hover:text-gray-700 text-sm block mx-auto"
                >
                  ← Change phone number
                </button>
                <button 
                  onClick={handleSendVerification}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  Resend code
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
