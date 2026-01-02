import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Plus, 
  Stethoscope, 
  FileText, 
  Clock, 
  Eye,
  Download,
  FileOutput,
  FileSignature,
  MessageSquare,
  Package,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';
import { DiagnosisPDFDocument } from '@/components/DiagnosisPDFDocument';
import { useToast } from '@/hooks/use-toast';

interface Diagnosis {
  id: string;
  company_name: string;
  segment: string | null;
  city_state: string | null;
  status: string;
  created_at: string;
  diagnosis_text: string | null;
}

const internalActions = [
  {
    id: 'diagnostico',
    title: 'Gerar Diagnóstico',
    desc: 'Análise completa da presença digital',
    icon: Stethoscope,
    color: 'success',
    path: '/solucoes/diagnostico/novo',
    main: true,
  },
  {
    id: 'proposta',
    title: 'Criar Proposta Comercial',
    desc: 'Proposta profissional com IA',
    icon: FileText,
    color: 'primary',
    path: '/solucoes/diagnostico/proposta',
  },
  {
    id: 'contrato',
    title: 'Gerar Contrato de Serviço',
    desc: 'Contrato simples e profissional',
    icon: FileSignature,
    color: 'amber-500',
    path: '/solucoes/diagnostico/contrato',
  },
  {
    id: 'whatsapp',
    title: 'Mensagens para WhatsApp',
    desc: 'Scripts prontos para enviar',
    icon: MessageSquare,
    color: 'green-500',
    path: '/solucoes/diagnostico/whatsapp',
  },
  {
    id: 'entrega',
    title: 'Material de Entrega',
    desc: 'Organize a entrega do serviço',
    icon: Package,
    color: 'blue-500',
    path: '/solucoes/diagnostico/entrega',
  },
];

export default function DiagnosticoHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pdfDiagnosis, setPdfDiagnosis] = useState<Diagnosis | null>(null);

  const { data: diagnoses = [], isLoading } = useQuery({
    queryKey: ['digital-diagnoses', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('digital_diagnoses')
        .select('id, company_name, segment, city_state, status, created_at, diagnosis_text')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Diagnosis[];
    },
    enabled: !!workspace?.id,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('digital_diagnoses')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['digital-diagnoses'] });
      
      toast({
        title: 'Diagnóstico excluído',
        description: 'O diagnóstico foi removido com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o diagnóstico.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Concluído</Badge>;
      case 'sent':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Enviado</Badge>;
      default:
        return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  const diagnosisToDelete = diagnoses.find(d => d.id === deleteId);

  return (
    <>
      <AppLayout title="Diagnóstico Digital">
        <div className="w-full space-y-6">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/solucoes')}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Soluções
          </Button>

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center border border-foreground/[0.05]">
                <Stethoscope className="h-6 w-6 text-success" />
              </div>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Diagnóstico Estratégico Digital
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Gere uma análise clara do negócio do cliente, identifique oportunidades e crie a base para qualquer proposta ou entrega digital.
            </p>
            <p className="text-xs text-muted-foreground/60">Ideal para primeiro contato e fechamento.</p>
            <Badge className="bg-success/90 text-success-foreground border-0 text-xs">
              Produto pronto para vender
            </Badge>
          </div>

          {/* Internal Actions Grid */}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {internalActions.map((action) => (
              <Card 
                key={action.id}
                className={`cursor-pointer transition-all ${
                  action.main 
                    ? 'border border-success/20 bg-gradient-to-br from-success/[0.03] to-transparent hover:border-success/40 md:col-span-2 lg:col-span-1' 
                    : 'border border-foreground/[0.06] hover:border-primary/20'
                }`}
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-${action.color}/10 flex items-center justify-center flex-shrink-0 border border-foreground/[0.04]`}>
                      <action.icon className={`h-5 w-5 text-${action.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{action.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* History */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Diagnósticos criados
                </h2>
              </div>
              <Button 
                size="sm" 
                className="gap-2 text-xs"
                onClick={() => navigate('/solucoes/diagnostico/novo')}
              >
                <Plus className="h-4 w-4" />
                Novo diagnóstico
              </Button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-3">
                      <div className="h-12 bg-muted rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : diagnoses.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum diagnóstico criado ainda.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Crie sua primeira solução digital para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {diagnoses.map((diagnosis) => (
                  <Card key={diagnosis.id} className="border border-foreground/[0.06] hover:border-primary/20 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm font-medium text-foreground">{diagnosis.company_name}</h3>
                            {getStatusBadge(diagnosis.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {diagnosis.segment || 'Sem segmento'} • {format(new Date(diagnosis.created_at), "dd 'de' MMMM", { locale: ptBR })}
                          </p>
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {/* View */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Visualizar"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/solucoes/diagnostico/${diagnosis.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Export PDF */}
                          {diagnosis.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Exportar PDF"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPdfDiagnosis(diagnosis);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Create Proposal */}
                          {diagnosis.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="Gerar proposta"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/vendas/propostas/nova?diagnostico=${diagnosis.id}`);
                              }}
                            >
                              <FileOutput className="h-4 w-4" />
                            </Button>
                          )}
                          
                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Excluir"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(diagnosis.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </AppLayout>

      {/* PDF Document View */}
      {pdfDiagnosis && (
        <DiagnosisPDFDocument 
          diagnosis={pdfDiagnosis} 
          onClose={() => setPdfDiagnosis(null)} 
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleDelete}
        title="Excluir diagnóstico"
        description={`Tem certeza que deseja excluir o diagnóstico de "${diagnosisToDelete?.company_name || ''}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </>
  );
}
