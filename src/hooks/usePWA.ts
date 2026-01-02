import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  needsIOSInstruction: boolean;
  hasUpdate: boolean;
}

interface UsePWAReturn extends PWAState {
  installApp: () => Promise<void>;
  dismissIOSPrompt: () => void;
  updateApp: () => void;
}

const IOS_PROMPT_STORAGE_KEY = 'nexia_ios_prompt_dismissed';
const IOS_PROMPT_DAYS = 7;
const UPDATE_CHECK_INTERVAL = 60000; // Check every minute

export function usePWA(): UsePWAReturn {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isDesktop: false,
    isSafari: false,
    needsIOSInstruction: false,
    hasUpdate: false,
  });

  // Detectar plataforma
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isDesktop = !isIOS && !isAndroid;
    
    // Verificar se está em modo standalone (já instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    // Verificar se deve mostrar instruções iOS
    const lastDismissed = localStorage.getItem(IOS_PROMPT_STORAGE_KEY);
    let needsIOSInstruction = false;
    
    if (isIOS && !isStandalone) {
      if (!lastDismissed) {
        needsIOSInstruction = true;
      } else {
        const dismissedDate = new Date(parseInt(lastDismissed));
        const now = new Date();
        const daysDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        needsIOSInstruction = daysDiff >= IOS_PROMPT_DAYS;
      }
    }
    
    setState(prev => ({
      ...prev,
      isIOS,
      isAndroid,
      isDesktop,
      isSafari,
      isInstalled: isStandalone,
      needsIOSInstruction,
    }));
  }, []);

  // Capturar evento beforeinstallprompt (Android/Desktop)
  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Detectar e gerenciar atualizações do Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;

    // Handle controller change (when new SW takes over)
    const handleControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for updates on SW registration
    const checkForUpdates = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Check for updates
        await registration.update();
        
        // Handle waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setState(prev => ({ ...prev, hasUpdate: true }));
        }

        // Listen for new updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setWaitingWorker(newWorker);
              setState(prev => ({ ...prev, hasUpdate: true }));
            }
          });
        });
      } catch (error) {
        console.log('SW update check failed:', error);
      }
    };

    // Initial check
    checkForUpdates();

    // Periodic check for updates
    const intervalId = setInterval(checkForUpdates, UPDATE_CHECK_INTERVAL);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      clearInterval(intervalId);
    };
  }, []);

  const installApp = useCallback(async () => {
    if (!deferredPrompt) {
      console.log('Install prompt not available');
      return;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ 
          ...prev, 
          isInstallable: false, 
          isInstalled: true 
        }));
      }
    } catch (error) {
      console.error('Error installing app:', error);
    }
  }, [deferredPrompt]);

  const dismissIOSPrompt = useCallback(() => {
    localStorage.setItem(IOS_PROMPT_STORAGE_KEY, Date.now().toString());
    setState(prev => ({ ...prev, needsIOSInstruction: false }));
  }, []);

  const updateApp = useCallback(() => {
    if (waitingWorker) {
      // Tell the waiting SW to skip waiting and become active
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      setState(prev => ({ ...prev, hasUpdate: false }));
    } else {
      // Fallback: just reload
      window.location.reload();
    }
  }, [waitingWorker]);

  return {
    ...state,
    installApp,
    dismissIOSPrompt,
    updateApp,
  };
}
