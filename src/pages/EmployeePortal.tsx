
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { NewEmployeeRequestForm } from '@/components/NewEmployeeRequestForm';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Truck, Shield, Users, Phone } from 'lucide-react';

export const EmployeePortal = () => {
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'phone' | 'request' | 'dashboard'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const { toast } = useToast();

  const handlePhoneVerification = async () => {
    if (!phone) {
      toast({
        title: "Phone Number Required",
        description: "Please enter your phone number.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Checking for employee with phone:', phone);

    try {
      // Check if employee exists in the employees table
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('phone', phone)
        .eq('status', 'active')
        .maybeSingle();

      if (employeeError) {
        console.error('Employee lookup error:', employeeError);
        throw employeeError;
      }

      if (employee) {
        setEmployeeData(employee);
        toast({
          title: "Welcome Back!",
          description: `Hello ${employee.name}! Redirecting to your dashboard...`,
        });
        
        setTimeout(() => {
          setStep('dashboard');
        }, 1500);
      } else {
        setStep('request');
        toast({
          title: "Phone Number Not Found",
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

  const handleLogout = () => {
    setStep('phone');
    setPhone('');
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
    
    setStep('phone');
    setPhone('');
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
            phone={phone}
            onBack={() => setStep('phone')}
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
              <Phone className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-purple-200 text-sm">Phone Verified</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-purple-200 text-sm">Team Portal</p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Employee Login
            </CardTitle>
            <CardDescription className="text-purple-200">
              Enter your phone number to access your dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-purple-200">
                Phone Number
              </label>
              <Input
                type="tel"
                placeholder="(555) 123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-white/20 border-purple-400 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400"
              />
              <p className="text-xs text-purple-300">
                Use: 555-123-4567 to test existing employee flow
              </p>
            </div>
            
            <Button 
              onClick={handlePhoneVerification}
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-purple-900 font-semibold"
            >
              {isLoading ? 'Checking Phone...' : 'Access Dashboard'}
            </Button>
            
            <div className="text-center">
              <p className="text-purple-300 text-sm">
                New to Bantu Movers? Enter any other phone number to request access
              </p>
            </div>
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
