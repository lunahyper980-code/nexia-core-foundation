import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Download, CheckCircle2, Loader2, FileSignature } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const statusLabels: Record<string, { label: string; variant: 'default' | 'secondary' }> = {
  draft: { label: 'Rascunho', variant: 'secondary' },
  sent: { label: 'Enviado', variant: 'default' },
  signed: { label: 'Assinado', variant: 'default' },
  completed: { label: 'Concluído', variant: 'default' },
  pending: { label: 'Pendente', variant: 'secondary' },
};

export default function ContratoVisualizar() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get('source') || 'solution_contracts';
  const [isCopied, setIsCopied] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['contract-view', id, source],
    queryFn: async () => {
      if (!id) return null;
      
      if (source === 'contracts') {
        const { data, error } = await supabase
          .from('contracts')
          .select('*, clients(name)')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        
        // Build contract text from fields
        const contractText = data ? `
CONTRATO DE PRESTAÇÃO DE SERVIÇOS

1. DAS PARTES
${data.parties_identification || 'Partes não especificadas'}

2. DO OBJETO
${data.contract_object || 'Objeto não especificado'}

3. DO ESCOPO DO SERVIÇO
${data.service_scope || 'Escopo não especificado'}

4. DAS RESPONSABILIDADES
${data.responsibilities || 'Responsabilidades não especificadas'}

5. DO VALOR E PAGAMENTO
${data.value_and_payment || 'Valor não especificado'}

6. DO PRAZO
${data.deadline || 'Prazo não especificado'}

7. DA RESCISÃO
${data.cancellation_terms || 'Termos de rescisão não especificados'}

8. DO FORO
${data.jurisdiction || 'Foro não especificado'}
        `.trim() : null;
        
        return data ? {
          ...data,
          contract_text: contractText,
          contractor_name: data.clients?.name || data.title,
        } : null;
      } else {
        const { data, error } = await supabase
          .from('solution_contracts')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        if (error) throw error;
        return data;
      }
    },
    enabled: !!id,
  });

  const copyToClipboard = async () => {
    if (!contract?.contract_text) return;
    await navigator.clipboard.writeText(contract.contract_text);
    setIsCopied(true);
    toast.success('Contrato copiado!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const exportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && contract?.contract_text) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Contrato - ${contract.contractor_name || 'Cliente'}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto; }
              pre { white-space: pre-wrap; font-family: Arial, sans-serif; }
            </style>
          </head>
          <body>
            <pre>${contract.contract_text}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  if (isLoading) {
    return (
      <AppLayout title="Contrato">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!contract) {
    return (
      <AppLayout title="Contrato">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Contrato não encontrado</p>
          <Button variant="outline" onClick={() => navigate('/vendas/contratos')} className="mt-4">
            Voltar
          </Button>
        </div>
      </AppLayout>
    );
  }

  const statusInfo = statusLabels[contract.status] || { label: contract.status, variant: 'secondary' as const };

  return (
    <AppLayout title="Contrato">
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        <div className="print:hidden">
          <Button variant="ghost" size="sm" onClick={() => navigate('/vendas/contratos')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
        </div>

        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-amber-500" />
                  <CardTitle>Contrato - {contract.contractor_name || 'Cliente'}</CardTitle>
                </div>
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardHeader>
        </Card>

        <Card className="print:border-0 print:shadow-none">
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">
              {contract.contract_text || 'Texto do contrato não disponível'}
            </div>
          </CardContent>
        </Card>

        <div className="print:hidden p-3 bg-amber-500/10 rounded-lg text-sm text-amber-700 dark:text-amber-300 text-center">
          ⚠️ Este é um modelo simplificado. Consulte um advogado para validação legal.
        </div>

        <div className="print:hidden flex gap-3 justify-center">
          <Button variant="outline" onClick={copyToClipboard} className="gap-2">
            {isCopied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
            Copiar texto
          </Button>
          <Button variant="outline" onClick={exportPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
