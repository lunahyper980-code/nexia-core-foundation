import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ClipboardList, Plus, Calendar, ArrowRight, ArrowLeft, CheckCircle2, FileText, Users, X, Copy, MessageSquare, Edit3, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const BRIEFING_QUESTIONS = `📋 BRIEFING PROFISSIONAL

Por favor, responda às perguntas abaixo para que possamos entender melhor o seu negócio:

🏢 SOBRE O NEGÓCIO
1. Qual o nome da sua empresa?
2. Em qual cidade/região você atua?
3. Qual é o segmento do seu negócio?
4. Há quanto tempo a empresa existe?
5. Qual o tamanho da empresa? (MEI, Micro, Pequena, Média, Grande)

🌐 PRESENÇA DIGITAL
6. Você possui site? (Sim/Não)
7. Quais redes sociais você utiliza? (Instagram, Facebook, WhatsApp Business, LinkedIn, TikTok, YouTube)
8. Qual o principal canal de contato com seus clientes?
9. Como é feito o atendimento? (Manual, Semi-automatizado, Automatizado)

⚠️ SITUAÇÃO ATUAL
10. Qual a principal dificuldade do seu negócio hoje?
11. Em qual momento você sente que perde mais clientes?
12. Qual o maior gargalo na sua operação?

🎯 OBJETIVOS
13. O que você mais gostaria de melhorar no seu negócio?
14. Qual a sua maior prioridade agora?
15. Quais dessas soluções te interessam?
   [ ] Site profissional
   [ ] Aplicativo
   [ ] Autoridade digital
   [ ] Organização de processos
   [ ] Posicionamento de marca
   [ ] Kit de lançamento

Aguardamos suas respostas! 🚀`;

