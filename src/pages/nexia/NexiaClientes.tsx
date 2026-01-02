import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Archive, 
  RotateCcw,
  MoreVertical,
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  User,
  FileText,
  X,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Json } from '@/integrations/supabase/types';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';

interface NexiaClient {
  id: string;
  name: string;
  niche: string | null;
  segment: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  notes: string | null;
  observations: string | null;
  city: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const clientSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório').max(100, 'Nome deve ter no máximo 100 caracteres'),
  segment: z.string().trim().max(100, 'Segmento deve ter no máximo 100 caracteres').optional(),
  contact_name: z.string().trim().max(100, 'Nome do contato deve ter no máximo 100 caracteres').optional(),
  contact_email: z.string().trim().email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres').optional().or(z.literal('')),
  contact_phone: z.string().trim().max(20, 'Telefone deve ter no máximo 20 caracteres').optional(),
  observations: z.string().trim().max(2000, 'Observações devem ter no máximo 2000 caracteres').optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

const initialFormData: ClientFormData = {
  name: '',
  segment: '',
  contact_name: '',
  contact_email: '',
  contact_phone: '',
  observations: '',
};

export default function NexiaClientes() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [clients, setClients] = useState<NexiaClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active');
  const [sortOrder, setSortOrder] = useState<'recent' | 'az'>('recent');
  
