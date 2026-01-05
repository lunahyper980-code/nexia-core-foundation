import { Clock, MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const WHATSAPP_SUPPORT_LINK = 'https://wa.me/5511999999999?text=Olá!%20Acabei%20de%20criar%20minha%20conta%20e%20gostaria%20de%20liberar%20meu%20acesso.';

export function AccessPendingScreen() {
  const { signOut } = useAuth();

  const handleWhatsApp = () => {
    window.open(WHATSAPP_SUPPORT_LINK, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
          <Clock className="h-10 w-10 text-warning" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Acesso Pendente</h1>
          <p className="text-muted-foreground">
            Seu acesso ainda não foi liberado. Envie o comprovante de pagamento para liberação.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={handleWhatsApp}
            className="w-full gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no WhatsApp
          </Button>
          
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

        {/* Footer */}
        <p className="text-xs text-muted-foreground pt-4">
          Após a confirmação do pagamento, seu acesso será liberado em até 24 horas.
        </p>
      </div>
    </div>
  );
}
