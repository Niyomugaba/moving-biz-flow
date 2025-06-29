
import { useState, useEffect } from 'react';

interface ManagerSession {
  id: string;
  username: string;
  name: string;
  loginTime: string;
}

export const useManagerAuth = () => {
  const [managerSession, setManagerSession] = useState<ManagerSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing manager session on mount
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem('managerSession');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Check if session is still valid (less than 8 hours old)
          const loginTime = new Date(session.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          if (hoursDiff < 8) {
            setManagerSession(session);
          } else {
            // Session expired, remove it
            localStorage.removeItem('managerSession');
          }
        }
      } catch (error) {
        console.error('Error checking manager session:', error);
        localStorage.removeItem('managerSession');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const logout = () => {
    localStorage.removeItem('managerSession');
    setManagerSession(null);
  };

  const isAuthenticated = !!managerSession;

  return {
    managerSession,
    isAuthenticated,
    isLoading,
    logout
  };
};
