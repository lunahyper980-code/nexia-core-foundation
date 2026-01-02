import { WifiOff, RefreshCw, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OfflineScreenProps {
  onRetry: () => Promise<boolean>;
  isChecking: boolean;
}

export function OfflineScreen({ onRetry, isChecking }: OfflineScreenProps) {
  const handleRetry = async () => {
    const isOnline = await onRetry();
    if (isOnline) {
      // Connection restored, the parent component will handle hiding this screen
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-5">
      <div className="text-center max-w-md w-full">
        {/* Icon container with glow */}
        <div className="mx-auto mb-8 w-28 h-28 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/30">
          <WifiOff className="w-14 h-14 text-primary" />
        </div>
        
        {/* Title */}
        <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Você está offline
        </h1>
        
        {/* Description */}
        <p className="text-muted-foreground mb-8 leading-relaxed">
          Parece que você perdeu a conexão com a internet. Verifique sua conexão e tente novamente.
        </p>
        
        {/* Retry button */}
        <Button 
          onClick={handleRetry}
          disabled={isChecking}
          className="w-full h-12 text-base font-semibold mb-3 shadow-lg shadow-primary/25"
        >
          {isChecking ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Verificando...
            </>
          ) : (
            <>
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar novamente
            </>
          )}
        </Button>
        
        {/* Reload link */}
        <button
          onClick={handleReload}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Recarregar app
        </button>
        
        {/* Branding */}
        <p className="mt-12 text-sm text-muted-foreground/60">
          Powered by <span className="text-primary font-semibold">Nexia Suite</span>
        </p>
      </div>
    </div>
  );
}
