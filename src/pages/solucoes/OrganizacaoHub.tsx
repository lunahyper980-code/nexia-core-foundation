import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Network, 
  FileText, 
  Clock, 
  Eye,
  Download,
  FileOutput,
  FileSignature,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import organizacaoImage from '@/assets/solution-organizacao.png';

interface ProcessOrganization {
  id: string;
  business_type: string;
  team_size: string | null;
  status: string;
  created_at: string;
  operation_overview: string | null;
}

export default function OrganizacaoHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['process-organizations', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('process_organizations')
        .select('id, business_type, team_size, status, created_at, operation_overview')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ProcessOrganization[];
    },
    enabled: !!workspace?.id,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('process_organizations')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['process-organizations'] });
      
      toast({
        title: 'Organização excluída',
        description: 'A organização de processos foi removida com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a organização.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Concluído</Badge>;
      case 'sent':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Enviado</Badge>;
      default:
        return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  const organizationToDelete = organizations.find(o => o.id === deleteId);

  return (
    <>
      <AppLayout title="Organização de Processos">
        <div className="w-full space-y-6">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/solucoes')}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Soluções
          </Button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-foreground/[0.05]">
                <Network className="h-6 w-6 text-amber-500" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Organização de Processos
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Estruture o funcionamento do negócio do seu cliente com processos simples, claros e aplicáveis.
            </p>
            <p className="text-xs text-muted-foreground/60">Ideal para empresas sem processos definidos.</p>
            <Badge className="bg-amber-500/90 text-white border-0 text-xs">
              Produto pronto para vender
            </Badge>
          </div>

          {/* Main Action */}
          <Card 
            className="cursor-pointer transition-all border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.03] to-transparent hover:border-amber-500/40 overflow-hidden"
            onClick={() => navigate('/solucoes/organizacao/novo')}
          >
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row">
                {/* Image */}
                <div className="w-full sm:w-48 h-32 sm:h-auto flex-shrink-0 overflow-hidden">
                  <img 
                    src={organizacaoImage} 
                    alt="Organização de Processos" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Content */}
                <div className="flex items-center gap-3 p-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0 border border-foreground/[0.04]">
                    <Network className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-foreground">Gerar Organização de Processos</h3>
                    <p className="text-xs text-muted-foreground truncate">Crie uma estrutura de funcionamento clara</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Organizações criadas
                </h2>
              </div>
              <Button 
                size="sm" 
                className="gap-2 text-xs"
                onClick={() => navigate('/solucoes/organizacao/novo')}
              >
                <Plus className="h-4 w-4" />
                Nova organização
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-3">
                      <div className="h-12 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : organizations.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhuma organização criada ainda.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Crie sua primeira organização de processos.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {organizations.map((org) => (
                  <Card key={org.id} className="border border-foreground/[0.06] hover:border-primary/20 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-medium text-foreground">{org.business_type}</h3>
                            {getStatusBadge(org.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {org.team_size || 'Equipe não definida'} • {format(new Date(org.created_at), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Visualizar"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/solucoes/organizacao/${org.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(org.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppLayout>

      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir organização"
        description={`Tem certeza que deseja excluir a organização de "${organizationToDelete?.business_type || ''}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </>
  );
}