import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Plus, Calendar, ArrowRight, ArrowLeft, CheckCircle2, FileText, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function BriefingHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const { data: briefings, isLoading } = useQuery({
    queryKey: ['briefings', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  const getStatusBadge = (status: string, convertedAt: string | null) => {
    if (convertedAt) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Convertido
        </Badge>
      );
    }
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Concluído
          </Badge>
        );
      case 'analyzed':
        return (
          <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
            Analisado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">Rascunho</Badge>
        );
    }
  };

  return (
    <AppLayout title="Briefings">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')} className="shrink-0 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ClipboardList className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Briefing Profissional
                </h1>
                <Badge variant="secondary" className="mt-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Coleta de dados
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Colete informações essenciais do negócio antes de qualquer diagnóstico ou planejamento. O briefing é a base para recomendações precisas.
            </p>
          </div>
          <Button onClick={() => navigate('/nexia-ai/briefing/novo')} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4" />
            Novo briefing
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                'Dados do negócio',
                'Presença digital',
                'Situação atual',
                'Objetivos'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Briefings List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Briefings criados</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : briefings && briefings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {briefings.map((briefing) => (
                <Card 
                  key={briefing.id} 
                  className="hover:border-emerald-500/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/nexia-ai/briefing/${briefing.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <CardTitle className="text-base line-clamp-1">
                          {briefing.company_name}
                        </CardTitle>
                      </div>
                      {getStatusBadge(briefing.status, briefing.converted_at)}
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(briefing.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {briefing.segment || 'Segmento não definido'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum briefing criado ainda</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Crie seu primeiro briefing para coletar informações do cliente.
                </p>
                <Button onClick={() => navigate('/nexia-ai/briefing/novo')} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4" />
                  Criar primeiro briefing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer tip */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 O briefing coleta dados reais do cliente. Depois, converta para o Nexia gerar diagnóstico e recomendações.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
