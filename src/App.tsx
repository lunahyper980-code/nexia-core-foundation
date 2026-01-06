import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { UserRoleProvider } from "@/contexts/UserRoleContext";
import { DemoModeProvider } from "@/contexts/DemoModeContext";
import { GlobalLoaderProvider } from "@/contexts/GlobalLoaderContext";
import { NavigationStateProvider } from "@/contexts/NavigationStateContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PWAProvider } from "@/components/pwa";
import { DemoModeBadge } from "@/components/DemoModeBadge";
import { GlobalLoaderOverlay } from "@/components/GlobalLoaderOverlay";
import { RouteLoaderWrapper } from "@/components/RouteLoaderWrapper";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Solucoes from "./pages/Solucoes";
import Templates from "./pages/Templates";
import Materializar from "./pages/Materializar";
import CriarDoZero from "./pages/CriarDoZero";
import HyperBuild from "./pages/HyperBuild";
import HyperBuildApp from "./pages/HyperBuildApp";
import HyperBuildSite from "./pages/HyperBuildSite";

import ProjetoDetalhe from "./pages/hyperbuild/ProjetoDetalhe";
import ProjetoEditar from "./pages/hyperbuild/ProjetoEditar";
import ContratoWizard from "./pages/hyperbuild/ContratoWizard";
import ContratoDetalhe from "./pages/hyperbuild/ContratoDetalhe";
import CriarAppHub from "./pages/solucoes/CriarAppHub";
import CriarSiteHub from "./pages/solucoes/CriarSiteHub";
import DiagnosticoHub from "./pages/solucoes/DiagnosticoHub";
import DiagnosticoWizard from "./pages/solucoes/DiagnosticoWizard";
import DiagnosticoDetalhe from "./pages/solucoes/DiagnosticoDetalhe";
import DiagnosticoProposta from "./pages/solucoes/PropostaWizard";
import DiagnosticoPropostaDetalhe from "./pages/solucoes/PropostaDetalhe";
import DiagnosticoContrato from "./pages/solucoes/ContratoWizard";
import DiagnosticoContratoDetalhe from "./pages/solucoes/ContratoDetalhe";
import DiagnosticoWhatsApp from "./pages/solucoes/DiagnosticoWhatsApp";
import DiagnosticoEntrega from "./pages/solucoes/DiagnosticoEntrega";
import PosicionamentoHub from "./pages/solucoes/PosicionamentoHub";
import PosicionamentoWizard from "./pages/solucoes/PosicionamentoWizard";
import PosicionamentoDetalhe from "./pages/solucoes/PosicionamentoDetalhe";
import OrganizacaoHub from "./pages/solucoes/OrganizacaoHub";
import OrganizacaoWizard from "./pages/solucoes/OrganizacaoWizard";
import OrganizacaoDetalhe from "./pages/solucoes/OrganizacaoDetalhe";
import KitLancamentoHub from "./pages/solucoes/KitLancamentoHub";
import KitLancamentoWizard from "./pages/solucoes/KitLancamentoWizard";
import KitLancamentoDetalhe from "./pages/solucoes/KitLancamentoDetalhe";
import AutoridadeHub from "./pages/solucoes/AutoridadeHub";
import AutoridadeWizard from "./pages/solucoes/AutoridadeWizard";
import AutoridadeDetalhe from "./pages/solucoes/AutoridadeDetalhe";
import NexiaHome from "./pages/nexia/NexiaHome";
import NexiaClientes from "./pages/nexia/NexiaClientes";
import NexiaPlanejamentos from "./pages/nexia/NexiaPlanejamentos";
import NexiaPlanejamentoWizard from "./pages/nexia/NexiaPlanejamentoWizard";
import NexiaPlanejamentoDetalhe from "./pages/nexia/NexiaPlanejamentoDetalhe";
import NexiaTarefas from "./pages/nexia/NexiaTarefas";
import NexiaHistorico from "./pages/nexia/NexiaHistorico";
import BriefingRapido from "./pages/nexia/BriefingRapido";
import BriefingConcluido from "./pages/nexia/BriefingConcluido";
import BriefingHub from "./pages/nexia/BriefingHub";
import BriefingWizard from "./pages/nexia/BriefingWizard";
import BriefingDetalhe from "./pages/nexia/BriefingDetalhe";
import NexiaEscolhaPlaneamento from "./pages/nexia/NexiaEscolhaPlaneamento";
import NexiaModoSimples from "./pages/nexia/NexiaModoSimples";
import VendasHub from "./pages/vendas/VendasHub";
import Propostas from "./pages/vendas/Propostas";
import PropostaForm from "./pages/vendas/PropostaForm";
import Contratos from "./pages/vendas/Contratos";
import ContratoForm from "./pages/vendas/ContratoForm";
import ContratoNexiaWizard from "./pages/vendas/ContratoNexiaWizard";
import MensagensWhatsApp from "./pages/vendas/MensagensWhatsApp";
import ContratoVisualizar from "./pages/vendas/ContratoVisualizar";
import EntregaHub from "./pages/entrega/EntregaHub";
import EntregaForm from "./pages/entrega/EntregaForm";
import Clientes from "./pages/Clientes";
import EncontrarClientes from "./pages/EncontrarClientes";
import Identidade from "./pages/Identidade";
import Historico from "./pages/Historico";
import Configuracoes from "./pages/Configuracoes";
import AdminPanel from "./pages/admin/AdminPanel";
import MinhaEquipe from "./pages/admin/MinhaEquipe";
import GerenciarUsuarios from "./pages/admin/GerenciarUsuarios";
import InstalarApp from "./pages/InstalarApp";
import RedefinirSenha from "./pages/RedefinirSenha";
import Academy from "./pages/Academy";
import GuiaIniciante from "./pages/academy/GuiaIniciante";
import GuiaAgencia from "./pages/academy/GuiaAgencia";
import AcademyFAQ from "./pages/academy/FAQ";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <WorkspaceProvider>
            <UserRoleProvider>
              <DemoModeProvider>
              <NavigationStateProvider>
              <GlobalLoaderProvider>
              <SidebarProvider>
                <PWAProvider>
                <GlobalLoaderOverlay />
                <RouteLoaderWrapper>
                <DemoModeBadge />
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cadastro" element={<Cadastro />} />
                  <Route path="/instalar" element={<InstalarApp />} />
                  <Route path="/redefinir-senha" element={<RedefinirSenha />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/solucoes" element={<ProtectedRoute><Solucoes /></ProtectedRoute>} />
                  <Route path="/solucoes/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                  <Route path="/solucoes/materializar" element={<ProtectedRoute><Materializar /></ProtectedRoute>} />
                  <Route path="/solucoes/criar" element={<ProtectedRoute><CriarDoZero /></ProtectedRoute>} />
                  <Route path="/solucoes/criar/app" element={<ProtectedRoute><CriarAppHub /></ProtectedRoute>} />
                  <Route path="/solucoes/criar/app/novo" element={<ProtectedRoute><HyperBuildApp /></ProtectedRoute>} />
                  <Route path="/solucoes/criar/site" element={<ProtectedRoute><CriarSiteHub /></ProtectedRoute>} />
                  <Route path="/solucoes/criar/site/novo" element={<ProtectedRoute><HyperBuildSite /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico" element={<ProtectedRoute><DiagnosticoHub /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/novo" element={<ProtectedRoute><DiagnosticoWizard /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/:id" element={<ProtectedRoute><DiagnosticoDetalhe /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/:id/editar" element={<ProtectedRoute><DiagnosticoWizard /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/proposta" element={<ProtectedRoute><DiagnosticoProposta /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/proposta/:id" element={<ProtectedRoute><DiagnosticoPropostaDetalhe /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/contrato" element={<ProtectedRoute><DiagnosticoContrato /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/contrato/:id" element={<ProtectedRoute><DiagnosticoContratoDetalhe /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/whatsapp" element={<ProtectedRoute><DiagnosticoWhatsApp /></ProtectedRoute>} />
                  <Route path="/solucoes/diagnostico/entrega" element={<ProtectedRoute><DiagnosticoEntrega /></ProtectedRoute>} />
                  <Route path="/solucoes/posicionamento" element={<ProtectedRoute><PosicionamentoHub /></ProtectedRoute>} />
                  <Route path="/solucoes/posicionamento/novo" element={<ProtectedRoute><PosicionamentoWizard /></ProtectedRoute>} />
                  <Route path="/solucoes/posicionamento/:id" element={<ProtectedRoute><PosicionamentoDetalhe /></ProtectedRoute>} />
                  <Route path="/solucoes/organizacao" element={<ProtectedRoute><OrganizacaoHub /></ProtectedRoute>} />
                  <Route path="/solucoes/organizacao/novo" element={<ProtectedRoute><OrganizacaoWizard /></ProtectedRoute>} />
                  <Route path="/solucoes/organizacao/:id" element={<ProtectedRoute><OrganizacaoDetalhe /></ProtectedRoute>} />
                  <Route path="/solucoes/servicos-produtizados" element={<Navigate to="/solucoes" replace />} />
                  <Route path="/solucoes/servicos/:serviceId" element={<Navigate to="/solucoes" replace />} />
                  <Route path="/solucoes/kit-lancamento" element={<ProtectedRoute><KitLancamentoHub /></ProtectedRoute>} />
                  <Route path="/solucoes/kit-lancamento/novo" element={<ProtectedRoute><KitLancamentoWizard /></ProtectedRoute>} />
                  <Route path="/solucoes/kit-lancamento/:id" element={<ProtectedRoute><KitLancamentoDetalhe /></ProtectedRoute>} />
                  <Route path="/solucoes/autoridade" element={<ProtectedRoute><AutoridadeHub /></ProtectedRoute>} />
                  <Route path="/solucoes/autoridade/novo" element={<ProtectedRoute><AutoridadeWizard /></ProtectedRoute>} />
                  <Route path="/solucoes/autoridade/:id" element={<ProtectedRoute><AutoridadeDetalhe /></ProtectedRoute>} />
                  <Route path="/hyperbuild" element={<Navigate to="/solucoes" replace />} />
                  <Route path="/hyperbuild/projetos" element={<Navigate to="/solucoes" replace />} />
                  <Route path="/hyperbuild/projeto/:id" element={<ProtectedRoute><ProjetoDetalhe /></ProtectedRoute>} />
                  <Route path="/hyperbuild/projeto/:id/editar" element={<ProtectedRoute><ProjetoEditar /></ProtectedRoute>} />
                  <Route path="/hyperbuild/projeto/:id/contrato" element={<ProtectedRoute><ContratoWizard /></ProtectedRoute>} />
                  <Route path="/hyperbuild/projeto/:id/contrato/:contractId" element={<ProtectedRoute><ContratoDetalhe /></ProtectedRoute>} />
                  <Route path="/nexia-ai" element={<ProtectedRoute><NexiaHome /></ProtectedRoute>} />
                  <Route path="/nexia-ai/clientes" element={<ProtectedRoute><NexiaClientes /></ProtectedRoute>} />
                  <Route path="/nexia-ai/planejamentos" element={<ProtectedRoute><NexiaPlanejamentos /></ProtectedRoute>} />
                  <Route path="/nexia-ai/planejamento/novo" element={<ProtectedRoute><NexiaPlanejamentoWizard /></ProtectedRoute>} />
                  <Route path="/nexia-ai/planejamento/:id" element={<ProtectedRoute><NexiaPlanejamentoDetalhe /></ProtectedRoute>} />
                  <Route path="/nexia-ai/planejamento/:id/editar" element={<ProtectedRoute><NexiaPlanejamentoWizard /></ProtectedRoute>} />
                  <Route path="/nexia-ai/tarefas" element={<ProtectedRoute><NexiaTarefas /></ProtectedRoute>} />
                  <Route path="/nexia-ai/historico" element={<ProtectedRoute><NexiaHistorico /></ProtectedRoute>} />
                  <Route path="/briefing-rapido" element={<ProtectedRoute><BriefingRapido /></ProtectedRoute>} />
                  <Route path="/nexia-ai/briefing-concluido" element={<ProtectedRoute><BriefingConcluido /></ProtectedRoute>} />
                  <Route path="/nexia-ai/briefings" element={<ProtectedRoute><BriefingHub /></ProtectedRoute>} />
                  <Route path="/nexia-ai/briefing/novo" element={<ProtectedRoute><BriefingWizard /></ProtectedRoute>} />
                  <Route path="/nexia-ai/briefing/:id" element={<ProtectedRoute><BriefingDetalhe /></ProtectedRoute>} />
                  <Route path="/nexia-ai/escolher-planejamento" element={<ProtectedRoute><NexiaEscolhaPlaneamento /></ProtectedRoute>} />
                  <Route path="/nexia-ai/modo-simples" element={<ProtectedRoute><NexiaModoSimples /></ProtectedRoute>} />
                  <Route path="/vendas" element={<ProtectedRoute><VendasHub /></ProtectedRoute>} />
                  <Route path="/vendas/propostas" element={<ProtectedRoute><Propostas /></ProtectedRoute>} />
                  <Route path="/vendas/propostas/nova" element={<ProtectedRoute><PropostaForm /></ProtectedRoute>} />
                  <Route path="/vendas/propostas/:id" element={<ProtectedRoute><PropostaForm /></ProtectedRoute>} />
                  <Route path="/vendas/contratos" element={<ProtectedRoute><Contratos /></ProtectedRoute>} />
                  <Route path="/vendas/contratos/nexia" element={<ProtectedRoute><ContratoNexiaWizard /></ProtectedRoute>} />
                  <Route path="/vendas/contratos/ver/:id" element={<ProtectedRoute><ContratoVisualizar /></ProtectedRoute>} />
                  <Route path="/vendas/contratos/:id" element={<ProtectedRoute><ContratoForm /></ProtectedRoute>} />
                  <Route path="/vendas/whatsapp" element={<ProtectedRoute><MensagensWhatsApp /></ProtectedRoute>} />
                  <Route path="/vendas/whatsapp/nova" element={<ProtectedRoute><MensagensWhatsApp /></ProtectedRoute>} />
                  <Route path="/entrega" element={<ProtectedRoute><EntregaHub /></ProtectedRoute>} />
                  <Route path="/entrega/nova" element={<ProtectedRoute><EntregaForm /></ProtectedRoute>} />
                  <Route path="/entrega/:id" element={<ProtectedRoute><EntregaForm /></ProtectedRoute>} />
                  <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
                  <Route path="/encontrar-clientes" element={<ProtectedRoute><EncontrarClientes /></ProtectedRoute>} />
                  <Route path="/identidade" element={<ProtectedRoute><Identidade /></ProtectedRoute>} />
                  <Route path="/historico" element={<ProtectedRoute><Historico /></ProtectedRoute>} />
                  <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
                  <Route path="/admin/equipe" element={<ProtectedRoute><MinhaEquipe /></ProtectedRoute>} />
                  <Route path="/admin/usuarios" element={<ProtectedRoute><GerenciarUsuarios /></ProtectedRoute>} />
                  <Route path="/admin/*" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
                  <Route path="/academy" element={<ProtectedRoute><Academy /></ProtectedRoute>} />
                  <Route path="/academy/guia-iniciante" element={<ProtectedRoute><GuiaIniciante /></ProtectedRoute>} />
                  <Route path="/academy/guia-agencia" element={<ProtectedRoute><GuiaAgencia /></ProtectedRoute>} />
                  <Route path="/academy/faq" element={<ProtectedRoute><AcademyFAQ /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </RouteLoaderWrapper>
                </PWAProvider>
              </SidebarProvider>
              </GlobalLoaderProvider>
              </NavigationStateProvider>
              </DemoModeProvider>
            </UserRoleProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
