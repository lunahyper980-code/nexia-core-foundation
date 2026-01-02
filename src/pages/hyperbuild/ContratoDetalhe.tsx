import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  FileText, 
  Edit, 
  Download, 
  Trash2, 
  Copy,
  Check,
  Loader2,
  Save
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

export default function ContratoDetalhe() {
  const navigate = useNavigate();
  const { id: projectId, contractId } = useParams();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract', contractId],
    queryFn: async () => {
      if (!contractId) return null;
      const { data, error } = await supabase
        .from('solution_contracts')
        .select('*')
        .eq('id', contractId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!contractId,
  });

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!projectId,
  });

  const updateMutation = useMutation({
    mutationFn: async (newText: string) => {
      const { error } = await supabase
        .from('solution_contracts')
        .update({ contract_text: newText, updated_at: new Date().toISOString() })
        .eq('id', contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      toast.success('Contrato atualizado com sucesso!');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Erro ao atualizar contrato');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('solution_contracts')
        .delete()
        .eq('id', contractId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Contrato excluído com sucesso!');
      navigate(`/hyperbuild/projeto/${projectId}`);
    },
    onError: () => {
      toast.error('Erro ao excluir contrato');
    },
  });

  const startEditing = () => {
    setEditedText(contract?.contract_text || '');
    setIsEditing(true);
  };

  const saveEdit = () => {
    updateMutation.mutate(editedText);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditedText('');
  };

  const copyContract = () => {
    if (contract?.contract_text) {
      navigator.clipboard.writeText(contract.contract_text);
      setCopied(true);
      toast.success('Contrato copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const exportPDF = () => {
    // Create a printable version
    const printWindow = window.open('', '_blank');
    if (printWindow && contract?.contract_text) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Contrato - ${project?.app_name || 'Projeto'}</title>
          <style>
            body {
              font-family: 'Times New Roman', serif;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              text-align: center;
              margin-bottom: 30px;
              font-size: 18px;
              text-transform: uppercase;
            }
            p {
              text-align: justify;
              margin-bottom: 15px;
            }
            .footer {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature {
              text-align: center;
              width: 45%;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 60px;
              padding-top: 5px;
            }
          </style>
        </head>
        <body>
          <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS</h1>
          <div style="white-space: pre-wrap;">${contract.contract_text}</div>
          <div class="footer">
            <div class="signature">
              <div class="signature-line">
                CONTRATANTE
              </div>
            </div>
            <div class="signature">
              <div class="signature-line">
                CONTRATADO
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const parseContractText = (text: string | null) => {
    if (!text) return null;
    
    try {
      const parsed = JSON.parse(text);
      return parsed;
    } catch {
      // If not JSON, return as plain text
      return { rawText: text };
    }
  };

  const renderContractContent = () => {
    const parsed = parseContractText(contract?.contract_text || null);
    
    if (!parsed) {
      return <p className="text-muted-foreground">Contrato não gerado ainda.</p>;
    }

    if (parsed.rawText) {
      return (
        <div className="whitespace-pre-wrap text-foreground leading-relaxed">
          {parsed.rawText}
        </div>
      );
    }

    // Render structured contract
    return (
      <div className="space-y-6 text-foreground leading-relaxed">
        {parsed.identificacao_partes && (
          <section>
            <h3 className="font-bold text-lg mb-2">IDENTIFICAÇÃO DAS PARTES</h3>
            <p>{parsed.identificacao_partes}</p>
          </section>
        )}
        
        {parsed.objeto && (
          <section>
            <h3 className="font-bold text-lg mb-2">DO OBJETO</h3>
            <p>{parsed.objeto}</p>
          </section>
        )}
        
        {parsed.escopo && (
          <section>
            <h3 className="font-bold text-lg mb-2">DO ESCOPO</h3>
            <p>{parsed.escopo}</p>
          </section>
        )}
        
        {parsed.prazo && (
          <section>
            <h3 className="font-bold text-lg mb-2">DO PRAZO</h3>
            <p>{parsed.prazo}</p>
          </section>
        )}
        
        {parsed.valor_pagamento && (
          <section>
            <h3 className="font-bold text-lg mb-2">DO VALOR E PAGAMENTO</h3>
            <p>{parsed.valor_pagamento}</p>
          </section>
        )}
        
        {parsed.obrigacoes_contratante && (
          <section>
            <h3 className="font-bold text-lg mb-2">DAS OBRIGAÇÕES DO CONTRATANTE</h3>
            <p>{parsed.obrigacoes_contratante}</p>
          </section>
        )}
        
        {parsed.obrigacoes_contratado && (
          <section>
            <h3 className="font-bold text-lg mb-2">DAS OBRIGAÇÕES DO CONTRATADO</h3>
            <p>{parsed.obrigacoes_contratado}</p>
          </section>
        )}
        
        {parsed.rescisao && (
          <section>
            <h3 className="font-bold text-lg mb-2">DA RESCISÃO</h3>
            <p>{parsed.rescisao}</p>
          </section>
        )}
        
        {parsed.foro && (
          <section>
            <h3 className="font-bold text-lg mb-2">DO FORO</h3>
            <p>{parsed.foro}</p>
          </section>
        )}
        
        {parsed.disposicoes_finais && (
          <section>
            <h3 className="font-bold text-lg mb-2">DISPOSIÇÕES FINAIS</h3>
            <p>{parsed.disposicoes_finais}</p>
          </section>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <AppLayout title="Contrato">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout title="Contrato">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Contrato não encontrado.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/hyperbuild/projeto/${projectId}`)}
            className="mt-4"
          >
            Voltar ao Projeto
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Contrato">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(`/hyperbuild/projeto/${projectId}`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                Contrato
              </h1>
              <p className="text-muted-foreground">
                Projeto: {project?.app_name || 'Carregando...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={contract.status === 'generated' ? 'default' : 'secondary'}>
              {contract.status === 'generated' ? 'Gerado' : 
               contract.status === 'generating' ? 'Gerando...' : contract.status}
            </Badge>
            {contract.contract_generated_at && (
              <span className="text-sm text-muted-foreground">
                {format(new Date(contract.contract_generated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={startEditing} className="gap-2">
                <Edit className="h-4 w-4" />
                Editar Texto
              </Button>
              <Button variant="outline" onClick={copyContract} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button variant="outline" onClick={exportPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Exportar PDF
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Excluir
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button onClick={saveEdit} disabled={updateMutation.isPending} className="gap-2">
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar
              </Button>
              <Button variant="outline" onClick={cancelEdit}>
                Cancelar
              </Button>
            </>
          )}
        </div>

        {/* Contract Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">
              CONTRATO DE PRESTAÇÃO DE SERVIÇOS
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="min-h-[500px] font-mono text-sm"
                placeholder="Texto do contrato..."
              />
            ) : (
              <div className="prose prose-sm max-w-none">
                {renderContractContent()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contract Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Contratante</p>
                <p className="font-medium">{contract.contracted_name || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contratado</p>
                <p className="font-medium">{contract.contractor_name || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">
                  {contract.service_value 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(contract.service_value)
                    : 'Não informado'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prazo</p>
                <p className="font-medium">{contract.deadline || 'Não informado'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeleteConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={() => deleteMutation.mutate()}
        title="Excluir Contrato"
        description="Tem certeza que deseja excluir este contrato? Esta ação não pode ser desfeita."
        isLoading={deleteMutation.isPending}
      />
    </AppLayout>
  );
}
