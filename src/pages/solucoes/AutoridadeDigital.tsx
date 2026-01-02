import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PremiumFrame } from '@/components/ui/PremiumFrame';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Award, Sparkles, Copy, Check, Loader2, CheckCircle2, Lightbulb } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthorityResult {
  estrategia_reconhecimento: string;
  diretrizes_posicionamento: string[];
  ideias_conteudo: Array<{
    tipo: string;
    descricao: string;
    objetivo: string;
  }>;
  checklist_acoes_organicas: string[];
}

export default function AutoridadeDigital() {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<AuthorityResult | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    businessName: '',
    segment: '',
    mainChannel: '',
    frequency: '',
    objective: '',
    targetAudience: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerate = async () => {
    if (!formData.businessName || !formData.segment || !formData.mainChannel || !formData.frequency || !formData.objective) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsGenerating(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-authority-strategy', {
        body: formData,
      });

      if (error) throw error;

      if (data.success && data.data) {
        setResult(data.data);
        toast.success('Estratégia de autoridade gerada com sucesso!');
      } else {
        throw new Error(data.error || 'Erro ao gerar estratégia');
      }
    } catch (error) {
      console.error('Error generating authority strategy:', error);
      toast.error('Erro ao gerar estratégia de autoridade');
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
    <AppLayout title="Autoridade & Reconhecimento Digital">
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
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Award className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-foreground">Autoridade & Reconhecimento Digital</h1>
                <Badge className="bg-emerald-500 text-white text-xs border-0">NOVO</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Estruture presença, confiança e visibilidade para o negócio.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Bloco 1 - Informações Básicas */}
            <PremiumFrame className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Informações Básicas</h2>
              <div className="space-y-4">
                <div>
                  <Label>Nome do negócio *</Label>
                  <Input
                    placeholder="Ex: Studio Ana Melo"
                    value={formData.businessName}
                    onChange={(e) => handleInputChange('businessName', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Segmento *</Label>
                  <Input
                    placeholder="Ex: Beleza, Saúde, Educação, etc."
                    value={formData.segment}
                    onChange={(e) => handleInputChange('segment', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Canal principal *</Label>
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
                <div>
                  <Label>Frequência desejada de presença *</Label>
                  <Select value={formData.frequency} onValueChange={(v) => handleInputChange('frequency', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa (1-2x por semana)</SelectItem>
                      <SelectItem value="media">Média (3-4x por semana)</SelectItem>
                      <SelectItem value="alta">Alta (diariamente)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PremiumFrame>

            {/* Bloco 2 - Objetivo de Autoridade */}
            <PremiumFrame className="p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Objetivo de Autoridade</h2>
              <div className="space-y-4">
                <div>
                  <Label>Objetivo principal *</Label>
                  <Select value={formData.objective} onValueChange={(v) => handleInputChange('objective', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o objetivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reconhecimento">Ser reconhecido</SelectItem>
                      <SelectItem value="confianca">Gerar confiança</SelectItem>
                      <SelectItem value="engajamento">Aumentar engajamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Público-alvo principal</Label>
                  <Input
                    placeholder="Ex: Mulheres 25-45 anos, empreendedores, etc."
                    value={formData.targetAudience}
                    onChange={(e) => handleInputChange('targetAudience', e.target.value)}
                  />
                </div>
              </div>
            </PremiumFrame>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando Estratégia...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Gerar Estratégia com IA
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {!result && !isGenerating && (
              <PremiumFrame className="p-8 text-center">
                <Award className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Preencha as informações e clique em gerar para criar a estratégia de autoridade.
                </p>
              </PremiumFrame>
            )}

            {isGenerating && (
              <PremiumFrame className="p-8 text-center">
                <Loader2 className="h-12 w-12 text-emerald-500 mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Gerando estratégia de autoridade...</p>
              </PremiumFrame>
            )}

            {result && (
              <>
                {/* Estratégia de Reconhecimento */}
                <PremiumFrame className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Estratégia de Reconhecimento</h3>
                    <CopyButton text={result.estrategia_reconhecimento} field="estrategia" />
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{result.estrategia_reconhecimento}</p>
                </PremiumFrame>

                {/* Diretrizes de Posicionamento */}
                <PremiumFrame className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Diretrizes de Posicionamento</h3>
                  <ul className="space-y-2">
                    {result.diretrizes_posicionamento?.map((diretriz, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{diretriz}</span>
                      </li>
                    ))}
                  </ul>
                </PremiumFrame>

                {/* Ideias de Conteúdo */}
                <PremiumFrame className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Ideias de Conteúdo</h3>
                  <div className="space-y-3">
                    {result.ideias_conteudo?.map((ideia, i) => (
                      <div key={i} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-emerald-500" />
                          <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-500">
                            {ideia.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground mb-1">{ideia.descricao}</p>
                        <p className="text-xs text-muted-foreground">Objetivo: {ideia.objetivo}</p>
                      </div>
                    ))}
                  </div>
                </PremiumFrame>

                {/* Checklist de Ações Orgânicas */}
                <PremiumFrame className="p-6">
                  <h3 className="font-semibold text-foreground mb-4">Checklist de Ações Orgânicas</h3>
                  <ul className="space-y-2">
                    {result.checklist_acoes_organicas?.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-500/50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-emerald-500">{i + 1}</span>
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
