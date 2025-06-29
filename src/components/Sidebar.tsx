
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Calendar, UserCheck, DollarSign, Phone, Clock, LogOut } from 'lucide-react';
import { useManagerAuth } from '@/hooks/useManagerAuth';
import { Button } from '@/components/ui/button';

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, managerSession } = useManagerAuth();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Phone, label: 'Leads', path: '/leads' },
    { icon: Calendar, label: 'Jobs', path: '/jobs' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Clock, label: 'Time Logs', path: '/time-logs' },
    { icon: UserCheck, label: 'Clients', path: '/clients' },
    { icon: DollarSign, label: 'Financials', path: '/financials' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/manager-login');
  };

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Bantu Movers</h1>
        <p className="text-gray-400 text-sm">Management Portal</p>
        {managerSession && (
          <p className="text-amber-400 text-xs mt-1">Welcome, {managerSession.name}</p>
        )}
      </div>
      
      <nav className="space-y-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
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
