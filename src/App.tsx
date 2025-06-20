import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AttendantsPage from "./pages/Attendants";
import ChatPage from "./pages/Chat";
import ContactsPage from "./pages/Contacts";
import KanbanPage from "./pages/Kanban";
import Login from "./pages/Login";
import MeusDados from "./pages/MeusDados";
import AIChatPage from "@/pages/managementChat";
import Setup from "./pages/Setup";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Componente de Rota Protegida
import ProtectedRoute from "./components/ProtectedRoute";
import { SetupGuard } from "./components/SetupGuard";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101112] flex items-center justify-center">
        <div className="text-white">Carregando aplicação...</div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/setup" element={<Setup />} />

            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route
                element={
                  <SetupGuard>
                    <MainLayout />
                  </SetupGuard>
                }
              >
                <Route path="/" element={<Index />} />
                <Route path="/atendentes" element={<AttendantsPage />} />
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/contatos" element={<ContactsPage />} />
                <Route path="/kanban" element={<KanbanPage />} />
                <Route path="/meus-dados" element={<MeusDados />} />
                <Route path="/chat-gestao" element={<AIChatPage />} />
              </Route>
            </Route>

            {/* Rota de fallback */}
            <Route path="/404" element={<NotFound />} />
            <Route
              path="*"
              element={user ? <Navigate to="/404" /> : <Navigate to="/login" />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
