import { useDemoMode } from '@/contexts/DemoModeContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { MonitorPlay } from 'lucide-react';

export function DemoModeBadge() {
  const { isDemoMode } = useDemoMode();
  const { isAdmin } = useUserRole();

  // Only show badge if demo mode is active AND user is admin
  if (!isDemoMode || !isAdmin) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/90 text-white text-xs font-medium shadow-lg backdrop-blur-sm">
        <MonitorPlay className="h-3 w-3" />
        <span>Sessão de Demonstração Ativa</span>
      </div>
    </div>
  );
}
