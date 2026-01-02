import { X, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IOSInstallOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function IOSInstallOverlay({ isOpen, onClose }: IOSInstallOverlayProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-md">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors z-10"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Card */}
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
          {/* Header with glow */}
          <div className="relative px-6 pt-8 pb-6 text-center">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent" />
            
            {/* App icon */}
            <div className="relative mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                NS
              </span>
            </div>
            
            <h2 className="relative text-2xl font-bold text-foreground mb-2">
              Instalar Nexia Suite
            </h2>
            <p className="relative text-muted-foreground text-sm">
              Adicione o app à sua tela inicial para acesso rápido
            </p>
          </div>

          {/* Instructions */}
          <div className="px-6 pb-6 space-y-4">
            {/* Step 1 */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Share className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  1. Toque em Compartilhar
                </p>
                <p className="text-sm text-muted-foreground">
                  Na barra inferior do Safari, toque no ícone de compartilhamento
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-border">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground mb-1">
                  2. Adicionar à Tela de Início
                </p>
                <p className="text-sm text-muted-foreground">
                  Role para baixo e toque em "Adicionar à Tela de Início"
                </p>
              </div>
            </div>

            {/* Visual indicator */}
            <div className="flex justify-center pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span>Safari no iPhone ou iPad</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <Button 
              onClick={onClose} 
              className="w-full h-12 text-base font-semibold"
              variant="default"
            >
              Entendi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
