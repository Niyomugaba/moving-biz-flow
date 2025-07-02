
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useManagerAuth } from '@/hooks/useManagerAuth';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated: isUserAuthenticated, isLoading: isUserLoading } = useAuth();
  const { isAuthenticated: isManagerAuthenticated, isLoading: isManagerLoading } = useManagerAuth();

  useEffect(() => {
    if (!isUserLoading && !isManagerLoading) {
      if (isManagerAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else if (isUserAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/manager-login', { replace: true });
      }
    }
  }, [isUserAuthenticated, isManagerAuthenticated, isUserLoading, isManagerLoading, navigate]);

  // Show loading while checking authentication
  if (isUserLoading || isManagerLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // This should rarely be seen since we redirect immediately
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Bantu Movers</h1>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
