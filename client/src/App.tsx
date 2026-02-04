import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";

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
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
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
        {/* Calculator / Orçamento */}
        <Route path="/calculadora" component={CalculadoraPage} />
        <Route path="/orcamento" component={CalculadoraPage} />
        {/* Histórico */}
        <Route path="/historico" component={HistoricoPage} />
        {/* Fallback */}
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
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
