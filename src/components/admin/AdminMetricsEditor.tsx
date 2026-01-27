import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { 
  BarChart3, 
  DollarSign, 
  RefreshCcw, 
  Users,
  Save, 
  Loader2,
  TrendingUp,
  Info,
  Percent,
} from 'lucide-react';

interface MetricsValues {
  total_pipeline_value: number;
  recurrence_monthly: number;
  projects: number;
  proposals: number;
  clients: number;
  contracts: number;
}

export function AdminMetricsEditor() {
  const { workspace } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<MetricsValues>({
    total_pipeline_value: 62000,
    recurrence_monthly: 3223,
    projects: 32,
    proposals: 38,
    clients: 29,
    contracts: 24,
  });

  // Derived values
  const commission = Math.round(values.recurrence_monthly * 0.1 * 14.3); // ~10% do volume simulado da equipe
  const averageTicket = values.projects > 0 ? Math.round(values.total_pipeline_value / values.projects) : 0;

  // Fetch current values
  useEffect(() => {
    if (!workspace?.id) return;

    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('owner_metrics')
          .select('*')
          .eq('workspace_id', workspace.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching metrics:', error);
          return;
        }

        if (data) {
          setValues({
            total_pipeline_value: Number(data.total_pipeline_value) || 62000,
            recurrence_monthly: Number(data.recurrence_monthly) || 3223,
            projects: data.projects || 32,
            proposals: data.proposals || 38,
            clients: data.clients || 29,
            contracts: data.contracts || 24,
          });
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [workspace?.id]);

  const handleSave = async () => {
    if (!workspace?.id) return;

    setSaving(true);
    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from('owner_metrics')
        .select('id')
        .eq('workspace_id', workspace.id)
        .maybeSingle();

      const updateData = {
        total_pipeline_value: values.total_pipeline_value,
        recurrence_monthly: values.recurrence_monthly,
        projects: values.projects,
        proposals: values.proposals,
        clients: values.clients,
        contracts: values.contracts,
        updated_at: new Date().toISOString(),
      };

      if (existing) {
        const { error } = await supabase
          .from('owner_metrics')
          .update(updateData)
          .eq('workspace_id', workspace.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('owner_metrics')
          .insert({
            ...updateData,
            workspace_id: workspace.id,
            reference_date: new Date().toISOString(),
          });

        if (error) throw error;
      }

      toast.success('Métricas atualizadas com sucesso!', {
        description: 'Os valores serão refletidos no Dashboard, Minha Equipe e Contratos.',
      });
    } catch (error) {
      console.error('Error saving metrics:', error);
      toast.error('Erro ao salvar métricas');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
        <Info className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-foreground">Editor de Métricas do Dashboard</p>
          <p className="text-sm text-muted-foreground mt-1">
            Altere os valores abaixo para personalizar o Dashboard, Minha Equipe e Contratos.
            As mudanças são aplicadas automaticamente ao gráfico de evolução.
          </p>
        </div>
      </div>

      {/* Main Values - Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-lg">Faturamento & Recorrência</CardTitle>
              <CardDescription>Valores exibidos nos cards do Dashboard</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Faturamento Total */}
            <div className="space-y-2">
              <Label htmlFor="total_pipeline_value" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-emerald-500" />
                Faturamento Total
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="total_pipeline_value"
                  type="number"
                  value={values.total_pipeline_value}
                  onChange={(e) => setValues({ ...values, total_pipeline_value: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Valor exibido como "Faturamento Total" no Dashboard
              </p>
            </div>

            {/* Recorrência Mensal */}
            <div className="space-y-2">
              <Label htmlFor="recurrence_monthly" className="flex items-center gap-2">
                <RefreshCcw className="h-4 w-4 text-primary" />
                Recorrência Mensal
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">R$</span>
                <Input
                  id="recurrence_monthly"
                  type="number"
                  value={values.recurrence_monthly}
                  onChange={(e) => setValues({ ...values, recurrence_monthly: Number(e.target.value) })}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Valor exibido como "Recorrência Mensal" no Dashboard
              </p>
            </div>
          </div>

          {/* Preview dos valores derivados */}
          <Separator />
          
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="h-4 w-4 text-warning" />
                <span className="text-sm font-medium text-foreground">Comissão (calculada)</span>
              </div>
              <p className="text-xl font-bold text-warning">{formatCurrency(commission)}</p>
              <p className="text-xs text-muted-foreground mt-1">10% do volume da equipe</p>
            </div>
            
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Ticket Médio (calculado)</span>
              </div>
              <p className="text-xl font-bold text-primary">{formatCurrency(averageTicket)}</p>
              <p className="text-xs text-muted-foreground mt-1">Faturamento ÷ Projetos</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Counters - Minha Equipe & Dashboard */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Contadores</CardTitle>
              <CardDescription>Quantidade de projetos, propostas, clientes e contratos</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="projects">Projetos</Label>
              <Input
                id="projects"
                type="number"
                value={values.projects}
                onChange={(e) => setValues({ ...values, projects: Number(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="proposals">Propostas</Label>
              <Input
                id="proposals"
                type="number"
                value={values.proposals}
                onChange={(e) => setValues({ ...values, proposals: Number(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clients">Clientes</Label>
              <Input
                id="clients"
                type="number"
                value={values.clients}
                onChange={(e) => setValues({ ...values, clients: Number(e.target.value) })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contracts">Contratos</Label>
              <Input
                id="contracts"
                type="number"
                value={values.contracts}
                onChange={(e) => setValues({ ...values, contracts: Number(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Salvar Alterações
        </Button>
      </div>

      {/* Affected Areas */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Áreas Afetadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Dashboard</Badge>
            <Badge variant="outline">Gráfico de Evolução</Badge>
            <Badge variant="outline">Minha Equipe</Badge>
            <Badge variant="outline">Contratos</Badge>
            <Badge variant="outline">Status da Operação</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
