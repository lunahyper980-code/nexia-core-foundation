import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Gift } from 'lucide-react';
import { RequestCreditsModal } from './RequestCreditsModal';
import { useAuth } from '@/contexts/AuthContext';

export function RequestCreditsSection() {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  // Only show for authenticated users
  if (!user) return null;

  return (
    <>
      <div className="mt-8 pt-6 border-t border-border/30">
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/20 border border-border/30">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gift className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Precisa de mais créditos no Lovable?</p>
              <p className="text-xs text-muted-foreground">
                Envie seu Invite Link para análise (limitado).
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary"
            onClick={() => setModalOpen(true)}
          >
            <Gift className="h-4 w-4 mr-2" />
            Solicitar créditos
          </Button>
        </div>
      </div>

      <RequestCreditsModal open={modalOpen} onOpenChange={setModalOpen} />
    </>
  );
}
