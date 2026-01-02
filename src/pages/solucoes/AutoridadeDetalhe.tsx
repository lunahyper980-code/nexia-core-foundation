import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, ArrowLeft, Download, Calendar, CheckCircle2, Sparkles, Copy, Check, FileText, Lightbulb, ListChecks, Target } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AuthorityContent {
  estrategia_reconhecimento?: string;
  diretrizes_posicionamento?: string[];
  ideias_conteudo?: Array<{
    tipo?: string;
    descricao?: string;
    objetivo?: string;
  }>;
  checklist_acoes_organicas?: string[];
}

export default function AutoridadeDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<AuthorityContent>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const { data: strategy, isLoading } = useQuery({
    queryKey: ['authority-strategy', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('authority_strategies')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    if (strategy?.generated_content) {
      try {
        const parsed = JSON.parse(strategy.generated_content);
        setContent(parsed);
      } catch {
        setContent({});
      }
    }
  }, [strategy]);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copiado!');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleExportPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Autoridade Digital - ${strategy?.business_name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 30px; }
            h2 { color: #059669; margin-top: 35px; margin-bottom: 15px; font-size: 18px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 8px 0; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Autoridade & Reconhecimento Digital</h1>
          <div class="meta">
            <strong>${strategy?.business_name}</strong><br>
            ${strategy?.segment || ''}<br>
            Gerado em ${strategy?.generated_at ? format(new Date(strategy.generated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
          </div>
          ${content.estrategia_reconhecimento ? `
            <div class="section">
              <h2>Estratégia de Reconhecimento</h2>
              <p>${content.estrategia_reconhecimento}</p>
            </div>
          ` : ''}
          ${content.diretrizes_posicionamento ? `
            <div class="section">
              <h2>Diretrizes de Posicionamento</h2>
              <ul>${content.diretrizes_posicionamento.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>
          ` : ''}
          ${content.ideias_conteudo ? `
            <div class="section">
              <h2>Ideias de Conteúdo</h2>
              ${content.ideias_conteudo.map(ideia => `
                <div style="margin-bottom: 15px; padding: 10px; background: #e0f7f1; border-radius: 6px;">
                  <strong>${ideia.tipo || ''}</strong>
                  <p>${ideia.descricao || ''}</p>
                  <small>Objetivo: ${ideia.objetivo || ''}</small>
                </div>
              `).join('')}
            </div>
          ` : ''}
          ${content.checklist_acoes_organicas ? `
            <div class="section">
              <h2>Checklist de Ações Orgânicas</h2>
              <ul>${content.checklist_acoes_organicas.map((item, i) => `<li>${i + 1}. ${item}</li>`).join('')}</ul>
            </div>
          ` : ''}
          <div class="footer">
            Este documento foi gerado automaticamente como parte de um serviço profissional de autoridade digital.
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
      <AppLayout title="Autoridade Digital">
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

  if (!strategy) {
    return (
      <AppLayout title="Autoridade Digital">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center py-12">
              <Award className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Estratégia não encontrada</h2>
              <Button onClick={() => navigate('/solucoes/autoridade')} className="mt-4">
                Voltar para estratégias
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Autoridade Digital">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/solucoes/autoridade')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Award className="h-5 w-5 text-emerald-500" />
                <h1 className="text-xl font-bold">{strategy.business_name}</h1>
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Concluído
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                Gerado em {strategy.generated_at 
                  ? format(new Date(strategy.generated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                  : 'Data não disponível'
                }
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleExportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações do Negócio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {strategy.segment && (
                <div>
                  <span className="text-muted-foreground">Segmento</span>
                  <p className="font-medium">{strategy.segment}</p>
                </div>
              )}
              {strategy.main_channel && (
                <div>
                  <span className="text-muted-foreground">Canal</span>
                  <p className="font-medium capitalize">{strategy.main_channel}</p>
                </div>
              )}
              {strategy.objective && (
                <div>
                  <span className="text-muted-foreground">Objetivo</span>
                  <p className="font-medium capitalize">{strategy.objective}</p>
                </div>
              )}
              {strategy.frequency && (
                <div>
                  <span className="text-muted-foreground">Frequência</span>
                  <p className="font-medium capitalize">{strategy.frequency}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Content */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold">Estratégia Gerada</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Estratégia */}
            {content.estrategia_reconhecimento && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="h-4 w-4 text-emerald-500" />
                      Estratégia de Reconhecimento
                    </CardTitle>
                    <CopyButton text={content.estrategia_reconhecimento} field="estrategia" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{content.estrategia_reconhecimento}</p>
                </CardContent>
              </Card>
            )}

            {/* Diretrizes */}
            {content.diretrizes_posicionamento && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-blue-500" />
                    Diretrizes de Posicionamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {content.diretrizes_posicionamento.map((d, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Ideias de Conteúdo */}
            {content.ideias_conteudo && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Ideias de Conteúdo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {content.ideias_conteudo.map((ideia, i) => (
                    <div key={i} className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-4 w-4 text-emerald-500" />
                        <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-600">
                          {ideia.tipo}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground">{ideia.descricao}</p>
                      {ideia.objetivo && (
                        <p className="text-xs text-muted-foreground mt-1">Objetivo: {ideia.objetivo}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Checklist */}
            {content.checklist_acoes_organicas && (
              <Card className="md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListChecks className="h-4 w-4 text-emerald-500" />
                    Checklist de Ações Orgânicas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 md:grid-cols-2">
                    {content.checklist_acoes_organicas.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full border-2 border-emerald-500/50 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-xs text-emerald-500">{i + 1}</span>
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

        {/* Actions */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span>Esta estratégia pode ser entregue como serviço profissional ao cliente.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
