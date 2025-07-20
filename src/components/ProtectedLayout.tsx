
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Auth } from '@/pages/Auth';
import { Sidebar } from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredRoles?: Array<'owner' | 'admin' | 'manager' | 'employee'>;
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ 
  children, 
  requiredRoles = ['owner', 'admin', 'manager', 'employee'] 
}) => {
  const { isAuthenticated, isLoading, canAccess, userRole } = useAuth();
  const isMobile = useIsMobile();

  // Show loading while auth is initializing OR while user role is being fetched
  if (isLoading || (isAuthenticated && !userRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  if (!canAccess(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 text-sm sm:text-base">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      <main className={`flex-1 relative ${isMobile ? 'w-full' : ''}`}>
        <div className={`h-full ${isMobile ? 'pt-16' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
};
