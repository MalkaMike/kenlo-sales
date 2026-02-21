import { Suspense, lazy } from "react";
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
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";

// Eagerly loaded pages (critical path)
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import AcessoNegado from "./pages/AcessoNegado";

// Lazy loaded pages (code-split for faster initial load)
const ImobPage = lazy(() => import("./pages/products/ImobPage"));
const LocacaoPage = lazy(() => import("./pages/products/LocacaoPage"));
const SitePage = lazy(() => import("./pages/products/SitePage"));
const LeadsPage = lazy(() => import("./pages/addons/LeadsPage"));
const InteligenciaPage = lazy(() => import("./pages/addons/InteligenciaPage"));
const AssinaturaPage = lazy(() => import("./pages/addons/AssinaturaPage"));
const PayPage = lazy(() => import("./pages/addons/PayPage"));
const SegurosPage = lazy(() => import("./pages/addons/SegurosPage"));
const CashPage = lazy(() => import("./pages/addons/CashPage"));
const KombosPage = lazy(() => import("./pages/KombosPage"));
const CalculadoraPage = lazy(() => import("./pages/calculadora"));
const HistoricoPage = lazy(() => import("./pages/HistoricoPage"));
const PerformancePage = lazy(() => import("./pages/PerformancePage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PricingAdminPage = lazy(() => import("./pages/PricingAdminPage"));
const AdminUsersPage = lazy(() => import("./pages/AdminUsersPage"));
const ConteudoPage = lazy(() => import("./pages/ConteudoPage"));
const ConversionDashboardPage = lazy(() => import("./pages/ConversionDashboardPage"));
const ClientRegistryPage = lazy(() => import("./pages/ClientRegistryPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-kenlo-pink border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-muted-foreground">Carregando...</span>
      </div>
    </div>
  );
}

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
            <Suspense fallback={<PageLoader />}>
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
                {/* Conteúdo */}
                <Route path="/conteudo" component={ConteudoPage} />
                {/* Calculator / Cotação */}
                <Route path="/calculadora" component={CalculadoraPage} />
                <Route path="/cotacao" component={CalculadoraPage} />
                {/* Histórico */}
                <Route path="/historico" component={HistoricoPage} />
                {/* Performance */}
                <Route path="/performance" component={PerformancePage} />
                {/* Conversion Dashboard */}
                <Route path="/conversao" component={ConversionDashboardPage} />
                {/* Profile */}
                <Route path="/perfil" component={ProfilePage} />
                {/* Pricing Admin */}
                <Route path="/admin/pricing" component={PricingAdminPage} />
                <Route path="/admin/users" component={AdminUsersPage} />
                <Route path="/admin/clientes" component={ClientRegistryPage} />
                {/* Fallback */}
                <Route path="/404" component={NotFound} />
                <Route component={NotFound} />
              </Switch>
            </Suspense>
          </Layout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

export default function App() {
  // Enable global keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <NotificationProvider>
          <TooltipProvider>
            <ErrorInterceptorSetup />
            <Toast />
            <Toaster />
            <Router />
          </TooltipProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
