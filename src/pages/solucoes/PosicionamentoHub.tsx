import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Target, Plus, FileText, Calendar, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PosicionamentoHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();

  const { data: positionings, isLoading } = useQuery({
    queryKey: ['digital-positionings', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('digital_positionings')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  return (
    <AppLayout title="Posicionamento Digital">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Posicionamento Digital Profissional
                </h1>
                <Badge variant="secondary" className="mt-1 bg-green-500/10 text-green-600 border-green-500/20">
                  Pronto para vender
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Defina como o negócio deve se apresentar no digital, com clareza, diferencial competitivo e presença profissional.
            </p>
            <p className="text-xs text-muted-foreground/70">Entregável pronto para envio ao cliente.</p>
          </div>
          <Button onClick={() => navigate('/solucoes/posicionamento/novo')} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar posicionamento
          </Button>
        </div>

        {/* Features */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                'Posicionamento central da marca',
                'Tom de comunicação definido',
                'Bio profissional para redes',
                'Diretrizes de conteúdo'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Positionings List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Posicionamentos criados</h2>
          
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
          ) : positionings && positionings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positionings.map((positioning) => (
                <Card 
                  key={positioning.id} 
                  className="hover:border-primary/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/solucoes/posicionamento/${positioning.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <CardTitle className="text-base line-clamp-1">
                          {positioning.company_name}
                        </CardTitle>
                      </div>
                      <Badge 
                        variant={positioning.status === 'completed' ? 'default' : 'secondary'}
                        className={positioning.status === 'completed' 
                          ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                          : ''
                        }
                      >
                        {positioning.status === 'completed' ? 'Concluído' : 'Rascunho'}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(positioning.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {positioning.segment || 'Segmento não definido'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-4">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum posicionamento criado ainda.</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Crie sua primeira solução digital para começar.
                </p>
                <Button onClick={() => navigate('/solucoes/posicionamento/novo')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Criar primeiro posicionamento
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer tip */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Você não vende execução. Você entrega soluções digitais organizadas.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
