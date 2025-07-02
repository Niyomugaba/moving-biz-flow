
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { Dashboard } from "./pages/Dashboard";
import { Leads } from "./pages/Leads";
import { Jobs } from "./pages/Jobs";
import { Employees } from "./pages/Employees";
import { Clients } from "./pages/Clients";
import { Financials } from "./pages/Financials";
import { EmployeePortal } from "./pages/EmployeePortal";
import { ManagerLogin } from "./pages/ManagerLogin";
import { TimeLogs } from "./pages/TimeLogs";
import { EmployeeRequests } from "./pages/EmployeeRequests";
import { UserManagement } from "./pages/UserManagement";
import { Auth } from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/employee-portal" element={<EmployeePortal />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          
          <Route path="/leads" element={
            <ProtectedLayout requiredRoles={['owner', 'admin', 'manager']}>
              <Leads />
            </ProtectedLayout>
          } />
          
          <Route path="/jobs" element={
            <ProtectedLayout requiredRoles={['owner', 'admin', 'manager']}>
              <Jobs />
            </ProtectedLayout>
          } />
          
          <Route path="/employees" element={
            <ProtectedLayout requiredRoles={['owner', 'admin', 'manager']}>
              <Employees />
            </ProtectedLayout>
          } />
          
          <Route path="/employee-requests" element={
            <ProtectedLayout requiredRoles={['owner', 'admin', 'manager']}>
              <EmployeeRequests />
            </ProtectedLayout>
          } />
          
          <Route path="/clients" element={
            <ProtectedLayout requiredRoles={['owner', 'admin', 'manager']}>
              <Clients />
            </ProtectedLayout>
          } />
          
          <Route path="/time-logs" element={
            <ProtectedLayout requiredRoles={['owner', 'admin', 'manager']}>
              <TimeLogs />
            </ProtectedLayout>
          } />
          
          <Route path="/financials" element={
            <ProtectedLayout requiredRoles={['owner', 'admin']}>
              <Financials />
            </ProtectedLayout>
          } />
          
          <Route path="/user-management" element={
            <ProtectedLayout requiredRoles={['owner']}>
              <UserManagement />
            </ProtectedLayout>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
