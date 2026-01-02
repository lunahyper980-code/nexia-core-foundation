import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  FileOutput,
  CheckCircle2,
  Loader2,
  FileText,
  Building2,
  DollarSign,
  Clock,
  MessageSquare
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function PropostaDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const [isCopied, setIsCopied] = useState(false);

  const { data: proposal, isLoading } = useQuery({
    queryKey: ['solution-proposal', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('solution_proposals')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const copyToClipboard = async () => {
    if (!proposal?.proposal_text) return;
    
    try {
      await navigator.clipboard.writeText(proposal.proposal_text);
      setIsCopied(true);
      toast({
        title: 'Copiado!',
        description: 'Proposta copiada para a área de transferência.'
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Erro ao copiar',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  const exportPDF = () => {
    window.print();
    toast({
      title: 'Exportar PDF',
      description: 'Use a opção "Salvar como PDF" no menu de impressão.'
    });
  };

  const sendWhatsApp = () => {
    const text = encodeURIComponent(`Olá! Segue a proposta comercial para ${proposal?.company_name}:\n\n${proposal?.proposal_text?.substring(0, 500)}...`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const createContract = () => {
    navigate(`/solucoes/contrato/novo?proposta=${id}`);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <AppLayout title="Proposta">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!proposal) {
    return (
      <AppLayout title="Proposta">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Proposta não encontrada</p>
          <Button variant="link" onClick={() => navigate('/solucoes/proposta')}>
            Voltar para propostas
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Proposta">
      <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
        <div className="print:hidden">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/solucoes/proposta')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <Card className="print:border-0 print:shadow-none">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <CardTitle className="text-xl">Proposta Comercial</CardTitle>
                </div>
                <Badge className="bg-success text-success-foreground">
                  Concluída
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {format(new Date(proposal.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="font-medium">{proposal.company_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Valor</p>
                  <p className="font-medium">{formatCurrency(proposal.service_value)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Prazo</p>
                  <p className="font-medium">{proposal.deadline || 'A combinar'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Serviço</p>
                  <p className="font-medium">{proposal.service_offered}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="print:border-0 print:shadow-none">
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                {proposal.proposal_text}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="print:hidden space-y-4">
          <div className="grid grid-cols-2 gap-3 md:flex md:justify-center md:flex-wrap">
            <Button variant="outline" onClick={copyToClipboard} className="gap-2">
              {isCopied ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              Copiar texto
            </Button>
            <Button variant="outline" onClick={exportPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button variant="outline" onClick={sendWhatsApp} className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Enviar WhatsApp
            </Button>
            <Button onClick={createContract} className="gap-2 col-span-2 md:col-span-1">
              <FileOutput className="h-4 w-4" />
              Criar contrato
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
