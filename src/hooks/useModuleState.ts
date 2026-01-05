import { useCallback, useEffect, useRef } from 'react';
import { useNavigationStateContext, ModuleKey } from '@/contexts/NavigationStateContext';

interface UseModuleStateOptions {
  /** Auto-restore state on mount */
  autoRestore?: boolean;
  /** Debounce delay for saving form data (ms) */
  saveDelay?: number;
}

interface ModuleStateResult {
  currentStep?: number;
  subScreen?: string;
  selectedTab?: string;
  formData?: Record<string, any>;
  extras?: Record<string, any>;
}

interface ModuleStateReturn {
  /** Get the current saved state for this module */
  getSavedState: () => ModuleStateResult | null;
  
  /** Save current step */
  saveStep: (step: number) => void;
  
  /** Save current sub-screen */
  saveSubScreen: (subScreen: string) => void;
  
  /** Save selected tab */
  saveTab: (tab: string) => void;
  
  /** Save form data (debounced) */
  saveFormData: (data: Record<string, any>) => void;
  
  /** Save extra data */
  saveExtras: (extras: Record<string, any>) => void;
  
  /** Clear all saved state for this module */
  clearState: () => void;
  
  /** Restore state and return it */
  restoreState: () => ModuleStateResult | null;
}

export function useModuleState(
  moduleKey: ModuleKey,
  options: UseModuleStateOptions = {}
): ModuleStateReturn {
  const { autoRestore = false, saveDelay = 300 } = options;
  const { getModuleState, updateModuleState, clearModuleState } = useNavigationStateContext();
  
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const pendingFormDataRef = useRef<Record<string, any>>({});

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Save any pending data before unmount
        if (Object.keys(pendingFormDataRef.current).length > 0) {
          updateModuleState(moduleKey, { formData: pendingFormDataRef.current });
        }
      }
    };
  }, [moduleKey, updateModuleState]);

  const getSavedState = useCallback((): ModuleStateResult | null => {
    return getModuleState(moduleKey);
  }, [moduleKey, getModuleState]);

  const saveStep = useCallback((step: number) => {
    updateModuleState(moduleKey, { currentStep: step });
  }, [moduleKey, updateModuleState]);

  const saveSubScreen = useCallback((subScreen: string) => {
    updateModuleState(moduleKey, { subScreen });
  }, [moduleKey, updateModuleState]);

  const saveTab = useCallback((tab: string) => {
    updateModuleState(moduleKey, { selectedTab: tab });
  }, [moduleKey, updateModuleState]);

  const saveFormData = useCallback((data: Record<string, any>) => {
    // Merge with pending data
    pendingFormDataRef.current = { ...pendingFormDataRef.current, ...data };
    
    // Debounce the save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      updateModuleState(moduleKey, { formData: pendingFormDataRef.current });
      pendingFormDataRef.current = {};
    }, saveDelay);
  }, [moduleKey, updateModuleState, saveDelay]);

  const saveExtras = useCallback((extras: Record<string, any>) => {
    updateModuleState(moduleKey, { extras });
  }, [moduleKey, updateModuleState]);

  const clearState = useCallback(() => {
    clearModuleState(moduleKey);
    pendingFormDataRef.current = {};
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, [moduleKey, clearModuleState]);

  const restoreState = useCallback((): ModuleStateResult | null => {
    return getModuleState(moduleKey);
  }, [moduleKey, getModuleState]);

  // Auto-restore on mount if enabled
  useEffect(() => {
    if (autoRestore) {
      restoreState();
    }
  }, [autoRestore, restoreState]);

  return {
    getSavedState,
    saveStep,
    saveSubScreen,
    saveTab,
    saveFormData,
    saveExtras,
    clearState,
    restoreState,
  };
}
