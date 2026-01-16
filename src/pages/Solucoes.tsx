import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Smartphone, Globe, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Solucoes() {
  const navigate = useNavigate();

  return (
    <AppLayout title="Criar App ou Site" hideBreadcrumb>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Criar App ou Site
          </h1>
          <p className="text-muted-foreground text-lg">
            Escolha o que você deseja criar
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
          {/* Card - Criar Aplicativo */}
          <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)] hover:-translate-y-1">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Content */}
            <div className="relative p-8 md:p-10 flex flex-col items-center text-center h-full min-h-[320px] justify-between">
              {/* Icon */}
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <Smartphone className="h-10 w-10 text-primary" />
              </div>

              {/* Text */}
              <div className="flex-1 flex flex-col justify-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Criar Aplicativo
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  Crie um aplicativo profissional sob medida, com painel administrativo e pronto para crescer.
                </p>
              </div>

              {/* Button */}
              <Button 
                size="lg"
                className="w-full gap-2 text-base font-medium group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-shadow"
                onClick={() => navigate('/solucoes/criar/app')}
              >
                Começar Aplicativo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Card - Criar Site */}
          <div className="group relative rounded-2xl overflow-hidden bg-card border border-border/50 transition-all duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(var(--primary)/0.15)] hover:-translate-y-1">
            {/* Gradient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Content */}
            <div className="relative p-8 md:p-10 flex flex-col items-center text-center h-full min-h-[320px] justify-between">
              {/* Icon */}
              <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 mb-6 group-hover:bg-primary/15 group-hover:scale-105 transition-all duration-300">
                <Globe className="h-10 w-10 text-primary" />
              </div>

              {/* Text */}
              <div className="flex-1 flex flex-col justify-center mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  Criar Site
                </h2>
                <p className="text-muted-foreground leading-relaxed max-w-sm">
                  Crie um site moderno, rápido e profissional para o seu negócio.
                </p>
              </div>

              {/* Button */}
              <Button 
                size="lg"
                className="w-full gap-2 text-base font-medium group-hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)] transition-shadow"
                onClick={() => navigate('/solucoes/criar/site')}
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
