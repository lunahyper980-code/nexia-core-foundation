import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Rocket, Plus, FileText, Calendar, ArrowRight, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function KitLancamentoHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const { data: launchKits, isLoading } = useQuery({
    queryKey: ['launch-kits', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('launch_kits')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  return (
    <AppLayout title="Kit de Lançamento Digital">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes')} className="shrink-0 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-lg bg-violet-500/10">
                <Rocket className="h-6 w-6 text-violet-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Kit de Lançamento Digital
                </h1>
                <Badge variant="secondary" className="mt-1 bg-green-500/10 text-green-600 border-green-500/20">
                  Pronto para vender
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Estruture lançamentos simples e profissionais para negócios em início ou novas ofertas, com foco em reconhecimento e primeiras vendas.
            </p>
            <p className="text-xs text-muted-foreground/70">Entregável pronto para envio ao cliente.</p>
          </div>
          <Button onClick={() => navigate('/solucoes/kit-lancamento/novo')} className="gap-2 bg-violet-500 hover:bg-violet-600">
            <Plus className="h-4 w-4" />
            Criar kit de lançamento
          </Button>
        </div>

        {/* Features */}
        <Card className="border-violet-500/20 bg-violet-500/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                'Estrutura de lançamento',
                'Sequência de ações',
                'Mensagens prontas',
                'Checklist de execução'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Launch Kits List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Kits criados</h2>
          
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
          ) : launchKits && launchKits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {launchKits.map((kit) => (
                <Card 
                  key={kit.id} 
                  className="hover:border-violet-500/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/solucoes/kit-lancamento/${kit.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-violet-500" />
                        <CardTitle className="text-base line-clamp-1">
                          {kit.business_name}
                        </CardTitle>
                      </div>
                      <Badge 
                        variant={kit.status === 'completed' ? 'default' : 'secondary'}
                        className={kit.status === 'completed' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : ''
                        }
                      >
                        {kit.status === 'completed' ? 'Concluído' : 'Rascunho'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(kit.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {kit.segment || 'Segmento não definido'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-4">
                  <Rocket className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum kit de lançamento criado ainda.</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Crie seu primeiro kit de lançamento para começar.
                </p>
                <Button onClick={() => navigate('/solucoes/kit-lancamento/novo')} className="gap-2 bg-violet-500 hover:bg-violet-600">
                  <Plus className="h-4 w-4" />
                  Criar primeiro kit
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer tip */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            A IA executa com base nas informações fornecidas. Quanto mais detalhes, melhor o resultado.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
