import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserRole } from '@/contexts/UserRoleContext';
import { useUserMode } from '@/contexts/UserModeContext';
import { useMemo } from 'react';
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
  Search,
  GraduationCap,
  UsersRound,
  Smartphone,
  FolderOpen,
  Coins,
  FileSignature,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import logoNexia from '@/assets/logo-nexia.png';
import { LucideIcon } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  adminOnly?: boolean;
  mode: 'simple' | 'advanced' | 'both';
}

// Items for SIMPLE mode
const simpleNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, mode: 'simple' },
  { label: 'Encontrar Clientes', path: '/encontrar-clientes', icon: Search, mode: 'simple' },
  { label: 'Criar App / Site', path: '/solucoes', icon: Smartphone, mode: 'simple' },
  { label: 'Meus Projetos', path: '/hyperbuild/projetos-lista', icon: FolderOpen, mode: 'simple' },
  { label: 'Contratos', path: '/contratos', icon: FileSignature, mode: 'simple' },
  { label: 'Clientes', path: '/clientes', icon: Users, mode: 'simple' },
  { label: 'Histórico / Atividade', path: '/historico', icon: History, mode: 'simple' },
  { label: 'Academy', path: '/academy', icon: GraduationCap, mode: 'simple' },
  { label: 'Créditos', path: '/creditos', icon: Coins, mode: 'simple' },
  { label: 'Minha Equipe', path: '/admin/equipe', icon: UsersRound, adminOnly: true, mode: 'simple' },
  { label: 'Configurações', path: '/configuracoes', icon: Settings, mode: 'simple' },
];

// Items for ADVANCED mode
// IMPORTANTE: Contratos NÃO é item separado no modo avançado - está dentro de Vendas
const advancedNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, mode: 'advanced' },
  { label: 'Encontrar Clientes', path: '/encontrar-clientes', icon: Search, mode: 'advanced' },
  { label: 'Diagnóstico', path: '/nexia-ai', icon: Brain, badge: 'avançado', adminOnly: true, mode: 'advanced' },
  { label: 'Vendas', path: '/vendas', icon: Briefcase, mode: 'advanced' },
  { label: 'Clientes', path: '/clientes', icon: Users, mode: 'advanced' },
  { label: 'Soluções Digitais', path: '/solucoes', icon: Layers, adminOnly: true, mode: 'advanced' },
  { label: 'Entrega', path: '/entrega', icon: Package, adminOnly: true, mode: 'advanced' },
  { label: 'Identidade', path: '/identidade', icon: Fingerprint, mode: 'advanced' },
  { label: 'Histórico / Atividade', path: '/historico', icon: History, mode: 'advanced' },
  { label: 'Academy / Ajuda', path: '/academy', icon: GraduationCap, mode: 'advanced' },
  { label: 'Minha Equipe', path: '/admin/equipe', icon: UsersRound, adminOnly: true, mode: 'advanced' },
  { label: 'Configurações', path: '/configuracoes', icon: Settings, mode: 'advanced' },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const location = useLocation();
  const { isAdminOrOwner } = useUserRole();
  const { mode } = useUserMode();

  // Filter nav items based on mode and user role
  const navItems = useMemo(() => {
    const baseItems = mode === 'simple' ? simpleNavItems : advancedNavItems;
    // Filter out admin-only items for non-admin users
    return baseItems.filter(item => !item.adminOnly || isAdminOrOwner);
  }, [mode, isAdminOrOwner]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[280px] p-0 bg-sidebar border-r border-border">
        <SheetHeader className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoNexia} alt="Nexia Suite" className="w-9 h-9 object-contain" />
              <SheetTitle className="font-bold text-lg text-foreground">NEXIA SUITE</SheetTitle>
            </div>
          </div>
        </SheetHeader>
        
        <ScrollArea className="flex-1 h-[calc(100vh-80px)]">
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
              const Icon = item.icon;
              const hasBadge = 'badge' in item && item.badge;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => onOpenChange(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary-foreground')} />
                  <span className="truncate flex-1 flex items-center gap-2">
                    {item.label}
                    {hasBadge && (
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary font-normal"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
