
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Users, Shield, ExternalLink } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show welcome page with options
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="bg-primary rounded-lg p-3">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-primary">Bantu Movers</h1>
              <p className="text-muted-foreground">Professional Moving Services</p>
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Welcome to Bantu Movers Portal System
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access our management and employee portals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">

          {/* Employee Portal */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Employee Portal</CardTitle>
              <CardDescription>
                Access for team members and field staff to manage time and tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/employee-portal')}
                className="w-full"
                variant="outline"
              >
                Employee Login
              </Button>
            </CardContent>
          </Card>

          {/* Manager Portal */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Manager Portal</CardTitle>
              <CardDescription>
                Administrative access for business management and operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate('/manager-login')}
                className="w-full"
                variant="outline"
              >
                Manager Login
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>Need help? Contact us at (225) 555-MOVE or info@bantumovers.com</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
