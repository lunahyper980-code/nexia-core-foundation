import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Gift, Copy, ExternalLink, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useLovableCreditRequests, statusLabels, statusColors, LovableCreditRequest } from '@/hooks/useLovableCreditRequests';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RequestCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestCreditsModal({ open, onOpenChange }: RequestCreditsModalProps) {
  const { requests, loading, createRequest, updateRequest, refetch } = useLovableCreditRequests();
  const [inviteLink, setInviteLink] = useState('');
  const [userNote, setUserNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLink, setEditLink] = useState('');

  const handleSubmit = async () => {
    if (!inviteLink.trim()) {
      toast.error('Cole seu Invite Link do Lovable');
      return;
    }

    if (!inviteLink.includes('lovable.dev')) {
      toast.error('Link inválido. Use o link de convite do Lovable.');
      return;
    }

    setSubmitting(true);
    const { error } = await createRequest(inviteLink, userNote);
    setSubmitting(false);

    if (error) {
      toast.error('Erro ao enviar solicitação');
      return;
    }

    setSubmitted(true);
    setInviteLink('');
    setUserNote('');
  };

  const handleEdit = async (id: string) => {
    if (!editLink.trim()) return;

    setSubmitting(true);
    const { error } = await updateRequest(id, editLink);
    setSubmitting(false);

    if (error) {
      toast.error('Erro ao atualizar link');
      return;
    }

    setEditingId(null);
    setEditLink('');
    toast.success('Link atualizado!');
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  const truncateLink = (link: string) => {
    if (link.length > 40) {
      return link.substring(0, 40) + '...';
    }
    return link;
  };

  const hasUpdates = requests.some(r => r.admin_message);

  if (submitted) {
    return (
      <Dialog open={open} onOpenChange={(v) => { setSubmitted(false); onOpenChange(v); }}>
        <DialogContent className="max-w-md">
          <div className="text-center py-6 space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Link recebido!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Seu pedido foi enviado para análise. Assim que o admin revisar, você verá o status aqui.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Depois, volte no Lovable para conferir se os créditos caíram.
              </p>
            </div>
            <Button onClick={() => { setSubmitted(false); refetch(); }}>
              Ver minhas solicitações
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary" />
            Solicitar Créditos Lovable
          </DialogTitle>
          <DialogDescription>
            Envie seu Invite Link para análise (limitado)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border/50 space-y-3">
            <p className="text-sm font-medium text-foreground">Como obter seu Invite Link:</p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Acesse sua conta em <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">Lovable.dev <ExternalLink className="h-3 w-3" /></a></li>
              <li>Clique no ícone 🎁 (presente), localizado no canto superior</li>
              <li>Copie o seu Invite Link para compartilhar com outras pessoas</li>
              <li className="text-warning font-medium">IMPORTANTÍSSIMO: Não esqueça de nos enviar o link abaixo.</li>
            </ol>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-link">Cole aqui seu Invite Link do Lovable *</Label>
              <Input
                id="invite-link"
                value={inviteLink}
                onChange={(e) => setInviteLink(e.target.value)}
                placeholder="https://lovable.dev/invite/..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user-note">Observação (opcional)</Label>
              <Textarea
                id="user-note"
                value={userNote}
                onChange={(e) => setUserNote(e.target.value)}
                placeholder="Ex: Vou criar um app para restaurante"
                rows={2}
              />
            </div>

            <Button 
              onClick={handleSubmit} 
              disabled={submitting || !inviteLink.trim()}
              className="w-full gap-2"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
              Enviar para análise
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Solicitações são analisadas manualmente.
            </p>
          </div>

          {/* My Requests */}
          {requests.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border/50">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Minhas solicitações</h4>
                {hasUpdates && (
                  <Badge variant="outline" className="bg-primary/10 text-primary text-xs">
                    Atualização
                  </Badge>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {requests.map((request) => (
                    <RequestCard
                      key={request.id}
                      request={request}
                      isEditing={editingId === request.id}
                      editLink={editLink}
                      onEditStart={() => { setEditingId(request.id); setEditLink(request.invite_link); }}
                      onEditCancel={() => { setEditingId(null); setEditLink(''); }}
                      onEditChange={setEditLink}
                      onEditSave={() => handleEdit(request.id)}
                      onCopy={copyLink}
                      truncateLink={truncateLink}
                      submitting={submitting}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface RequestCardProps {
  request: LovableCreditRequest;
  isEditing: boolean;
  editLink: string;
  onEditStart: () => void;
  onEditCancel: () => void;
  onEditChange: (value: string) => void;
  onEditSave: () => void;
  onCopy: (link: string) => void;
  truncateLink: (link: string) => string;
  submitting: boolean;
}

function RequestCard({
  request,
  isEditing,
  editLink,
  onEditStart,
  onEditCancel,
  onEditChange,
  onEditSave,
  onCopy,
  truncateLink,
  submitting,
}: RequestCardProps) {
  return (
    <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
      <div className="flex items-center justify-between">
        <Badge className={statusColors[request.status]}>
          {statusLabels[request.status]}
        </Badge>
        <span className="text-xs text-muted-foreground">
          {format(new Date(request.created_at), "dd MMM yyyy", { locale: ptBR })}
        </span>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Input
            value={editLink}
            onChange={(e) => onEditChange(e.target.value)}
            placeholder="https://lovable.dev/invite/..."
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onEditSave} disabled={submitting}>
              Salvar
            </Button>
            <Button size="sm" variant="ghost" onClick={onEditCancel}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground font-mono">
          {truncateLink(request.invite_link)}
        </p>
      )}

      {request.admin_message && (
        <div className="p-2 rounded bg-primary/5 border border-primary/10">
          <p className="text-xs text-foreground">
            <span className="font-medium">Mensagem:</span> {request.admin_message}
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => onCopy(request.invite_link)}
        >
          <Copy className="h-3 w-3 mr-1" />
          Copiar
        </Button>
        {request.status === 'pending' && !isEditing && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={onEditStart}
          >
            Editar link
          </Button>
        )}
      </div>
    </div>
  );
}
