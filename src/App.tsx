import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import PinScreen from "./pages/PinScreen";
import EnergyTracker from "./pages/EnergyTracker";
import ClientTracker from "./pages/ClientTracker";
import Refresh from "./pages/Refresh";
import DebtCalculator from "./pages/DebtCalculator";
import Calendar from "./pages/Calendar";
import LifeTimeline from "./pages/LifeTimeline";
import NotFound from "./pages/NotFound";
import { FinanceApp, FinanceAuth } from "@/apps/finance";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/pin" element={<PinScreen />} />
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/energy-tracker" element={<ProtectedRoute><EnergyTracker /></ProtectedRoute>} />
          <Route path="/client-tracker" element={<ProtectedRoute><ClientTracker /></ProtectedRoute>} />
          <Route path="/refresh" element={<ProtectedRoute><Refresh /></ProtectedRoute>} />
          <Route path="/debt-calculator" element={<ProtectedRoute><DebtCalculator /></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
          <Route path="/life-timeline" element={<ProtectedRoute><LifeTimeline /></ProtectedRoute>} />
          <Route path="/finance/auth" element={<FinanceAuth />} />
          <Route path="/finance/*" element={<ProtectedRoute><FinanceApp /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
