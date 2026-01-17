import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Layers, Rocket, Target, Compass, Users2, FileSignature, Smartphone, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserMode } from '@/contexts/UserModeContext';

// Import images
import solutionTypeApp from '@/assets/solution-type-app.png';
import solutionTypeSite from '@/assets/solution-type-site.png';
import solutionDiagnostico from '@/assets/solution-diagnostico.png';
import solutionPosicionamento from '@/assets/solution-posicionamento.png';
import solutionOrganizacao from '@/assets/solution-organizacao.png';
import solutionAutoridade from '@/assets/solution-autoridade.png';
import solutionKitLancamento from '@/assets/solution-kit-lancamento.png';
import solutionContrato from '@/assets/solution-contrato.png';
import solutionProposta from '@/assets/solution-proposta.png';

// ================================
// MODO SIMPLES - Apenas Criar App/Site
// ================================
function SolucoesSimples() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Criar" hideBreadcrumb>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-140px)] px-4 pt-8 md:pt-20">
        {/* Header */}
        <div className="text-center mb-14 md:mb-20 max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            O que você deseja criar hoje?
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            <span className="text-muted-foreground">Crie </span>
            <span className="bg-gradient-to-r from-primary to-[#3b82f6] bg-clip-text text-transparent font-medium">
              aplicativos e sites profissionais
            </span>
            <span className="text-muted-foreground"> com estrutura, automação e escala desde o primeiro dia.</span>
          </p>
          <p className="text-sm text-muted-foreground/70 mt-4">
            Escolha o caminho ideal para transformar sua ideia em produto.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-10 w-full max-w-5xl">
          {/* Card - Criar Aplicativo */}
          <div 
            className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/30 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_60px_hsl(var(--primary)/0.2)] hover:scale-[1.02] cursor-pointer"
            onClick={() => navigate('/solucoes/criar/app')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            
            <div className="relative h-52 md:h-64 overflow-hidden bg-gradient-to-br from-surface-dark to-background">
              <img 
                src={solutionTypeApp} 
                alt="Aplicativo" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            
            <div className="relative p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                Criar Aplicativo
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Desenvolva um aplicativo completo, com painel administrativo, usuários, automações e pronto para crescer.
              </p>
              <p className="text-sm text-muted-foreground/70 mb-8">
                Ideal para SaaS, plataformas, sistemas internos e produtos digitais.
              </p>

              <Button 
                size="lg"
                className="w-full gap-2 text-base font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all duration-300"
              >
                Começar Aplicativo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Card - Criar Site */}
          <div 
            className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/30 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_60px_hsl(var(--primary)/0.2)] hover:scale-[1.02] cursor-pointer"
            onClick={() => navigate('/solucoes/criar/site')}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            
            <div className="relative h-52 md:h-64 overflow-hidden bg-gradient-to-br from-surface-dark to-background">
              <img 
                src={solutionTypeSite} 
                alt="Site" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            
            <div className="relative p-8 md:p-10">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                Criar Site
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Crie um site rápido, moderno e otimizado para conversão, com estrutura profissional desde o início.
              </p>
              <p className="text-sm text-muted-foreground/70 mb-8">
                Ideal para landing pages, sites institucionais e páginas de vendas.
              </p>

              <Button 
                size="lg"
                className="w-full gap-2 text-base font-semibold bg-primary hover:bg-primary/90 shadow-[0_0_20px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] transition-all duration-300"
              >
                Começar Site
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

// ================================
// MODO AVANÇADO - Soluções Digitais Completas
// ================================

