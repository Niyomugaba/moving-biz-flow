
import React from 'react';
import { ProtectedLayout } from './ProtectedLayout';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ProtectedLayout requiredRoles={['owner', 'admin', 'manager', 'employee']}>
      {children}
    </ProtectedLayout>
  );
};
