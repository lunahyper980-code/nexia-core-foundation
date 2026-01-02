import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  Package, 
  Sparkles, 
  Copy, 
  FileText,
  Download,
  Check,
  Loader2,
  CheckCircle,
  Link2,
  Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Diagnosis {
  id: string;
  company_name: string;
  segment: string | null;
  city_state: string | null;
  has_website: boolean | null;
  social_networks: string[] | null;
  main_objective: string | null;
  main_problem_perceived: string | null;
  online_presence_rating: number | null;
  contact_ease_rating: number | null;
  professionalism_rating: number | null;
  digital_communication_rating: number | null;
  diagnosis_text: string | null;
  status: string;
}

interface Proposal {
  id: string;
  company_name: string;
  service_offered: string;
  service_value: number | null;
  status: string;
  created_at: string;
}

export default function DiagnosticoEntrega() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedDiagnosisId, setSelectedDiagnosisId] = useState<string>('');
  const [deliveryMaterial, setDeliveryMaterial] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedDeliveryId, setSavedDeliveryId] = useState<string | null>(null);

  const { data: diagnoses = [], isLoading: isLoadingDiagnoses } = useQuery({
    queryKey: ['completed-diagnoses-for-delivery', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('digital_diagnoses')
        .select('*')
        .eq('workspace_id', workspace.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Diagnosis[];
    },
    enabled: !!workspace?.id,
  });

  const selectedDiagnosis = diagnoses.find(d => d.id === selectedDiagnosisId);

  // Buscar propostas do mesmo cliente (por company_name)
  const { data: matchingProposals = [] } = useQuery({
    queryKey: ['matching-proposals', workspace?.id, selectedDiagnosis?.company_name],
    queryFn: async () => {
      if (!workspace?.id || !selectedDiagnosis?.company_name) return [];
      const { data, error } = await supabase
        .from('solution_proposals')
        .select('*')
        .eq('workspace_id', workspace.id)
        .ilike('company_name', selectedDiagnosis.company_name)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Proposal[];
    },
    enabled: !!workspace?.id && !!selectedDiagnosis?.company_name,
  });

  // Buscar cliente existente pelo nome da empresa
  const { data: matchingClients = [] } = useQuery({
    queryKey: ['matching-clients', workspace?.id, selectedDiagnosis?.company_name],
    queryFn: async () => {
      if (!workspace?.id || !selectedDiagnosis?.company_name) return [];
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('workspace_id', workspace.id)
        .ilike('name', selectedDiagnosis.company_name)
        .limit(1);
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id && !!selectedDiagnosis?.company_name,
  });

  const handleGenerate = async () => {
    if (!selectedDiagnosis) {
      toast({
        title: "Selecione um diagnóstico",
        description: "Escolha um diagnóstico para gerar o material de entrega.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setSavedDeliveryId(null);
    try {
      const { data, error } = await supabase.functions.invoke('generate-delivery-material', {
        body: { diagnosisData: selectedDiagnosis }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setDeliveryMaterial(data.deliveryMaterial);
      toast({
        title: "Material gerado!",
        description: "O material de entrega foi gerado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro ao gerar material:', error);
      toast({
        title: "Erro ao gerar material",
        description: error.message || "Tente novamente em alguns segundos.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndLink = async () => {
    if (!workspace?.id || !selectedDiagnosis || !deliveryMaterial || !user) return;

    const linkedProposal = matchingProposals[0];
    let clientId = matchingClients[0]?.id;

    setIsSaving(true);
    try {
      // Se não existe cliente, cria um novo
      if (!clientId) {
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            workspace_id: workspace.id,
            name: selectedDiagnosis.company_name,
            segment: selectedDiagnosis.segment,
            city: selectedDiagnosis.city_state,
            created_by_user_id: user.id,
            status: 'active',
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // Salva a entrega
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          workspace_id: workspace.id,
          title: `Material de Entrega - ${selectedDiagnosis.company_name}`,
          description: deliveryMaterial,
          delivery_type: 'diagnostico_digital',
          delivery_date: new Date().toISOString().split('T')[0],
          client_id: clientId,
          proposal_id: linkedProposal?.id || null,
          created_by_user_id: user.id,
          status: 'delivered',
          observations: `Gerado a partir do diagnóstico digital de ${selectedDiagnosis.company_name}`,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedDeliveryId(data.id);
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['matching-clients'] });
      
      toast({
        title: "Entrega salva!",
        description: linkedProposal 
          ? `Material vinculado à proposta de ${linkedProposal.company_name}.`
          : "Material salvo e cliente registrado.",
      });
    } catch (error: any) {
      console.error('Erro ao salvar entrega:', error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(deliveryMaterial);
    setCopied(true);
    toast({
      title: "Copiado!",
      description: "Material copiado para a área de transferência.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Material de Entrega - ${selectedDiagnosis?.company_name}</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
              color: #333;
            }
            h1 { 
              color: #1a1a1a; 
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            h2 { 
              color: #2563eb; 
              margin-top: 30px;
              margin-bottom: 15px;
            }
            p, li { margin-bottom: 10px; }
            ul, ol { padding-left: 20px; }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              color: #1a1a1a;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">${selectedDiagnosis?.company_name}</div>
            <p style="color: #666;">Material de Entrega - Diagnóstico Digital</p>
          </div>
          ${deliveryMaterial.replace(/\n/g, '<br>').replace(/## /g, '<h2>').replace(/\*\*/g, '')}
          <div class="footer">
            <p>Documento gerado automaticamente</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <AppLayout title="Material de Entrega">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/solucoes/diagnostico')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Package className="h-7 w-7 text-blue-500" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            Material de Entrega
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Gere um material profissional para entregar ao cliente com todas as análises e recomendações
          </p>
        </div>

        {/* Select Diagnosis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              Selecionar Diagnóstico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingDiagnoses ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando diagnósticos...
              </div>
            ) : diagnoses.length === 0 ? (
              <div className="text-center py-6">
                <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhum diagnóstico concluído encontrado</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/solucoes/diagnostico/novo')}
                >
                  Criar diagnóstico
                </Button>
              </div>
            ) : (
              <>
                <Select value={selectedDiagnosisId} onValueChange={setSelectedDiagnosisId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um diagnóstico concluído" />
                  </SelectTrigger>
                  <SelectContent>
                    {diagnoses.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.company_name} - {d.segment || 'Sem segmento'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDiagnosis && (
                  <div className="space-y-3">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{selectedDiagnosis.company_name}</span>
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Concluído
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedDiagnosis.segment} • {selectedDiagnosis.city_state || 'Local não informado'}
                      </p>
                    </div>

                    {/* Proposta vinculada */}
                    {matchingProposals.length > 0 && (
                      <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm">
                          <Link2 className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">Proposta encontrada:</span>
                          <span className="font-medium text-primary">
                            {matchingProposals[0].service_offered}
                          </span>
                          {matchingProposals[0].service_value && (
                            <Badge variant="secondary" className="ml-auto">
                              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(matchingProposals[0].service_value)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  onClick={handleGenerate}
                  disabled={!selectedDiagnosisId || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Gerando material...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Gerar Material de Entrega
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Generated Material */}
        {deliveryMaterial && (
          <Card className="border-2 border-success/30">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-success" />
                  Material Gerado
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copiar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportPDF}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                  {!savedDeliveryId && (
                    <Button
                      size="sm"
                      onClick={handleSaveAndLink}
                      disabled={isSaving}
                      className="gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {matchingProposals.length > 0 ? 'Salvar e Vincular' : 'Salvar Entrega'}
                        </>
                      )}
                    </Button>
                  )}
                  {savedDeliveryId && (
                    <Badge variant="outline" className="bg-success/10 text-success border-success/20 gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Salvo
                    </Badge>
                  )}
                </div>
              </div>
              
              {/* Info de vinculação */}
              {savedDeliveryId && matchingProposals.length > 0 && (
                <div className="mt-3 p-3 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-success">
                    <Link2 className="h-4 w-4" />
                    <span>Vinculado à proposta: <strong>{matchingProposals[0].service_offered}</strong></span>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {deliveryMaterial}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              💡 <strong>Dica:</strong> Use este material para apresentar as descobertas do diagnóstico ao cliente 
              de forma profissional e organizada. Você pode exportar como PDF ou copiar e colar em um documento.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
