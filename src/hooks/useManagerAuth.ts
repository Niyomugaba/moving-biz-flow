
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
        console.log('Checking manager session:', sessionData);
        
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Check if session is still valid (less than 8 hours old)
          const loginTime = new Date(session.loginTime);
          const now = new Date();
          const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
          
          console.log('Session age in hours:', hoursDiff);
          
          if (hoursDiff < 8) {
            console.log('Valid manager session found');
            setManagerSession(session);
          } else {
            // Session expired, remove it
            console.log('Manager session expired, removing');
            localStorage.removeItem('managerSession');
          }
        } else {
          console.log('No manager session found');
        }
      } catch (error) {
        console.error('Error checking manager session:', error);
        localStorage.removeItem('managerSession');
      } finally {
        setIsLoading(false);
      }
    };

    // Listen for storage changes (login/logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'managerSession') {
        if (e.newValue) {
          try {
            const session = JSON.parse(e.newValue);
            setManagerSession(session);
          } catch (error) {
            console.error('Error parsing manager session from storage:', error);
          }
        } else {
          setManagerSession(null);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    checkSession();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const logout = () => {
    console.log('Manager logging out');
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
