
import React from 'react';
import { useAuth } from '@/hooks/useAuth';

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
  const { canAccess } = useAuth();

  if (!canAccess(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
