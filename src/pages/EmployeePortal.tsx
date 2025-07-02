import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Shield, Users, Hash, LogIn, Truck } from 'lucide-react';

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
      <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
        <div className="max-w-lg w-full">
          {/* Header with Truck Icon for Employees */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center">
                <Truck className="w-12 h-12 text-purple-800" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Join Bantu Movers</h1>
            <p className="text-purple-100 text-lg">Complete the form below to request mover access</p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
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
    <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header Section with Truck Icon for Mobile */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center shadow-2xl">
              <Truck className="w-14 h-14 text-purple-800" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Bantu Movers</h1>
          <p className="text-purple-100 text-xl font-medium">Mover Portal</p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-purple-800" />
            </div>
            <p className="text-white text-sm font-medium">Secure</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Hash className="w-6 h-6 text-purple-800" />
            </div>
            <p className="text-white text-sm font-medium">PIN Access</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 text-purple-800" />
            </div>
            <p className="text-white text-sm font-medium">Mobile Ready</p>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-2 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
          <CardHeader className="text-center pb-6 bg-yellow-500 rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                <Truck className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-purple-800">
              Mover Login
            </CardTitle>
            <CardDescription className="text-purple-600 text-base">
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
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg"
              >
                {isLoading ? 'Verifying...' : 'Access Dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-white font-medium mb-2">
              New to Bantu Movers?
            </p>
            <p className="text-purple-100 text-sm">
              Enter any PIN above to request mover access and join our team
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-200 text-sm">
            © 2024 Bantu Movers • Professional Moving Services
          </p>
        </div>
      </div>
    </div>
  );
};
