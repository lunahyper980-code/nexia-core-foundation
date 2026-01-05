import { ShieldX, MessageCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface AccessBlockedScreenProps {
  reason?: string | null;
  isDeviceBlocked?: boolean;
}

const WHATSAPP_SUPPORT_LINK = 'https://wa.me/5511999999999?text=Olá!%20Meu%20acesso%20foi%20bloqueado%20e%20gostaria%20de%20entender%20o%20motivo.';

export function AccessBlockedScreen({ reason, isDeviceBlocked }: AccessBlockedScreenProps) {
  const { signOut } = useAuth();

  const handleWhatsApp = () => {
    window.open(WHATSAPP_SUPPORT_LINK, '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {isDeviceBlocked ? 'Acesso Bloqueado por Segurança' : 'Acesso Bloqueado'}
          </h1>
          <p className="text-muted-foreground">
            {isDeviceBlocked 
              ? 'Este dispositivo foi bloqueado por razões de segurança. Entre em contato com o suporte.'
              : 'Seu acesso foi desativado.'
            }
          </p>
          {reason && !isDeviceBlocked && (
            <p className="text-sm text-muted-foreground/80 italic">
              Motivo: {reason}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={handleWhatsApp}
            variant="outline"
            className="w-full gap-2"
            size="lg"
          >
            <MessageCircle className="h-5 w-5" />
            Falar no Suporte
          </Button>
          
          <Button 
            onClick={signOut}
            variant="ghost"
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
