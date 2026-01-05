/**
 * Hook placeholder for route loader.
 * 
 * SMART BEHAVIOR:
 * - Does NOT trigger loader on route changes anymore
 * - Route transitions are instant in most SPAs
 * - Loader is now controlled ONLY by:
 *   1. useSmartLoader().withLoader() for async operations (AI, PDF, etc)
 *   2. Manual loader.start()/stop() calls
 *   3. Heavy data fetching with explicit loading states
 * 
 * This prevents the loader from appearing on every navigation.
 */
export function useRouteLoader() {
  // Intentionally empty - no automatic route loading
  // Loader should only appear for real async operations
}
