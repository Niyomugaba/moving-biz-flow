
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  UserCheck, 
  DollarSign, 
  FileText 
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Employees', href: '/employees', icon: UserCheck },
  { name: 'Clients', href: '/clients', icon: FileText },
  { name: 'Financials', href: '/financials', icon: DollarSign },
];

export const Sidebar = () => {
  return (
    <div className="w-64 bg-slate-900 min-h-screen text-white">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-yellow-400">Bantu Movers</h1>
        <p className="text-slate-300 text-sm mt-1">Business Management</p>
      </div>
      
      <nav className="mt-8">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white border-r-2 border-yellow-400'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
