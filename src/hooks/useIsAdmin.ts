import { useAuth } from '@/contexts/AuthContext';

export function useIsAdmin() {
  const { user } = useAuth();
  
  // Check if user email matches admin criteria
  const isAdmin = user?.email?.includes('@nexia') || user?.email === 'admin@nexia.com';
  
  return { isAdmin };
}
