import { createContext, useContext, ReactNode, useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { IOSInstallOverlay } from './IOSInstallOverlay';
import { PWAUpdateBanner } from './PWAUpdateBanner';
import { OfflineScreen } from './OfflineScreen';
import { AndroidInstallBanner } from './AndroidInstallBanner';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  showIOSInstructions: () => void;
}

const PWAContext = createContext<PWAContextType | null>(null);

export function usePWAContext() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWAContext must be used within PWAProvider');
  }
  return context;
}

interface PWAProviderProps {
  children: ReactNode;
}

export function PWAProvider({ children }: PWAProviderProps) {
  const pwa = usePWA();
  const network = useNetworkStatus();
  const [androidBannerDismissed, setAndroidBannerDismissed] = useState(false);

  const showIOSInstructions = () => {
    // Trigger iOS overlay manually if needed
    if (pwa.isIOS && !pwa.isInstalled) {
      // Reset the localStorage to show the overlay
      localStorage.removeItem('nexia_ios_prompt_dismissed');
      window.location.reload();
    }
  };

  const contextValue: PWAContextType = {
    isInstallable: pwa.isInstallable,
    isInstalled: pwa.isInstalled,
    isIOS: pwa.isIOS,
    isAndroid: pwa.isAndroid,
    isDesktop: pwa.isDesktop,
    isOnline: network.isOnline,
    installApp: pwa.installApp,
    showIOSInstructions,
  };

  // Show Android banner when: Android device + installable + not installed + online + not dismissed
  const showAndroidBanner = pwa.isAndroid && pwa.isInstallable && !pwa.isInstalled && network.isOnline && !androidBannerDismissed;

  return (
    <PWAContext.Provider value={contextValue}>
      {children}
      
      {/* Offline Screen - Only show when truly offline */}
      {!network.isOnline && (
        <OfflineScreen 
          onRetry={network.retry}
          isChecking={network.isChecking}
        />
      )}
      
      {/* iOS Install Instructions Overlay */}
      {network.isOnline && (
        <IOSInstallOverlay 
          isOpen={pwa.needsIOSInstruction} 
          onClose={pwa.dismissIOSPrompt}
        />
      )}
      
      {/* Android Install Banner - Shows automatically when installable */}
      <AndroidInstallBanner
        isVisible={showAndroidBanner}
        onInstall={pwa.installApp}
        onDismiss={() => setAndroidBannerDismissed(true)}
      />
      
      {/* Update Available Banner */}
      {network.isOnline && (
        <PWAUpdateBanner 
          isVisible={pwa.hasUpdate} 
          onUpdate={pwa.updateApp}
        />
      )}
    </PWAContext.Provider>
  );
}
