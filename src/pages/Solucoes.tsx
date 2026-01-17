import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Import images
import solutionTypeApp from '@/assets/solution-type-app.png';
import solutionTypeSite from '@/assets/solution-type-site.png';

export default function Solucoes() {
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
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 -z-10" />
            
            {/* Image Container */}
            <div className="relative h-52 md:h-64 overflow-hidden bg-gradient-to-br from-surface-dark to-background">
              <img 
                src={solutionTypeApp} 
                alt="Aplicativo" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            
            {/* Content */}
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
            <div className="relative h-52 md:h-64 overflow-hidden bg-gradient-to-br from-surface-dark to-background">
              <img 
                src={solutionTypeSite} 
                alt="Site" 
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            </div>
            
            {/* Content */}
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
