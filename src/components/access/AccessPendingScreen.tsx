import { Clock, LogOut, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const SUPPORT_PHONE_DISPLAY = '+55 22 99720-8172';
const SUPPORT_WHATSAPP_URL = `https://wa.me/5522997208172?text=${encodeURIComponent(
  'Olá! Fiz login na plataforma e meu acesso ainda está pendente de confirmação. Poderiam verificar com a equipe e me avisar quando o acesso for liberado, por favor?'
)}`;

export function AccessPendingScreen() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center">
          <Clock className="h-10 w-10 text-warning" />
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Acesso pendente</h1>
          <p className="text-muted-foreground">
            Seu login foi realizado, mas o seu acesso ainda está pendente de confirmação.
          </p>
          <p className="text-sm text-muted-foreground">
            Aguarde a liberação da equipe. Se preferir, entre em contato com o suporte para solicitar a análise.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 text-left shadow-sm">
          <p className="text-sm font-medium text-foreground">Suporte</p>
          <p className="mt-1 text-sm text-muted-foreground">WhatsApp: {SUPPORT_PHONE_DISPLAY}</p>

          <Button asChild className="mt-4 w-full gap-2" size="lg">
            <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer noopener">
              <MessageCircle className="h-5 w-5" />
              Falar com o suporte
            </a>
          </Button>
        </div>

        <div className="pt-2">
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

