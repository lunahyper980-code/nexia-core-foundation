import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Rocket, ArrowLeft, Download, Calendar, CheckCircle2, Sparkles, Copy, Check, Lightbulb, MessageSquare, ListChecks, Palette, Trash2, RefreshCw, Loader2, Image } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LaunchKitContent {
  estrutura_lancamento?: string;
  sequencia_acoes?: {
    pre_lancamento?: string[];
    durante?: string[];
    pos_lancamento?: string[];
  };
  ideia_oferta?: string;
  mensagens_divulgacao?: {
    teaser?: string;
    lancamento?: string;
    urgencia?: string;
  };
  checklist_execucao?: string[];
}

const COLOR_PALETTE = [
  { name: 'Azul Navy', color: '#1E3A5F' },
  { name: 'Verde Esmeralda', color: '#047857' },
  { name: 'Roxo Violeta', color: '#7C3AED' },
  { name: 'Rosa Pink', color: '#EC4899' },
  { name: 'Laranja Vibrante', color: '#EA580C' },
  { name: 'Amarelo Ouro', color: '#CA8A04' },
  { name: 'Vermelho Intenso', color: '#DC2626' },
  { name: 'Cinza Grafite', color: '#374151' },
  { name: 'Bege Neutro', color: '#D4C4A8' },
  { name: 'Verde Menta', color: '#10B981' },
  { name: 'Azul Céu', color: '#0EA5E9' },
  { name: 'Coral', color: '#F97316' },
];

