import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useUserMode } from '@/contexts/UserModeContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useMemo } from 'react';
import {
  LayoutDashboard,
  Search,
  Brain,
  Users,
  History,
  Menu,
  User,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  mode: 'simple' | 'advanced' | 'both';
  adminOnly?: boolean;
}

// SIMPLE mode: Dashboard, Buscar, Clientes, Histórico, Perfil
const simpleNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, mode: 'simple' },
  { label: 'Buscar', path: '/encontrar-clientes', icon: Search, mode: 'simple' },
  { label: 'Clientes', path: '/clientes', icon: Users, mode: 'simple' },
  { label: 'Histórico', path: '/historico', icon: History, mode: 'simple' },
];

// ADVANCED mode: Dashboard, Buscar, Diagnóstico, Clientes, Perfil
const advancedNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, mode: 'advanced' },
  { label: 'Buscar', path: '/encontrar-clientes', icon: Search, mode: 'advanced' },
  { label: 'Diagnóstico', path: '/nexia-ai', icon: Brain, mode: 'advanced', adminOnly: true },
  { label: 'Clientes', path: '/clientes', icon: Users, mode: 'advanced' },
];

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const location = useLocation();
  const { mode } = useUserMode();
  const { isAdminOrOwner } = useUserRole();

  // Filter nav items based on mode and user role
  const navItems = useMemo(() => {
    const baseItems = mode === 'simple' ? simpleNavItems : advancedNavItems;
    // Filter out admin-only items for non-admin users
    return baseItems.filter(item => !item.adminOnly || isAdminOrOwner);
  }, [mode, isAdminOrOwner]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-pb">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-transform',
                isActive && 'scale-110'
              )} />
              <span className="text-[10px] font-medium truncate max-w-[56px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
        
        {/* Menu button for more options */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-muted-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
}
