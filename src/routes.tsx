
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Index } from './pages/Index';
import { Dashboard } from './pages/Dashboard';
import { Leads } from './pages/Leads';
import { Jobs } from './pages/Jobs';
import { Employees } from './pages/Employees';
import { TimeLogs } from './pages/TimeLogs';
import { Clients } from './pages/Clients';
import { Financials } from './pages/Financials';
import { NotFound } from './pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leads" element={<Leads />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/employees" element={<Employees />} />
      <Route path="/time-logs" element={<TimeLogs />} />
      <Route path="/clients" element={<Clients />} />
      <Route path="/financials" element={<Financials />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
