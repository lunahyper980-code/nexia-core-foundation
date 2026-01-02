import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AndroidInstallBannerProps {
  isVisible: boolean;
  onInstall: () => Promise<void>;
  onDismiss: () => void;
}

const ANDROID_BANNER_STORAGE_KEY = 'nexia_android_banner_dismissed';
const ANDROID_BANNER_DAYS = 1; // Show again after 1 day

export function AndroidInstallBanner({ isVisible, onInstall, onDismiss }: AndroidInstallBannerProps) {
  const [show, setShow] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setShow(false);
      return;
    }

    // Check if user dismissed recently
    const lastDismissed = localStorage.getItem(ANDROID_BANNER_STORAGE_KEY);
    if (lastDismissed) {
      const dismissedDate = new Date(parseInt(lastDismissed));
      const now = new Date();
      const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff < ANDROID_BANNER_DAYS) {
        return;
      }
    }

    // Small delay to avoid showing immediately on page load
    const timer = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  const handleDismiss = () => {
    localStorage.setItem(ANDROID_BANNER_STORAGE_KEY, Date.now().toString());
    setShow(false);
    onDismiss();
  };

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await onInstall();
      setShow(false);
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-md mx-auto bg-card border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Header with close button */}
        <div className="relative bg-gradient-to-r from-primary/20 to-primary/5 p-4 pb-3">
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-background/50 hover:bg-background/80 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-white">NS</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground text-base">Instalar Nexia Suite</h3>
              <p className="text-sm text-muted-foreground">Acesse rápido pela tela inicial</p>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-4 pt-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Smartphone className="w-4 h-4" />
            <span>Funciona offline • Sem ocupar espaço</span>
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleDismiss}
            >
              Agora não
            </Button>
            <Button
              className="flex-1"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Instalando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Instalar
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
