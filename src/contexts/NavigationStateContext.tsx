import { createContext, useContext, useCallback, useEffect, ReactNode } from 'react';

// Module keys for navigation state persistence
export type ModuleKey = 
  | 'prospeccao'
  | 'diagnostico'
  | 'posicionamento'
  | 'organizacao'
  | 'kit-lancamento'
  | 'autoridade'
  | 'planejamento'
  | 'briefing'
  | 'briefing-rapido'
  | 'modo-simples'
  | 'contrato-nexia'
  | 'contrato-hyperbuild'
  | 'criar-app'
  | 'criar-site'
  | 'materializar'
  | 'proposta'
  | 'proposta-wizard'
  | 'contrato'
  | 'contrato-wizard'
  | 'entrega-form'
  | 'vendas'
  | 'entrega'
  | 'academy'
  | 'clientes'
  | 'abordagem';

interface ModuleState {
  currentStep?: number;
  subScreen?: string;
  selectedTab?: string;
  formData?: Record<string, any>;
  scrollPosition?: number;
  extras?: Record<string, any>;
  lastUpdated?: number;
}

interface NavigationStateContextType {
  getModuleState: (moduleKey: ModuleKey) => ModuleState | null;
  setModuleState: (moduleKey: ModuleKey, state: Partial<ModuleState>) => void;
  updateModuleState: (moduleKey: ModuleKey, updates: Partial<ModuleState>) => void;
  clearModuleState: (moduleKey: ModuleKey) => void;
  clearAllStates: () => void;
}

const NavigationStateContext = createContext<NavigationStateContextType | undefined>(undefined);

const STORAGE_PREFIX = 'nexia_nav_';
const STATE_TTL_MS = 30 * 60 * 1000; // 30 minutes TTL for stale states

function getStorageKey(moduleKey: ModuleKey): string {
  return `${STORAGE_PREFIX}${moduleKey}`;
}

function loadFromStorage(moduleKey: ModuleKey): ModuleState | null {
  try {
    const stored = sessionStorage.getItem(getStorageKey(moduleKey));
    if (!stored) return null;
    
    const parsed = JSON.parse(stored) as ModuleState;
    
    // Check if state is stale (older than TTL)
    if (parsed.lastUpdated && Date.now() - parsed.lastUpdated > STATE_TTL_MS) {
      sessionStorage.removeItem(getStorageKey(moduleKey));
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(moduleKey: ModuleKey, state: ModuleState): void {
  try {
    const stateWithTimestamp = {
      ...state,
      lastUpdated: Date.now(),
    };
    sessionStorage.setItem(getStorageKey(moduleKey), JSON.stringify(stateWithTimestamp));
  } catch (error) {
    console.warn('Failed to save navigation state:', error);
  }
}

export function NavigationStateProvider({ children }: { children: ReactNode }) {
  
  const getModuleState = useCallback((moduleKey: ModuleKey): ModuleState | null => {
    return loadFromStorage(moduleKey);
  }, []);

  const setModuleState = useCallback((moduleKey: ModuleKey, state: Partial<ModuleState>): void => {
    saveToStorage(moduleKey, state as ModuleState);
  }, []);

  const updateModuleState = useCallback((moduleKey: ModuleKey, updates: Partial<ModuleState>): void => {
    const current = loadFromStorage(moduleKey) || {};
    const merged = {
      ...current,
      ...updates,
      formData: updates.formData 
        ? { ...(current.formData || {}), ...updates.formData }
        : current.formData,
      extras: updates.extras
        ? { ...(current.extras || {}), ...updates.extras }
        : current.extras,
    };
    saveToStorage(moduleKey, merged);
  }, []);

  const clearModuleState = useCallback((moduleKey: ModuleKey): void => {
    sessionStorage.removeItem(getStorageKey(moduleKey));
  }, []);

  const clearAllStates = useCallback((): void => {
    // Clear all navigation states
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  // Clear states on logout (listen to auth changes)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // If auth token is removed, clear navigation states
      if (e.key === 'supabase.auth.token' && e.newValue === null) {
        clearAllStates();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAllStates]);

  return (
    <NavigationStateContext.Provider value={{
      getModuleState,
      setModuleState,
      updateModuleState,
      clearModuleState,
      clearAllStates,
    }}>
      {children}
    </NavigationStateContext.Provider>
  );
}

export function useNavigationStateContext() {
  const context = useContext(NavigationStateContext);
  if (context === undefined) {
    throw new Error('useNavigationStateContext must be used within a NavigationStateProvider');
  }
  return context;
}
