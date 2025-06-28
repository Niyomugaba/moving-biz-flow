
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Users, Calendar, UserCheck, DollarSign, Phone, Clock } from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { icon: BarChart3, label: 'Dashboard', path: '/' },
    { icon: Phone, label: 'Leads', path: '/leads' },
    { icon: Calendar, label: 'Jobs', path: '/jobs' },
    { icon: Users, label: 'Employees', path: '/employees' },
    { icon: Clock, label: 'Time Logs', path: '/time-logs' },
    { icon: UserCheck, label: 'Clients', path: '/clients' },
    { icon: DollarSign, label: 'Financials', path: '/financials' }
  ];

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">MoveCorp</h1>
        <p className="text-gray-400 text-sm">Moving Business Manager</p>
      </div>
      
      <nav className="space-y-2">
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

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-sm font-semibold mb-2">Employee Portal</h3>
        <p className="text-xs text-gray-400 mb-3">Share this link with your employees:</p>
        <div className="bg-gray-700 p-2 rounded text-xs font-mono break-all">
          {window.location.origin}/employee-portal
        </div>
      </div>
    </div>
  );
};
