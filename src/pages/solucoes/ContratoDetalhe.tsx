import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Download, CheckCircle2, Loader2, FileSignature } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ContratoDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const { data: contract, isLoading } = useQuery({
    queryKey: ['solution-contract', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('solution_contracts').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const copyToClipboard = async () => {
    if (!contract?.contract_text) return;
    await navigator.clipboard.writeText(contract.contract_text);
    setIsCopied(true);
    toast({ title: 'Copiado!', description: 'Contrato copiado.' });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) return <AppLayout title="Contrato"><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  if (!contract) return <AppLayout title="Contrato"><div className="text-center py-12"><p className="text-muted-foreground">Contrato não encontrado</p></div></AppLayout>;

  return (
    <AppLayout title="Contrato">
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        <div className="print:hidden"><Button variant="ghost" size="sm" onClick={() => navigate('/solucoes/contrato')} className="gap-2"><ArrowLeft className="h-4 w-4" /> Voltar</Button></div>

        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-amber-500" /><CardTitle>Contrato de Prestação de Serviço</CardTitle></div>
                <Badge className="bg-success text-success-foreground">Concluído</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{format(new Date(contract.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
            </div>
          </CardHeader>
        </Card>

        <Card className="print:border-0 print:shadow-none">
          <CardContent className="pt-6">
            <div className="whitespace-pre-wrap text-foreground leading-relaxed">{contract.contract_text}</div>
          </CardContent>
        </Card>

        <div className="print:hidden p-3 bg-amber-500/10 rounded-lg text-sm text-amber-700 dark:text-amber-300 text-center">
          ⚠️ Este é um modelo simplificado. Consulte um advogado para validação legal.
        </div>

        <div className="print:hidden flex gap-3 justify-center">
          <Button variant="outline" onClick={copyToClipboard} className="gap-2">{isCopied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />} Copiar texto</Button>
          <Button variant="outline" onClick={() => window.print()} className="gap-2"><Download className="h-4 w-4" /> Exportar PDF</Button>
        </div>
      </div>
    </AppLayout>
  );
}
