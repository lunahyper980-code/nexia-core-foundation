import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Network, 
  Eye,
  AlertTriangle,
  Users,
  Clock,
  CheckCircle2,
  Route,
  FileText,
  FileSignature,
  Trash2,
  Loader2,
  Download,
  Target,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  Sunrise,
  Sun,
  Sunset
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

// New structure interfaces
interface FluxoEtapa {
  etapa: number;
  titulo: string;
  descricao: string;
}

interface PapelResponsabilidade {
  funcao: string;
  responsavel: string;
  descricao: string;
}

interface RotinaEssencial {
  inicio_dia?: string[];
  durante_dia?: string[];
  final_dia?: string[];
}

interface ImpactoEsperado {
  atendimento?: string;
  vendas?: string;
  erros?: string;
}

interface NewOrganizationContent {
  objetivo_organizacao?: string;
  gargalos_atuais?: string[];
  fluxo_atendimento?: FluxoEtapa[];
  papeis_responsabilidades?: PapelResponsabilidade[];
  rotina_essencial?: RotinaEssencial;
  checklist_organizacao?: string[];
  impacto_esperado?: ImpactoEsperado;
}

// Old structure for backwards compatibility
interface OldOrganizationContent {
  operationOverview?: string;
  processProblems?: string;
  idealFlow?: string;
  internalOrganization?: string;
  recommendedRoutine?: string;
  attentionPoints?: string;
}

type OrganizationContent = NewOrganizationContent | OldOrganizationContent;

function isNewFormat(content: OrganizationContent): content is NewOrganizationContent {
  return 'objetivo_organizacao' in content || 'gargalos_atuais' in content || 'fluxo_atendimento' in content;
}

