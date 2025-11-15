import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import Features from "./pages/Features";
import Setup from "./pages/Setup";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import ProfilePage from "./pages/Profile";
import { useAuthUser } from "@/hooks/useAuthUser";

const queryClient = new QueryClient();

const AuthRedirectWatcher = () => {
  const { user } = useAuthUser();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (location.pathname === "/" || location.pathname === "/login") {
      navigate("/admin", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthRedirectWatcher />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/faq" element={<FAQ />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
