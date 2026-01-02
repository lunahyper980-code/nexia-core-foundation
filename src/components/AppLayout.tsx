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
}

export function AppLayout({ children, title }: AppLayoutProps) {
  const { collapsed } = useSidebarState();
  const breakpoint = useBreakpoint();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';

  return (
    <div className="min-h-screen bg-background w-full max-w-full overflow-x-hidden">
      {/* Desktop/Tablet Sidebar */}
      {!isMobile && <AppSidebar forceCollapsed={isTablet} />}

      {/* Mobile Drawer */}
      {isMobile && (
        <MobileDrawer 
          open={mobileDrawerOpen} 
          onOpenChange={setMobileDrawerOpen} 
        />
      )}

      {/* Header */}
      <AppHeader 
        title={title} 
        isMobile={isMobile}
        onMenuClick={() => setMobileDrawerOpen(true)}
      />

      {/* Main Content */}
      <main
        className={cn(
          'pt-16 min-h-screen transition-all duration-300 w-full overflow-x-hidden',
          // Mobile: full width, bottom padding for nav
          isMobile && 'pl-0 pb-20',
          // Tablet: collapsed sidebar padding
          isTablet && 'pl-16',
          // Desktop: dynamic sidebar padding
          !isMobile && !isTablet && (collapsed ? 'pl-16' : 'pl-64')
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
          <GlobalBreadcrumb />
          
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <MobileBottomNav onMenuClick={() => setMobileDrawerOpen(true)} />
      )}
    </div>
  );
}
