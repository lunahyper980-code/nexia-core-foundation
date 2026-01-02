import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  Archive,
  Copy,
  FileText, 
  Building2,
  Target,
  Brain,
  TrendingUp,
  CheckCircle2,
  Clock,
  Calendar,
  Rocket,
  Smartphone,
  Globe,
  Layout,
  Users,
  UserPlus
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
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

interface Planning {
  id: string;
  name: string;
  description: string | null;
  primary_goal: string | null;
  focus_area: string | null;
  status: string;
  mode: string | null;
  created_at: string;
  updated_at: string;
  created_by_user_id: string;
  client_id: string | null;
  diagnosis_text: string | null;
  marketing_maturity_level: string | null;
  marketing_current_state: string | null;
  marketing_top_goal: string | null;
  include_sales: boolean;
  sales_maturity_level: string | null;
  sales_top_goal: string | null;
  strategy_summary: string | null;
  objectives_list: string[];
  conclusion_notes: string | null;
  simple_summary: string | null;
  solution_type: string | null;
  company_name: string | null;
  sector_niche: string | null;
  clients?: {
    id: string;
    name: string;
    segment: string | null;
  } | null;
}

interface ActivityLog {
  id: string;
  type: string;
  message: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  draft: { label: 'Rascunho', variant: 'outline' },
  briefing: { label: 'Briefing', variant: 'secondary' },
  ready_for_diagnosis: { label: 'Pronto para Diagnóstico', variant: 'secondary' },
  active: { label: 'Ativo', variant: 'default' },
  completed: { label: 'Concluído', variant: 'secondary' },
  archived: { label: 'Arquivado', variant: 'secondary' },
};

const focusAreaConfig: Record<string, string> = {
  marketing: 'Marketing',
  comercial: 'Comercial',
  operacional: 'Operacional',
  produto: 'Produto',
};

