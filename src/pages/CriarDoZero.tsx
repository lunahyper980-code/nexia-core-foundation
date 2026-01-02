import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Wand2, ArrowRight, ArrowLeft, Sparkles, Check, Monitor, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import solutionTypeApp from '@/assets/solution-type-app.png';
import solutionTypeSite from '@/assets/solution-type-site.png';

export default function CriarDoZero() {
  const navigate = useNavigate();

  const options = [
    {
      id: 'app',
      title: 'Aplicativo / SaaS',
      desc: 'Apps, sistemas, plataformas e soluções interativas com autenticação, painel admin e fluxos completos.',
      image: solutionTypeApp,
      icon: Smartphone,
      path: '/solucoes/criar/app',
      features: ['7 etapas', '~5 min', 'Fluxos completos'],
      color: 'primary',
    },
    {
      id: 'site',
      title: 'Site / Página Web',
      desc: 'Landing pages, páginas de venda, sites institucionais e e-commerce com foco em conversão.',
      image: solutionTypeSite,
      icon: Monitor,
      path: '/solucoes/criar/site',
      features: ['6 etapas', '~4 min', 'Alta conversão'],
      color: 'emerald',
    },
  ];

  return (
    <AppLayout title="Criar do Zero">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/solucoes')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Criar do Zero</h1>
            <p className="text-muted-foreground">
              Use o wizard guiado para criar sua solução digital personalizada
            </p>
          </div>
        </div>

        {/* Hero Card */}
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-[hsl(228,12%,10%)] to-[hsl(228,12%,10%)] border border-primary/20 p-8">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mb-6">
              <Wand2 className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Wizard Inteligente
            </h2>
            <p className="text-muted-foreground mb-6">
              Responda perguntas simples sobre sua ideia e receba um prompt profissional 
              pronto para criar seu aplicativo ou site no Lovable.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Não precisa conhecimento técnico</span>
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Type Selection Title */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            O que você quer criar?
          </h3>
        </div>

        {/* Options Grid - Premium Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => navigate(option.path)}
              className={`group relative cursor-pointer rounded-2xl overflow-hidden bg-[hsl(228,12%,10%)] border border-border/50 transition-all duration-300 hover:-translate-y-2 ${
                option.color === 'primary' 
                  ? 'hover:border-primary/50 hover:shadow-[0_0_30px_hsl(268,60%,50%/0.15)]' 
                  : 'hover:border-emerald-500/50 hover:shadow-[0_0_30px_hsl(145,60%,42%/0.15)]'
              }`}
            >
              {/* Image Section */}
              <div className="h-44 relative overflow-hidden">
                <img 
                  src={option.image} 
                  alt={option.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(228,12%,10%)] via-transparent to-transparent" />
                
                {/* Floating Icon Badge */}
                <div className="absolute bottom-4 left-4">
                  <div className={`p-3 rounded-xl backdrop-blur-sm border transition-colors ${
                    option.color === 'primary' 
                      ? 'bg-primary/20 border-primary/20 group-hover:bg-primary/30' 
                      : 'bg-emerald-500/20 border-emerald-500/20 group-hover:bg-emerald-500/30'
                  }`}>
                    <option.icon className={`h-6 w-6 ${option.color === 'primary' ? 'text-primary' : 'text-emerald-500'}`} />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className={`text-xl font-bold text-foreground transition-colors ${
                    option.color === 'primary' ? 'group-hover:text-primary' : 'group-hover:text-emerald-500'
                  }`}>
                    {option.title}
                  </h3>
                  <p className="text-muted-foreground mt-2 text-sm">
                    {option.desc}
                  </p>
                </div>

                {/* Features as mini cards */}
                <div className="flex flex-wrap gap-2">
                  {option.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                        option.color === 'primary'
                          ? 'bg-primary/10 border-primary/20'
                          : 'bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      <Check className={`h-3 w-3 ${option.color === 'primary' ? 'text-primary' : 'text-emerald-500'}`} />
                      <span className={`text-xs ${option.color === 'primary' ? 'text-primary' : 'text-emerald-500'}`}>
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Button 
                  className={`w-full gap-2 transition-shadow ${
                    option.color === 'primary' 
                      ? 'group-hover:shadow-[0_0_20px_hsl(268,60%,50%/0.3)]' 
                      : 'bg-emerald-500 hover:bg-emerald-600 group-hover:shadow-[0_0_20px_hsl(145,60%,42%/0.3)]'
                  }`}
                  variant={option.color === 'primary' ? 'default' : undefined}
                >
                  {option.color === 'primary' ? 'Criar Aplicativo' : 'Criar Site'}
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-br ${
                  option.color === 'primary' ? 'from-primary/5' : 'from-emerald-500/5'
                } via-transparent to-transparent`} />
              </div>
            </div>
          ))}
        </div>

        {/* Info Card */}
        <div className="flex items-start gap-4 p-5 rounded-xl bg-[hsl(228,12%,10%)] border border-border/50">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Wand2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-1">Como funciona?</h4>
            <p className="text-sm text-muted-foreground">
              O wizard faz perguntas simples sobre sua ideia de negócio, público-alvo, 
              funcionalidades desejadas e identidade visual. No final, gera automaticamente 
              um prompt profissional otimizado para criar seu projeto no Lovable.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
