import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebarState } from '@/contexts/SidebarContext';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useUserMode } from '@/contexts/UserModeContext';
import {
  LayoutDashboard,
  Layers,
  Brain,
  Briefcase,
  Package,
  Users,
  Fingerprint,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  GraduationCap,
  UsersRound,
  Smartphone,
  FolderOpen,
  FileText,
  Coins,
  FileSignature,
} from 'lucide-react';
import logoNexia from '@/assets/logo-nexia.png';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo } from 'react';

import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
  mode?: 'simple' | 'advanced' | 'both';
}

// Items for SIMPLE mode
const simpleNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, mode: 'simple' },
  { label: 'Encontrar Clientes', path: '/encontrar-clientes', icon: Search, mode: 'simple' },
  { label: 'Criar App / Site', path: '/solucoes', icon: Smartphone, mode: 'simple' },
  { label: 'Meus Projetos', path: '/hyperbuild/projetos-lista', icon: FolderOpen, mode: 'simple' },
  { label: 'Contratos', path: '/contratos', icon: FileSignature, mode: 'simple' },
  { label: 'Propostas', path: '/vendas/propostas', icon: FileText, mode: 'simple' },
  { label: 'Clientes', path: '/clientes', icon: Users, mode: 'simple' },
  { label: 'Créditos', path: '/creditos', icon: Coins, mode: 'simple' },
  { label: 'Minha Equipe', path: '/admin/equipe', icon: UsersRound, adminOnly: true, mode: 'simple' },
  { label: 'Configurações', path: '/configuracoes', icon: Settings, mode: 'simple' },
];

// Items for ADVANCED mode (current menu)
const advancedNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, mode: 'advanced' },
  { label: 'Encontrar Clientes', path: '/encontrar-clientes', icon: Search, mode: 'advanced' },
  { label: 'Diagnóstico', path: '/nexia-ai', icon: Brain, badge: 'avançado', mode: 'advanced' },
  { label: 'Vendas', path: '/vendas', icon: Briefcase, mode: 'advanced' },
  { label: 'Contratos', path: '/contratos', icon: FileSignature, mode: 'advanced' },
  { label: 'Clientes', path: '/clientes', icon: Users, mode: 'advanced' },
  { label: 'Soluções Digitais', path: '/solucoes', icon: Layers, mode: 'advanced' },
  { label: 'Entrega', path: '/entrega', icon: Package, mode: 'advanced' },
  { label: 'Identidade', path: '/identidade', icon: Fingerprint, mode: 'advanced' },
  { label: 'Histórico / Atividade', path: '/historico', icon: History, mode: 'advanced' },
  { label: 'Academy / Ajuda', path: '/academy', icon: GraduationCap, mode: 'advanced' },
  { label: 'Minha Equipe', path: '/admin/equipe', icon: UsersRound, adminOnly: true, mode: 'advanced' },
  { label: 'Configurações', path: '/configuracoes', icon: Settings, mode: 'advanced' },
];

interface AppSidebarProps {
  forceCollapsed?: boolean;
}

export function AppSidebar({ forceCollapsed = false }: AppSidebarProps) {
  const { collapsed, toggle, setCollapsed } = useSidebarState();
  const { isAdminOrOwner } = useUserRole();
  const { mode } = useUserMode();
  const location = useLocation();

  // Filter nav items based on user role and mode
  const navItems = useMemo(() => {
    const baseItems = mode === 'simple' ? simpleNavItems : advancedNavItems;
    return baseItems.filter(item => !item.adminOnly || isAdminOrOwner);
  }, [isAdminOrOwner, mode]);

  // Force collapsed state on tablet
  useEffect(() => {
    if (forceCollapsed && !collapsed) {
      setCollapsed(true);
    }
  }, [forceCollapsed, collapsed, setCollapsed]);

  const isCollapsed = forceCollapsed || collapsed;

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-foreground/[0.04] bg-sidebar transition-all duration-200',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-2.5 border-b border-foreground/[0.04] p-4 h-14',
        isCollapsed && 'justify-center'
      )}>
        <img src={logoNexia} alt="Nexia Suite" className="w-10 h-10 object-contain" />
        {!isCollapsed && (
          <span className="font-semibold text-sm text-foreground tracking-tight truncate">NEXIA SUITE</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2.5 pt-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          const hasBadge = 'badge' in item && item.badge;

          const linkContent = (
            <NavLink
              to={item.path}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary border border-primary/15'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
                isCollapsed && 'justify-center px-2'
              )}
            >
              <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground')} strokeWidth={1.75} />
              {!isCollapsed && (
                <span className="truncate flex-1 flex items-center gap-2">
                  {item.label}
                  {hasBadge && (
                    <Badge variant="premium" className="text-[10px] px-1.5 py-0 h-4 font-normal">
                      {item.badge}
                    </Badge>
                  )}
                </span>
              )}
            </NavLink>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={8} className="bg-card border-foreground/[0.06] shadow-md text-sm">
                  {item.label} {hasBadge && `(${item.badge})`}
                </TooltipContent>
              </Tooltip>
            );
          }

          return <div key={item.path}>{linkContent}</div>;
        })}
      </nav>

      {/* Toggle Button - Only show on desktop */}
      {!forceCollapsed && (
        <div className="border-t border-foreground/[0.04] p-2.5">
          <button
            onClick={toggle}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground',
              'transition-all duration-150 hover:bg-secondary/60 hover:text-foreground',
              isCollapsed && 'justify-center px-2'
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
                <span>Recolher menu</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
}
