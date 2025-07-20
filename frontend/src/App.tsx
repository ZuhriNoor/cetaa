
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
