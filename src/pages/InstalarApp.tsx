import { 
  Smartphone, 
  CheckCircle2, 
  Download, 
  Apple, 
  Share, 
  Plus,
  Monitor,
  Zap,
  Wifi,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWAContext } from '@/components/pwa';
import { useNavigate } from 'react-router-dom';

export default function InstalarApp() {
  const navigate = useNavigate();
  const { isInstalled, isInstallable, isIOS, isAndroid, isDesktop, installApp, showIOSInstructions } = usePWAContext();

  const handleInstall = async () => {
    if (isIOS) {
      showIOSInstructions();
    } else if (isInstallable) {
      await installApp();
    }
  };

  const benefits = [
    { icon: Zap, title: 'Acesso Rápido', description: 'Abra direto da tela inicial' },
    { icon: Wifi, title: 'Funciona Offline', description: 'Use mesmo sem internet' },
    { icon: Bell, title: 'Notificações', description: 'Receba alertas importantes' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <button 
            onClick={() => navigate(-1)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          {/* App Icon */}
          <div className="mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-6 shadow-2xl shadow-primary/30">
            <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              NS
            </span>
          </div>

          <h1 className="text-3xl font-bold text-foreground mb-3">
            Instalar Nexia Suite
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Adicione o app à sua tela inicial para uma experiência completa
          </p>
        </div>

        {/* Status Card */}
        <div className="mb-8">
          {isInstalled ? (
            <div className="p-6 rounded-2xl bg-success/10 border border-success/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">App já instalado!</h3>
                  <p className="text-sm text-muted-foreground">
                    O Nexia Suite já está na sua tela inicial
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  {isIOS ? (
                    <Apple className="w-6 h-6 text-primary" />
                  ) : isAndroid ? (
                    <Smartphone className="w-6 h-6 text-primary" />
                  ) : (
                    <Monitor className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {isIOS ? 'iPhone / iPad' : isAndroid ? 'Android' : 'Desktop'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isIOS 
                      ? 'Siga as instruções para instalar'
                      : isInstallable 
                        ? 'Pronto para instalar' 
                        : 'Instalação disponível no Chrome'
                    }
                  </p>
                </div>
              </div>

              <Button 
                onClick={handleInstall}
                className="w-full h-12 text-base font-semibold"
                disabled={!isIOS && !isInstallable}
              >
                <Download className="w-5 h-5 mr-2" />
                {isIOS ? 'Ver instruções de instalação' : 'Instalar Agora'}
              </Button>
            </div>
          )}
        </div>

        {/* iOS Instructions (always visible for iOS) */}
        {isIOS && !isInstalled && (
          <div className="mb-8 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Como instalar no iOS</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  1
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Share className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Toque em Compartilhar</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Na barra inferior do Safari, toque no ícone de compartilhamento (quadrado com seta)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  2
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Plus className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Adicionar à Tela de Início</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Role para baixo e toque em "Adicionar à Tela de Início"
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  3
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Confirme a instalação</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Toque em "Adicionar" no canto superior direito
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Benefícios do app</h2>
          
          <div className="grid gap-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            O app funciona em qualquer dispositivo moderno com navegador atualizado
          </p>
        </div>
      </div>
    </div>
  );
}
