
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Standalone pages - No Layout */}
          <Route path="/employee-portal" element={<EmployeePortal />} />
          <Route path="/manager-login" element={<ManagerLogin />} />
          
          {/* Protected Admin Routes with Layout */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
          <Route path="/leads" element={<Layout><Leads /></Layout>} />
          <Route path="/jobs" element={<Layout><Jobs /></Layout>} />
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/employee-requests" element={<Layout><EmployeeRequests /></Layout>} />
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
          <Route path="/financials" element={<Layout><Financials /></Layout>} />
          <Route path="/time-logs" element={<Layout><TimeLogs /></Layout>} />
          
          {/* 404 fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
