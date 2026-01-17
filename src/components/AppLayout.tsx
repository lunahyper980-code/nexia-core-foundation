import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileDrawer } from './MobileDrawer';
import { GlobalBreadcrumb } from './GlobalBreadcrumb';
import { useSidebarState } from '@/contexts/SidebarContext';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  hideBreadcrumb?: boolean;
  hideNavigation?: boolean;
}

export function AppLayout({ children, title, hideBreadcrumb = false, hideNavigation = false }: AppLayoutProps) {
  const { collapsed } = useSidebarState();
  const breakpoint = useBreakpoint();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Desktop/Tablet Sidebar - Hidden when hideNavigation is true */}
      <div className={`transition-all duration-500 ${hideNavigation ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100'}`}>
        {!isMobile && <AppSidebar forceCollapsed={isTablet} />}
      </div>

      {/* Mobile Drawer - Blocked when hideNavigation is true */}
      {isMobile && !hideNavigation && (
        <MobileDrawer 
          open={mobileDrawerOpen} 
          onOpenChange={setMobileDrawerOpen} 
        />
      )}

      {/* Header - Hidden when hideNavigation is true */}
      <div className={`transition-all duration-500 ${hideNavigation ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100'}`}>
        <AppHeader 
          title={title} 
          isMobile={isMobile}
          onMenuClick={() => setMobileDrawerOpen(true)}
        />
      </div>

      {/* Main Content */}
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-500 w-full overflow-x-hidden',
          // When navigation is hidden, remove padding
          hideNavigation && 'pl-0 pt-0',
          // Mobile: full width, bottom padding for nav (unless hidden)
          isMobile && !hideNavigation && 'pl-0 pb-20',
          isMobile && hideNavigation && 'pl-0 pb-0',
          // Tablet: collapsed sidebar padding
          !hideNavigation && isTablet && 'pl-16',
          // Desktop: dynamic sidebar padding
          !hideNavigation && !isMobile && !isTablet && (collapsed ? 'pl-16' : 'pl-64')
        )}
      >
        {/* Full-width centered container for SaaS premium layout */}
        <div className={cn(
          'mx-auto w-full animate-fade-in',
          // Max-width constraint for desktop - larger for more content space
          !isMobile && 'max-w-[1400px]',
          // Responsive padding - minimal top padding for tight layout
          isMobile ? 'px-4 py-2' : isTablet ? 'px-6 py-2' : 'px-10 py-3'
        )}>
          {/* Global Breadcrumb */}
          {!hideBreadcrumb && <GlobalBreadcrumb />}
          
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden when hideNavigation is true */}
      <div className={`transition-all duration-500 ${hideNavigation ? 'opacity-0 pointer-events-none translate-y-full' : 'opacity-100'}`}>
        {isMobile && (
          <MobileBottomNav onMenuClick={() => setMobileDrawerOpen(true)} />
        )}
      </div>
    </div>
  );
}
