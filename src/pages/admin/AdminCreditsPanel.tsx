import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Gift, 
  Clock, 
  Search, 
  Eye, 
  Copy, 
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  useAdminCreditRequests, 
  statusLabels, 
  statusColors, 
  CreditRequestStatus,
  LovableCreditRequest 
} from '@/hooks/useLovableCreditRequests';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export default function AdminCreditsPanel() {
  const navigate = useNavigate();
  const { isAdmin } = useIsAdmin();
  const { requests, loading, stats, fetchRequests, updateRequestStatus } = useAdminCreditRequests();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [emailSearch, setEmailSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LovableCreditRequest | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <AppLayout title="Acesso Negado">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <XCircle className="h-12 w-12 text-destructive mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Acesso Restrito</h2>
          <p className="text-muted-foreground mt-2">Você não tem permissão para acessar esta área.</p>
          <Button className="mt-4" onClick={() => navigate('/configuracoes')}>
            Voltar às Configurações
          </Button>
        </div>
      </AppLayout>
    );
  }

  const handleSearch = () => {
    fetchRequests(statusFilter, emailSearch);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchRequests(value, emailSearch);
  };

  const openDetail = (request: LovableCreditRequest) => {
    setSelectedRequest(request);
    setDetailModalOpen(true);
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Link copiado!');
  };

  return (
    <AppLayout title="Painel Admin - Créditos Lovable">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/configuracoes')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Créditos Lovable (Invite Links)</h1>
            <p className="text-muted-foreground">Gerencie as solicitações de créditos dos usuários</p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                  <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Em análise</p>
                  <p className="text-2xl font-bold text-warning">{stats.reviewing}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Concluídos</p>
                  <p className="text-2xl font-bold text-success">{stats.fulfilled}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recusados</p>
                  <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por email..."
                value={emailSearch}
                onChange={(e) => setEmailSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="pending">Pendentes</SelectItem>
              <SelectItem value="reviewing">Em análise</SelectItem>
              <SelectItem value="approved">Aprovados</SelectItem>
              <SelectItem value="fulfilled">Concluídos</SelectItem>
              <SelectItem value="rejected">Recusados</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Solicitações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma solicitação encontrada
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <p className="font-medium text-foreground truncate">{request.user_email}</p>
                        <Badge className={statusColors[request.status]}>
                          {statusLabels[request.status]}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyLink(request.invite_link)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={() => openDetail(request)}>
                        <Eye className="h-4 w-4 mr-1" />
                        Abrir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
          onUpdate={updateRequestStatus}
        />
      )}
    </AppLayout>
  );
}

interface RequestDetailModalProps {
  request: LovableCreditRequest;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (
    id: string,
    status: CreditRequestStatus,
    adminNote?: string,
    adminMessage?: string
  ) => Promise<{ error: string | null }>;
}

function RequestDetailModal({ request, open, onOpenChange, onUpdate }: RequestDetailModalProps) {
  const [status, setStatus] = useState<CreditRequestStatus>(request.status);
  const [adminNote, setAdminNote] = useState(request.admin_note || '');
  const [adminMessage, setAdminMessage] = useState(request.admin_message || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await onUpdate(request.id, status, adminNote, adminMessage);
    setSaving(false);

    if (error) {
      toast.error('Erro ao atualizar solicitação');
      return;
    }

    toast.success('Solicitação atualizada!');
    onOpenChange(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(request.invite_link);
    toast.success('Link copiado!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detalhe da Solicitação</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Info */}
          <div className="p-4 rounded-lg bg-muted/50 space-y-3">
            <div>
              <Label className="text-muted-foreground text-xs">Email do usuário</Label>
              <p className="font-medium text-foreground">{request.user_email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground text-xs">Invite Link</Label>
              <div className="flex items-center gap-2">
                <p className="text-sm font-mono text-foreground break-all flex-1">{request.invite_link}</p>
                <Button size="sm" variant="ghost" onClick={copyLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {request.user_note && (
              <div>
                <Label className="text-muted-foreground text-xs">Observação do usuário</Label>
                <p className="text-sm text-foreground">{request.user_note}</p>
              </div>
            )}
            <div>
              <Label className="text-muted-foreground text-xs">Data da solicitação</Label>
              <p className="text-sm text-foreground">
                {format(new Date(request.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as CreditRequestStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="reviewing">Em análise</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="fulfilled">Créditos enviados</SelectItem>
                  <SelectItem value="rejected">Recusado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nota interna (só admin)</Label>
              <Textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Anotações internas sobre esta solicitação..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem para o usuário</Label>
              <Textarea
                value={adminMessage}
                onChange={(e) => setAdminMessage(e.target.value)}
                placeholder="Ex: Já comprei seus créditos. Verifique sua conta em até 10 min."
                rows={2}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar atualização
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
