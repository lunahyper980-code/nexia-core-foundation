import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, ArrowLeft, Download, Calendar, CheckCircle2, Sparkles, Copy, Check, Building2, Globe, AlertTriangle, Target, ArrowRight, Trash2, Loader2, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function BriefingDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const { data: briefing, isLoading, refetch } = useQuery({
    queryKey: ['briefing', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const { error } = await supabase.from('briefings').delete().eq('id', id);
      if (error) throw error;
      toast.success('Briefing excluído com sucesso');
      navigate('/nexia-ai/briefings');
    } catch (error) {
      console.error('Error deleting briefing:', error);
      toast.error('Erro ao excluir briefing');
    }
  };

  const handleConvertToDiagnosis = async () => {
    if (!briefing || !workspace?.id || !user?.id) return;

    setIsConverting(true);

    try {
      // Create planning with ALL briefing data - ready for diagnosis
      const { data: planning, error: planningError } = await supabase
        .from('nexia_plannings')
        .insert({
          workspace_id: workspace.id,
          created_by_user_id: user.id,
          name: `Planejamento - ${briefing.company_name}`,
          company_name: briefing.company_name,
          sector_niche: briefing.segment,
          location_region: briefing.location,
          company_size: briefing.company_size,
          main_problem: briefing.main_difficulty,
          growth_bottlenecks: briefing.main_bottleneck,
          primary_goal: briefing.main_priority,
          initial_objective: briefing.what_to_improve,
          // Store additional briefing data for diagnosis
          maturity_level: briefing.maturity_level,
          main_challenges: briefing.main_pains,
          // Mark as coming from a complete briefing - skip data collection
          mode: 'from_briefing',
          status: 'ready_for_diagnosis',
          current_step: 2, // Skip to diagnosis step
          // Store briefing context for reference
          description: JSON.stringify({
            source: 'briefing_completo',
            briefing_id: id,
            has_website: briefing.has_website,
            social_networks: briefing.social_networks,
            main_contact_channel: briefing.main_contact_channel,
            service_type: briefing.service_type,
            where_loses_clients: briefing.where_loses_clients,
            interests: briefing.interests,
            intelligent_summary: briefing.intelligent_summary,
            opportunities: briefing.opportunities,
          }),
        })
        .select()
        .single();

      if (planningError) throw planningError;

      // Update briefing as converted
      await supabase
        .from('briefings')
        .update({
          converted_to_planning_id: planning.id,
          converted_at: new Date().toISOString(),
        })
        .eq('id', id);

      // Log activity
      await supabase.from('activity_logs').insert({
        workspace_id: workspace.id,
        user_id: user.id,
        type: 'briefing_converted',
        message: `Briefing de ${briefing.company_name} convertido em diagnóstico`,
        entity_type: 'briefing',
        entity_id: id,
      });

      toast.success('Briefing convertido! Escolha o tipo de planejamento.');
      
      // Navigate directly to planning choice - data is already complete
      navigate(`/nexia-ai/escolher-planejamento?briefingId=${planning.id}&briefingName=${encodeURIComponent(briefing.company_name)}&fromBriefing=true`);

    } catch (error: any) {
      console.error('Error converting briefing:', error);
      toast.error(error.message || 'Erro ao converter briefing');
    } finally {
      setIsConverting(false);
      setConvertOpen(false);
    }
  };

  const handleExportPDF = () => {
    if (!briefing) return;

    const socialNetworksText = briefing.social_networks?.join(', ') || 'Nenhuma';
    const interestsText = briefing.interests?.join(', ') || 'Nenhum';

    const printContent = `
      <html>
        <head>
          <title>Briefing - ${briefing.company_name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 30px; }
            h2 { color: #059669; margin-top: 35px; margin-bottom: 15px; font-size: 18px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .field { margin-bottom: 12px; }
            .field-label { font-weight: 600; color: #374151; }
            .field-value { color: #6b7280; }
            .analysis { background: linear-gradient(135deg, #ecfdf5, #d1fae5); border: 1px solid #a7f3d0; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Briefing Profissional</h1>
          <div class="meta">
            <strong>${briefing.company_name}</strong><br>
            ${briefing.segment || 'Segmento não definido'} · ${briefing.location || 'Localização não definida'}<br>
            Criado em ${format(new Date(briefing.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>

          <div class="section">
            <h2>Dados do Negócio</h2>
            <div class="field"><span class="field-label">Empresa:</span> <span class="field-value">${briefing.company_name}</span></div>
            <div class="field"><span class="field-label">Localização:</span> <span class="field-value">${briefing.location || 'Não informada'}</span></div>
            <div class="field"><span class="field-label">Segmento:</span> <span class="field-value">${briefing.segment || 'Não informado'}</span></div>
            <div class="field"><span class="field-label">Tempo de atuação:</span> <span class="field-value">${briefing.time_in_business || 'Não informado'}</span></div>
            <div class="field"><span class="field-label">Tamanho:</span> <span class="field-value">${briefing.company_size || 'Não informado'}</span></div>
          </div>

          <div class="section">
            <h2>Presença Digital</h2>
            <div class="field"><span class="field-label">Possui site:</span> <span class="field-value">${briefing.has_website ? 'Sim' : 'Não'}</span></div>
            <div class="field"><span class="field-label">Redes sociais:</span> <span class="field-value">${socialNetworksText}</span></div>
            <div class="field"><span class="field-label">Canal principal:</span> <span class="field-value">${briefing.main_contact_channel || 'Não informado'}</span></div>
            <div class="field"><span class="field-label">Tipo de atendimento:</span> <span class="field-value">${briefing.service_type || 'Não informado'}</span></div>
          </div>

          <div class="section">
            <h2>Situação Atual</h2>
            <div class="field"><span class="field-label">Principal dificuldade:</span> <span class="field-value">${briefing.main_difficulty || 'Não informada'}</span></div>
            <div class="field"><span class="field-label">Onde perde clientes:</span> <span class="field-value">${briefing.where_loses_clients || 'Não informado'}</span></div>
            <div class="field"><span class="field-label">Maior gargalo:</span> <span class="field-value">${briefing.main_bottleneck || 'Não informado'}</span></div>
          </div>

          <div class="section">
            <h2>Objetivos</h2>
            <div class="field"><span class="field-label">O que deseja melhorar:</span> <span class="field-value">${briefing.what_to_improve || 'Não informado'}</span></div>
            <div class="field"><span class="field-label">Prioridade principal:</span> <span class="field-value">${briefing.main_priority || 'Não informada'}</span></div>
            <div class="field"><span class="field-label">Interesses:</span> <span class="field-value">${interestsText}</span></div>
          </div>

          ${briefing.intelligent_summary ? `
            <div class="section analysis">
              <h2>Análise Inteligente</h2>
              <div class="field"><span class="field-label">Nível de maturidade:</span> <span class="field-value">${briefing.maturity_level || '-'}</span></div>
              <div class="field"><span class="field-label">Principais dores:</span> <span class="field-value">${briefing.main_pains || '-'}</span></div>
              <div class="field"><span class="field-label">Oportunidades:</span> <span class="field-value">${briefing.opportunities || '-'}</span></div>
              <p>${briefing.intelligent_summary}</p>
            </div>
          ` : ''}

          <div class="footer">
            Documento gerado automaticamente pelo sistema de briefing profissional.
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('PDF pronto para impressão!');
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button variant="ghost" size="sm" onClick={() => handleCopy(text, field)} className="h-8 px-2">
      {copiedField === field ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );

  if (isLoading) {
    return (
      <AppLayout title="Briefing">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="h-4 bg-muted rounded w-1/2" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-48 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!briefing) {
    return (
      <AppLayout title="Briefing">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Briefing não encontrado</h2>
              <Button onClick={() => navigate('/nexia-ai/briefings')} className="mt-4">
                Voltar para briefings
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const getStatusBadge = () => {
    if (briefing.converted_at) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Convertido
        </Badge>
      );
    }
    if (briefing.status === 'analyzed') {
      return (
        <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
          <Sparkles className="h-3 w-3 mr-1" />
          Analisado
        </Badge>
      );
    }
    return <Badge variant="secondary">Concluído</Badge>;
  };

  return (
    <AppLayout title="Briefing">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai/briefings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <ClipboardList className="h-5 w-5 text-emerald-500" />
                <h1 className="text-xl font-bold">{briefing.company_name}</h1>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Criado em {format(new Date(briefing.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            {!briefing.converted_at && (
              <Button onClick={() => setConvertOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                <ArrowRight className="h-4 w-4" />
                Converter em Diagnóstico
              </Button>
            )}
          </div>
        </div>

        {/* Analysis Summary */}
        {briefing.intelligent_summary && (
          <Card className="bg-gradient-to-br from-emerald-500/5 to-teal-500/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-500" />
                  Análise Inteligente
                </CardTitle>
                <Badge variant="outline" className="text-emerald-600 border-emerald-500/30">
                  {briefing.maturity_level || 'Analisado'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {briefing.main_pains && (
                  <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10">
                    <h4 className="text-sm font-medium text-red-600 mb-1">Principais Dores</h4>
                    <p className="text-sm text-muted-foreground">{briefing.main_pains}</p>
                  </div>
                )}
                {briefing.opportunities && (
                  <div className="p-3 bg-green-500/5 rounded-lg border border-green-500/10">
                    <h4 className="text-sm font-medium text-green-600 mb-1">Oportunidades</h4>
                    <p className="text-sm text-muted-foreground">{briefing.opportunities}</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-line">{briefing.intelligent_summary}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Briefing Data */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Block 1: Business Data */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-500" />
                Dados do Negócio
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Empresa</span>
                  <p className="font-medium">{briefing.company_name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Localização</span>
                  <p className="font-medium">{briefing.location || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Segmento</span>
                  <p className="font-medium">{briefing.segment || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tempo de atuação</span>
                  <p className="font-medium capitalize">{briefing.time_in_business?.replace('_', ' ') || '-'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Tamanho</span>
                  <p className="font-medium capitalize">{briefing.company_size || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block 2: Digital Presence */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                Presença Digital
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Possui site</span>
                  <p className="font-medium">{briefing.has_website ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Canal principal</span>
                  <p className="font-medium capitalize">{briefing.main_contact_channel || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Redes sociais</span>
                  <p className="font-medium capitalize">{briefing.social_networks?.join(', ') || 'Nenhuma'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Atendimento</span>
                  <p className="font-medium capitalize">{briefing.service_type?.replace('_', ' ') || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block 3: Current Situation */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Situação Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Principal dificuldade</span>
                <p className="font-medium">{briefing.main_difficulty || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Onde perde clientes</span>
                <p className="font-medium">{briefing.where_loses_clients || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Maior gargalo</span>
                <p className="font-medium">{briefing.main_bottleneck || '-'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Block 4: Objectives */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Objetivos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">O que deseja melhorar</span>
                <p className="font-medium">{briefing.what_to_improve || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prioridade principal</span>
                <p className="font-medium capitalize">{briefing.main_priority?.replace('_', ' ') || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Interesses</span>
                <p className="font-medium capitalize">{briefing.interests?.join(', ') || 'Nenhum'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Footer */}
        {!briefing.converted_at && (
          <Card className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Pronto para avançar?</h3>
                  <p className="text-sm text-muted-foreground">
                    Converta este briefing em um diagnóstico Nexia para receber recomendações personalizadas.
                  </p>
                </div>
                <Button onClick={() => setConvertOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  <ArrowRight className="h-4 w-4" />
                  Converter em Diagnóstico Nexia
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          title="Excluir briefing"
          description="Tem certeza que deseja excluir este briefing? Esta ação não pode ser desfeita."
        />

        {/* Convert Dialog */}
        <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                Converter em Diagnóstico Nexia
              </DialogTitle>
              <DialogDescription>
                Ao converter, os dados do briefing serão usados para criar um planejamento no Nexia. O briefing não cria cliente automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <p className="text-sm"><strong>Empresa:</strong> {briefing.company_name}</p>
                <p className="text-sm"><strong>Segmento:</strong> {briefing.segment || 'Não definido'}</p>
                <p className="text-sm"><strong>Prioridade:</strong> {briefing.main_priority?.replace('_', ' ') || 'Não definida'}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConvertOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleConvertToDiagnosis} 
                disabled={isConverting}
                className="gap-2 bg-emerald-500 hover:bg-emerald-600"
              >
                {isConverting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Convertendo...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Converter e iniciar diagnóstico
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
