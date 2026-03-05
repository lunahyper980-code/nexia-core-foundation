import { Clock, LogOut, MessageCircle, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';

const SUPPORT_PHONE_DISPLAY = '+55 22 99720-8172';
const OFFICIAL_SITE_URL = 'https://usenexia.site/';
const SUPPORT_WHATSAPP_URL = `https://wa.me/5522997208172?text=${encodeURIComponent(
  'Olá! Fiz login no Nexia e minha compra já foi realizada, mas meu acesso ainda aparece como pendente. Poderiam verificar com a equipe e me avisar quando a liberação for concluída, por favor?'
)}`;

export function AccessPendingScreen() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-warning/10">
          <Clock className="h-10 w-10 text-warning" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-foreground">Acesso pendente</h1>
          <p className="mx-auto max-w-xl text-muted-foreground">
            Seu login foi identificado, mas a liberação do acesso ainda está pendente.
          </p>
          <p className="mx-auto max-w-xl text-sm text-muted-foreground">
            A ativação é feita manualmente pela equipe para confirmar a compra e liberar sua entrada corretamente.
          </p>
        </div>

        <div className="grid gap-4 text-left md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-foreground">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Ainda não comprou o Nexia?</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Para acessar a plataforma, é necessário ter uma compra ativa. Se ainda não concluiu, acesse o site oficial.
              </p>
            </div>
            <Button asChild className="mt-5 w-full" size="lg">
              <a href={OFFICIAL_SITE_URL} target="_blank" rel="noreferrer noopener">
                Ir para o site oficial
              </a>
            </Button>
          </div>

          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">Já comprou e está aguardando?</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Seu acesso pode estar em análise final. Se precisar, fale com o suporte e nossa equipe verifica para você.
              </p>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mt-5 w-full gap-2" size="lg">
                  <MessageCircle className="h-5 w-5" />
                  Contatar suporte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Suporte via WhatsApp</DialogTitle>
                  <DialogDescription>
                    Fale com a equipe somente se sua compra já foi concluída e o acesso ainda estiver pendente.
                  </DialogDescription>
                </DialogHeader>

                <div className="rounded-2xl border border-border bg-secondary/40 p-4">
                  <p className="text-sm font-medium text-foreground">WhatsApp</p>
                  <p className="mt-1 text-sm text-muted-foreground">{SUPPORT_PHONE_DISPLAY}</p>
                </div>

                <Button asChild className="w-full gap-2" size="lg">
                  <a href={SUPPORT_WHATSAPP_URL} target="_blank" rel="noreferrer noopener">
                    <MessageCircle className="h-5 w-5" />
                    Abrir conversa pronta
                  </a>
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs text-muted-foreground">
            A aprovação continua manual e será feita normalmente pela equipe.
          </p>
          <Button onClick={signOut} variant="outline" className="w-full gap-2 sm:w-auto" size="lg">
            <LogOut className="h-5 w-5" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  );
}

