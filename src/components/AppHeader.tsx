import { useAuth } from '@/contexts/AuthContext';
import { useSidebarState } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Menu, LogOut, User, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';
import logoNexia from '@/assets/logo-nexia.png';

interface AppHeaderProps {
  title: string;
  isMobile?: boolean;
  onMenuClick?: () => void;
}

export function AppHeader({ title, isMobile = false, onMenuClick }: AppHeaderProps) {
  const { user, signOut } = useAuth();
  const { collapsed } = useSidebarState();
  const navigate = useNavigate();

  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header
      className={cn(
        'fixed top-0 right-0 z-30 flex h-14 items-center justify-between',
        'border-b border-foreground/[0.04] bg-background/95 backdrop-blur-lg px-4 sm:px-6',
        'transition-all duration-200',
        // Mobile: full width
        isMobile && 'left-0',
        // Desktop/Tablet: offset for sidebar
        !isMobile && (collapsed ? 'left-16' : 'left-64')
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Mobile menu button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>
        )}
        
        {/* Title - truncate on mobile */}
        <h1 className={cn(
          'font-semibold text-foreground truncate tracking-tight',
          isMobile ? 'text-sm' : 'text-base'
        )}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full flex-shrink-0 transition-all">
            <Avatar className="h-8 w-8 border border-foreground/[0.06]">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          className="w-52 bg-card border-foreground/[0.06] shadow-lg z-50"
        >
          <div className="flex items-center gap-3 p-3">
            <Avatar className="h-9 w-9 border border-foreground/[0.06] flex-shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-medium text-xs">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden min-w-0">
              <span className="text-sm font-medium truncate">
                {user?.user_metadata?.full_name || 'Usuário'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {user?.email}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-foreground/[0.04]" />
          <DropdownMenuItem 
            onClick={() => navigate('/configuracoes')}
            className="cursor-pointer hover:bg-secondary text-sm"
          >
            <User className="mr-2 h-3.5 w-3.5" />
            Meu perfil
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => navigate('/configuracoes')}
            className="cursor-pointer hover:bg-secondary text-sm"
          >
            <Settings className="mr-2 h-3.5 w-3.5" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-foreground/[0.04]" />
          <DropdownMenuItem 
            onClick={handleSignOut} 
            className="text-destructive focus:text-destructive cursor-pointer text-sm"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" />
            Sair
          </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