// Kits e soluções do modo avançado
const solutionCategories = [
  {
    title: 'Criação',
    description: 'Crie apps e sites profissionais',
    solutions: [
      {
        id: 'criar-app',
        title: 'Criar Aplicativo',
        description: 'App completo com painel, usuários e automações',
        icon: Smartphone,
        image: solutionTypeApp,
        path: '/solucoes/criar/app',
        color: 'text-primary',
        bgColor: 'bg-primary/10',
      },
      {
        id: 'criar-site',
        title: 'Criar Site',
        description: 'Site moderno otimizado para conversão',
        icon: Globe,
        image: solutionTypeSite,
        path: '/solucoes/criar/site',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
      },
    ],
  },
  {
    title: 'Diagnóstico & Estratégia',
    description: 'Ferramentas de análise e planejamento',
    solutions: [
      {
        id: 'diagnostico',
        title: 'Diagnóstico Digital',
        description: 'Análise completa da presença digital do cliente',
        icon: Target,
        image: solutionDiagnostico,
        path: '/solucoes/diagnostico',
        color: 'text-violet-500',
        bgColor: 'bg-violet-500/10',
      },
      {
        id: 'posicionamento',
        title: 'Posicionamento Digital',
        description: 'Definir posição estratégica no mercado',
        icon: Compass,
        image: solutionPosicionamento,
        path: '/solucoes/posicionamento',
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
      },
      {
        id: 'organizacao',
        title: 'Organização de Processos',
        description: 'Estruturar processos internos do negócio',
        icon: Layers,
        image: solutionOrganizacao,
        path: '/solucoes/organizacao',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
      },
    ],
  },
  {
    title: 'Kits Prontos',
    description: 'Soluções completas para lançamentos e autoridade',
    solutions: [
      {
        id: 'kit-lancamento',
        title: 'Kit de Lançamento',
        description: 'Material completo para lançar o cliente no digital',
        icon: Rocket,
        image: solutionKitLancamento,
        path: '/solucoes/kit-lancamento',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        badge: 'POPULAR',
      },
      {
        id: 'autoridade',
        title: 'Autoridade Digital',
        description: 'Estratégia de conteúdo e autoridade online',
        icon: Users2,
        image: solutionAutoridade,
        path: '/solucoes/autoridade',
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
      },
    ],
  },
  {
    title: 'Comercial',
    description: 'Propostas e contratos profissionais',
    solutions: [
      {
        id: 'proposta',
        title: 'Gerador de Propostas',
        description: 'Propostas comerciais personalizadas',
        icon: FileSignature,
        image: solutionProposta,
        path: '/solucoes/proposta',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
      },
      {
        id: 'contrato',
        title: 'Gerador de Contratos',
        description: 'Contratos de prestação de serviço',
        icon: FileSignature,
        image: solutionContrato,
        path: '/solucoes/contrato',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
      },
    ],
  },
];

function SolucoesAvancado() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Soluções Digitais">
      <div className="content-premium space-y-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Soluções Digitais
          </h1>
          <p className="text-muted-foreground">
            Kits completos, ferramentas estratégicas e materiais prontos para seus clientes.
          </p>
        </div>

        {/* Categories */}
        {solutionCategories.map((category) => (
          <div key={category.title} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {category.solutions.map((solution) => {
                const Icon = solution.icon;
                return (
                  <PremiumFrame 
                    key={solution.id}
                    className="group cursor-pointer hover:border-primary/30 transition-all duration-300"
                    onClick={() => navigate(solution.path)}
                  >
                    <div className="p-5">
                      {/* Image */}
                      {solution.image && (
                        <div className="relative h-32 -mx-5 -mt-5 mb-4 overflow-hidden rounded-t-lg bg-gradient-to-br from-surface-dark to-background">
                          <img 
                            src={solution.image} 
                            alt={solution.title}
                            className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg ${solution.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-5 w-5 ${solution.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {solution.title}
                            </h3>
                            {solution.badge && (
                              <Badge variant="premium" className="text-[10px] px-1.5 py-0 h-4">
                                {solution.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {solution.description}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors"
                      >
                        Acessar
                        <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </PremiumFrame>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}

// ================================
// COMPONENTE PRINCIPAL - Renderiza baseado no modo
// ================================
export default function Solucoes() {
  const { mode } = useUserMode();

  // Modo simples: apenas criar app/site
  // Modo avançado: soluções digitais completas
  if (mode === 'simple') {
    return <SolucoesSimples />;
  }

  return <SolucoesAvancado />;
}
