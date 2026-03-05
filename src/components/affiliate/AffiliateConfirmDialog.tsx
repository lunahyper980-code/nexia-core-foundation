import {
  AlertTriangle,
  BadgeDollarSign,
  CheckCircle2,
  Lock,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
      <DialogContent className="sm:max-w-2xl border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <Badge variant="warning" className="w-fit gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            Atenção: escolha irreversível
          </Badge>
          <DialogTitle className="text-2xl">Você está prestes a ativar sua modalidade</DialogTitle>
          <DialogDescription>
            Depois da confirmação, essa opção ficará bloqueada para troca automática dentro da plataforma.
          </DialogDescription>
        </DialogHeader>

        <Card variant="glass" className="border-primary/20">
          <CardContent className="p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <BadgeDollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">Ganhe 20% por Venda</p>
                <p className="text-sm text-muted-foreground">Comissão direta em cada venda confirmada pelo seu link.</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Users className="h-4 w-4 text-primary" />
                  Indicações livres
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Sem limite de pessoas indicadas.</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Comissão por venda
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Receba 20% de cada venda vinculada.</p>
              </div>
              <div className="rounded-xl border border-border bg-background/60 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Link exclusivo
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Seu código é gerado na hora.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-warning/25 bg-warning/10 p-4">
              <div className="flex items-start gap-3">
                <Lock className="mt-0.5 h-4 w-4 text-warning" />
                <div>
                  <p className="font-medium text-foreground">Esta escolha é definitiva</p>
                  <p className="text-sm text-muted-foreground">
                    Você não poderá migrar sozinho para outra modalidade de comissão depois de confirmar.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Voltar
          </Button>
          <Button variant="premium" onClick={onConfirm} disabled={loading}>
            {loading ? 'Ativando...' : 'Sim, confirmar escolha'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
