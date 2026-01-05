import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Smartphone, Globe, Target, Network, Lightbulb, Rocket, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NextStepCard } from '@/components/academy/NextStepCard';
import { CommercialButtons } from '@/components/solucoes/CommercialModals';
import solutionTypeApp from '@/assets/solution-type-app.png';
import solutionTypeSite from '@/assets/solution-type-site.png';
import solutionPosicionamento from '@/assets/solution-posicionamento.png';
import solutionOrganizacao from '@/assets/solution-organizacao.png';
import solutionKitLancamento from '@/assets/solution-kit-lancamento.png';
import solutionAutoridade from '@/assets/solution-autoridade.png';

interface SolutionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  borderColor: string;
  bgGradient: string;
  badgeText: string;
  badgeClass: string;
  path: string;
  features: string[];
  buttonText: string;
  buttonClass?: string;
  isNew?: boolean;
}

export default function Solucoes() {
  const navigate = useNavigate();

  const solutions: SolutionCard[] = [
    {
      id: 'kit-lancamento',
      title: 'Kit de Lançamento Digital',
      description: 'Estruture um lançamento simples e profissional para negócios em início.',
      image: solutionKitLancamento,
      icon: Rocket,
      color: 'text-violet-500',
      borderColor: 'border-violet-500/20 hover:border-violet-500/40',
      bgGradient: 'from-violet-500/[0.05] to-transparent',
      badgeText: 'NOVO',
      badgeClass: 'bg-violet-500 text-white',
      path: '/solucoes/kit-lancamento',
      features: ['Estrutura de lançamento', 'Sequência de ações', 'Mensagens prontas', 'Checklist de execução'],
      buttonText: 'Acessar Kit de Lançamento',
      buttonClass: 'bg-violet-500 hover:bg-violet-600',
      isNew: true,
    },
    {
      id: 'autoridade',
      title: 'Autoridade & Reconhecimento Digital',
      description: 'Estratégia de reconhecimento e autoridade orgânica para marcas.',
      image: solutionAutoridade,
      icon: Award,
      color: 'text-emerald-500',
      borderColor: 'border-emerald-500/20 hover:border-emerald-500/40',
      bgGradient: 'from-emerald-500/[0.05] to-transparent',
      badgeText: 'NOVO',
      badgeClass: 'bg-emerald-500 text-white',
      path: '/solucoes/autoridade',
      features: ['Estratégia de presença', 'Diretrizes de autoridade', 'Ideias de conteúdo', 'Ações orgânicas'],
      buttonText: 'Acessar Autoridade',
      buttonClass: 'bg-emerald-500 hover:bg-emerald-600',
      isNew: true,
    },
    {
      id: 'posicionamento',
      title: 'Posicionamento Digital Profissional',
      description: 'Posicione marcas e negócios como profissionais no digital.',
      image: solutionPosicionamento,
      icon: Target,
      color: 'text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40',
      bgGradient: 'from-primary/[0.05] to-transparent',
      badgeText: 'Pronto para vender',
      badgeClass: 'bg-primary/90 text-primary-foreground',
      path: '/solucoes/posicionamento',
      features: ['Proposta de posicionamento', 'Mensagem central', 'Bio profissional', 'Direcionamento de comunicação'],
      buttonText: 'Acessar Posicionamento',
    },
    {
      id: 'site',
      title: 'Criação de Sites e Landing Pages',
      description: 'Sites profissionais prontos para negócios locais e digitais.',
      image: solutionTypeSite,
      icon: Globe,
      color: 'text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40',
      bgGradient: 'from-primary/[0.05] to-transparent',
      badgeText: 'Criação',
      badgeClass: 'bg-primary/90 text-primary-foreground',
      path: '/solucoes/criar/site',
      features: ['Modelos prontos', 'SEO otimizado', 'Responsivo', 'Deploy automático'],
      buttonText: 'Criar Site',
    },
    {
      id: 'app',
      title: 'Criação de Aplicativos',
      description: 'Crie aplicativos profissionais com modelos prontos ou do zero.',
      image: solutionTypeApp,
      icon: Smartphone,
      color: 'text-primary',
      borderColor: 'border-primary/20 hover:border-primary/40',
      bgGradient: 'from-primary/[0.05] to-transparent',
      badgeText: 'Criação',
      badgeClass: 'bg-primary/90 text-primary-foreground',
      path: '/solucoes/criar/app',
      features: ['Modelos prontos', 'Criar do zero', 'Geração de prompt', 'Salvamento em projetos'],
      buttonText: 'Criar Aplicativo',
    },
    {
      id: 'organizacao',
      title: 'Organização de Processos',
      description: 'Estruture rotinas, fluxos e operação do negócio.',
      image: solutionOrganizacao,
      icon: Network,
      color: 'text-amber-500',
      borderColor: 'border-amber-500/20 hover:border-amber-500/40',
      bgGradient: 'from-amber-500/[0.05] to-transparent',
      badgeText: 'Pronto para vender',
      badgeClass: 'bg-amber-500/90 text-white',
      path: '/solucoes/organizacao',
      features: ['Processos organizados', 'Rotinas diárias e semanais', 'Checklists claros', 'Documento final'],
      buttonText: 'Acessar Organização',
      buttonClass: 'bg-amber-500 hover:bg-amber-600',
    },
  ];

  return (
    <AppLayout title="Soluções Digitais">
      <div className="content-premium space-premium">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Soluções Digitais</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Soluções geradas a partir de diagnósticos inteligentes e planejamentos estratégicos do Nexia.
          </p>
        </div>

        {/* Next Step Card */}
        <NextStepCard 
          message="Gerar proposta e mensagem para enviar ao cliente."
          buttonText="Ir para Vendas"
          path="/vendas"
        />

        {/* Nexia Hint */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-lg bg-primary/5 border border-primary/10 max-w-xl mx-auto">
          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            O <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => navigate('/nexia-ai')}>Nexia</span> analisa o negócio e recomenda a solução ideal. Aqui você executa e entrega.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {solutions.map((sol, index) => (
            <PremiumFrame 
              key={sol.id} 
              className="fade-in p-0 overflow-hidden" 
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div 
                className={`group cursor-pointer bg-gradient-to-br ${sol.bgGradient} h-full`}
                onClick={() => navigate(sol.path)}
              >
                {/* Image */}
                <div className="relative h-40 overflow-hidden border-b border-primary/10">
                  <img 
                    src={sol.image} 
                    alt={sol.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <Badge className={`${sol.badgeClass} text-xs border-0 shadow-sm`}>
                      {sol.badgeText}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  {/* Title and Description */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/15`}>
                      <sol.icon className={`h-5 w-5 ${sol.color} icon-glow-subtle`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{sol.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{sol.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                    {sol.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${sol.color.replace('text-', 'bg-')}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Commercial Buttons */}
                  <CommercialButtons solutionId={sol.id} solutionTitle={sol.title} />

                  {/* Button */}
                  <Button 
                    size="default" 
                    className={`gap-2 w-full text-sm ${sol.buttonClass || ''}`}
                  >
                    {sol.buttonText}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </PremiumFrame>
          ))}
        </div>

        {/* Trust Block */}
        <div className="mt-8 text-center p-6 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-sm text-muted-foreground">
            Todas as soluções aqui são <span className="text-foreground font-medium">recomendadas pelo Nexia</span>.
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            O Nexia analisa o negócio, recomenda a solução ideal. Você executa e cobra pelo serviço.
          </p>
        </div>

        {/* Nexia CTA */}
        <div className="mt-6 flex items-center justify-center gap-2 p-4 rounded-lg bg-primary/5 border border-primary/10 max-w-2xl mx-auto">
          <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Não sabe por onde começar? O <span className="text-primary font-medium cursor-pointer hover:underline" onClick={() => navigate('/nexia-ai')}>Nexia</span> analisa o negócio e recomenda a solução certa.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
