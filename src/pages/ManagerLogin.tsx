
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useManagers } from '@/hooks/useManagers';
import { Shield, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useManagerAuth } from '@/hooks/useManagerAuth';

export const ManagerLogin = () => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { authenticateManager } = useManagers();
  const navigate = useNavigate();
  const { isAuthenticated } = useManagerAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async () => {
    if (!username || !pin) {
      toast({
        title: "Missing Information",
        description: "Please enter both username and PIN.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log('Attempting manager login with:', username, 'PIN:', pin);

    try {
      const manager = await authenticateManager(username, pin);
      console.log('Manager authenticated successfully:', manager);
      
      // Store manager session in localStorage with role
      const sessionData = {
        id: manager.id,
        username: manager.username,
        name: manager.name,
        loginTime: new Date().toISOString(),
        role: 'manager' as const
      };
      
      localStorage.setItem('managerSession', JSON.stringify(sessionData));
      console.log('Manager session stored:', sessionData);

      toast({
        title: "Login Successful!",
        description: `Welcome back, ${manager.name}!`,
      });
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Manager login error:', error);
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-amber-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Bantu Movers Branding Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
              alt="Bantu Movers Logo" 
              className="h-20 w-auto"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Bantu Movers</h1>
          <p className="text-purple-200 text-lg">Manager Portal</p>
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
              <Lock className="w-6 h-6 text-amber-400" />
            </div>
            <p className="text-purple-200 text-sm">PIN Protected</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center mx-auto mb-2">
              <img 
                src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
                alt="Bantu Logo" 
                className="w-6 h-6 object-contain"
              />
            </div>
            <p className="text-purple-200 text-sm">Full Access</p>
          </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">
              Manager Login
            </CardTitle>
            <CardDescription className="text-purple-200">
              Enter your credentials to access the full management dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-purple-200">
                Username
              </label>
              <Input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/20 border-purple-400 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-purple-200">
                PIN
              </label>
              <Input
                type="password"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyPress={handleKeyPress}
                className="bg-white/20 border-purple-400 text-white placeholder:text-purple-300 focus:border-amber-400 focus:ring-amber-400"
              />
            </div>
            
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-purple-900 font-semibold"
            >
              {isLoading ? 'Authenticating...' : 'Access Full Dashboard'}
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-purple-300 text-sm">
            © 2024 Bantu Movers. Management Portal - Full Access.
          </p>
        </div>
      </div>
    </div>
  );
};
