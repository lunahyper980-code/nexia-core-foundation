import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useUserRole } from '@/contexts/UserRoleContext';
import logoNexia from '@/assets/logo-nexia.png';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Encontrar Clientes', path: '/encontrar-clientes', icon: Search },
  { label: 'Diagnóstico', path: '/nexia-ai', icon: Brain, badge: 'avançado' },
  { label: 'Vendas', path: '/vendas', icon: Briefcase },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Soluções Digitais', path: '/solucoes', icon: Layers },
  { label: 'Entrega', path: '/entrega', icon: Package },
  { label: 'Identidade', path: '/identidade', icon: Fingerprint },
  { label: 'Histórico / Atividade', path: '/historico', icon: History },
  { label: 'Minha Equipe', path: '/admin/minha-equipe', icon: UsersRound, adminOnly: true },
  { label: 'Academy / Ajuda', path: '/academy', icon: GraduationCap },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];

interface MobileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileDrawer({ open, onOpenChange }: MobileDrawerProps) {
  const location = useLocation();
  const { isAdminOrOwner } = useUserRole();

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdminOrOwner);

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
            {filteredNavItems.map((item) => {
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
