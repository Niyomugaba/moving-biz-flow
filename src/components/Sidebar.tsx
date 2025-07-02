import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Calendar, UserCheck, DollarSign, Phone, Clock, LogOut, Settings, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { RoleGuard } from '@/components/RoleGuard';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, profile, userRole } = useAuth();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/dashboard', roles: ['owner', 'admin', 'manager', 'employee'] },
    { icon: Phone, label: 'Leads', path: '/leads', roles: ['owner', 'admin', 'manager'] },
    { icon: Calendar, label: 'Jobs', path: '/jobs', roles: ['owner', 'admin', 'manager'] },
    { icon: Users, label: 'Employees', path: '/employees', roles: ['owner', 'admin', 'manager'] },
    { icon: Clock, label: 'Time Logs', path: '/time-logs', roles: ['owner', 'admin', 'manager'] },
    { icon: UserCheck, label: 'Clients', path: '/clients', roles: ['owner', 'admin', 'manager'] },
    { icon: DollarSign, label: 'Financials', path: '/financials', roles: ['owner', 'admin'] },
    { icon: Shield, label: 'User Management', path: '/user-management', roles: ['owner'] }
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-600 text-white';
      case 'admin': return 'bg-blue-600 text-white';
      case 'manager': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Mobile Menu Button */}
        <div className="fixed top-4 left-4 z-50 lg:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="bg-white shadow-md"
          >
            {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={closeSidebar} />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="p-4 flex flex-col h-full">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
                  alt="Bantu Movers Logo" 
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm">Management Portal</p>
              {profile && (
                <div className="mt-2">
                  <p className="text-amber-400 text-xs font-medium">{profile.full_name || profile.email}</p>
                  {userRole && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(userRole.role)}`}>
                      {userRole.role.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <nav className="space-y-2 flex-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <RoleGuard key={item.path} allowedRoles={item.roles as any}>
                    <Link
                      to={item.path}
                      onClick={closeSidebar}
                      className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-purple-600 text-white' 
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </RoleGuard>
                );
              })}
            </nav>

            <div className="mt-auto space-y-4">
              <div className="p-4 bg-gray-800 rounded-lg">
                <h3 className="text-sm font-semibold mb-2">Employee Portal</h3>
                <p className="text-xs text-gray-400 mb-3">Share this link:</p>
                <div className="bg-gray-700 p-2 rounded text-xs font-mono break-all">
                  {window.location.origin}/employee-portal
                </div>
              </div>
              
              <Button 
                onClick={handleLogout}
                variant="destructive"
                className="w-full flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop Sidebar (unchanged)
  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <img 
            src="/lovable-uploads/6319d82c-0bdd-465a-9925-c9401c11e50a.png" 
            alt="Bantu Movers Logo" 
            className="h-10 w-auto"
          />
        </div>
        <p className="text-gray-400 text-sm">Management Portal</p>
        {profile && (
          <div className="mt-2">
            <p className="text-amber-400 text-xs font-medium">{profile.full_name || profile.email}</p>
            {userRole && (
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(userRole.role)}`}>
                {userRole.role.toUpperCase()}
              </span>
            )}
          </div>
        )}
      </div>
      
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <RoleGuard key={item.path} allowedRoles={item.roles as any}>
              <Link
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </RoleGuard>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold mb-2">Employee Portal</h3>
          <p className="text-xs text-gray-400 mb-3">Share this link with your movers:</p>
          <div className="bg-gray-700 p-2 rounded text-xs font-mono break-all">
            {window.location.origin}/employee-portal
          </div>
        </div>
        
        <Button 
          onClick={handleLogout}
          variant="destructive"
          className="w-full flex items-center space-x-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};
