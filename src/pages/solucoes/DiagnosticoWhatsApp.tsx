import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ArrowLeft, Copy, Check, Loader2, RefreshCw, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Messages {
  primeiro_contato?: string;
  follow_up?: string;
  proposta?: string;
  fechamento?: string;
  [key: string]: string | undefined;
}

const MESSAGE_TYPES = [
  { id: 'primeiro_contato', label: 'Primeiro Contato', icon: '👋', description: 'Iniciar conversa' },
  { id: 'follow_up', label: 'Follow-up', icon: '🔄', description: 'Retomar contato' },
  { id: 'proposta', label: 'Envio de Proposta', icon: '📄', description: 'Acompanhar proposta' },
  { id: 'fechamento', label: 'Fechamento', icon: '🤝', description: 'Incentivar decisão' },
];

export default function DiagnosticoWhatsApp() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const diagnosisId = searchParams.get('diagnosisId');
  const { workspace } = useWorkspace();
  
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>(diagnosisId || '');
  const [messages, setMessages] = useState<Messages>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('primeiro_contato');

  // Fetch all diagnoses
  const { data: diagnoses, isLoading: loadingDiagnoses } = useQuery({
    queryKey: ['diagnoses-for-whatsapp', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('digital_diagnoses')
        .select('id, company_name, segment, city_state, main_objective, main_problem_perceived, diagnosis_text, status')
        .eq('workspace_id', workspace.id)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  // Set initial diagnosis if provided via URL
  useEffect(() => {
    if (diagnosisId && !selectedDiagnosis) {
      setSelectedDiagnosis(diagnosisId);
    }
  }, [diagnosisId]);

  const selectedDiagnosisData = diagnoses?.find(d => d.id === selectedDiagnosis);

  const handleGenerateMessages = async () => {
    if (!selectedDiagnosisData) {
      toast.error('Selecione um diagnóstico primeiro');
      return;
    }

    setIsGenerating(true);
    setMessages({});

    try {
      const { data, error } = await supabase.functions.invoke('generate-whatsapp-messages', {
        body: {
          diagnosisData: {
            companyName: selectedDiagnosisData.company_name,
            segment: selectedDiagnosisData.segment,
            cityState: selectedDiagnosisData.city_state,
            mainObjective: selectedDiagnosisData.main_objective,
            mainProblem: selectedDiagnosisData.main_problem_perceived,
            diagnosisText: selectedDiagnosisData.diagnosis_text,
          },
          messageType: 'all'
        }
      });

      if (error) throw error;

      setMessages(data.messages);
      toast.success('Mensagens geradas com sucesso!');
    } catch (error: any) {
      console.error('Error generating messages:', error);
      toast.error(error.message || 'Erro ao gerar mensagens');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Mensagem copiada!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = (text: string) => {
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const hasMessages = Object.keys(messages).length > 0;

  return (
    <AppLayout title="Mensagens WhatsApp">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/diagnostico')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-500" />
              <h1 className="text-xl font-bold">Mensagens para WhatsApp</h1>
            </div>
            <p className="text-sm text-muted-foreground">
              Gere mensagens personalizadas baseadas no diagnóstico do cliente
            </p>
          </div>
        </div>

        {/* Diagnosis Selector */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Selecionar Diagnóstico</CardTitle>
            <CardDescription>
              Escolha um diagnóstico para gerar mensagens personalizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um diagnóstico..." />
              </SelectTrigger>
              <SelectContent>
                {loadingDiagnoses ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                  </div>
                ) : diagnoses && diagnoses.length > 0 ? (
                  diagnoses.map((diagnosis) => (
                    <SelectItem key={diagnosis.id} value={diagnosis.id}>
                      <div className="flex items-center gap-2">
                        <span>{diagnosis.company_name}</span>
                        {diagnosis.segment && (
                          <Badge variant="outline" className="text-xs">
                            {diagnosis.segment}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    Nenhum diagnóstico concluído encontrado
                  </div>
                )}
              </SelectContent>
            </Select>

            {selectedDiagnosisData && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{selectedDiagnosisData.company_name}</span>
                  <Badge variant="secondary">{selectedDiagnosisData.segment}</Badge>
                </div>
                {selectedDiagnosisData.main_objective && (
                  <p className="text-sm text-muted-foreground">
                    Objetivo: {selectedDiagnosisData.main_objective}
                  </p>
                )}
              </div>
            )}

            <Button 
              onClick={handleGenerateMessages} 
              disabled={!selectedDiagnosis || isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Gerando mensagens...
                </>
              ) : hasMessages ? (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Gerar novas mensagens
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Gerar mensagens com IA
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Messages */}
        {hasMessages && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                Mensagens Geradas
              </CardTitle>
              <CardDescription>
                Clique para copiar ou enviar diretamente pelo WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  {MESSAGE_TYPES.map((type) => (
                    <TabsTrigger key={type.id} value={type.id} className="text-xs md:text-sm">
                      <span className="hidden md:inline mr-1">{type.icon}</span>
                      <span className="truncate">{type.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {MESSAGE_TYPES.map((type) => (
                  <TabsContent key={type.id} value={type.id} className="mt-4">
                    {messages[type.id] ? (
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <div className="flex items-start gap-2 mb-3">
                            <span className="text-2xl">{type.icon}</span>
                            <div>
                              <h4 className="font-medium">{type.label}</h4>
                              <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                          </div>
                          <div className="bg-background rounded-lg p-4 border whitespace-pre-wrap text-sm leading-relaxed">
                            {messages[type.id]}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => handleCopy(messages[type.id]!, type.id)}
                          >
                            {copiedId === type.id ? (
                              <>
                                <Check className="h-4 w-4 text-green-500" />
                                Copiado!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copiar
                              </>
                            )}
                          </Button>
                          <Button
                            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                            onClick={() => handleOpenWhatsApp(messages[type.id]!)}
                          >
                            <Send className="h-4 w-4" />
                            Abrir WhatsApp
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Mensagem não disponível</p>
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!hasMessages && !isGenerating && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-green-500/10 mb-4">
                <MessageSquare className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">Mensagens personalizadas para WhatsApp</h3>
              <p className="text-muted-foreground max-w-md mb-4">
                Selecione um diagnóstico concluído e a IA gerará mensagens prontas para você 
                enviar ao cliente: primeiro contato, follow-up, proposta e fechamento.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {MESSAGE_TYPES.map((type) => (
                  <Badge key={type.id} variant="secondary" className="gap-1">
                    {type.icon} {type.label}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading Overlay */}
        {isGenerating && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="w-full max-w-sm mx-4">
              <CardContent className="flex flex-col items-center py-8">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-green-500 animate-pulse" />
                  </div>
                  <Loader2 className="h-6 w-6 text-green-500 animate-spin absolute -bottom-1 -right-1" />
                </div>
                <h3 className="text-lg font-semibold mt-4">Gerando mensagens...</h3>
                <p className="text-sm text-muted-foreground text-center mt-2">
                  A IA está criando mensagens personalizadas para {selectedDiagnosisData?.company_name}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Footer Tip */}
        <div className="bg-green-500/10 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 As mensagens são geradas com base no diagnóstico. Personalize antes de enviar!
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
