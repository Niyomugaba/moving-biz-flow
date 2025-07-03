
import { useState, useEffect } from 'react';

interface ManagerSession {
  id: string;
  username: string;
  name: string;
  loginTime: string;
  role: 'manager'; // Add role to indicate this is a manager session
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
            // Add role to session
            const sessionWithRole = { ...session, role: 'manager' as const };
            setManagerSession(sessionWithRole);
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
            const sessionWithRole = { ...session, role: 'manager' as const };
            setManagerSession(sessionWithRole);
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

  // Manager access control - managers should have same access as owners
  const hasRole = (role: 'owner' | 'admin' | 'manager' | 'employee') => {
    if (!managerSession) return false;
    // Managers have same privileges as owners and admins
    if (managerSession.role === 'manager') {
      return ['owner', 'admin', 'manager'].includes(role);
    }
    return managerSession.role === role;
  };

  const canAccess = (requiredRoles: Array<'owner' | 'admin' | 'manager' | 'employee'>) => {
    if (!managerSession) return false;
    // Managers can access anything that owners, admins, or managers can access
    if (managerSession.role === 'manager') {
      return requiredRoles.some(role => ['owner', 'admin', 'manager'].includes(role));
    }
    return requiredRoles.includes(managerSession.role as any);
  };

  return {
    managerSession,
    isAuthenticated,
    isLoading,
    logout,
    hasRole,
    canAccess,
    // Provide compatibility with regular auth hook
    profile: managerSession ? {
      id: managerSession.id,
      email: null,
      full_name: managerSession.name,
      created_at: managerSession.loginTime,
      updated_at: managerSession.loginTime
    } : null,
    userRole: managerSession ? { role: 'manager' as const } : null
  };
};
