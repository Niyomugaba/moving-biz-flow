
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ManagerLayout } from "./components/ManagerLayout";
import Index from "./pages/Index";
import Website from "./pages/Website";
import { Auth } from "./pages/Auth";
import { Dashboard } from "./pages/Dashboard";
import { Jobs } from "./pages/Jobs";
import { Clients } from "./pages/Clients";
import { Employees } from "./pages/Employees";
import { Leads } from "./pages/Leads";
import { TimeLogs } from "./pages/TimeLogs";
import { Financials } from "./pages/Financials";
import { FinancialReports } from "./pages/FinancialReports";
import { EmployeeRequests } from "./pages/EmployeeRequests";
import { UserManagement } from "./pages/UserManagement";
import { EmployeePortal } from "./pages/EmployeePortal";
import { ManagerLogin } from "./pages/ManagerLogin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/website" element={<Website />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/manager-login" element={<ManagerLogin />} />
            <Route path="/employee-portal" element={<EmployeePortal />} />
            <Route path="/manager/*" element={
              <ManagerLayout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/time-logs" element={<TimeLogs />} />
                  <Route path="/financials" element={<Financials />} />
                  <Route path="/financial-reports" element={<FinancialReports />} />
                  <Route path="/employee-requests" element={<EmployeeRequests />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ManagerLayout>
            } />
            <Route path="/*" element={
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/time-logs" element={<TimeLogs />} />
                  <Route path="/financials" element={<Financials />} />
                  <Route path="/financial-reports" element={<FinancialReports />} />
                  <Route path="/employee-requests" element={<EmployeeRequests />} />
                  <Route path="/user-management" element={<UserManagement />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
