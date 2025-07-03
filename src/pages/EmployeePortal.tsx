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
  const [user, setUser] = useState<any>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [employeeRequestStatus, setEmployeeRequestStatus] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await checkEmployeeStatus(session.user);
      }
    };
    
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user);
          await checkEmployeeStatus(session.user);
        } else {
          setUser(null);
          setEmployeeData(null);
          setEmployeeRequestStatus(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkEmployeeStatus = async (user: any) => {
    try {
      // Check if user is an approved employee
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('email', user.email)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error checking employee status:', error);
        return;
      }

      if (employee) {
        setEmployeeData(employee);
        setEmployeeRequestStatus(null);
        toast({
          title: "Welcome Back!",
          description: `Hello ${employee.name}! Access granted to your dashboard.`,
        });
      } else {
        // Check employee request status
        const { data: employeeRequest } = await supabase
          .from('employee_requests')
          .select('status')
          .eq('email', user.email)
          .maybeSingle();

        if (employeeRequest) {
          setEmployeeRequestStatus(employeeRequest.status);
          
          if (employeeRequest.status === 'pending') {
            toast({
              title: "Account Pending Approval",
              description: "Your mover request is being reviewed. You can still log time entries while waiting for approval.",
            });
          } else if (employeeRequest.status === 'rejected') {
            toast({
              title: "Account Request Rejected",
              description: "Your mover request has been rejected. Please contact management for more information.",
              variant: "destructive",
            });
          }
        } else {
          setEmployeeRequestStatus(null);
          toast({
            title: "Account Not Found",
            description: "You'll need to submit a mover request to access the system.",
          });
        }
      }
    } catch (error) {
      console.error('Error checking employee status:', error);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Login Successful",
          description: "Welcome back! Checking your mover status...",
        });
      } else {
        // Sign up new employee
        const redirectUrl = `${window.location.origin}/employee-portal`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
              phone: phone,
            }
          }
        });

        if (error) throw error;

        // Create employee request
        const { error: requestError } = await supabase
          .from('employee_requests')
          .insert({
            name: fullName,
            email: email,
            phone: phone,
            position_applied: 'mover',
            notes: 'Self-registered through mover portal'
          });

        if (requestError) {
          console.error('Error creating employee request:', requestError);
        }

        // Show success message and redirect to login
        setShowSuccessMessage(true);
        
        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          setShowSuccessMessage(false);
          setIsLogin(true);
          setEmail('');
          setPassword('');
          setFullName('');
          setPhone('');
        }, 3000);
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

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setEmployeeData(null);
      setEmployeeRequestStatus(null);
      setEmail('');
      setPassword('');
      setFullName('');
      setPhone('');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    }
  };

  // Show success message overlay
  if (showSuccessMessage) {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-2 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
            <CardHeader className="text-center pb-6 bg-green-500 rounded-t-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Account Created Successfully!
              </CardTitle>
              <CardDescription className="text-green-100 text-base">
                Your mover request has been submitted
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-4">
                Welcome to the Bantu Movers team! Your account has been created and your mover request is pending approval.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can log time entries while waiting for approval. Redirecting to login page...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in and approved employee, show dashboard
  if (user && employeeData) {
    return (
      <EmployeeDashboard 
        employee={employeeData} 
        onLogout={handleLogout}
      />
    );
  }

  // If user is logged in but request was rejected, show rejection message
  if (user && employeeRequestStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-2 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
            <CardHeader className="text-center pb-6 bg-red-500 rounded-t-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white">
                Request Rejected
              </CardTitle>
              <CardDescription className="text-red-100 text-base">
                Your mover request has been rejected
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Hello {user.user_metadata?.full_name || user.email}! Unfortunately, your mover request has been rejected by management.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Please contact management for more information about this decision.
              </p>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If user is logged in but not approved, show pending status
  if (user && employeeRequestStatus === 'pending') {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <Card className="border-2 border-white/20 shadow-2xl bg-white backdrop-blur-sm">
            <CardHeader className="text-center pb-6 bg-yellow-500 rounded-t-lg">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-purple-800">
                Account Pending
              </CardTitle>
              <CardDescription className="text-purple-600 text-base">
                Your mover request is being reviewed
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 text-center">
              <p className="text-gray-600 mb-6">
                Hello {user.user_metadata?.full_name || user.email}! Your mover request has been submitted and is pending approval from management.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                You can still log time entries while waiting for approval.
              </p>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
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
                : 'Create your account, and we\'ll review your request. You can log time entries while waiting for approval.'
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
