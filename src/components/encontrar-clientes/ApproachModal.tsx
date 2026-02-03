import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Copy, 
  MessageCircle, 
  Instagram, 
  Mail, 
  Phone, 
  Languages, 
  X,
  Sparkles,
  Handshake,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { TranslateApproachModal } from './TranslateApproachModal';
import type { Lead } from './LeadCard';

interface ApproachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

// Mensagens de Venda Consultiva - Foco em conexão e diagnóstico
const getConsultiveMessages = (lead: Lead) => ({
  whatsapp: [
    `Oi, tudo bem? Vi o perfil da ${lead.nome} e achei interessante o trabalho de vocês com ${lead.segmento}. Como está o movimento por aí?`,
    `Olá! Trabalho com presença digital e estava pesquisando negócios de ${lead.segmento} em ${lead.localizacao}. Posso fazer uma pergunta rápida sobre como vocês lidam com clientes online?`,
    `E aí, tudo certo? Percebi que vocês trabalham com ${lead.segmento} em ${lead.localizacao}. Já pensaram em fortalecer a presença online do negócio? Fico curioso pra saber como funciona pra vocês hoje.`
  ],
  instagram: [
    `Curti demais o trabalho de vocês! Quanto tempo de mercado em ${lead.localizacao}? 💪`,
    `Que legal o perfil! Vocês trabalham mais com qual público dentro de ${lead.segmento}?`,
    `Parabéns pelo trabalho com ${lead.segmento}! Como está sendo a experiência no digital?`
  ],
  email: [
    `Assunto: Uma observação sobre ${lead.segmento} em ${lead.localizacao}\n\nOlá, equipe da ${lead.nome}!\n\nMeu nome é [seu nome] e trabalho ajudando negócios locais a crescerem no digital.\n\nPercebi que vocês atuam com ${lead.segmento} em ${lead.localizacao} e tenho algumas ideias que podem ser úteis para o momento de vocês.\n\nPosso compartilhar em uma conversa rápida?\n\nAbraço!`,
    `Assunto: Dúvida rápida sobre a ${lead.nome}\n\nOi, tudo bem?\n\nEstava pesquisando sobre ${lead.segmento} em ${lead.localizacao} e encontrei vocês.\n\nFiquei curioso: como vocês lidam com a captação de clientes hoje? É mais boca a boca ou usam alguma estratégia digital?\n\nPergunto porque trabalho nessa área e gosto de entender como cada negócio funciona.\n\nAbs!`
  ],
  ligacao: [
    `"Oi, [nome do contato]? Tudo bem? Aqui é [seu nome], tô ligando rapidinho."`,
    `"Vi que vocês trabalham com ${lead.segmento} em ${lead.localizacao} e fiquei curioso sobre uma coisa."`,
    `"Como vocês tão lidando com a parte digital do negócio hoje? Tem site, redes ativas?"`,
    `"Entendi. Olha, trabalho nessa área e posso ter algumas ideias úteis. Posso mandar algo por WhatsApp pra você dar uma olhada sem compromisso?"`
  ]
});

// Mensagens de Venda Direta - Foco em oferta objetiva
const getDirectMessages = (lead: Lead) => ({
  whatsapp: [
    `Olá! Sou especialista em presença digital para ${lead.segmento}. Tenho uma proposta especial para negócios de ${lead.localizacao}. Posso te enviar?`,
    `Oi! Vi que a ${lead.nome} ainda não tem um site profissional. Tenho uma oferta exclusiva para o mês. Interesse em conhecer?`,
    `Olá! Trabalho criando sites e apps para negócios como o de vocês. Tenho disponibilidade essa semana. Quer agendar uma apresentação de 15min?`
  ],
  instagram: [
    `Oi! Trabalho com marketing digital para ${lead.segmento}. Tenho um pacote especial. Posso enviar os detalhes?`,
    `Olá! Vi o perfil de vocês e tenho uma proposta que pode ajudar a aumentar as vendas. Interesse?`,
    `Oi! Especialista em ${lead.segmento} aqui. Quer saber como dobrar seu alcance no Instagram?`
  ],
  email: [
    `Assunto: Proposta Comercial - ${lead.nome}\n\nOlá!\n\nSou [seu nome], especialista em soluções digitais para ${lead.segmento}.\n\nTenho um pacote sob medida que inclui:\n✅ Site profissional otimizado\n✅ Gestão de redes sociais\n✅ Consultoria de marketing\n\nCondições especiais para fechamento este mês.\n\nPosso enviar a proposta detalhada?\n\nAtenciosamente,\n[seu nome]`,
    `Assunto: Oportunidade para ${lead.nome}\n\nOlá!\n\nNotei que ${lead.nome} ainda não possui presença digital completa.\n\nOfereço:\n✅ Site em até 7 dias\n✅ Primeiro mês de manutenção grátis\n✅ Setup de Google Meu Negócio incluso\n\nVamos conversar?\n\nAbraço!`
  ],
  ligacao: [
    `"Oi, [nome]? Aqui é [seu nome]. Tenho uma proposta comercial para apresentar."`,
    `"Somos especialistas em ${lead.segmento} e tenho condições especiais essa semana."`,
    `"O pacote inclui site, redes sociais e suporte. Tudo por um valor acessível."`,
    `"Posso agendar uma apresentação de 15 minutos ainda hoje. Qual o melhor horário?"`
  ]
});

