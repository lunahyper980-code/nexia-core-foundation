import { AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface AffiliateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function AffiliateConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
}: AffiliateConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl border-warning/35 bg-card/95 p-0 backdrop-blur-2xl">
        <div className="rounded-[1.75rem] border border-warning/30 bg-card/95 p-6 sm:p-8">
          <DialogHeader className="space-y-5 text-left">
            <div className="flex items-center gap-3 text-warning">
              <AlertTriangle className="h-7 w-7" />
              <DialogTitle className="text-3xl font-bold text-foreground sm:text-4xl">
                Atenção: Escolha Irreversível
              </DialogTitle>
            </div>

            <p className="text-xl text-foreground/90">Você está prestes a escolher a opção:</p>
          </DialogHeader>

          <div className="mt-6 space-y-5">
            <div className="rounded-[1.6rem] border border-primary/30 bg-primary/15 px-6 py-5 text-center">
              <p className="text-3xl font-bold text-primary sm:text-4xl">Ganhe 20% por Venda</p>
            </div>

            <div className="rounded-[1.6rem] border border-warning/35 bg-warning/10 p-5 sm:p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background/60 text-warning">
                  <Lock className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">Esta escolha é DEFINITIVA</p>
                  <p className="mt-2 text-lg text-muted-foreground">
                    Após confirmar, você não poderá alterar para outra forma de ganhar comissão. Escolha apenas uma vez!
                  </p>
                </div>
              </div>
            </div>

            <p className="text-2xl font-bold text-foreground">Tem certeza que deseja continuar?</p>
          </div>

          <DialogFooter className="mt-8 flex-col gap-3 border-0 pt-0 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="h-14 min-w-[160px] rounded-2xl text-lg font-semibold"
            >
              Voltar
            </Button>
            <Button
              variant="premium"
              size="lg"
              onClick={onConfirm}
              disabled={loading}
              className="h-14 min-w-[260px] rounded-2xl text-lg font-semibold"
            >
              <CheckCircle2 className="h-5 w-5" />
              {loading ? 'Confirmando...' : 'Sim, Confirmar Escolha'}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
