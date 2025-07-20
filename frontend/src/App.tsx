
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GoldenJubilee from "./pages/GoldenJubilee";
import SilverJubilee from "./pages/SilverJubilee";
import Executives from "./pages/Executives";
import NewRegistration from "./pages/NewRegistration";
import AttendanceLogs from "./pages/AttendanceLogs";
import SheetsLogs from "./pages/SheetsLogs";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

function useKeepBackendAlive() {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`${API_BASE}/ping`).catch(() => {});
    }, 13 * 60 * 1000); // 13 minutes
    // Ping once on mount
    fetch(`${API_BASE}/ping`).catch(() => {});
    return () => clearInterval(interval);
  }, []);
}

const App = () => {
  useKeepBackendAlive();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black w-full">
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<GoldenJubilee />} />
                <Route path="/golden-jubilee" element={<GoldenJubilee />} />
                <Route path="/silver-jubilee" element={<SilverJubilee />} />
                <Route path="/executives" element={<Executives />} />
                <Route path="/new-registration" element={<NewRegistration />} />
                <Route path="/attendance-logs" element={<AttendanceLogs />} />
                <Route path="/sheets-logs" element={<SheetsLogs />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
