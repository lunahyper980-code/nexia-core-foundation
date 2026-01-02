import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Wand2, 
  Search, 
  Copy, 
  ExternalLink, 
  FileText, 
  Clock,
  Sparkles,
  Filter,
  MoreVertical,
  Eye,
  Trash2,
  Edit,
  Download,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Project {
  id: string;
  app_name: string;
  generated_prompt: string | null;
  created_at: string;
  status: string | null;
  target_platform: string | null;
}

export default function HyperBuild() {
  const { workspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedPrompt, setEditedPrompt] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (workspace) {
      fetchProjects();
    }
  }, [workspace]);

  const fetchProjects = async () => {
    if (!workspace) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Erro ao carregar projetos');
    } finally {
      setLoading(false);
    }
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado para a área de transferência!');
  };

  const openLovable = () => {
    window.open('https://lovable.dev', '_blank');
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setEditedName(project.app_name);
    setEditedPrompt(project.generated_prompt || '');
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingProject) return;
    
    if (!editedName.trim()) {
      toast.error('O nome do projeto é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          app_name: editedName.trim(),
          generated_prompt: editedPrompt.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', editingProject.id);

      if (error) throw error;

      setProjects(prev => prev.map(p => 
        p.id === editingProject.id 
          ? { ...p, app_name: editedName.trim(), generated_prompt: editedPrompt.trim() }
          : p
      ));
      
      setIsEditDialogOpen(false);
      setEditingProject(null);
      toast.success('Prompt atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Erro ao atualizar projeto');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;
      
      setProjects(prev => prev.filter(p => p.id !== projectId));
      toast.success('Projeto excluído com sucesso!');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Erro ao excluir projeto');
    }
  };

  const exportPrompt = (project: Project) => {
    if (!project.generated_prompt) return;
    
    const blob = new Blob([project.generated_prompt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.app_name.replace(/\s+/g, '-').toLowerCase()}-prompt.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Prompt exportado!');
  };

  const filteredProjects = projects.filter(project =>
    project.app_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AppLayout title="HyperBuild">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Wand2 className="h-6 w-6 text-primary" />
              </div>
              HyperBuild
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie seus prompts e projetos gerados pelo wizard
            </p>
          </div>
          <Button onClick={openLovable} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir Lovable
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{projects.length}</p>
                <p className="text-sm text-muted-foreground">Prompts Gerados</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Sparkles className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {projects.filter(p => p.status === 'prompt_generated').length}
                </p>
                <p className="text-sm text-muted-foreground">Prontos para usar</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {projects.length > 0 ? formatDate(projects[0]?.created_at).split(',')[0] : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Último gerado</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtrar
          </Button>
        </div>

        {/* Projects List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Histórico de Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Carregando projetos...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhum prompt encontrado
                </h3>
                <p className="text-muted-foreground mb-4">
                  Use o wizard em Soluções Digitais para gerar seu primeiro prompt
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="py-4 flex items-center justify-between gap-4 hover:bg-muted/30 -mx-4 px-4 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-foreground truncate">
                          {project.app_name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(project.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="hidden sm:flex">
                        {project.status === 'prompt_generated' ? 'Pronto' : 'Rascunho'}
                      </Badge>
                      
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => project.generated_prompt && copyPrompt(project.generated_prompt)}
                        disabled={!project.generated_prompt}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewProject(project)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => exportPrompt(project)}>
                            <Download className="h-4 w-4 mr-2" />
                            Exportar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProject(project.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Motor de Prompts Avançado</h4>
                <p className="text-sm text-muted-foreground">
                  O HyperBuild é sua central de gerenciamento de prompts. Aqui você pode visualizar, 
                  copiar, exportar e organizar todos os prompts gerados pelo wizard. Use esta área 
                  para refinar e reutilizar seus melhores prompts.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedProject?.app_name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <pre className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap font-mono">
              {selectedProject?.generated_prompt || 'Nenhum prompt disponível'}
            </pre>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => selectedProject?.generated_prompt && copyPrompt(selectedProject.generated_prompt)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button onClick={openLovable}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Usar no Lovable
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-primary" />
              Editar Prompt
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="editName">Nome do Projeto</Label>
              <Input
                id="editName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                placeholder="Nome do projeto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="editPrompt">Prompt</Label>
              <Textarea
                id="editPrompt"
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                placeholder="Conteúdo do prompt..."
                className="min-h-[400px] font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}