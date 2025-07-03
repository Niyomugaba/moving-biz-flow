
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useManagerAuth } from '@/hooks/useManagerAuth';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: Array<'owner' | 'admin' | 'manager' | 'employee'>;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallback = null 
}) => {
  const { canAccess: authCanAccess } = useAuth();
  const { canAccess: managerCanAccess, managerSession } = useManagerAuth();

  // Use manager auth if manager is logged in, otherwise use regular auth
  const canAccess = managerSession ? managerCanAccess : authCanAccess;

  if (!canAccess(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
