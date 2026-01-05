import { ReactNode } from 'react';
import { useAccessControl } from '@/hooks/useAccessControl';
import { useUserRole } from '@/contexts/UserRoleContext';
import { AccessPendingScreen } from './AccessPendingScreen';
import { AccessBlockedScreen } from './AccessBlockedScreen';
import { NexiaLoader } from '@/components/ui/nexia-loader';

interface AccessGuardProps {
  children: ReactNode;
}

export function AccessGuard({ children }: AccessGuardProps) {
  const { status, reason, isDeviceBlocked, loading } = useAccessControl();
  const { isAdminOrOwner, loading: roleLoading } = useUserRole();

  // Loading state
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <NexiaLoader size="lg" />
      </div>
    );
  }

  // Admins bypass access control
  if (isAdminOrOwner) {
    return <>{children}</>;
  }

  // Device blocked - highest priority
  if (isDeviceBlocked) {
    return <AccessBlockedScreen isDeviceBlocked={true} />;
  }

  // Access blocked
  if (status === 'blocked') {
    return <AccessBlockedScreen reason={reason} />;
  }

  // Access pending
  if (status === 'pending') {
    return <AccessPendingScreen />;
  }

  // Access granted
  return <>{children}</>;
}
