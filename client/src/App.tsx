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
import LeadsPage from "./pages/addons/LeadsPage";
import InteligenciaPage from "./pages/addons/InteligenciaPage";
import AssinaturaPage from "./pages/addons/AssinaturaPage";
import PayPage from "./pages/addons/PayPage";
import SegurosPage from "./pages/addons/SegurosPage";
import CashPage from "./pages/addons/CashPage";
import KombosPage from "./pages/KombosPage";
import CalculadoraPage from "./pages/CalculadoraPage";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        {/* Products */}
        <Route path="/produtos/imob" component={ImobPage} />
        <Route path="/produtos/locacao" component={LocacaoPage} />
        {/* Add-ons */}
        <Route path="/addons/leads" component={LeadsPage} />
        <Route path="/addons/inteligencia" component={InteligenciaPage} />
        <Route path="/addons/assinatura" component={AssinaturaPage} />
        <Route path="/addons/pay" component={PayPage} />
        <Route path="/addons/seguros" component={SegurosPage} />
        <Route path="/addons/cash" component={CashPage} />
        {/* Kombos */}
        <Route path="/kombos" component={KombosPage} />
        {/* Calculator */}
        <Route path="/calculadora" component={CalculadoraPage} />
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
