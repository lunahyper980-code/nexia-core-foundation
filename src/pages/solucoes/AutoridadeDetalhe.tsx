import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, ArrowLeft, Download, Calendar, CheckCircle2, Sparkles, Copy, Check, FileText, Lightbulb, ListChecks, Target, MessageCircle, Users, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EstrategiaReconhecimento {
  canal_principal?: string;
  canal_conversao?: string;
  frequencia_minima?: string;
  horizonte_resultado?: string;
  metrica_sucesso?: string;
}

interface DiretrizPosicionamento {
  publico_central?: string;
  promessa_principal?: string;
  diferencial?: string;
  tom_comunicacao?: string;
  mensagem_chave?: string;
}

interface IdeiaConteudo {
  tipo?: string;
  titulo_sugerido?: string;
  objetivo_estrategico?: string;
  onde_publicar?: string;
  call_to_action?: string;
  // Fallback for old format
  descricao?: string;
  objetivo?: string;
}

interface ChecklistExecucao {
  semana_1?: string[];
  semana_2?: string[];
  semana_3?: string[];
}

interface AuthorityContent {
  // New structure
  objetivo_autoridade?: string;
  estrategia_reconhecimento?: EstrategiaReconhecimento | string;
  diretrizes_posicionamento?: DiretrizPosicionamento | string[];
  ideias_conteudo?: IdeiaConteudo[];
  checklist_execucao?: ChecklistExecucao;
  // Old structure fallback
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

  // Check if using new structure
  const isNewStructure = content.objetivo_autoridade || 
    (content.estrategia_reconhecimento && typeof content.estrategia_reconhecimento === 'object') ||
    content.checklist_execucao;

  const estrategia = typeof content.estrategia_reconhecimento === 'object' 
    ? content.estrategia_reconhecimento as EstrategiaReconhecimento 
    : null;

  const diretrizes = typeof content.diretrizes_posicionamento === 'object' && !Array.isArray(content.diretrizes_posicionamento)
    ? content.diretrizes_posicionamento as DiretrizPosicionamento
    : null;

  const diretrizesArray = Array.isArray(content.diretrizes_posicionamento) 
    ? content.diretrizes_posicionamento as string[]
    : null;