export default function BriefingHub() {
  const navigate = useNavigate();
  const { workspace } = useWorkspace();
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [copiedOption, setCopiedOption] = useState<string | null>(null);

  const { data: briefings, isLoading } = useQuery({
    queryKey: ['briefings', workspace?.id],
    queryFn: async () => {
      if (!workspace?.id) return [];
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!workspace?.id,
  });

  const copyToClipboard = (text: string, optionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOption(optionId);
    toast.success('Copiado para a área de transferência!');
    setTimeout(() => setCopiedOption(null), 2000);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(BRIEFING_QUESTIONS);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    toast.success('Abrindo WhatsApp...');
  };

  const handleGeneratePDF = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Briefing Profissional</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.6; color: #333; }
            h1 { color: #059669; border-bottom: 2px solid #059669; padding-bottom: 10px; }
            h2 { color: #065f46; margin-top: 30px; font-size: 18px; }
            .question { margin: 12px 0; padding: 10px; background: #f9fafb; border-radius: 6px; }
            .answer-line { border-bottom: 1px solid #d1d5db; margin-top: 8px; min-height: 30px; }
            .checkbox-group { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px; }
            .checkbox-item { display: flex; align-items: center; gap: 8px; }
            .checkbox { width: 18px; height: 18px; border: 2px solid #d1d5db; border-radius: 4px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <h1>📋 Briefing Profissional</h1>
          <h2>🏢 SOBRE O NEGÓCIO</h2>
          <div class="question">1. Qual o nome da sua empresa?<div class="answer-line"></div></div>
          <div class="question">2. Em qual cidade/região você atua?<div class="answer-line"></div></div>
          <div class="question">3. Qual é o segmento do seu negócio?<div class="answer-line"></div></div>
          <div class="question">4. Há quanto tempo a empresa existe?<div class="answer-line"></div></div>
          <div class="question">5. Qual o tamanho da empresa?<div class="answer-line"></div></div>
          <h2>🌐 PRESENÇA DIGITAL</h2>
          <div class="question">6. Você possui site?<div class="answer-line"></div></div>
          <div class="question">7. Quais redes sociais você utiliza?<div class="answer-line"></div></div>
          <div class="question">8. Qual o principal canal de contato com seus clientes?<div class="answer-line"></div></div>
          <div class="question">9. Como é feito o atendimento?<div class="answer-line"></div></div>
          <h2>⚠️ SITUAÇÃO ATUAL</h2>
          <div class="question">10. Qual a principal dificuldade do seu negócio hoje?<div class="answer-line"></div><div class="answer-line"></div></div>
          <div class="question">11. Em qual momento você sente que perde mais clientes?<div class="answer-line"></div><div class="answer-line"></div></div>
          <div class="question">12. Qual o maior gargalo na sua operação?<div class="answer-line"></div><div class="answer-line"></div></div>
          <h2>🎯 OBJETIVOS</h2>
          <div class="question">13. O que você mais gostaria de melhorar no seu negócio?<div class="answer-line"></div><div class="answer-line"></div></div>
          <div class="question">14. Qual a sua maior prioridade agora?<div class="answer-line"></div></div>
          <div class="question">
            15. Quais dessas soluções te interessam?
            <div class="checkbox-group">
              <div class="checkbox-item"><div class="checkbox"></div> Site profissional</div>
              <div class="checkbox-item"><div class="checkbox"></div> Aplicativo</div>
              <div class="checkbox-item"><div class="checkbox"></div> Autoridade digital</div>
              <div class="checkbox-item"><div class="checkbox"></div> Organização de processos</div>
              <div class="checkbox-item"><div class="checkbox"></div> Posicionamento de marca</div>
              <div class="checkbox-item"><div class="checkbox"></div> Kit de lançamento</div>
            </div>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
    toast.success('Gerando PDF para impressão...');
  };

  const handleFillInNexia = () => {
    navigate('/nexia-ai/briefing/novo');
    setSendModalOpen(false);
  };

  const getStatusBadge = (status: string, convertedAt: string | null) => {
    if (convertedAt) {
      return (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Convertido
        </Badge>
      );
    }
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            Concluído
          </Badge>
        );
      case 'analyzed':
        return (
          <Badge className="bg-violet-500/10 text-violet-600 border-violet-500/20">
            Analisado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">Rascunho</Badge>
        );
    }
  };

  return (
    <AppLayout title="Briefings">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')} className="shrink-0 -ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <ClipboardList className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Briefing Profissional
                </h1>
                <Badge variant="secondary" className="mt-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                  Coleta de dados
                </Badge>
              </div>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Colete informações essenciais do negócio antes de qualquer diagnóstico ou planejamento. O briefing é a base para recomendações precisas.
            </p>
          </div>
          <Button onClick={() => setSendModalOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
            <Plus className="h-4 w-4" />
            Novo briefing
          </Button>
        </div>

        {/* Info Card */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                'Dados do negócio',
                'Presença digital',
                'Situação atual',
                'Objetivos'
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Briefings List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Briefings criados</h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : briefings && briefings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {briefings.map((briefing) => (
                <Card 
                  key={briefing.id} 
                  className="hover:border-emerald-500/50 transition-colors cursor-pointer group"
                  onClick={() => navigate(`/nexia-ai/briefing/${briefing.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-500" />
                        <CardTitle className="text-base line-clamp-1">
                          {briefing.company_name}
                        </CardTitle>
                      </div>
                      {getStatusBadge(briefing.status, briefing.converted_at)}
                    </div>
                    <CardDescription className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(briefing.created_at), "dd 'de' MMM, yyyy", { locale: ptBR })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground line-clamp-1">
                        {briefing.segment || 'Segmento não definido'}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-3 rounded-full bg-muted mb-4">
                  <ClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">Nenhum briefing criado ainda</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">
                  Crie seu primeiro briefing para coletar informações do cliente.
                </p>
                <Button onClick={() => setSendModalOpen(true)} className="gap-2 bg-emerald-500 hover:bg-emerald-600">
                  <Plus className="h-4 w-4" />
                  Criar primeiro briefing
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer tip */}
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            💡 O briefing coleta dados reais do cliente. Depois, converta para o Nexia gerar diagnóstico e recomendações.
          </p>
        </div>
      </div>

      {/* Modal de Enviar Briefing */}
      {sendModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-background border border-border rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10">
                  <ClipboardList className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-semibold text-foreground">Enviar Briefing</h2>
                  <p className="text-xs text-muted-foreground">
                    Para o cliente responder
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSendModalOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground text-center mb-4">
                Escolha como deseja coletar as informações do cliente
              </p>

              {/* Option: Copy */}
              <button
                onClick={() => copyToClipboard(BRIEFING_QUESTIONS, 'copy')}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2.5 rounded-xl bg-blue-500/10">
                  {copiedOption === 'copy' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">
                    {copiedOption === 'copy' ? 'Copiado!' : 'Copiar perguntas'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    Copie as perguntas para enviar por qualquer canal
                  </p>
                </div>
                <Send className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>

              {/* Option: WhatsApp */}
              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2.5 rounded-xl bg-green-500/10">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">Enviar via WhatsApp</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Abre o WhatsApp com as perguntas prontas
                  </p>
                </div>
                <Send className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>

              {/* Option: PDF */}
              <button
                onClick={handleGeneratePDF}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2.5 rounded-xl bg-amber-500/10">
                  <FileText className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">Gerar PDF de perguntas</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Gere um PDF profissional para o cliente preencher
                  </p>
                </div>
                <Send className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>

              {/* Option: Fill in Nexia */}
              <button
                onClick={handleFillInNexia}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
              >
                <div className="p-2.5 rounded-xl bg-emerald-500/10">
                  <Edit3 className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-foreground">Preencher no Nexia</p>
                  <p className="text-xs text-muted-foreground truncate">
                    Preencha você mesmo as respostas do cliente
                  </p>
                </div>
                <Send className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
              </button>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground text-center">
                💡 Após coletar as respostas, preencha no Nexia para gerar o diagnóstico inteligente.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
