
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Shield, Users, Hash, LogIn } from 'lucide-react';

export const EmployeePortal = () => {
  const [pin, setPin] = useState('');
  const [step, setStep] = useState<'pin' | 'request' | 'dashboard'>('pin');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const { toast } = useToast();

  const handlePinVerification = async () => {
    if (!pin) {
      toast({
        title: "PIN Required",
        description: "Please enter your PIN.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Checking for employee with pin:', pin);

    try {
      // Check if employee exists with this PIN in the notes field
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .like('notes', `%PIN: ${pin}%`)
        .eq('status', 'active')
        .maybeSingle();

      if (employeeError) {
        console.error('Employee lookup error:', employeeError);
        throw employeeError;
      }

      if (employee) {
        setEmployeeData({ ...employee, pin });
        toast({
          title: "Welcome Back!",
          description: `Hello ${employee.name}! Redirecting to your dashboard...`,
        });
        
        setTimeout(() => {
          setStep('dashboard');
        }, 1500);
      } else {
        // Check if there's a pending request with this PIN
        const { data: pendingRequest, error: requestError } = await supabase
          .from('employee_requests')
          .select('*')
          .like('notes', `%PIN: ${pin}%`)
          .eq('status', 'pending')
          .maybeSingle();

        if (requestError) {
          console.error('Request lookup error:', requestError);
        }

        if (pendingRequest) {
          toast({
            title: "Request Pending",
            description: "Your access request is still being reviewed. Please wait for approval.",
            variant: "destructive",
          });
        } else {
          setStep('request');
          toast({
            title: "PIN Not Found",
            description: "You'll need to request access as a new mover.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error during PIN verification:', error);
      toast({
        title: "Error",
        description: "Failed to verify PIN. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setStep('pin');
    setPin('');
    setEmployeeData(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const handleRequestSubmitted = () => {
    toast({
      title: "Request Submitted",
      description: "Your mover access request has been submitted for approval.",
    });
    
    setStep('pin');
    setPin('');
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
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
                alt="Bantu Movers Logo" 
                className="h-20 w-auto"
              />
            </div>
            <h1 className="text-4xl font-bold text-purple-700 mb-3">Join Bantu Movers</h1>
            <p className="text-purple-600 text-lg">Complete the form below to request mover access</p>
          </div>
          
          <div className="bg-purple-50 rounded-2xl p-8 border-2 border-purple-200">
            <NewEmployeeRequestForm 
              onBack={() => setStep('pin')}
              onSuccess={handleRequestSubmitted}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
              alt="Bantu Movers Logo" 
              className="h-24 w-auto"
            />
          </div>
          <p className="text-purple-600 text-xl font-medium">Mover Portal</p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <p className="text-purple-700 text-sm font-medium">Secure</p>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-300">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <p className="text-yellow-700 text-sm font-medium">PIN Access</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-purple-700 text-sm font-medium">Team Hub</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-purple-200 shadow-xl bg-white">
          <CardHeader className="text-center pb-6 bg-purple-600 rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-purple-700" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              Mover Login
            </CardTitle>
            <CardDescription className="text-purple-100 text-base">
              Enter your PIN to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-purple-700 mb-3 block">
                  Your PIN
                </label>
                <Input
                  type="password"
                  placeholder="Enter your PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="h-12 text-center text-lg font-mono border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <Button 
                onClick={handlePinVerification}
                disabled={isLoading || !pin.trim()}
                className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-purple-800 font-bold text-lg border-2 border-yellow-600"
              >
                {isLoading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
            <p className="text-purple-700 font-medium mb-2">
              New to Bantu Movers?
            </p>
            <p className="text-purple-600 text-sm">
              Enter any PIN above to request mover access and join our team
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-500 text-sm">
            © 2024 Bantu Movers • Professional Moving Services
          </p>
        </div>
      </div>
    </div>
  );
};
