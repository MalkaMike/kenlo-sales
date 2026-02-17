import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Layout from "./components/Layout";
import AuthGuard from "./components/AuthGuard";
import { Toast } from "./components/Toast";
import { ErrorInterceptorSetup } from "./components/ErrorInterceptorSetup";

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
import CalculadoraPage from "./pages/calculadora";
import HistoricoPage from "./pages/HistoricoPage";
import PerformancePage from "./pages/PerformancePage";
import LoginPage from "./pages/LoginPage";
import AcessoNegado from "./pages/AcessoNegado";
import ProfilePage from "./pages/ProfilePage";
import PricingAdminPage from "./pages/PricingAdminPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import PlaybookPage from "./pages/PlaybookPage";
import ConteudoPage from "./pages/ConteudoPage";

function Router() {
  return (
    <Switch>
      {/* Login page - no layout, no auth guard */}
      <Route path="/login" component={LoginPage} />
      
      {/* Access denied page - no layout, no auth guard */}
      <Route path="/acesso-negado" component={AcessoNegado} />
      
      {/* All other pages require authentication + Layout */}
      <Route>
        <AuthGuard>
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
              {/* Sales Playbook */}
              <Route path="/playbook" component={PlaybookPage} />
              {/* Conteúdo */}
              <Route path="/conteudo" component={ConteudoPage} />
              {/* Calculator / Cotação */}
              <Route path="/calculadora" component={CalculadoraPage} />
              <Route path="/cotacao" component={CalculadoraPage} />
              {/* Histórico */}
              <Route path="/historico" component={HistoricoPage} />
              {/* Performance */}
              <Route path="/performance" component={PerformancePage} />
              {/* Profile */}
              <Route path="/perfil" component={ProfilePage} />
              {/* Pricing Admin */}
              <Route path="/admin/pricing" component={PricingAdminPage} />
              <Route path="/admin/users" component={AdminUsersPage} />
              {/* Fallback */}
              <Route path="/404" component={NotFound} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <NotificationProvider>
          <TooltipProvider>
            <ErrorInterceptorSetup />
            <Toast />
            <Router />
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
