import { Link } from 'react-router-dom';
import { ChevronRight, Home, Smartphone, Globe, Palette, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
}

interface CreationBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function CreationBreadcrumb({ items, className }: CreationBreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-1 text-sm text-muted-foreground overflow-x-auto pb-2",
        className
      )}
    >
      <ol className="flex items-center gap-1 flex-wrap">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
            )}
            {item.current ? (
              <span 
                className="flex items-center gap-1.5 font-medium text-foreground whitespace-nowrap"
                aria-current="page"
              >
                {item.icon}
                {item.label}
              </span>
            ) : item.href ? (
              <Link 
                to={item.href}
                className="flex items-center gap-1.5 hover:text-foreground transition-colors whitespace-nowrap"
              >
                {item.icon}
                {item.label}
              </Link>
            ) : (
              <span className="flex items-center gap-1.5 whitespace-nowrap">
                {item.icon}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// Pre-built breadcrumb configs
export const getBreadcrumbForApp = (currentPage: 'hub' | 'template' | 'scratch') => {
  const base: BreadcrumbItem[] = [
    { label: 'Soluções', href: '/solucoes', icon: <Home className="h-3.5 w-3.5" /> },
    { label: 'App / SaaS', href: currentPage === 'hub' ? undefined : '/solucoes/criar/app', icon: <Smartphone className="h-3.5 w-3.5" />, current: currentPage === 'hub' },
  ];

  if (currentPage === 'template') {
    base[1].current = false;
    base.push({ label: 'Modelo Pronto', icon: <Palette className="h-3.5 w-3.5" />, current: true });
  } else if (currentPage === 'scratch') {
    base[1].current = false;
    base.push({ label: 'Criar do Zero', icon: <Wand2 className="h-3.5 w-3.5" />, current: true });
  }

  return base;
};

export const getBreadcrumbForSite = (currentPage: 'hub' | 'template' | 'scratch') => {
  const base: BreadcrumbItem[] = [
    { label: 'Soluções', href: '/solucoes', icon: <Home className="h-3.5 w-3.5" /> },
    { label: 'Site / Página', href: currentPage === 'hub' ? undefined : '/solucoes/criar/site', icon: <Globe className="h-3.5 w-3.5" />, current: currentPage === 'hub' },
  ];

  if (currentPage === 'template') {
    base[1].current = false;
    base.push({ label: 'Modelo Pronto', icon: <Palette className="h-3.5 w-3.5" />, current: true });
  } else if (currentPage === 'scratch') {
    base[1].current = false;
    base.push({ label: 'Criar do Zero', icon: <Wand2 className="h-3.5 w-3.5" />, current: true });
  }

  return base;
};
