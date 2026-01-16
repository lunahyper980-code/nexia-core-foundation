import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images
import solutionTypeApp from '@/assets/solution-type-app.png';
import solutionTypeSite from '@/assets/solution-type-site.png';

export default function Solucoes() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Criar App ou Site" hideBreadcrumb>
      <div className="flex flex-col items-center justify-start min-h-[calc(100vh-140px)] px-4 pt-8 md:pt-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              O que você deseja criar?
            </h1>
          </div>
          <p className="text-lg md:text-xl font-medium">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Seu aplicativo ou site começa aqui
            </span>
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 w-full max-w-5xl">
          {/* Card - Criar Aplicativo */}
          <div 
            className="group relative rounded-2xl overflow-hidden bg-card/50 backdrop-blur-sm border border-border/30 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_60px_hsl(var(--primary)/0.2)] hover:scale-[1.02] cursor-pointer"
            onClick={() => navigate('/solucoes/criar/app')}
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            
            {/* Image Container */}
            <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-surface-dark to-background">
              <img 
                src={solutionTypeApp} 
                alt="Aplicativo" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                Criar Aplicativo
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Crie um aplicativo profissional sob medida, com painel administrativo e pronto para escalar.
              </p>

              {/* Button */}
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
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            
            {/* Image Container */}
            <div className="relative h-48 md:h-56 overflow-hidden bg-gradient-to-br from-surface-dark to-background">
              <img 
                src={solutionTypeSite} 
                alt="Site" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            
            {/* Content */}
            <div className="relative p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                Criar Site
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Crie um site moderno, rápido e profissional para o seu negócio.
              </p>

              {/* Button */}
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
