import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, ProtectedRoute, AdminRoute } from "@/hooks/useAuth";

// Landing page carrega eagerly (primeira coisa que o usuário vê)
import Index from "./pages/Index";

// Todas as outras páginas carregam sob demanda (lazy loading)
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NewEvent = lazy(() => import("./pages/NewEvent"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const EventPage = lazy(() => import("./pages/EventPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Plans = lazy(() => import("./pages/Plans"));
const Termos = lazy(() => import("./pages/Termos"));
const Privacidade = lazy(() => import("./pages/Privacidade"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos - dados ficam "frescos" por 5 min
      gcTime: 10 * 60 * 1000,    // 10 minutos - cache persiste por 10 min
      refetchOnWindowFocus: false, // Não rebusca ao focar a janela
      retry: 1,                    // 1 retry em caso de falha
    },
  },
});

// Loading fallback minimalista
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        <span className="text-sm text-gray-400">Carregando...</span>
      </div>
    </div>
  );
}

const App = () => (
  <div style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Rotas públicas */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/plans" element={<Plans />} />
                <Route path="/termos" element={<Termos />} />
                <Route path="/privacidade" element={<Privacidade />} />

                {/* Rota pública do evento */}
                <Route path="/e/:slug" element={<EventPage />} />

                {/* Rotas protegidas (requerem login) */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events/new"
                  element={
                    <ProtectedRoute>
                      <NewEvent />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/events/:id/edit"
                  element={
                    <ProtectedRoute>
                      <EditEvent />
                    </ProtectedRoute>
                  }
                />

                {/* Rota admin (requer role admin) */}
                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* Página 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </div>
);

export default App;