export function ApproachModal({ open, onOpenChange, lead }: ApproachModalProps) {
  const [activeTab, setActiveTab] = useState<'consultiva' | 'direta'>('consultiva');
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [messageToTranslate, setMessageToTranslate] = useState('');
  const [messageType, setMessageType] = useState<'whatsapp' | 'instagram' | 'email' | 'ligacao'>('whatsapp');

  const consultiveMessages = useMemo(() => {
    if (!lead) return null;
    return getConsultiveMessages(lead);
  }, [lead]);

  const directMessages = useMemo(() => {
    if (!lead) return null;
    return getDirectMessages(lead);
  }, [lead]);

  const currentMessages = activeTab === 'consultiva' ? consultiveMessages : directMessages;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Mensagem copiada!');
  };

  const openWhatsApp = (message: string) => {
    if (lead?.telefone) {
      const phone = lead.telefone.replace(/\D/g, '');
      const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      copyToClipboard(message);
      toast.info('Telefone não disponível. Mensagem copiada!');
    }
  };

  const openInstagram = (message: string) => {
    copyToClipboard(message);
    toast.success('Mensagem copiada! Cole no Instagram DM.');
    window.open('https://instagram.com/direct/inbox', '_blank');
  };

  const openEmail = (message: string) => {
    // Extrai o assunto da primeira linha se existir
    const lines = message.split('\n');
    const subjectMatch = lines[0].match(/^Assunto:\s*(.+)$/);
    const subject = subjectMatch ? encodeURIComponent(subjectMatch[1]) : '';
    const body = subjectMatch 
      ? encodeURIComponent(lines.slice(1).join('\n').trim())
      : encodeURIComponent(message);
    
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleTranslate = (message: string, type: 'whatsapp' | 'instagram' | 'email' | 'ligacao') => {
    setMessageToTranslate(message);
    setMessageType(type);
    setTranslateModalOpen(true);
  };

  if (!lead || !currentMessages) return null;

  const MessageCard = ({ 
    message, 
    index, 
    type 
  }: { 
    message: string; 
    index: number; 
    type: 'whatsapp' | 'instagram' | 'email' | 'ligacao';
  }) => (
    <div className="group relative bg-card/50 hover:bg-card border border-border/50 hover:border-primary/20 rounded-xl p-4 transition-all duration-200">
      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap pr-2 mb-4">
        {message}
      </p>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => copyToClipboard(message)}
        >
          <Copy className="h-3.5 w-3.5" />
          Copiar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={() => handleTranslate(message, type)}
        >
          <Languages className="h-3.5 w-3.5" />
          Traduzir
        </Button>
      </div>
    </div>
  );

  const MessageSection = ({ 
    title, 
    icon: Icon, 
    messages, 
    type,
    iconColor 
  }: { 
    title: string; 
    icon: React.ElementType; 
    messages: string[]; 
    type: 'whatsapp' | 'instagram' | 'email' | 'ligacao';
    iconColor: string;
  }) => (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        <h4 className="text-sm font-medium text-foreground">{title}</h4>
        <Badge variant="outline" className="text-[10px] ml-auto">
          {messages.length} opções
        </Badge>
      </div>
      <div className="space-y-3">
        {messages.map((msg, idx) => (
          <MessageCard key={idx} message={msg} index={idx} type={type} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-[95vw] md:max-w-[85vw] lg:max-w-4xl h-[95vh] md:h-[90vh] p-0 gap-0 overflow-hidden bg-background/95 backdrop-blur-xl border-primary/10"
          hideCloseButton
        >
          {/* Header */}
          <DialogHeader className="shrink-0 px-4 md:px-6 pt-4 md:pt-6 pb-4 border-b border-border/50 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
                  Estratégias de Abordagem
                </DialogTitle>
                <DialogDescription className="text-sm md:text-base">
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-medium">
                    Escolha o estilo de abordagem ideal para este lead
                  </span>
                </DialogDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8 rounded-full"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Lead Info Badge */}
            <div className="flex items-center gap-2 pt-1">
              <Badge variant="secondary" className="gap-1.5 text-xs">
                <Target className="h-3 w-3" />
                {lead.nome}
              </Badge>
              <Badge variant="outline" className="text-xs text-muted-foreground">
                {lead.segmento}
              </Badge>
            </div>
          </DialogHeader>

          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onValueChange={(v) => setActiveTab(v as 'consultiva' | 'direta')}
            className="flex flex-col flex-1 min-h-0"
          >
            <TabsList className="shrink-0 grid grid-cols-2 mx-4 md:mx-6 mt-4 h-12 p-1 bg-muted/50">
              <TabsTrigger 
                value="consultiva" 
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">Venda</span> Consultiva
              </TabsTrigger>
              <TabsTrigger 
                value="direta"
                className="gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Handshake className="h-4 w-4" />
                <span className="hidden sm:inline">Venda</span> Direta
              </TabsTrigger>
            </TabsList>

            {/* Tab Description */}
            <div className="shrink-0 px-4 md:px-6 py-3 text-xs text-muted-foreground bg-muted/30 mx-4 md:mx-6 mt-3 rounded-lg">
              {activeTab === 'consultiva' ? (
                <p>💡 <strong>Foco em conexão, curiosidade e diagnóstico.</strong> Ideal para criar relacionamento antes de oferecer serviços.</p>
              ) : (
                <p>🎯 <strong>Foco em oferta objetiva e CTA direto.</strong> Ideal quando você quer ir direto ao ponto.</p>
              )}
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="px-4 md:px-6 py-4 space-y-6">
                <TabsContent value="consultiva" className="mt-0 space-y-6">
                  <MessageSection 
                    title="WhatsApp" 
                    icon={MessageCircle} 
                    messages={consultiveMessages?.whatsapp || []} 
                    type="whatsapp"
                    iconColor="text-emerald-500"
                  />
                  <MessageSection 
                    title="Instagram DM" 
                    icon={Instagram} 
                    messages={consultiveMessages?.instagram || []} 
                    type="instagram"
                    iconColor="text-pink-500"
                  />
                  <MessageSection 
                    title="E-mail" 
                    icon={Mail} 
                    messages={consultiveMessages?.email || []} 
                    type="email"
                    iconColor="text-blue-500"
                  />
                  <MessageSection 
                    title="Roteiro de Ligação" 
                    icon={Phone} 
                    messages={consultiveMessages?.ligacao || []} 
                    type="ligacao"
                    iconColor="text-orange-500"
                  />
                </TabsContent>

                <TabsContent value="direta" className="mt-0 space-y-6">
                  <MessageSection 
                    title="WhatsApp" 
                    icon={MessageCircle} 
                    messages={directMessages?.whatsapp || []} 
                    type="whatsapp"
                    iconColor="text-emerald-500"
                  />
                  <MessageSection 
                    title="Instagram DM" 
                    icon={Instagram} 
                    messages={directMessages?.instagram || []} 
                    type="instagram"
                    iconColor="text-pink-500"
                  />
                  <MessageSection 
                    title="E-mail" 
                    icon={Mail} 
                    messages={directMessages?.email || []} 
                    type="email"
                    iconColor="text-blue-500"
                  />
                  <MessageSection 
                    title="Roteiro de Ligação" 
                    icon={Phone} 
                    messages={directMessages?.ligacao || []} 
                    type="ligacao"
                    iconColor="text-orange-500"
                  />
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Translate Modal */}
      <TranslateApproachModal
        open={translateModalOpen}
        onOpenChange={setTranslateModalOpen}
        originalMessage={messageToTranslate}
        messageType={messageType}
      />
    </>
  );
}
