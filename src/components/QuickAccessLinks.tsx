
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Truck, Settings } from 'lucide-react';

export const QuickAccessLinks = () => {
  const handleManagerLogin = () => {
    window.open('/manager-login', '_blank');
  };

  const handleEmployeePortal = () => {
    window.open('/employee-portal', '_blank');
  };

  const currentUrl = window.location.origin;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Access Links
        </CardTitle>
        <CardDescription>
          Direct links to different system portals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Manager Portal */}
          <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <h3 className="font-semibold text-purple-800">Manager Portal</h3>
            </div>
            <p className="text-sm text-purple-600 mb-3">
              Access the management dashboard with PIN authentication
            </p>
            <Button 
              onClick={handleManagerLogin}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Open Manager Login
            </Button>
            <div className="mt-2 p-2 bg-purple-100 rounded text-xs font-mono text-purple-700">
              {currentUrl}/manager-login
            </div>
          </div>

          {/* Employee Portal */}
          <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-purple-800" />
              </div>
              <h3 className="font-semibold text-yellow-800">Employee Portal</h3>
            </div>
            <p className="text-sm text-yellow-600 mb-3">
              Mover access portal for time tracking and job management
            </p>
            <Button 
              onClick={handleEmployeePortal}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-purple-800"
            >
              Open Employee Portal
            </Button>
            <div className="mt-2 p-2 bg-yellow-100 rounded text-xs font-mono text-yellow-700">
              {currentUrl}/employee-portal
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-500 mt-4">
          💡 Tip: Bookmark these links or share them with your team members
        </div>
      </CardContent>
    </Card>
  );
};