  const handleExportPDF = () => {
    let checklistHTML = '';
    
    if (content.checklist_execucao) {
      const { semana_1, semana_2, semana_3 } = content.checklist_execucao;
      checklistHTML = `
        <div class="section">
          <h2>Checklist de Execução Prioritário</h2>
          ${semana_1 ? `<h3>Semana 1</h3><ul>${semana_1.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
          ${semana_2 ? `<h3>Semana 2</h3><ul>${semana_2.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
          ${semana_3 ? `<h3>Semana 3</h3><ul>${semana_3.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
        </div>
      `;
    } else if (content.checklist_acoes_organicas) {
      checklistHTML = `
        <div class="section">
          <h2>Checklist de Ações Orgânicas</h2>
          <ul>${content.checklist_acoes_organicas.map((item, i) => `<li>${i + 1}. ${item}</li>`).join('')}</ul>
        </div>
      `;
    }

    const printContent = `
      <html>
        <head>
          <title>Plano de Autoridade Digital - ${strategy?.business_name}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #10b981; padding-bottom: 12px; margin-bottom: 30px; }
            h2 { color: #059669; margin-top: 35px; margin-bottom: 15px; font-size: 18px; }
            h3 { color: #047857; margin-top: 20px; margin-bottom: 10px; font-size: 15px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; padding: 20px; background: #f9fafb; border-radius: 8px; }
            .highlight { background: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 8px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .grid-item { background: #f3f4f6; padding: 12px; border-radius: 6px; }
            .grid-item strong { color: #374151; display: block; margin-bottom: 4px; font-size: 12px; }
            .content-card { background: #ecfdf5; padding: 15px; border-radius: 8px; margin-bottom: 12px; }
            .badge { display: inline-block; background: #d1fae5; color: #047857; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 8px; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Plano de Autoridade & Reconhecimento Digital</h1>
          <div class="meta">
            <strong>${strategy?.business_name}</strong><br>
            ${strategy?.segment || ''}<br>
            Gerado em ${strategy?.generated_at ? format(new Date(strategy.generated_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : ''}
          </div>
          
          ${content.objetivo_autoridade ? `
            <div class="section">
              <h2>1. Objetivo de Autoridade</h2>
              <p>${content.objetivo_autoridade}</p>
            </div>
          ` : ''}
          
          ${estrategia ? `
            <div class="section">
              <h2>2. Estratégia de Reconhecimento</h2>
              <div class="grid">
                ${estrategia.canal_principal ? `<div class="grid-item"><strong>Canal Principal</strong>${estrategia.canal_principal}</div>` : ''}
                ${estrategia.canal_conversao ? `<div class="grid-item"><strong>Canal de Conversão</strong>${estrategia.canal_conversao}</div>` : ''}
                ${estrategia.frequencia_minima ? `<div class="grid-item"><strong>Frequência Mínima</strong>${estrategia.frequencia_minima}</div>` : ''}
                ${estrategia.horizonte_resultado ? `<div class="grid-item"><strong>Horizonte de Resultado</strong>${estrategia.horizonte_resultado}</div>` : ''}
              </div>
              ${estrategia.metrica_sucesso ? `<div class="highlight"><strong>Métrica de Sucesso:</strong> ${estrategia.metrica_sucesso}</div>` : ''}
            </div>
          ` : (typeof content.estrategia_reconhecimento === 'string' ? `
            <div class="section">
              <h2>Estratégia de Reconhecimento</h2>
              <p>${content.estrategia_reconhecimento}</p>
            </div>
          ` : '')}
          
          ${diretrizes ? `
            <div class="section">
              <h2>3. Diretrizes de Posicionamento</h2>
              <div class="grid">
                ${diretrizes.publico_central ? `<div class="grid-item"><strong>Público Central</strong>${diretrizes.publico_central}</div>` : ''}
                ${diretrizes.promessa_principal ? `<div class="grid-item"><strong>Promessa Principal</strong>${diretrizes.promessa_principal}</div>` : ''}
                ${diretrizes.diferencial ? `<div class="grid-item"><strong>Diferencial</strong>${diretrizes.diferencial}</div>` : ''}
                ${diretrizes.tom_comunicacao ? `<div class="grid-item"><strong>Tom de Comunicação</strong>${diretrizes.tom_comunicacao}</div>` : ''}
              </div>
              ${diretrizes.mensagem_chave ? `<div class="highlight"><strong>Mensagem-chave:</strong> "${diretrizes.mensagem_chave}"</div>` : ''}
            </div>
          ` : (diretrizesArray ? `
            <div class="section">
              <h2>Diretrizes de Posicionamento</h2>
              <ul>${diretrizesArray.map(d => `<li>${d}</li>`).join('')}</ul>
            </div>
          ` : '')}
          
          ${content.ideias_conteudo ? `
            <div class="section">
              <h2>4. Ideias de Conteúdo com Função</h2>
              ${content.ideias_conteudo.map(ideia => `
                <div class="content-card">
                  <span class="badge">${ideia.tipo || ''}</span>
                  ${ideia.objetivo_estrategico ? `<span class="badge">${ideia.objetivo_estrategico}</span>` : ''}
                  ${ideia.onde_publicar ? `<span class="badge">${ideia.onde_publicar}</span>` : ''}
                  <p style="margin: 10px 0 5px;"><strong>${ideia.titulo_sugerido || ideia.descricao || ''}</strong></p>
                  ${ideia.call_to_action ? `<p style="font-size: 13px; color: #047857;">CTA: ${ideia.call_to_action}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${checklistHTML}
          
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
                  Plano Executável
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
            <h2 className="text-lg font-semibold">Plano Estratégico Executável</h2>
          </div>

          {/* 1. Objetivo de Autoridade */}
          {content.objetivo_autoridade && (
            <Card className="border-emerald-500/20">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">1</div>
                    <Target className="h-4 w-4 text-emerald-500" />
                    Objetivo de Autoridade
                  </CardTitle>
                  <CopyButton text={content.objetivo_autoridade} field="objetivo" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{content.objetivo_autoridade}</p>
              </CardContent>
            </Card>
          )}

          {/* 2. Estratégia de Reconhecimento */}
          {estrategia ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Estratégia de Reconhecimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {estrategia.canal_principal && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Canal Principal</span>
                      <p className="text-sm font-medium">{estrategia.canal_principal}</p>
                    </div>
                  )}
                  {estrategia.canal_conversao && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Canal de Conversão</span>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-green-500" />
                        {estrategia.canal_conversao}
                      </p>
                    </div>
                  )}
                  {estrategia.frequencia_minima && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Frequência Mínima</span>
                      <p className="text-sm font-medium">{estrategia.frequencia_minima}</p>
                    </div>
                  )}
                  {estrategia.horizonte_resultado && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Horizonte de Resultado</span>
                      <p className="text-sm font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3 text-amber-500" />
                        {estrategia.horizonte_resultado}
                      </p>
                    </div>
                  )}
                </div>
                {estrategia.metrica_sucesso && (
                  <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-xs text-emerald-600 font-medium block mb-1">Métrica de Sucesso</span>
                    <p className="text-sm font-medium text-emerald-700">{estrategia.metrica_sucesso}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (typeof content.estrategia_reconhecimento === 'string' && (
            <Card>
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
          ))}

          {/* 3. Diretrizes de Posicionamento */}
          {diretrizes ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-600">3</div>
                  <Users className="h-4 w-4 text-purple-500" />
                  Diretrizes de Posicionamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  {diretrizes.publico_central && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Público Central</span>
                      <p className="text-sm">{diretrizes.publico_central}</p>
                    </div>
                  )}
                  {diretrizes.promessa_principal && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Promessa Principal</span>
                      <p className="text-sm">{diretrizes.promessa_principal}</p>
                    </div>
                  )}
                  {diretrizes.diferencial && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Diferencial</span>
                      <p className="text-sm">{diretrizes.diferencial}</p>
                    </div>
                  )}
                  {diretrizes.tom_comunicacao && (
                    <div className="p-3 rounded-lg bg-muted/50">
                      <span className="text-xs text-muted-foreground block mb-1">Tom de Comunicação</span>
                      <p className="text-sm">{diretrizes.tom_comunicacao}</p>
                    </div>
                  )}
                </div>
                {diretrizes.mensagem_chave && (
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-xs text-purple-600 font-medium block mb-1">Mensagem-chave da Marca</span>
                    <p className="text-sm font-medium text-purple-700 italic">"{diretrizes.mensagem_chave}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (diretrizesArray && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-blue-500" />
                  Diretrizes de Posicionamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diretrizesArray.map((d, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          {/* 4. Ideias de Conteúdo */}
          {content.ideias_conteudo && content.ideias_conteudo.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-600">4</div>
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  Ideias de Conteúdo com Função
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {content.ideias_conteudo.map((ideia, i) => (
                  <div key={i} className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {ideia.tipo && (
                        <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-600 bg-amber-500/10">
                          {ideia.tipo}
                        </Badge>
                      )}
                      {ideia.objetivo_estrategico && (
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600 bg-blue-500/10">
                          {ideia.objetivo_estrategico}
                        </Badge>
                      )}
                      {ideia.onde_publicar && (
                        <Badge variant="outline" className="text-xs border-muted-foreground/30 text-muted-foreground">
                          {ideia.onde_publicar}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      {ideia.titulo_sugerido || ideia.descricao}
                    </p>
                    {ideia.call_to_action && (
                      <p className="text-xs text-emerald-600 flex items-center gap-1 mt-2">
                        <MessageCircle className="h-3 w-3" />
                        CTA: {ideia.call_to_action}
                      </p>
                    )}
                    {ideia.objetivo && !ideia.objetivo_estrategico && (
                      <p className="text-xs text-muted-foreground mt-1">Objetivo: {ideia.objetivo}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 5. Checklist de Execução */}
          {content.checklist_execucao ? (
            <Card className="border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">5</div>
                  <ListChecks className="h-4 w-4 text-emerald-500" />
                  Checklist de Execução Prioritário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.checklist_execucao.semana_1 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-emerald-500 text-white flex items-center justify-center text-xs">1</div>
                      Semana 1
                    </h4>
                    <ul className="space-y-1.5 pl-7">
                      {content.checklist_execucao.semana_1.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.checklist_execucao.semana_2 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-blue-500 text-white flex items-center justify-center text-xs">2</div>
                      Semana 2
                    </h4>
                    <ul className="space-y-1.5 pl-7">
                      {content.checklist_execucao.semana_2.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {content.checklist_execucao.semana_3 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <div className="h-5 w-5 rounded bg-purple-500 text-white flex items-center justify-center text-xs">3</div>
                      Semana 3
                    </h4>
                    <ul className="space-y-1.5 pl-7">
                      {content.checklist_execucao.semana_3.map((item, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (content.checklist_acoes_organicas && (
            <Card>
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
          ))}
        </div>

        {/* Actions */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span>Este plano pode ser executado por qualquer pessoa sem conhecimento técnico.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
