import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Rocket, Sparkles, Copy, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LaunchKitResult {
  estrutura_lancamento: string;
  sequencia_acoes: {
    pre_lancamento: string[];
    durante: string[];
    pos_lancamento: string[];
  };
  ideia_oferta: string;
  mensagens_divulgacao: {
    teaser: string;
    lancamento: string;
    urgencia: string;
  };
  checklist_execucao: string[];
}

export default function KitLancamentoDigital() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<LaunchKitResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    segment: '',
    location: '',
    mainChannel: '',
    objective: '',
    deadline: '',
    urgency: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.businessType || !formData.segment || !formData.mainChannel || !formData.objective || !formData.deadline || !formData.urgency) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-launch-kit', {
        body: formData,
      });

      if (error) throw error;

      if (data.success && data.data) {
        setResult(data.data);
        toast.success('Kit de lançamento gerado com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao gerar kit');
      }
    } catch (error) {
      console.error('Error generating launch kit:', error);
      toast.error('Erro ao gerar kit de lançamento');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleCopy(text, field)}
      className="h-8 px-2"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
    </Button>
  );

  return (
    <AppLayout title="Kit de Lançamento Digital">
      <div className="content-premium space-premium">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/solucoes')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
              <Rocket className="h-6 w-6 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Kit de Lançamento Digital</h1>
                <Badge className="bg-violet-500 text-white text-xs border-0">NOVO</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Estruture um lançamento simples e profissional para o seu cliente.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Bloco 1 - Informações do Negócio */}
            <PremiumFrame className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Informações do Negócio</h2>
              <div className="space-y-4">
                <div>
                  <Label>Nome do negócio *</Label>
                  <Input
                    placeholder="Ex: Loja da Maria"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tipo de negócio *</Label>
                  <Select value={formData.businessType} onValueChange={(v) => handleInputChange('businessType', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Segmento *</Label>
                  <Input
                    placeholder="Ex: Moda feminina, Alimentação, etc."
                    value={formData.segment}
                    onChange={(e) => handleInputChange('segment', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Localização</Label>
                  <Input
                    placeholder="Ex: São Paulo - SP"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Canal principal de divulgação *</Label>
                  <Select value={formData.mainChannel} onValueChange={(v) => handleInputChange('mainChannel', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="ambos">Ambos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PremiumFrame>

            {/* Bloco 2 - Objetivo do Lançamento */}
            <PremiumFrame className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Objetivo do Lançamento</h2>
              <div className="space-y-4">
                <div>
                  <Label>Objetivo principal *</Label>
                  <Select value={formData.objective} onValueChange={(v) => handleInputChange('objective', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reconhecimento">Reconhecimento</SelectItem>
                      <SelectItem value="primeiras_vendas">Primeiras vendas</SelectItem>
                      <SelectItem value="nova_oferta">Divulgação de nova oferta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prazo desejado *</Label>
                  <Select value={formData.deadline} onValueChange={(v) => handleInputChange('deadline', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o prazo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7_dias">7 dias</SelectItem>
                      <SelectItem value="14_dias">14 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nível de urgência *</Label>
                  <Select value={formData.urgency} onValueChange={(v) => handleInputChange('urgency', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a urgência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixo">Baixo</SelectItem>
                      <SelectItem value="medio">Médio</SelectItem>
                      <SelectItem value="alto">Alto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PremiumFrame>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 bg-violet-500 hover:bg-violet-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando Kit de Lançamento...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Gerar Kit de Lançamento com IA
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {!result && !isGenerating && (
              <PremiumFrame className="p-8 text-center">
                <Rocket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Preencha as informações e clique em gerar para criar o kit de lançamento.
                </p>
              </PremiumFrame>
            )}

            {isGenerating && (
              <PremiumFrame className="p-8 text-center">
                <Loader2 className="h-12 w-12 text-violet-500 mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Gerando kit de lançamento...</p>
              </PremiumFrame>
            )}

            {result && (
              <>
                {/* Estrutura do Lançamento */}
                <PremiumFrame className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Estrutura do Lançamento</h3>
                    <CopyButton text={result.estrutura_lancamento} field="estrutura" />
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{result.estrutura_lancamento}</p>
                </PremiumFrame>

                {/* Sequência de Ações */}
                <PremiumFrame className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Sequência de Ações</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-violet-500 mb-2">Pré-Lançamento</h4>
                      <ul className="space-y-1">
                        {result.sequencia_acoes?.pre_lancamento?.map((acao, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-success mb-2">Durante</h4>
                      <ul className="space-y-1">
                        {result.sequencia_acoes?.durante?.map((acao, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-amber-500 mb-2">Pós-Lançamento</h4>
                      <ul className="space-y-1">
                        {result.sequencia_acoes?.pos_lancamento?.map((acao, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            {acao}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </PremiumFrame>

                {/* Ideia de Oferta */}
                <PremiumFrame className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Ideia de Oferta Inicial</h3>
                    <CopyButton text={result.ideia_oferta} field="oferta" />
                  </div>
                  <p className="text-sm text-muted-foreground">{result.ideia_oferta}</p>
                </PremiumFrame>

                {/* Mensagens de Divulgação */}
                <PremiumFrame className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Mensagens de Divulgação</h3>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">Teaser</Badge>
                        <CopyButton text={result.mensagens_divulgacao?.teaser || ''} field="teaser" />
                      </div>
                      <p className="text-sm text-muted-foreground">{result.mensagens_divulgacao?.teaser}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-success/5 border border-success/10">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs border-success/30 text-success">Lançamento</Badge>
                        <CopyButton text={result.mensagens_divulgacao?.lancamento || ''} field="lancamento" />
                      </div>
                      <p className="text-sm text-muted-foreground">{result.mensagens_divulgacao?.lancamento}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-500">Urgência</Badge>
                        <CopyButton text={result.mensagens_divulgacao?.urgencia || ''} field="urgencia" />
                      </div>
                      <p className="text-sm text-muted-foreground">{result.mensagens_divulgacao?.urgencia}</p>
                    </div>
                  </div>
                </PremiumFrame>

                {/* Checklist de Execução */}
                <PremiumFrame className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Checklist de Execução</h3>
                  <ul className="space-y-2">
                    {result.checklist_execucao?.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-violet-500">{i + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumFrame>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
