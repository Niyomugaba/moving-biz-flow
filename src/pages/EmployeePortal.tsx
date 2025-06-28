
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';
import { EmployeeDashboard } from './EmployeeDashboard';

export const EmployeePortal = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify' | 'request' | 'dashboard'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const { toast } = useToast();

  const handleSendVerification = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Checking for employee with email:', email);

    try {
      // Check if employee exists in the employees table (approved employees)
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('status', 'Active')
        .maybeSingle();

      if (employeeError) {
        console.error('Employee lookup error:', employeeError);
        throw employeeError;
      }

      console.log('Employee found:', employee);

      if (employee) {
        // Employee exists - send magic link
        setEmployeeData(employee);
        
        const { error } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false,
          }
        });

        if (error) {
          console.error('Magic link sending error:', error);
          throw new Error('Failed to send verification email');
        }

        setStep('verify');
        toast({
          title: "Verification Email Sent",
          description: "Check your email for a magic link to access your dashboard.",
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
      console.error('Error during email verification:', error);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
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
        description: "Please enter the verification code from your email.",
        variant: "destructive",
      });
      return;
    }

    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter the complete 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email'
      });

      if (error) {
        console.error('Verification error:', error);
        throw new Error('Failed to verify code');
      }

      toast({
        title: "Verification Successful!",
        description: `Welcome ${employeeData?.name}! Redirecting to your dashboard...`,
      });
      
      // Redirect to dashboard after successful verification
      setTimeout(() => {
        setStep('dashboard');
      }, 1500);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Failed to verify code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setEmployeeData(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleRequestSubmitted = () => {
    toast({
      title: "Request Submitted",
      description: "Your employee access request has been submitted for approval.",
    });
    
    // Reset to email step after successful submission
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setEmployeeData(null);
  };

  // Show dashboard if employee is verified
  if (step === 'dashboard' && employeeData) {
    return (
      <EmployeeDashboard 
        employee={employeeData} 
        onLogout={handleLogout}
      />
    );
  }

  if (step === 'request') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Request Employee Access</h1>
            <p className="text-gray-600 mt-2">Fill out the form below to request access</p>
          </div>
          
          <NewEmployeeRequestForm 
            phoneNumber=""
            onBack={() => setStep('email')}
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
            {step === 'email' 
              ? 'Enter your email address to access your dashboard'
              : `Enter the 6-digit code sent to ${email}`
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {step === 'email' ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="your.email@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <Button 
                onClick={handleSendVerification}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Sending Email...' : 'Send Verification Email'}
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
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
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
                  onClick={() => setStep('email')}
                  className="text-gray-600 hover:text-gray-700 text-sm block mx-auto"
                >
                  ← Change email address
                </button>
                <button 
                  onClick={handleSendVerification}
                  disabled={isLoading}
                  className="text-purple-600 hover:text-purple-700 text-sm"
                >
                  {isLoading ? 'Sending...' : 'Resend verification email'}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
