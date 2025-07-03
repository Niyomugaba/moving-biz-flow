
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmployeeDashboard } from './EmployeeDashboard';
import { Shield, Users, Mail, LogIn, Truck, Eye, EyeOff, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export const EmployeePortal = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Check if user exists in employees table (approved users)
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('*')
          .eq('email', email)
          .eq('status', 'active')
          .maybeSingle();

        if (employeeError) {
          console.error('Error checking employee:', employeeError);
          throw new Error('Login failed. Please try again.');
        }

        if (employee) {
          // Check if the employee has a notes field with password (PIN)
          const storedPassword = employee.notes?.replace('PIN: ', '') || employee.phone;
          
          if (password === storedPassword) {
            setEmployeeData(employee);
            toast({
              title: "Login Successful",
              description: `Welcome back, ${employee.name}!`,
            });
          } else {
            throw new Error('Invalid credentials. Please check your email and password.');
          }
        } else {
          // Check if user exists in employee_requests table
          const { data: request, error: requestError } = await supabase
            .from('employee_requests')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (requestError) {
            console.error('Error checking request:', requestError);
            throw new Error('Login failed. Please try again.');
          }

          if (request) {
            if (request.status === 'pending') {
              throw new Error('Your account is pending approval. Please contact Niyo for approval.');
            } else if (request.status === 'rejected') {
              throw new Error('Your account request has been rejected. Please contact Niyo for more information.');
            }
          } else {
            throw new Error('Account not found. Please create an account first.');
          }
        }
      } else {
        // Sign up new employee
        console.log('Starting signup process for:', email);
        
        // Check if email already exists
        const { data: existingEmployee } = await supabase
          .from('employees')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        const { data: existingRequest } = await supabase
          .from('employee_requests')
          .select('email')
          .eq('email', email)
          .maybeSingle();

        if (existingEmployee || existingRequest) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }

        // Create employee request
        const { error: requestError } = await supabase
          .from('employee_requests')
          .insert({
            name: fullName,
            email: email,
            phone: phone,
            position_applied: 'mover',
            notes: `PIN: ${password}`,
            status: 'pending'
          });

        if (requestError) {
          console.error('Error creating employee request:', requestError);
          throw new Error('Failed to create account. Please try again.');
        }

        console.log('Employee request created successfully');
        
        // Show pending approval message
        setShowPendingMessage(true);
        
        // Auto redirect to login after 5 seconds
        setTimeout(() => {
          setShowPendingMessage(false);
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
          toast({
            title: "Account Created!",
            description: "Please log in once your account is approved.",
          });
        }, 5000);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      toast({
        title: "Authentication Error",
        description: error.message || "An error occurred during authentication.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setEmployeeData(null);
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  // Show pending approval message
  if (showPendingMessage) {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-2 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
            <CardHeader className="text-center pb-6 bg-yellow-500 rounded-t-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-yellow-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Account Pending Approval
              </CardTitle>
              <CardDescription className="text-yellow-100 text-base">
                Your mover request has been submitted
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                Thank you for creating your account! Your mover request has been submitted and is waiting for approval.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please contact <strong>Niyo</strong> for approval or wait for approval notification. You will be able to log in once approved.
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full animate-pulse w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in and approved employee, show dashboard
  if (employeeData) {
    return (
      <EmployeeDashboard 
        employee={employeeData} 
        onLogout={handleLogout}
      />
    );
  }

  // Show login/signup form
  return (
    <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header Section */}
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
              <Mail className="w-6 h-6 text-purple-800" />
            </div>
            <p className="text-white text-sm font-medium">Email Login</p>
          </div>
          <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
            <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Truck className="w-6 h-6 text-purple-800" />
            </div>
            <p className="text-white text-sm font-medium">Mobile Ready</p>
          </div>
        </div>

        {/* Login/Signup Card */}
        <Card className="border-2 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
          <CardHeader className="text-center pb-6 bg-yellow-500 rounded-t-lg">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                {isLogin ? <LogIn className="w-8 h-8 text-white" /> : <UserPlus className="w-8 h-8 text-white" />}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-purple-800">
              {isLogin ? 'Mover Login' : 'Join Our Team'}
            </CardTitle>
            <CardDescription className="text-purple-600 text-base">
              {isLogin 
                ? 'Enter your credentials to access your dashboard' 
                : 'Create your account to get started'
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleAuth} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-purple-700 mb-3 block">
                      Full Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={!isLogin}
                      className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-purple-700 mb-3 block">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={!isLogin}
                      className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                    />
                  </div>
                </>
              )}
              
              <div>
                <label className="text-sm font-semibold text-purple-700 mb-3 block">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="text-sm font-semibold text-purple-700 mb-3 block">
                  Password
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 focus:ring-purple-500 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 hover:text-purple-700"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg"
              >
                {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-purple-600 hover:text-purple-800 text-sm font-medium"
              >
                {isLogin 
                  ? "Don't have an account? Sign up" 
                  : "Already have an account? Sign in"
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Info Section */}
        <div className="mt-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <p className="text-white font-medium mb-2">
              {isLogin ? 'New to Bantu Movers?' : 'How it works:'}
            </p>
            <p className="text-purple-100 text-sm">
              {isLogin 
                ? 'Create an account to request mover access and join our team'
                : 'Create your account, and we\'ll review your request. Contact Niyo for faster approval.'
              }
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
