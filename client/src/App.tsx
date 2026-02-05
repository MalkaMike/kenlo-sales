import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import ImobPage from "./pages/products/ImobPage";
import LocacaoPage from "./pages/products/LocacaoPage";
import SitePage from "./pages/products/SitePage";
import LeadsPage from "./pages/addons/LeadsPage";
import InteligenciaPage from "./pages/addons/InteligenciaPage";
import AssinaturaPage from "./pages/addons/AssinaturaPage";
import PayPage from "./pages/addons/PayPage";
import SegurosPage from "./pages/addons/SegurosPage";
import CashPage from "./pages/addons/CashPage";
import KombosPage from "./pages/KombosPage";
import CalculadoraPage from "./pages/CalculadoraPage";
import HistoricoPage from "./pages/HistoricoPage";
import PerformancePage from "./pages/PerformancePage";
import LoginPage from "./pages/LoginPage";
import AcessoNegado from "./pages/AcessoNegado";
import ProfilePage from "./pages/ProfilePage";

// Protected Calculadora wrapper
function ProtectedCalculadora() {
  return (
    <ProtectedRoute>
      <CalculadoraPage />
    </ProtectedRoute>
  );
}

// Protected Historico wrapper
function ProtectedHistorico() {
  return (
    <ProtectedRoute>
      <HistoricoPage />
    </ProtectedRoute>
  );
}

// Protected Performance wrapper
function ProtectedPerformance() {
  return (
    <ProtectedRoute>
      <PerformancePage />
    </ProtectedRoute>
  );
}

// Protected Profile wrapper
function ProtectedProfile() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      {/* Login page - no layout */}
      <Route path="/login" component={LoginPage} />
      
      {/* Access denied page - no layout */}
      <Route path="/acesso-negado" component={AcessoNegado} />
      
      {/* All other pages with layout */}
      <Route>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            {/* Products */}
            <Route path="/produtos/imob" component={ImobPage} />
            <Route path="/produtos/locacao" component={LocacaoPage} />
            <Route path="/produtos/site" component={SitePage} />
            {/* Add-ons */}
            <Route path="/addons/leads" component={LeadsPage} />
            <Route path="/addons/inteligencia" component={InteligenciaPage} />
            <Route path="/addons/assinatura" component={AssinaturaPage} />
            <Route path="/addons/pay" component={PayPage} />
            <Route path="/addons/seguros" component={SegurosPage} />
            <Route path="/addons/cash" component={CashPage} />
            {/* Kombos */}
            <Route path="/kombos" component={KombosPage} />
            {/* Calculator / Cotação - PROTECTED */}
            <Route path="/calculadora" component={ProtectedCalculadora} />
            <Route path="/cotacao" component={ProtectedCalculadora} />
            {/* Histórico - PROTECTED */}
            <Route path="/historico" component={ProtectedHistorico} />
            {/* Performance - PROTECTED */}
            <Route path="/performance" component={ProtectedPerformance} />
            {/* Profile - PROTECTED */}
            <Route path="/perfil" component={ProtectedProfile} />
            {/* Fallback */}
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
