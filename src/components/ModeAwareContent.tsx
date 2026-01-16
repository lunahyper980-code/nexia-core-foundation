import { useUserMode } from '@/contexts/UserModeContext';
import { ModeSelectionModal } from '@/components/ModeSelectionModal';
import { NexiaLoader } from '@/components/ui/nexia-loader';

interface ModeAwareContentProps {
  children: React.ReactNode;
}

export function ModeAwareContent({ children }: ModeAwareContentProps) {
  const { loading, needsModeSelection } = useUserMode();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <NexiaLoader size="lg" />
      </div>
    );
  }

  return (
    <>
      <ModeSelectionModal open={needsModeSelection} />
      {children}
    </>
  );
}
