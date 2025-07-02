
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedLayout } from "./components/ProtectedLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
          
          {/* Manager protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/leads" element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={
            <ProtectedRoute>
              <Jobs />
            </ProtectedRoute>
          } />
          
          <Route path="/employees" element={
            <ProtectedRoute>
              <Employees />
            </ProtectedRoute>
          } />
          
          <Route path="/employee-requests" element={
            <ProtectedRoute>
              <EmployeeRequests />
            </ProtectedRoute>
          } />
          
          <Route path="/clients" element={
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          } />
          
          <Route path="/time-logs" element={
            <ProtectedRoute>
              <TimeLogs />
            </ProtectedRoute>
          } />
          
          <Route path="/financials" element={
            <ProtectedRoute>
              <Financials />
            </ProtectedRoute>
          } />
          
          <Route path="/user-management" element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
