import { RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, forwardRef } from 'react';

interface PWAUpdateBannerProps {
  isVisible: boolean;
  onUpdate: () => void;
}

export const PWAUpdateBanner = forwardRef<HTMLDivElement, PWAUpdateBannerProps>(
  function PWAUpdateBanner({ isVisible, onUpdate }, ref) {
    const [dismissed, setDismissed] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!isVisible || dismissed) return null;

    const handleUpdate = () => {
      setIsUpdating(true);
      onUpdate();
    };

    return (
      <div 
        ref={ref}
        className="fixed bottom-4 left-4 right-4 z-[90] animate-in slide-in-from-bottom duration-300"
      >
        <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-xl shadow-primary/10 overflow-hidden">
          <div className="flex items-center gap-3 p-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 text-primary ${isUpdating ? 'animate-spin' : ''}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground text-sm">
                Nova versão disponível
              </p>
              <p className="text-xs text-muted-foreground">
                Toque para atualizar
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDismissed(true)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                disabled={isUpdating}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
              <Button 
                onClick={handleUpdate}
                size="sm"
                className="font-medium"
                disabled={isUpdating}
              >
                {isUpdating ? 'Atualizando...' : 'Atualizar'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
