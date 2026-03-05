import { Copy, ExternalLink, Gift, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface AffiliateShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  referralCode: string;
  onCopyLink: () => Promise<void> | void;
  onShareWhatsApp: () => void;
}

export function AffiliateShareDialog({
  open,
  onOpenChange,
  shareUrl,
  referralCode,
  onCopyLink,
  onShareWhatsApp,
}: AffiliateShareDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl border-primary/20 bg-card/95 backdrop-blur-xl">
        <DialogHeader className="space-y-3">
          <Badge variant="premium" className="w-fit gap-1.5">
            <Gift className="h-3.5 w-3.5" />
            Seu link está pronto
          </Badge>
          <DialogTitle className="text-2xl">Compartilhe e comece a indicar</DialogTitle>
          <DialogDescription>
            Esse é o seu link exclusivo de afiliado. Toda nova conta vinculada a ele entra no seu painel de indicações.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Código de afiliado</p>
              <p className="text-xs text-muted-foreground">Use este código em campanhas, bios e materiais promocionais.</p>
            </div>
            <Input value={referralCode} readOnly className="h-11 font-medium" />
          </div>

          <div className="rounded-2xl border border-border bg-background/60 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium text-foreground">Link de indicação</p>
              <p className="text-xs text-muted-foreground">Direcione novos usuários para o cadastro com rastreio automático.</p>
            </div>
            <Input value={shareUrl} readOnly className="h-11" />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={onCopyLink} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar link
            </Button>
            <Button variant="outline" onClick={onShareWhatsApp} className="gap-2">
              <Share2 className="h-4 w-4" />
              Enviar no WhatsApp
            </Button>
          </div>
          <Button asChild variant="premium" className="gap-2">
            <a href={shareUrl} target="_blank" rel="noreferrer">
              Abrir link
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