  const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false);
  
  const [editingClient, setEditingClient] = useState<NexiaClient | null>(null);
  const [selectedClient, setSelectedClient] = useState<NexiaClient | null>(null);
  const [archivingClientId, setArchivingClientId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ClientFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workspace) {
      fetchClients();
    }
  }, [workspace]);

  const fetchClients = async () => {
    if (!workspace) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (
    eventType: string, 
    title: string,
    description: string,
    entityId: string, 
    metadata: Record<string, unknown> = {}
  ) => {
    if (!workspace || !user) return;
    try {
      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        user_id: user.id,
        type: eventType,
        entity_type: 'client',
        entity_id: entityId,
        title,
        description,
        message: description,
        metadata: metadata as Json,
      }]);
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  const handleOpenFormDialog = (client?: NexiaClient) => {
    if (client) {
      setEditingClient(client);
      setFormData({
        name: client.name,
        segment: client.segment || '',
        contact_name: client.contact_name || '',
        contact_email: client.contact_email || '',
        contact_phone: client.contact_phone || '',
        observations: client.observations || '',
      });
    } else {
      setEditingClient(null);
      setFormData(initialFormData);
    }
    setFormErrors({});
    setIsFormDialogOpen(true);
  };

  const handleSave = async () => {
    if (!workspace || !user) return;

    // Validate form
    const result = clientSchema.safeParse(formData);
    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    try {
      const cleanData = {
        name: formData.name.trim(),
        segment: formData.segment?.trim() || null,
        contact_name: formData.contact_name?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        contact_phone: formData.contact_phone?.trim() || null,
        observations: formData.observations?.trim() || null,
      };

      if (editingClient) {
        const { error } = await supabase
          .from('clients')
          .update(cleanData)
          .eq('id', editingClient.id);

        if (error) throw error;
        
        await logActivity(
          'CLIENT_UPDATED', 
          'Cliente atualizado',
          `O cliente "${cleanData.name}" foi atualizado`, 
          editingClient.id, 
          { client_name: cleanData.name, changes: cleanData }
        );
        
        toast.success('Cliente atualizado com sucesso!');
        
        // Update selected client if viewing details
        if (selectedClient?.id === editingClient.id) {
          setSelectedClient({ ...selectedClient, ...cleanData });
        }
      } else {
        const { data, error } = await supabase
          .from('clients')
          .insert([{
            workspace_id: workspace.id,
            created_by_user_id: user.id,
            status: 'active',
            ...cleanData,
          }])
          .select()
          .single();

        if (error) throw error;
        
        await logActivity(
          'CLIENT_CREATED', 
          'Cliente criado',
          `O cliente "${cleanData.name}" foi criado`, 
          data.id, 
          { client_name: cleanData.name, segment: cleanData.segment }
        );
        
        toast.success('Cliente criado com sucesso!');
      }

      setIsFormDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error('Erro ao salvar cliente');
    } finally {
      setIsSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!archivingClientId || !workspace) return;

    try {
      const client = clients.find(c => c.id === archivingClientId);
      const newStatus = client?.status === 'archived' ? 'active' : 'archived';
      
      const { error } = await supabase
        .from('clients')
        .update({ status: newStatus })
        .eq('id', archivingClientId);

      if (error) throw error;
      
      const actionType = newStatus === 'archived' ? 'CLIENT_DELETED' : 'CLIENT_UPDATED';
      const actionTitle = newStatus === 'archived' ? 'Cliente arquivado' : 'Cliente reativado';
      const actionDescription = newStatus === 'archived' 
        ? `O cliente "${client?.name}" foi arquivado` 
        : `O cliente "${client?.name}" foi reativado`;
      
      await logActivity(actionType, actionTitle, actionDescription, archivingClientId, {
        client_name: client?.name,
        new_status: newStatus,
      });
      
      toast.success(newStatus === 'archived' ? 'Cliente arquivado!' : 'Cliente reativado!');
      
      setIsArchiveDialogOpen(false);
      setArchivingClientId(null);
      
      // Close detail sheet if viewing archived client
      if (selectedClient?.id === archivingClientId) {
        setIsDetailSheetOpen(false);
        setSelectedClient(null);
      }
      
      fetchClients();
    } catch (error) {
      console.error('Error updating client status:', error);
      toast.error('Erro ao atualizar status do cliente');
    }
  };

  const handleViewDetails = (client: NexiaClient) => {
    setSelectedClient(client);
    setIsDetailSheetOpen(true);
  };

  // Filter and sort clients
  const filteredClients = clients
    .filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.segment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.contact_email?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'az') {
        return a.name.localeCompare(b.name);
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const activeCount = clients.filter(c => c.status === 'active').length;
  const archivedCount = clients.filter(c => c.status === 'archived').length;

  return (
    <AppLayout title="Clientes - NEXIA">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground">Gerencie seus clientes para planejamentos estratégicos</p>
          </div>
          <Button onClick={() => handleOpenFormDialog()} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, segmento ou contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativos ({activeCount})</SelectItem>
                <SelectItem value="archived">Arquivados ({archivedCount})</SelectItem>
                <SelectItem value="all">Todos ({clients.length})</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as typeof sortOrder)}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="az">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Lista de Clientes ({filteredClients.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando clientes...
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {clients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {clients.length === 0 
                    ? 'Cadastre seu primeiro cliente para começar' 
                    : 'Tente ajustar os filtros de busca'}
                </p>
                {clients.length === 0 && (
                  <Button onClick={() => handleOpenFormDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeiro cliente
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {filteredClients.map((client) => (
                  <div 
                    key={client.id} 
                    className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(client)}
                  >
                    <div className="p-2.5 rounded-xl bg-primary/10 flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">{client.name}</h4>
                        <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="flex-shrink-0">
                          {client.status === 'active' ? 'Ativo' : 'Arquivado'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        {client.segment && <span>{client.segment}</span>}
                        {client.contact_name && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {client.contact_name}
                          </span>
                        )}
                        <span>{formatDate(client.created_at)}</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleOpenFormDialog(client);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setArchivingClientId(client.id);
                            setIsArchiveDialogOpen(true);
                          }}
                        >
                          {client.status === 'active' ? (
                            <>
                              <Archive className="h-4 w-4 mr-2" />
                              Arquivar
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reativar
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Editar Cliente' : 'Novo Cliente'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cliente *</Label>
              <Input
                id="name"
                placeholder="Ex: Empresa XYZ, João Silva..."
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && <p className="text-sm text-destructive">{formErrors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="segment">Segmento</Label>
              <Input
                id="segment"
                placeholder="Ex: E-commerce, Consultoria, Saúde..."
                value={formData.segment}
                onChange={(e) => setFormData(prev => ({ ...prev, segment: e.target.value }))}
              />
            </div>

            <Separator />
            <p className="text-sm font-medium text-muted-foreground">Informações de Contato</p>

            <div className="space-y-2">
              <Label htmlFor="contact_name">Nome do Contato</Label>
              <Input
                id="contact_name"
                placeholder="Nome da pessoa de contato"
                value={formData.contact_name}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className={formErrors.contact_email ? 'border-destructive' : ''}
                />
                {formErrors.contact_email && <p className="text-sm text-destructive">{formErrors.contact_email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_phone">Telefone</Label>
                <Input
                  id="contact_phone"
                  placeholder="(00) 00000-0000"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                placeholder="Informações adicionais sobre o cliente..."
                value={formData.observations}
                onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : editingClient ? 'Salvar Alterações' : 'Criar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive/Restore Confirmation */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clients.find(c => c.id === archivingClientId)?.status === 'active' 
                ? 'Arquivar Cliente' 
                : 'Reativar Cliente'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clients.find(c => c.id === archivingClientId)?.status === 'active'
                ? 'O cliente será movido para a lista de arquivados. Você pode reativá-lo a qualquer momento.'
                : 'O cliente será reativado e voltará a aparecer na lista principal.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {clients.find(c => c.id === archivingClientId)?.status === 'active' ? 'Arquivar' : 'Reativar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Client Detail Sheet */}
      <Sheet open={isDetailSheetOpen} onOpenChange={setIsDetailSheetOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <span className="truncate">{selectedClient?.name}</span>
              <Badge variant={selectedClient?.status === 'active' ? 'default' : 'secondary'}>
                {selectedClient?.status === 'active' ? 'Ativo' : 'Arquivado'}
              </Badge>
            </SheetTitle>
          </SheetHeader>
          
          <ScrollArea className="h-[calc(100vh-180px)] mt-6">
            <div className="space-y-6 pr-4">
              {/* Main Info */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Dados Principais
                </h4>
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome</p>
                    <p className="font-medium">{selectedClient?.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Segmento</p>
                    <p className="font-medium">{selectedClient?.segment || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informações de Contato
                </h4>
                <div className="space-y-3 bg-muted/30 rounded-lg p-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nome do Contato</p>
                    <p className="font-medium">{selectedClient?.contact_name || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedClient?.contact_email || '-'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">{selectedClient?.contact_phone || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Observations */}
              {selectedClient?.observations && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Observações
                  </h4>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{selectedClient.observations}</p>
                  </div>
                </div>
              )}

              {/* Plannings Placeholder */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Planejamentos deste Cliente
                </h4>
                <div className="bg-muted/30 rounded-lg p-6 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum planejamento vinculado a este cliente
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-3"
                    onClick={() => {
                      setIsDetailSheetOpen(false);
                      navigate('/nexia-ai/planejamento/novo');
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Planejamento
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-muted-foreground pt-4 border-t space-y-1">
                <p>Criado em: {selectedClient && formatDate(selectedClient.created_at)}</p>
                <p>Atualizado em: {selectedClient && formatDate(selectedClient.updated_at)}</p>
              </div>
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => {
                if (selectedClient) {
                  handleOpenFormDialog(selectedClient);
                }
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button 
              variant={selectedClient?.status === 'active' ? 'outline' : 'default'}
              className="flex-1"
              onClick={() => {
                if (selectedClient) {
                  setArchivingClientId(selectedClient.id);
                  setIsArchiveDialogOpen(true);
                }
              }}
            >
              {selectedClient?.status === 'active' ? (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Arquivar
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reativar
                </>
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
