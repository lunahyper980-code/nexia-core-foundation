import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Search,
  Brain,
  Briefcase,
  Menu,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Buscar', path: '/encontrar-clientes', icon: Search },
  { label: 'Diagnóstico', path: '/nexia-ai', icon: Brain },
  { label: 'Vendas', path: '/vendas', icon: Briefcase },
];

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

export function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const location = useLocation();

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
