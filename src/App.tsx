
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
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Root route - handles authentication redirect */}
          <Route path="/" element={<Index />} />
          
          {/* Public routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/employee-portal" element={<EmployeePortal />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          
          {/* User protected routes */}
          <Route path="/dashboard" element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          } />
          
          <Route path="/leads" element={
            <ProtectedLayout>
              <Leads />
            </ProtectedLayout>
          } />
          
          <Route path="/jobs" element={
            <ProtectedLayout>
              <Jobs />
            </ProtectedLayout>
          } />
          
          <Route path="/employees" element={
            <ProtectedLayout>
              <Employees />
            </ProtectedLayout>
          } />
          
          <Route path="/employee-requests" element={
            <ProtectedLayout>
              <EmployeeRequests />
            </ProtectedLayout>
          } />
          
          <Route path="/clients" element={
            <ProtectedLayout>
              <Clients />
            </ProtectedLayout>
          } />
          
          <Route path="/time-logs" element={
            <ProtectedLayout>
              <TimeLogs />
            </ProtectedLayout>
          } />
          
          <Route path="/financials" element={
            <ProtectedLayout>
              <Financials />
            </ProtectedLayout>
          } />
          
          <Route path="/user-management" element={
            <ProtectedLayout>
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
