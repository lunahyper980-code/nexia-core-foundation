import { useRouteLoader } from '@/hooks/useRouteLoader';

/**
 * Component that wraps the app content and triggers the global loader on route changes.
 * Must be placed inside BrowserRouter and GlobalLoaderProvider.
 */
export function RouteLoaderWrapper({ children }: { children: React.ReactNode }) {
  useRouteLoader();
  return <>{children}</>;
}
