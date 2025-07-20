
import React from 'react';
import { useManagerAuth } from '@/hooks/useManagerAuth';
import { ManagerLogin } from '@/pages/ManagerLogin';
import { Sidebar } from '@/components/Sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export const ManagerLayout: React.FC<ManagerLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useManagerAuth();
  const isMobile = useIsMobile();

  if (isLoading) {
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
    return <ManagerLogin />;
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
