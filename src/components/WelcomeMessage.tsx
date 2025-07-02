
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Crown, Shield, Users, User } from 'lucide-react';

export const WelcomeMessage = () => {
  const { profile, userRole } = useAuth();

  const getRoleIcon = () => {
    switch (userRole?.role) {
      case 'owner': return <Crown className="w-5 h-5 text-purple-600" />;
      case 'admin': return <Shield className="w-5 h-5 text-blue-600" />;
      case 'manager': return <Users className="w-5 h-5 text-green-600" />;
      default: return <User className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRoleMessage = () => {
    switch (userRole?.role) {
      case 'owner': return 'You have full access to all system features.';
      case 'admin': return 'You can manage operations and help with scheduling.';
      case 'manager': return 'You can manage day-to-day operations.';
      default: return 'Welcome to the system.';
    }
  };

  return (
    <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-amber-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          {getRoleIcon()}
          <div>
            <h2 className="text-xl font-semibold text-purple-800">
              Welcome back, {profile?.full_name || 'User'}!
            </h2>
            <p className="text-purple-600 text-sm mt-1">
              {getRoleMessage()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