export default function NexiaPlanejamentoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspace } = useWorkspace();
  
  const [planning, setPlanning] = useState<Planning | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isConvertingToClient, setIsConvertingToClient] = useState(false);

  useEffect(() => {
    if (workspace && id) {
      fetchPlanning();
      fetchActivities();
    }
  }, [workspace, id]);

  const fetchPlanning = async () => {
    if (!workspace || !id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nexia_plannings')
        .select(`
          *,
          clients (id, name, segment)
        `)
        .eq('id', id)
        .eq('workspace_id', workspace.id)
        .single();

      if (error) throw error;
      
      // If this is a simple mode planning or from_briefing going to simple, redirect to the simple mode page
      if (data.mode === 'simple') {
        navigate(`/nexia-ai/modo-simples?planningId=${data.id}`, { replace: true });
        return;
      }
      
      // If this is from_briefing mode, it can be displayed in detail view
      // The user chose "Planejamento Avançado" after converting briefing
      
      setPlanning({
        ...data,
        objectives_list: Array.isArray(data.objectives_list) ? data.objectives_list : [],
      } as Planning);
    } catch (error) {
      console.error('Error fetching planning:', error);
      toast.error('Erro ao carregar planejamento');
      navigate('/nexia-ai/planejamentos');
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    if (!workspace || !id) return;

    try {
      const { data } = await supabase
        .from('activity_logs')
        .select('id, type, message, created_at')
        .eq('workspace_id', workspace.id)
        .like('type', 'nexia_plan%')
        .order('created_at', { ascending: false })
        .limit(20);

      // Filter activities related to this planning
      const filtered = (data || []).filter(a => {
        try {
          return a.message.includes(planning?.name || '');
        } catch {
          return false;
        }
      });
      
      setActivities(filtered.slice(0, 10));
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  };

  const handleArchive = async () => {
    if (!planning || !workspace) return;

    try {
      const newStatus = planning.status === 'archived' ? 'active' : 'archived';
      
      const { error } = await supabase
        .from('nexia_plannings')
        .update({ status: newStatus })
        .eq('id', planning.id);

      if (error) throw error;

      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type: newStatus === 'archived' ? 'nexia_plan_archived' : 'nexia_plan_restored',
        message: `Planejamento "${planning.name}" ${newStatus === 'archived' ? 'arquivado' : 'restaurado'}`,
        metadata: { entity_type: 'plan', entity_id: planning.id },
      }]);
      
      toast.success(newStatus === 'archived' ? 'Planejamento arquivado!' : 'Planejamento restaurado!');
      setIsArchiveDialogOpen(false);
      fetchPlanning();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleDuplicate = async () => {
    if (!planning || !workspace) return;

    try {
      const { data: newPlanning, error } = await supabase
        .from('nexia_plannings')
        .insert([{
          workspace_id: workspace.id,
          created_by_user_id: planning.created_by_user_id,
          client_id: planning.client_id,
          name: `${planning.name} (cópia)`,
          description: planning.description,
          primary_goal: planning.primary_goal,
          focus_area: planning.focus_area,
          diagnosis_text: planning.diagnosis_text,
          marketing_maturity_level: planning.marketing_maturity_level,
          marketing_current_state: planning.marketing_current_state,
          marketing_top_goal: planning.marketing_top_goal,
          include_sales: planning.include_sales,
          sales_maturity_level: planning.sales_maturity_level,
          sales_top_goal: planning.sales_top_goal,
          strategy_summary: planning.strategy_summary,
          objectives_list: planning.objectives_list,
          conclusion_notes: planning.conclusion_notes,
          status: 'draft',
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type: 'nexia_plan_duplicated',
        message: `Planejamento "${planning.name}" duplicado`,
        metadata: { entity_type: 'plan', entity_id: newPlanning.id, original_id: planning.id },
      }]);

      toast.success('Planejamento duplicado!');
      navigate(`/nexia-ai/planejamento/${newPlanning.id}`);
    } catch (error) {
      console.error('Error duplicating:', error);
      toast.error('Erro ao duplicar');
    }
  };

  // Convert Briefing to Client
  const handleConvertToClient = async () => {
    if (!planning || !workspace) return;

    setIsConvertingToClient(true);
    try {
      // Create a new client from briefing data
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert([{
          workspace_id: workspace.id,
          created_by_user_id: planning.created_by_user_id,
          name: planning.clients?.name || planning.name.replace('Briefing Rápido - ', ''),
          segment: planning.clients?.segment || null,
          status: 'active',
        }])
        .select()
        .single();

      if (clientError) throw clientError;

      // Update the planning to link to the new client and change status
      const { error: updateError } = await supabase
        .from('nexia_plannings')
        .update({ 
          client_id: newClient.id,
          status: 'active' // Change from 'briefing' to 'active'
        })
        .eq('id', planning.id);

      if (updateError) throw updateError;

      // Log activity
      await supabase.from('activity_logs').insert([{
        workspace_id: workspace.id,
        type: 'BRIEFING_CONVERTED_TO_CLIENT',
        message: `Briefing "${planning.name}" convertido em cliente "${newClient.name}"`,
        metadata: { 
          entity_type: 'client', 
          entity_id: newClient.id,
          briefing_id: planning.id 
        },
      }]);

      toast.success('Briefing convertido em cliente com sucesso!');
      fetchPlanning(); // Refresh data
    } catch (error) {
      console.error('Error converting to client:', error);
      toast.error('Erro ao converter em cliente');
    } finally {
      setIsConvertingToClient(false);
    }
  };

  // Check if this is a briefing (not yet a client)
  const isBriefing = planning?.status === 'briefing' || 
    (planning?.client_id === null && planning?.name?.includes('Briefing'));

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <AppLayout title="Carregando...">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Carregando planejamento...</p>
        </div>
      </AppLayout>
    );
  }

  if (!planning) {
    return (
      <AppLayout title="Não encontrado">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Planejamento não encontrado</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={planning.name}>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai/planejamentos')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h1 className="text-2xl font-bold text-foreground">{planning.name}</h1>
              <Badge variant={statusConfig[planning.status]?.variant || 'outline'}>
                {statusConfig[planning.status]?.label || planning.status}
              </Badge>
              {planning.focus_area && (
                <Badge variant="outline">
                  <Target className="h-3 w-3 mr-1" />
                  {focusAreaConfig[planning.focus_area] || planning.focus_area}
                </Badge>
              )}
            </div>
            {planning.clients ? (
              <p className="text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {planning.clients.name}
                {planning.clients.segment && (
                  <span className="text-xs">• {planning.clients.segment}</span>
                )}
              </p>
            ) : isBriefing ? (
              <p className="text-amber-600 flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Briefing (ainda não é cliente)
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Convert to Client Button - only show for briefings */}
            {isBriefing && (
              <Button 
                onClick={handleConvertToClient}
                disabled={isConvertingToClient}
                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              >
                <UserPlus className="h-4 w-4" />
                {isConvertingToClient ? 'Convertendo...' : 'Converter em Cliente'}
              </Button>
            )}
            {/* Create Solution Button */}
            <Button 
              onClick={() => {
                const params = new URLSearchParams({
                  fromNexia: 'true',
                  projectName: planning.clients?.name || planning.name,
                  companyName: planning.clients?.name || '',
                  sectorNiche: planning.clients?.segment || '',
                  targetAudience: planning.clients?.segment || '',
                  primaryGoal: planning.primary_goal || '',
                  mainProblem: planning.description || '',
                  diagnosisSummary: planning.diagnosis_text?.slice(0, 200) || '',
                  strategySummary: planning.strategy_summary?.slice(0, 200) || '',
                  focusArea: planning.focus_area || '',
                  planningId: planning.id,
                  clientId: planning.client_id || '',
                  mode: 'full',
                });
                navigate(`/solucoes/criar?${params.toString()}`);
              }}
              className="gap-2"
              variant={isBriefing ? "outline" : "default"}
            >
              <Rocket className="h-4 w-4" />
              Criar solução digital
            </Button>
            <Button variant="outline" onClick={() => {
              if (planning.mode === 'simple') {
                navigate(`/nexia-ai/modo-simples?planningId=${planning.id}`);
              } else {
                navigate(`/nexia-ai/planejamento/${planning.id}/editar`);
              }
            }}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicar
            </Button>
            <Button variant="outline" onClick={() => setIsArchiveDialogOpen(true)}>
              <Archive className="h-4 w-4 mr-2" />
              {planning.status === 'archived' ? 'Restaurar' : 'Arquivar'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnóstico</TabsTrigger>
            <TabsTrigger value="maturity">Maturidade</TabsTrigger>
            <TabsTrigger value="strategy">Estratégia</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {planning.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Descrição</p>
                      <p className="text-sm">{planning.description}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Objetivo Principal</p>
                    <p className="text-sm">{planning.primary_goal || '-'}</p>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Criado: {formatDate(planning.created_at)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Atualizado: {formatDate(planning.updated_at)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Resumo Estratégico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {planning.objectives_list.length > 0 ? (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Objetivos ({planning.objectives_list.length})</p>
                      <ul className="space-y-2">
                        {planning.objectives_list.slice(0, 5).map((obj, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {obj}
                          </li>
                        ))}
                        {planning.objectives_list.length > 5 && (
                          <li className="text-xs text-muted-foreground">
                            +{planning.objectives_list.length - 5} mais...
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum objetivo definido</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="diagnosis">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent>
                {planning.diagnosis_text ? (
                  <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                    {planning.diagnosis_text}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhum diagnóstico registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maturity">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Marketing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nível de Maturidade</p>
                    <Badge variant="outline" className="capitalize">
                      {planning.marketing_maturity_level || 'Não definido'}
                    </Badge>
                  </div>
                  {planning.marketing_current_state && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Situação Atual</p>
                      <p className="text-sm">{planning.marketing_current_state}</p>
                    </div>
                  )}
                  {planning.marketing_top_goal && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Meta Prioritária</p>
                      <p className="text-sm">{planning.marketing_top_goal}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {planning.include_sales && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Comercial
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Nível de Maturidade</p>
                      <Badge variant="outline" className="capitalize">
                        {planning.sales_maturity_level || 'Não definido'}
                      </Badge>
                    </div>
                    {planning.sales_top_goal && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Meta Comercial</p>
                        <p className="text-sm">{planning.sales_top_goal}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="strategy">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Estratégia e Objetivos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {planning.strategy_summary && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Resumo Estratégico</p>
                    <div className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
                      {planning.strategy_summary}
                    </div>
                  </div>
                )}

                {planning.objectives_list.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Objetivos</p>
                    <ul className="space-y-2">
                      {planning.objectives_list.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 p-3 rounded-lg bg-muted/30">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {planning.conclusion_notes && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Notas Finais</p>
                    <p className="text-sm">{planning.conclusion_notes}</p>
                  </div>
                )}

                {!planning.strategy_summary && planning.objectives_list.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma estratégia definida
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Histórico de Atividades
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-3">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma atividade registrada
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Archive Dialog */}
      <AlertDialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {planning.status === 'archived' ? 'Restaurar Planejamento' : 'Arquivar Planejamento'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {planning.status === 'archived'
                ? 'O planejamento será restaurado e voltará a aparecer na lista principal.'
                : 'O planejamento será movido para a lista de arquivados.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              {planning.status === 'archived' ? 'Restaurar' : 'Arquivar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
