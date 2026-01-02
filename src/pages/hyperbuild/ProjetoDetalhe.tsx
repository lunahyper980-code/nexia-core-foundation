import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Smartphone, 
  Globe, 
  Copy, 
  ExternalLink, 
  Edit,
  Calendar,
  Palette,
  Users,
  Layout
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ProjetoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const copyPrompt = () => {
    if (!project?.generated_prompt) {
      toast.error('Este projeto não possui prompt gerado');
      return;
    }
    navigator.clipboard.writeText(project.generated_prompt);
    toast.success('Prompt copiado para a área de transferência!');
  };

  const openLovable = () => {
    window.open('https://lovable.dev', '_blank');
  };

  if (isLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Projeto não encontrado">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Projeto não encontrado</h2>
          <Button onClick={() => navigate('/hyperbuild/projetos')}>
            Voltar para Projetos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isApp = !project.template_id?.includes('site') && !project.template_id?.includes('landing');

  return (
    <AppLayout title={project.app_name}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/hyperbuild/projetos')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
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
                <h1 className="text-2xl font-bold text-foreground">{project.app_name}</h1>
                <Badge variant="outline">{isApp ? 'Aplicativo' : 'Site'}</Badge>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => navigate(`/hyperbuild/projeto/${project.id}/editar`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Projeto
          </Button>
        </div>

        {/* Info Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Criado em</p>
                <p className="font-medium">
                  {format(new Date(project.created_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Público-alvo</p>
                <p className="font-medium line-clamp-1">
                  {project.target_audience || 'Não definido'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layout className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Telas/Seções</p>
                <p className="font-medium line-clamp-1">
                  {project.pages?.split(',').length || 0} itens
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cor primária</p>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: project.primary_color || '#8B5CF6' }}
                  />
                  <p className="font-medium">{project.primary_color || '#8B5CF6'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Task */}
        {project.main_task && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Função Principal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.main_task}</p>
            </CardContent>
          </Card>
        )}

        {/* Main Benefit */}
        {project.main_benefit && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Problema que Resolve</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.main_benefit}</p>
            </CardContent>
          </Card>
        )}

        {/* Generated Prompt */}
        {project.generated_prompt && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Prompt Gerado</CardTitle>
              <Button variant="outline" size="sm" onClick={copyPrompt} className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <Textarea
                value={project.generated_prompt}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted/30"
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={copyPrompt} className="flex-1 gap-2">
            <Copy className="h-4 w-4" />
            Copiar Prompt
          </Button>
          <Button onClick={openLovable} variant="outline" className="flex-1 gap-2">
            <ExternalLink className="h-4 w-4" />
            Abrir Lovable
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
