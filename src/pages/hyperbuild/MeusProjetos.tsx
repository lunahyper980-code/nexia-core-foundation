import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Smartphone, 
  Globe, 
  Edit, 
  Copy, 
  Trash2,
  FolderOpen,
  Clock,
  Search,
  FileText
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function MeusProjetos() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspace } = useWorkspace();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!workspace?.id,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Projeto excluído com sucesso!');
      setDeleteId(null);
    },
    onError: () => {
      toast.error('Erro ao excluir projeto');
    },
  });

  const copyPrompt = (prompt: string | null) => {
    if (!prompt) {
      toast.error('Este projeto não possui prompt gerado');
      return;
    }
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado para a área de transferência!');
  };

  const openLovable = () => {
    window.open('https://lovable.dev', '_blank');
  };

  const filteredProjects = projects?.filter(project => 
    project.app_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getProjectType = (project: typeof projects[0]) => {
    // Try to detect if it's a site or app based on status or other fields
    if (project.template_id?.includes('landing') || 
        project.template_id?.includes('site') || 
        project.template_id?.includes('page')) {
      return 'site';
    }
    return 'app';
  };

  return (
    <AppLayout title="Meus Projetos">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Seus projetos organizados</h1>
            <p className="text-muted-foreground">
              Todos os seus projetos, diagnósticos e soluções digitais ficam salvos aqui para edição, atualização e entrega.
            </p>
          </div>
          <Button onClick={() => navigate('/solucoes/criar')} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded w-16" />
                    <div className="h-8 bg-muted rounded w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto criado ainda.'}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                {searchTerm 
                  ? 'Tente buscar com outros termos' 
                  : 'Crie sua primeira solução digital para começar.'}
              </p>
              {!searchTerm && (
                <Button onClick={() => navigate('/solucoes/criar')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar Primeiro Projeto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => {
              const projectType = getProjectType(project);
              const isApp = projectType === 'app';
              
              return (
                <Card 
                  key={project.id} 
                  className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                >
                  <CardContent className="p-6 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isApp ? 'bg-primary/10' : 'bg-emerald-500/10'
                        }`}>
                          {isApp ? (
                            <Smartphone className="h-5 w-5 text-primary" />
                          ) : (
                            <Globe className="h-5 w-5 text-emerald-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground line-clamp-1">
                            {project.app_name}
                          </h3>
                          <Badge variant="outline" className="text-xs mt-1">
                            {isApp ? 'Aplicativo' : 'Site'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(project.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </span>
                    </div>

                    {/* Status */}
                    <Badge 
                      variant={project.status === 'prompt_generated' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {project.status === 'prompt_generated' ? 'Prompt Gerado' : 
                       project.status === 'draft' ? 'Rascunho' : project.status}
                    </Badge>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate(`/hyperbuild/projeto/${project.id}/editar`)}
                      >
                        <Edit className="h-3.5 w-3.5" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1.5"
                        onClick={() => navigate(`/hyperbuild/projeto/${project.id}/contrato`)}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        Contrato
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1.5"
                        onClick={() => copyPrompt(project.generated_prompt)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copiar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="gap-1.5 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(project.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Excluir Projeto"
        description="Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
        isLoading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