export default function OrganizacaoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [showDelete, setShowDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [content, setContent] = useState<OrganizationContent>({});

  const { data: organization, isLoading } = useQuery({
    queryKey: ['process-organization', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('process_organizations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Parse content from various sources
  useEffect(() => {
    if (!organization) return;

    // Try to parse from the main fields first (old format stored in columns)
    if (organization.operation_overview || organization.process_problems) {
      setContent({
        operationOverview: organization.operation_overview,
        processProblems: organization.process_problems,
        idealFlow: organization.ideal_flow,
        internalOrganization: organization.internal_organization,
        recommendedRoutine: organization.recommended_routine,
        attentionPoints: organization.attention_points,
      } as OldOrganizationContent);
    }
  }, [organization]);

  const handleDelete = async () => {
    if (!id) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('process_organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['process-organizations'] });
      
      toast({
        title: 'Organização excluída',
        description: 'A organização foi removida com sucesso.'
      });
      
      navigate('/solucoes/organizacao');
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a organização.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setShowDelete(false);
    }
  };

  const handleExportPDF = () => {
    if (!organization) return;

    let htmlContent = '';

    if (isNewFormat(content)) {
      const c = content as NewOrganizationContent;
      htmlContent = `
        ${c.objetivo_organizacao ? `
          <div class="section">
            <h2>1. Objetivo da Organização</h2>
            <p>${c.objetivo_organizacao}</p>
          </div>
        ` : ''}
        
        ${c.gargalos_atuais ? `
          <div class="section">
            <h2>2. Principais Gargalos Atuais</h2>
            <ul>${c.gargalos_atuais.map((g, i) => `<li><strong>${i + 1}.</strong> ${g}</li>`).join('')}</ul>
          </div>
        ` : ''}
        
        ${c.fluxo_atendimento ? `
          <div class="section">
            <h2>3. Fluxo Ideal de Atendimento</h2>
            ${c.fluxo_atendimento.map(f => `
              <div class="step">
                <span class="step-number">${f.etapa}</span>
                <div>
                  <strong>${f.titulo}</strong>
                  <p>${f.descricao}</p>
                </div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${c.papeis_responsabilidades ? `
          <div class="section">
            <h2>4. Papéis e Responsabilidades</h2>
            ${c.papeis_responsabilidades.map(p => `
              <div class="role">
                <strong>${p.funcao}: ${p.responsavel}</strong>
                <p>${p.descricao}</p>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${c.rotina_essencial ? `
          <div class="section">
            <h2>5. Rotina Essencial</h2>
            ${c.rotina_essencial.inicio_dia ? `<h3>Início do Dia</h3><ul>${c.rotina_essencial.inicio_dia.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
            ${c.rotina_essencial.durante_dia ? `<h3>Durante o Dia</h3><ul>${c.rotina_essencial.durante_dia.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
            ${c.rotina_essencial.final_dia ? `<h3>Final do Dia</h3><ul>${c.rotina_essencial.final_dia.map(a => `<li>${a}</li>`).join('')}</ul>` : ''}
          </div>
        ` : ''}
        
        ${c.checklist_organizacao ? `
          <div class="section">
            <h2>6. Checklist de Organização</h2>
            <ul class="checklist">${c.checklist_organizacao.map(item => `<li>☐ ${item}</li>`).join('')}</ul>
          </div>
        ` : ''}
        
        ${c.impacto_esperado ? `
          <div class="section impact">
            <h2>7. Impacto Esperado</h2>
            ${c.impacto_esperado.atendimento ? `<div class="impact-item"><strong>Atendimento:</strong> ${c.impacto_esperado.atendimento}</div>` : ''}
            ${c.impacto_esperado.vendas ? `<div class="impact-item"><strong>Vendas:</strong> ${c.impacto_esperado.vendas}</div>` : ''}
            ${c.impacto_esperado.erros ? `<div class="impact-item"><strong>Redução de Erros:</strong> ${c.impacto_esperado.erros}</div>` : ''}
          </div>
        ` : ''}
      `;
    } else {
      const c = content as OldOrganizationContent;
      htmlContent = `
        ${c.operationOverview ? `<div class="section"><h2>Visão Geral</h2><p>${c.operationOverview}</p></div>` : ''}
        ${c.processProblems ? `<div class="section"><h2>Problemas de Processo</h2><p>${c.processProblems}</p></div>` : ''}
        ${c.idealFlow ? `<div class="section"><h2>Fluxo Ideal</h2><p>${c.idealFlow}</p></div>` : ''}
        ${c.internalOrganization ? `<div class="section"><h2>Organização Interna</h2><p>${c.internalOrganization}</p></div>` : ''}
        ${c.recommendedRoutine ? `<div class="section"><h2>Rotina Recomendada</h2><p>${c.recommendedRoutine}</p></div>` : ''}
        ${c.attentionPoints ? `<div class="section"><h2>Pontos de Atenção</h2><p>${c.attentionPoints}</p></div>` : ''}
      `;
    }

    const printContent = `
      <html>
        <head>
          <title>Organização de Processos - ${organization.business_type}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
            h1 { color: #1a1a1a; border-bottom: 3px solid #f59e0b; padding-bottom: 12px; margin-bottom: 20px; }
            h2 { color: #d97706; margin-top: 30px; margin-bottom: 12px; font-size: 16px; }
            h3 { color: #92400e; margin-top: 15px; margin-bottom: 8px; font-size: 14px; }
            .meta { color: #666; font-size: 14px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; padding: 18px; background: #fffbeb; border-radius: 8px; border-left: 4px solid #f59e0b; }
            ul { margin: 10px 0; padding-left: 20px; }
            li { margin: 6px 0; }
            .checklist li { list-style: none; margin-left: -20px; }
            .step { display: flex; gap: 12px; margin: 12px 0; padding: 10px; background: #fef3c7; border-radius: 6px; }
            .step-number { background: #f59e0b; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; flex-shrink: 0; }
            .role { margin: 12px 0; padding: 10px; background: #fef3c7; border-radius: 6px; }
            .impact { background: #ecfdf5 !important; border-left-color: #10b981 !important; }
            .impact-item { margin: 8px 0; padding: 8px; background: #d1fae5; border-radius: 4px; }
            .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #eee; color: #888; font-size: 11px; text-align: center; }
          </style>
        </head>
        <body>
          <h1>Plano de Organização de Processos</h1>
          <div class="meta">
            <strong>${organization.business_type}</strong><br>
            Gerado em ${format(new Date(organization.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          ${htmlContent}
          <div class="footer">
            Este plano foi criado para ser aplicado imediatamente por qualquer pequeno negócio.
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
    toast({ title: 'PDF pronto para impressão!' });
  };

  if (isLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  if (!organization) {
    return (
      <AppLayout title="Não encontrado">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Organização não encontrada.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/solucoes/organizacao')}
            className="mt-4"
          >
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isCompleted = organization.status === 'completed';
  const isNew = isNewFormat(content);
  const newContent = isNew ? content as NewOrganizationContent : null;
  const oldContent = !isNew ? content as OldOrganizationContent : null;

  return (
    <>
      <AppLayout title="Organização de Processos">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/solucoes/organizacao')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Network className="h-5 w-5 text-amber-500" />
                <h1 className="text-xl font-bold text-foreground">{organization.business_type}</h1>
                <Badge className={isCompleted ? 'bg-success/10 text-success' : 'bg-muted'}>
                  {isCompleted ? 'Plano Prático' : 'Rascunho'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Criado em {format(new Date(organization.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            {isCompleted && (
              <Button variant="outline" onClick={handleExportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
            )}
          </div>

          {/* Business Info Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Equipe</p>
                  <p className="font-medium text-foreground">{organization.team_size || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Canais</p>
                  <p className="font-medium text-foreground">{organization.contact_channels || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Objetivo</p>
                  <p className="font-medium text-foreground truncate">{organization.organization_goal || '-'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium text-foreground">{isCompleted ? 'Gerado' : 'Pendente'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generated Content */}
          {isCompleted ? (
            <div className="space-y-4">
              {/* New Format Content */}
              {newContent ? (
                <>
                  {/* 1. Objetivo */}
                  {newContent.objetivo_organizacao && (
                    <Card className="border-amber-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold text-amber-600">1</div>
                          <Target className="h-4 w-4 text-amber-500" />
                          Objetivo da Organização
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">{newContent.objetivo_organizacao}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* 2. Gargalos */}
                  {newContent.gargalos_atuais && newContent.gargalos_atuais.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-600">2</div>
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          Principais Gargalos Atuais
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {newContent.gargalos_atuais.map((gargalo, i) => (
                          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                            <p className="text-sm text-muted-foreground">{gargalo}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* 3. Fluxo de Atendimento */}
                  {newContent.fluxo_atendimento && newContent.fluxo_atendimento.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">3</div>
                          <Route className="h-4 w-4 text-emerald-500" />
                          Fluxo Ideal de Atendimento
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {newContent.fluxo_atendimento.map((etapa) => (
                          <div key={etapa.etapa} className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">
                              {etapa.etapa}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{etapa.titulo}</p>
                              <p className="text-sm text-muted-foreground">{etapa.descricao}</p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* 4. Papéis e Responsabilidades */}
                  {newContent.papeis_responsabilidades && newContent.papeis_responsabilidades.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">4</div>
                          <Users className="h-4 w-4 text-blue-500" />
                          Papéis e Responsabilidades
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {newContent.papeis_responsabilidades.map((papel, i) => (
                          <div key={i} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-600">
                                {papel.funcao}
                              </Badge>
                              <span className="text-sm font-medium text-foreground">{papel.responsavel}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{papel.descricao}</p>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* 5. Rotina Essencial */}
                  {newContent.rotina_essencial && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-600">5</div>
                          <Clock className="h-4 w-4 text-purple-500" />
                          Rotina Essencial
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-3 gap-4">
                        {newContent.rotina_essencial.inicio_dia && (
                          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Sunrise className="h-4 w-4 text-amber-500" />
                              <span className="text-sm font-medium text-foreground">Início do Dia</span>
                            </div>
                            <ul className="space-y-1.5">
                              {newContent.rotina_essencial.inicio_dia.map((acao, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                                  {acao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {newContent.rotina_essencial.durante_dia && (
                          <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Sun className="h-4 w-4 text-blue-500" />
                              <span className="text-sm font-medium text-foreground">Durante o Dia</span>
                            </div>
                            <ul className="space-y-1.5">
                              {newContent.rotina_essencial.durante_dia.map((acao, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                                  {acao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {newContent.rotina_essencial.final_dia && (
                          <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10">
                            <div className="flex items-center gap-2 mb-2">
                              <Sunset className="h-4 w-4 text-purple-500" />
                              <span className="text-sm font-medium text-foreground">Final do Dia</span>
                            </div>
                            <ul className="space-y-1.5">
                              {newContent.rotina_essencial.final_dia.map((acao, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                  <div className="w-4 h-4 rounded border border-muted-foreground/30 shrink-0 mt-0.5" />
                                  {acao}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* 6. Checklist */}
                  {newContent.checklist_organizacao && newContent.checklist_organizacao.length > 0 && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">6</div>
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Checklist de Organização
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="grid md:grid-cols-2 gap-2">
                          {newContent.checklist_organizacao.map((item, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-muted/30">
                              <div className="w-5 h-5 rounded border-2 border-emerald-500/50 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-xs text-emerald-500">{i + 1}</span>
                              </div>
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* 7. Impacto Esperado */}
                  {newContent.impacto_esperado && (
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-bold text-emerald-600">7</div>
                          <TrendingUp className="h-4 w-4 text-emerald-500" />
                          Impacto Esperado
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid md:grid-cols-3 gap-3">
                        {newContent.impacto_esperado.atendimento && (
                          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <Users className="h-4 w-4 text-blue-500" />
                              <span className="text-xs font-medium text-blue-600">Atendimento</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{newContent.impacto_esperado.atendimento}</p>
                          </div>
                        )}
                        {newContent.impacto_esperado.vendas && (
                          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <ShoppingCart className="h-4 w-4 text-emerald-500" />
                              <span className="text-xs font-medium text-emerald-600">Vendas</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{newContent.impacto_esperado.vendas}</p>
                          </div>
                        )}
                        {newContent.impacto_esperado.erros && (
                          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-purple-500" />
                              <span className="text-xs font-medium text-purple-600">Redução de Erros</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{newContent.impacto_esperado.erros}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : oldContent && (
                /* Old Format Content - Backwards Compatibility */
                <>
                  {oldContent.operationOverview && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Eye className="h-4 w-4 text-primary" />
                          Visão Geral da Operação
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{oldContent.operationOverview}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {oldContent.processProblems && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-destructive" />
                          Problemas de Processo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{oldContent.processProblems}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {oldContent.idealFlow && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Route className="h-4 w-4 text-success" />
                          Fluxo Ideal
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{oldContent.idealFlow}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {oldContent.internalOrganization && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-500" />
                          Organização Interna
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{oldContent.internalOrganization}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {oldContent.recommendedRoutine && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Clock className="h-4 w-4 text-amber-500" />
                          Rotina Recomendada
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{oldContent.recommendedRoutine}</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {oldContent.attentionPoints && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-purple-500" />
                          Pontos de Atenção
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{oldContent.attentionPoints}</p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/solucoes/proposta/novo?organizacao=${id}`)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Gerar Proposta
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/solucoes/contrato/novo?organizacao=${id}`)}
                  className="gap-2"
                >
                  <FileSignature className="h-4 w-4" />
                  Gerar Contrato
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowDelete(true)}
                  className="gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>

              {/* Footer Note */}
              <p className="text-center text-xs text-muted-foreground pt-2">
                Este plano pode ser aplicado imediatamente por qualquer pequeno negócio.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-primary/20 p-8 text-center">
              <Network className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="font-medium mb-2">Organização não gerada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete o formulário para gerar o plano de organização.
              </p>
              <Button onClick={() => navigate('/solucoes/organizacao/novo')} className="bg-amber-500 hover:bg-amber-600">
                Gerar Organização
              </Button>
            </div>
          )}
        </div>
      </AppLayout>

      <DeleteConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        onConfirm={handleDelete}
        title="Excluir organização"
        description={`Tem certeza que deseja excluir a organização de "${organization.business_type}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </>
  );
}