export default function KitLancamentoDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<LaunchKitContent>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerateForm, setRegenerateForm] = useState({
    brandName: '',
    secondaryText: '',
    brandStyle: '',
    brandFeeling: '',
    preferredColors: [] as string[],
    visualNotes: '',
  });

  const { data: launchKit, isLoading, refetch } = useQuery({
    queryKey: ['launch-kit', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('launch_kits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (launchKit?.generated_content) {
      try {
        const parsed = JSON.parse(launchKit.generated_content);
        setContent(parsed);
      } catch {
        setContent({});
      }
    }
  }, [launchKit]);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadLogo = async () => {
    if (!launchKit?.logo_url) return;
    
    try {
      const response = await fetch(launchKit.logo_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `logo-${launchKit.business_name.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Logo baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading logo:', error);
      toast.error('Erro ao baixar logo');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      const { error } = await supabase.from('launch_kits').delete().eq('id', id);
      if (error) throw error;
      toast.success('Kit excluído com sucesso');
      navigate('/solucoes/kit-lancamento');
    } catch (error) {
      console.error('Error deleting kit:', error);
      toast.error('Erro ao excluir kit');
    }
  };

  const toggleColor = (colorName: string) => {
    setRegenerateForm(prev => {
      const colors = prev.preferredColors;
      if (colors.includes(colorName)) {
        return { ...prev, preferredColors: colors.filter(c => c !== colorName) };
      }
      if (colors.length >= 3) {
        toast.error('Selecione no máximo 3 cores');
        return prev;
      }
      return { ...prev, preferredColors: [...colors, colorName] };
    });
  };

  const handleOpenRegenerate = () => {
    // Parse existing colors from string to array
    const existingColors = launchKit?.preferred_colors?.split(', ').filter(Boolean) || [];
    
    setRegenerateForm({
      brandName: launchKit?.business_name || '',
      secondaryText: '',
      brandStyle: launchKit?.brand_style || '',
      brandFeeling: launchKit?.brand_feeling || '',
      preferredColors: existingColors,
      visualNotes: launchKit?.visual_notes || '',
    });
    setRegenerateOpen(true);
  };

  const handleRegenerateLogo = async () => {
    if (!id || !launchKit) return;
    
    if (!regenerateForm.brandStyle || !regenerateForm.brandFeeling) {
      toast.error('Selecione o estilo e a sensação da marca');
      return;
    }

    if (regenerateForm.preferredColors.length === 0) {
      toast.error('Selecione pelo menos uma cor');
      return;
    }

    setIsRegenerating(true);

    try {
      const colorsText = regenerateForm.preferredColors.join(', ');
      
      const { data: logoResult, error: logoError } = await supabase.functions.invoke('generate-launch-logo', {
        body: {
          brandName: regenerateForm.brandName || launchKit.business_name,
          secondaryText: regenerateForm.secondaryText,
          brandStyle: regenerateForm.brandStyle,
          brandFeeling: regenerateForm.brandFeeling,
          preferredColors: colorsText,
          visualNotes: regenerateForm.visualNotes,
          generateImage: true,
        }
      });

      if (logoError) throw logoError;

      if (!logoResult.success) {
        throw new Error(logoResult.error || 'Erro ao gerar logo');
      }

      // Update kit with new logo data
      const { error: updateError } = await supabase
        .from('launch_kits')
        .update({
          brand_style: regenerateForm.brandStyle,
          brand_feeling: regenerateForm.brandFeeling,
          preferred_colors: colorsText,
          visual_notes: regenerateForm.visualNotes,
          logo_url: logoResult.data.logo_url || null,
          logo_concept: logoResult.data.descricao_identidade,
          logo_usage_guidelines: logoResult.data.prompt_logo,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast.success(logoResult.data.logo_url 
        ? 'Logo regenerado com sucesso!' 
        : 'Identidade atualizada! Logo não disponível no momento.');
      setRegenerateOpen(false);
      refetch();

    } catch (error: any) {
      console.error('Error regenerating logo:', error);
      toast.error(error.message || 'Erro ao regenerar logo');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleExportPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Kit de Lançamento - ${launchKit?.business_name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #8b5cf6; padding-bottom: 12px; margin-bottom: 30px; }
            h2 { color: #7c3aed; margin-top: 35px; margin-bottom: 15px; font-size: 18px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 8px 0; }
            .logo-section { text-align: center; margin: 30px 0; }
            .logo-section img { max-width: 200px; border: 1px solid #eee; border-radius: 8px; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Kit de Lançamento Digital</h1>
          <div class="meta">
            <strong>${launchKit?.business_name}</strong><br>
            ${launchKit?.segment || ''}<br>
            Gerado em ${launchKit?.generated_at ? format(new Date(launchKit.generated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
          </div>
          ${launchKit?.logo_url ? `
            <div class="logo-section">
              <h2>Logo de Lançamento</h2>
              <img src="${launchKit.logo_url}" alt="Logo" />
              ${launchKit.logo_concept ? `<p>${launchKit.logo_concept}</p>` : ''}
            </div>
          ` : ''}
          ${content.estrutura_lancamento ? `
            <div class="section">
              <h2>Estrutura do Lançamento</h2>
              <p>${content.estrutura_lancamento}</p>
            </div>
          ` : ''}
          ${content.ideia_oferta ? `
            <div class="section">
              <h2>Ideia de Oferta</h2>
              <p>${content.ideia_oferta}</p>
            </div>
          ` : ''}
          ${content.sequencia_acoes ? `
            <div class="section">
              <h2>Sequência de Ações</h2>
              <h3>Pré-Lançamento</h3>
              <ul>${content.sequencia_acoes.pre_lancamento?.map(a => `<li>${a}</li>`).join('') || ''}</ul>
              <h3>Durante</h3>
              <ul>${content.sequencia_acoes.durante?.map(a => `<li>${a}</li>`).join('') || ''}</ul>
              <h3>Pós-Lançamento</h3>
              <ul>${content.sequencia_acoes.pos_lancamento?.map(a => `<li>${a}</li>`).join('') || ''}</ul>
            </div>
          ` : ''}
          ${content.mensagens_divulgacao ? `
            <div class="section">
              <h2>Mensagens de Divulgação</h2>
              <p><strong>Teaser:</strong> ${content.mensagens_divulgacao.teaser || ''}</p>
              <p><strong>Lançamento:</strong> ${content.mensagens_divulgacao.lancamento || ''}</p>
              <p><strong>Urgência:</strong> ${content.mensagens_divulgacao.urgencia || ''}</p>
            </div>
          ` : ''}
          ${content.checklist_execucao ? `
            <div class="section">
              <h2>Checklist de Execução</h2>
              <ul>${content.checklist_execucao.map((item, i) => `<li>${i + 1}. ${item}</li>`).join('')}</ul>
            </div>
          ` : ''}
          ${launchKit?.logo_usage_guidelines ? `
            <div class="section">
              <h2>Orientações de Uso da Logo</h2>
              <p>${launchKit.logo_usage_guidelines}</p>
            </div>
          ` : ''}
          <div class="footer">
            Este documento foi gerado automaticamente como parte de um serviço profissional de lançamento digital.
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

  const getSelectedColorsInModal = () => {
    return COLOR_PALETTE.filter(c => regenerateForm.preferredColors.includes(c.name));
  };

  if (isLoading) {
    return (
      <AppLayout title="Kit de Lançamento">
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

  if (!launchKit) {
    return (
      <AppLayout title="Kit de Lançamento">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Rocket className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Kit não encontrado</h2>
              <Button onClick={() => navigate('/solucoes/kit-lancamento')} className="mt-4">
                Voltar para kits
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Kit de Lançamento">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/kit-lancamento')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Rocket className="h-5 w-5 text-violet-500" />
                <h1 className="text-xl font-bold">{launchKit.business_name}</h1>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {launchKit.status === 'completed' ? 'Concluído' : 'Rascunho'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Gerado em {launchKit.generated_at 
                  ? format(new Date(launchKit.generated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                  : 'Data não disponível'
                }
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Logo Section */}
        {launchKit.logo_url ? (
          <Card className="bg-gradient-to-br from-violet-500/5 to-pink-500/5 border-violet-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Image className="h-4 w-4 text-violet-500" />
                  Logo de Lançamento
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadLogo} className="gap-2">
                    <Download className="h-4 w-4" />
                    Baixar PNG
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleOpenRegenerate} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="bg-white rounded-lg p-4 border shadow-sm">
                  <img 
                    src={launchKit.logo_url} 
                    alt="Logo gerada" 
                    className="w-32 h-32 object-contain"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  {launchKit.logo_concept && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Conceito</h4>
                      <p className="text-sm text-muted-foreground">{launchKit.logo_concept}</p>
                    </div>
                  )}
                  {launchKit.brand_style && (
                    <div className="flex gap-4">
                      <div>
                        <h4 className="text-sm font-medium mb-1">Estilo</h4>
                        <Badge variant="outline" className="capitalize">{launchKit.brand_style}</Badge>
                      </div>
                      {launchKit.brand_feeling && (
                        <div>
                          <h4 className="text-sm font-medium mb-1">Sensação</h4>
                          <Badge variant="outline" className="capitalize">{launchKit.brand_feeling}</Badge>
                        </div>
                      )}
                    </div>
                  )}
                  {launchKit.preferred_colors && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Cores</h4>
                      <div className="flex gap-2 flex-wrap">
                        {launchKit.preferred_colors.split(', ').map(colorName => {
                          const colorObj = COLOR_PALETTE.find(c => c.name === colorName);
                          return colorObj ? (
                            <div key={colorName} className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded">
                              <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: colorObj.color }} />
                              {colorName}
                            </div>
                          ) : (
                            <Badge key={colorName} variant="outline" className="text-xs">{colorName}</Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground/70">
                    ⚠️ Esta logo é funcional para lançamento, não substitui um branding completo.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed border-violet-500/30">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Palette className="h-10 w-10 text-muted-foreground mb-3" />
              <h3 className="font-medium mb-1">Sem logo gerada</h3>
              <p className="text-sm text-muted-foreground mb-4 text-center max-w-sm">
                Este kit foi criado sem identidade visual. Gere uma logo agora.
              </p>
              <Button onClick={handleOpenRegenerate} className="gap-2 bg-violet-500 hover:bg-violet-600">
                <Sparkles className="h-4 w-4" />
                Gerar logo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Company Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {launchKit.project_type && (
                <div>
                  <span className="text-muted-foreground">Tipo</span>
                  <p className="font-medium capitalize">{launchKit.project_type.replace('_', ' ')}</p>
                </div>
              )}
              {launchKit.target_audience && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Público-alvo</span>
                  <p className="font-medium">{launchKit.target_audience}</p>
                </div>
              )}
              {launchKit.objective && (
                <div>
                  <span className="text-muted-foreground">Objetivo</span>
                  <p className="font-medium capitalize">{launchKit.objective.replace('_', ' ')}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-violet-500" />
            <h2 className="text-lg font-semibold">Kit Gerado</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Estrutura */}
            {content.estrutura_lancamento && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-violet-500" />
                      Estrutura do Lançamento
                    </CardTitle>
                    <CopyButton text={content.estrutura_lancamento} field="estrutura" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{content.estrutura_lancamento}</p>
                </CardContent>
              </Card>
            )}

            {/* Ideia de Oferta */}
            {content.ideia_oferta && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-500" />
                      Ideia de Oferta
                    </CardTitle>
                    <CopyButton text={content.ideia_oferta} field="oferta" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{content.ideia_oferta}</p>
                </CardContent>
              </Card>
            )}

            {/* Sequência de Ações */}
            {content.sequencia_acoes && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-blue-500" />
                    Sequência de Ações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.sequencia_acoes.pre_lancamento && (
                    <div>
                      <p className="text-sm font-medium text-violet-500 mb-1">Pré-Lançamento</p>
                      <ul className="space-y-1">
                        {content.sequencia_acoes.pre_lancamento.map((a, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {content.sequencia_acoes.durante && (
                    <div>
                      <p className="text-sm font-medium text-green-500 mb-1">Durante</p>
                      <ul className="space-y-1">
                        {content.sequencia_acoes.durante.map((a, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {content.sequencia_acoes.pos_lancamento && (
                    <div>
                      <p className="text-sm font-medium text-amber-500 mb-1">Pós-Lançamento</p>
                      <ul className="space-y-1">
                        {content.sequencia_acoes.pos_lancamento.map((a, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mensagens */}
            {content.mensagens_divulgacao && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-pink-500" />
                    Mensagens de Divulgação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-3">
                    {content.mensagens_divulgacao.teaser && (
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs">Teaser</Badge>
                          <CopyButton text={content.mensagens_divulgacao.teaser} field="teaser" />
                        </div>
                        <p className="text-sm text-muted-foreground">{content.mensagens_divulgacao.teaser}</p>
                      </div>
                    )}
                    {content.mensagens_divulgacao.lancamento && (
                      <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs border-green-500/30 text-green-600">Lançamento</Badge>
                          <CopyButton text={content.mensagens_divulgacao.lancamento} field="lancamento" />
                        </div>
                        <p className="text-sm text-muted-foreground">{content.mensagens_divulgacao.lancamento}</p>
                      </div>
                    )}
                    {content.mensagens_divulgacao.urgencia && (
                      <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600">Urgência</Badge>
                          <CopyButton text={content.mensagens_divulgacao.urgencia} field="urgencia" />
                        </div>
                        <p className="text-sm text-muted-foreground">{content.mensagens_divulgacao.urgencia}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            {content.checklist_execucao && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-violet-500" />
                    Checklist de Execução
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {content.checklist_execucao.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-violet-500/50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-violet-500">{i + 1}</span>
                        </div>
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer CTA */}
        <Card className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 border-violet-500/20">
          <CardContent className="py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold">Entregue este kit como serviço profissional</h3>
                <p className="text-sm text-muted-foreground">
                  Exporte o PDF completo e apresente ao seu cliente como um pacote de lançamento digital.
                </p>
              </div>
              <Button onClick={handleExportPDF} className="gap-2 bg-violet-500 hover:bg-violet-600">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        <DeleteConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={handleDelete}
          title="Excluir kit de lançamento"
          description="Tem certeza que deseja excluir este kit? Esta ação não pode ser desfeita."
        />

        {/* Regenerate Logo Modal - COMPLETE */}
        <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-violet-500" />
                {launchKit?.logo_url ? 'Regenerar Logo' : 'Gerar Logo'}
              </DialogTitle>
              <DialogDescription>
                Configure todos os detalhes para gerar uma nova logo de lançamento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Nome da marca */}
              <div className="space-y-2">
                <Label htmlFor="regen-brandName">Nome da marca</Label>
                <Input
                  id="regen-brandName"
                  value={regenerateForm.brandName}
                  onChange={(e) => setRegenerateForm(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Ex: Boutique Maria Bonita"
                />
              </div>

              {/* Texto secundário */}
              <div className="space-y-2">
                <Label htmlFor="regen-secondaryText">Texto secundário / Slogan (opcional)</Label>
                <Input
                  id="regen-secondaryText"
                  value={regenerateForm.secondaryText}
                  onChange={(e) => setRegenerateForm(prev => ({ ...prev, secondaryText: e.target.value }))}
                  placeholder="Ex: Moda que transforma"
                />
              </div>

              {/* Estilo da logo */}
              <div className="space-y-2">
                <Label>Estilo da logo *</Label>
                <Select 
                  value={regenerateForm.brandStyle} 
                  onValueChange={(v) => setRegenerateForm(prev => ({ ...prev, brandStyle: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="premium">Premium / Luxo</SelectItem>
                    <SelectItem value="criativo">Criativo / Artístico</SelectItem>
                    <SelectItem value="tecnologico">Tecnológico</SelectItem>
                    <SelectItem value="organico">Orgânico / Natural</SelectItem>
                    <SelectItem value="vintage">Vintage / Retrô</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sensação da marca */}
              <div className="space-y-2">
                <Label>Sensação da marca *</Label>
                <Select 
                  value={regenerateForm.brandFeeling} 
                  onValueChange={(v) => setRegenerateForm(prev => ({ ...prev, brandFeeling: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a sensação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confianca">Confiança e Segurança</SelectItem>
                    <SelectItem value="autoridade">Autoridade e Expertise</SelectItem>
                    <SelectItem value="proximidade">Proximidade e Acolhimento</SelectItem>
                    <SelectItem value="inovacao">Inovação e Modernidade</SelectItem>
                    <SelectItem value="elegancia">Elegância e Sofisticação</SelectItem>
                    <SelectItem value="energia">Energia e Dinamismo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Cores como Cards */}
              <div className="space-y-2">
                <Label>Cores principais * (selecione até 3)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_PALETTE.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => toggleColor(c.name)}
                      className={`relative p-2 rounded-lg border-2 transition-all ${
                        regenerateForm.preferredColors.includes(c.name)
                          ? 'border-violet-500 ring-2 ring-violet-500/30'
                          : 'border-transparent hover:border-muted-foreground/30'
                      }`}
                    >
                      <div
                        className="w-full aspect-square rounded-md mb-1"
                        style={{ backgroundColor: c.color }}
                      />
                      <span className="text-[9px] text-muted-foreground line-clamp-1">{c.name}</span>
                      {regenerateForm.preferredColors.includes(c.name) && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                          <Check className="h-2.5 w-2.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                {regenerateForm.preferredColors.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Selecionadas:</span>
                    {getSelectedColorsInModal().map(c => (
                      <Badge key={c.name} variant="outline" className="text-xs gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="regen-visualNotes">Observações adicionais (opcional)</Label>
                <Textarea
                  id="regen-visualNotes"
                  placeholder="Ex: Algo mais feminino, com formas orgânicas"
                  value={regenerateForm.visualNotes}
                  onChange={(e) => setRegenerateForm(prev => ({ ...prev, visualNotes: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRegenerateOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleRegenerateLogo} 
                disabled={isRegenerating}
                className="gap-2 bg-violet-500 hover:bg-violet-600"
              >
                {isRegenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Gerar logo
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
