import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Download, 
  FileOutput,
  Loader2,
  Stethoscope,
  Building2,
  MapPin,
  Globe,
  MessageSquare,
  Eye,
  AlertTriangle,
  Lightbulb,
  ListChecks,
  ArrowRight,
  Trash2,
  Sparkles,
  ClipboardList,
  Brain
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AIResponseCard } from '@/components/AIResponseCard';
import { DiagnosisPDFDocument } from '@/components/DiagnosisPDFDocument';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

interface DiagnosisSections {
  visao_geral?: string;
  pontos_atencao?: string;
  oportunidades?: string;
  recomendacoes?: string;
  proximo_passo?: string;
}

export default function DiagnosticoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sections, setSections] = useState<DiagnosisSections>({});
  const [showPDFView, setShowPDFView] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: diagnosis, isLoading } = useQuery({
    queryKey: ['diagnosis', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('digital_diagnoses')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (diagnosis?.diagnosis_text) {
      try {
        // Remove code block markers if present
        let cleanText = diagnosis.diagnosis_text;
        cleanText = cleanText.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        
        const parsed = JSON.parse(cleanText);
        setSections(parsed);
      } catch {
        setSections({ visao_geral: diagnosis.diagnosis_text });
      }
    }
  }, [diagnosis]);

  const handleExportPDF = () => {
    setShowPDFView(true);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('digital_diagnoses')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['digital-diagnoses'] });
      
      toast({
        title: 'Diagnóstico excluído',
        description: 'O diagnóstico foi removido com sucesso.'
      });
      
      navigate('/solucoes/diagnostico');
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const useAsProposal = () => {
    navigate(`/vendas/propostas/nova?diagnostico=${id}`);
  };

  const handleSectionChange = (key: string, newContent: string) => {
    setSections(prev => ({ ...prev, [key]: newContent }));
  };

  if (isLoading) {
    return (
      <AppLayout title="Diagnóstico">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!diagnosis) {
    return (
      <AppLayout title="Diagnóstico">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Diagnóstico não encontrado</p>
          <Button variant="link" onClick={() => navigate('/solucoes/diagnostico')}>
            Voltar para diagnósticos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const sectionConfig = [
    { key: 'visao_geral', title: 'Visão Geral', icon: <Eye className="h-4 w-4 text-blue-500" />, fullWidth: true },
    { key: 'pontos_atencao', title: 'Pontos de Atenção', icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    { key: 'oportunidades', title: 'Oportunidades', icon: <Lightbulb className="h-4 w-4 text-green-500" /> },
    { key: 'recomendacoes', title: 'Recomendações', icon: <ListChecks className="h-4 w-4 text-purple-500" />, fullWidth: true },
    { key: 'proximo_passo', title: 'Próximo Passo', icon: <ArrowRight className="h-4 w-4 text-primary" />, fullWidth: true },
  ];

  return (
    <>
      <AppLayout title="Diagnóstico">
        <div className="w-full space-y-6">
          {/* Top Actions */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/solucoes/diagnostico')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">Diagnóstico Digital</CardTitle>
                  </div>
                  <Badge className="bg-success text-success-foreground">Concluído</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(diagnosis.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Empresa</p>
                    <p className="font-medium">{diagnosis.company_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Localização</p>
                    <p className="font-medium">{diagnosis.city_state || 'Não informado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Site</p>
                    <p className="font-medium">{diagnosis.has_website ? 'Sim' : 'Não'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Redes Sociais</p>
                    <p className="font-medium">{diagnosis.social_networks?.length > 0 ? diagnosis.social_networks.join(', ') : 'Nenhuma'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            {sectionConfig.map(({ key, title, icon, fullWidth }) => 
              sections[key as keyof DiagnosisSections] && (
                <AIResponseCard
                  key={key}
                  title={title}
                  content={sections[key as keyof DiagnosisSections] || ''}
                  icon={icon}
                  onContentChange={(newContent) => handleSectionChange(key, newContent)}
                  className={fullWidth ? 'md:col-span-2' : ''}
                />
              )
            )}
          </div>

          {/* Actions */}
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                Este diagnóstico pode ser entregue como serviço profissional ao cliente.
              </p>
              <Button onClick={useAsProposal} className="gap-2">
                <FileOutput className="h-4 w-4" />
                Usar como proposta
              </Button>
            </CardContent>
          </Card>

          {/* Next Step Block */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">
                    Próximo passo recomendado
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Com base nessa análise, o próximo passo é criar o planejamento estratégico no Nexia.
                    <br />
                    Caso você ainda não tenha coletado todas as informações do cliente, gere o briefing agora.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto pt-2">
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/briefing-rapido')}
                    className="gap-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    Gerar briefing rápido
                  </Button>
                  <Button 
                    onClick={() => navigate('/nexia-ai/planejamento/novo')}
                    className="gap-2"
                  >
                    <Brain className="h-4 w-4" />
                    Criar planejamento no Nexia
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>

      {/* PDF Document View */}
      {showPDFView && (
        <DiagnosisPDFDocument 
          diagnosis={diagnosis} 
          onClose={() => setShowPDFView(false)} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Excluir diagnóstico"
        description={`Tem certeza que deseja excluir o diagnóstico de "${diagnosis.company_name}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </>
  );
}
