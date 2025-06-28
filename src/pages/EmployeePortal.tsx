
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Truck, Shield, Users } from 'lucide-react';

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
      // Check if employee exists in the employees table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', email)
        .eq('status', 'active')
        .maybeSingle();

      if (employeeError) {
        console.error('Employee lookup error:', employeeError);
        throw employeeError;
      }

      if (employee) {
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
        title: "Welcome to Bantu Movers!",
        description: `Hello ${employeeData?.name}! Redirecting to your dashboard...`,
      });
      
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
    
    setStep('email');
    setEmail('');
    setVerificationCode('');
    setEmployeeData(null);
  };

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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-amber-600 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-amber-400 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-purple-900" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Join Bantu Movers</h1>
            <p className="text-purple-200 mt-2">Fill out the form below to request access</p>
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-amber-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Bantu Movers Branding Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-amber-400 rounded-full flex items-center justify-center shadow-xl">
              <Truck className="w-10 h-10 text-purple-900" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bantu Movers</h1>
          <p className="text-purple-200 text-lg">Employee Portal</p>
        </div>

        {/* Features showcase */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-purple-200 text-sm">Secure Access</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-purple-200 text-sm">Team Portal</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Truck className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-purple-200 text-sm">Job Tracking</p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              {step === 'email' ? 'Employee Login' : 'Verify Your Email'}
            </CardTitle>
            <CardDescription className="text-purple-200">
              {step === 'email' 
                ? 'Enter your email address to access your dashboard'
                : `Enter the 6-digit code sent to ${email}`
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {step === 'email' ? (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-purple-200">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your.email@bantumovers.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/20 border-purple-400 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400"
                  />
                </div>
                
                <Button 
                  onClick={handleSendVerification}
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-purple-900 font-semibold"
                >
                  {isLoading ? 'Sending Email...' : 'Send Verification Email'}
                </Button>
                
                <div className="text-center">
                  <button 
                    onClick={() => setStep('request')}
                    className="text-amber-300 hover:text-amber-200 text-sm underline"
                  >
                    New to Bantu Movers? Request access here
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-purple-200">
                    Verification Code
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="bg-white/20 border-purple-400 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400 text-center text-lg tracking-widest"
                  />
                </div>
                
                <Button 
                  onClick={handleVerifyCode}
                  disabled={isLoading}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-purple-900 font-semibold"
                >
                  {isLoading ? 'Verifying...' : 'Verify & Access Dashboard'}
                </Button>
                
                <div className="text-center space-y-3">
                  <button 
                    onClick={() => setStep('email')}
                    className="text-purple-200 hover:text-white text-sm block mx-auto"
                  >
                    ← Change email address
                  </button>
                  <button 
                    onClick={handleSendVerification}
                    disabled={isLoading}
                    className="text-amber-300 hover:text-amber-200 text-sm underline"
                  >
                    {isLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            © 2024 Bantu Movers. Professional Moving Services.
          </p>
        </div>
      </div>
    </div>
  );
};
