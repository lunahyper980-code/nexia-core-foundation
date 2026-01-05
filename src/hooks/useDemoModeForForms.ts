import { useDemoMode } from '@/contexts/DemoModeContext';
import { useUserRole } from '@/contexts/UserRoleContext';

/**
 * Hook that provides demo mode utilities for forms and AI calls
 * Only admins can use demo mode
 */
export function useDemoModeForForms() {
  const { isDemoMode } = useDemoMode();
  const { isAdmin } = useUserRole();

  // Only return true if user is admin AND demo mode is active
  const demoModeActive = isAdmin && isDemoMode;

  /**
   * Validates a required field
   * In demo mode, allows any value (even empty)
   * In normal mode, requires non-empty value
   */
  const validateRequired = (value: string | undefined | null): boolean => {
    if (demoModeActive) return true;
    return Boolean(value && value.trim().length > 0);
  };

  /**
   * Validates minimum length
   * In demo mode, allows any length
   * In normal mode, requires minimum length
   */
  const validateMinLength = (value: string | undefined | null, minLength: number): boolean => {
    if (demoModeActive) return true;
    return Boolean(value && value.trim().length >= minLength);
  };

  /**
   * Get the demoMode flag to pass to edge functions
   */
  const getDemoModeFlag = (): boolean => {
    return demoModeActive;
  };

  /**
   * Get a fallback value for empty fields in demo mode
   */
  const getFallbackValue = (value: string | undefined | null, fallback: string): string => {
    if (value && value.trim().length > 0) return value;
    if (demoModeActive) return fallback;
    return value || '';
  };

  return {
    isDemoMode: demoModeActive,
    validateRequired,
    validateMinLength,
    getDemoModeFlag,
    getFallbackValue,
  };
}
