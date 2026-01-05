import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export function AccessPendingScreen() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
          <Clock className="h-10 w-10 text-warning" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Acesso pendente</h1>
          <p className="text-muted-foreground">
            Seu acesso ainda não foi liberado.
          </p>
        </div>

        {/* Logout Button */}
        <div className="pt-4">
          <Button 
            onClick={signOut}
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
