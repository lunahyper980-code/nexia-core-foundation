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
  Target,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { TranslateApproachModal } from './TranslateApproachModal';
import type { Lead } from './LeadCard';

interface ApproachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
}

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
    `Assunto: Uma observação sobre ${lead.segmento} em ${lead.localizacao}\n\nOlá, equipe da ${lead.nome}!\n\nMeu nome é [seu nome] e trabalho ajudando negócios locais a crescerem no digital.\n\nPercebi que vocês atuam com ${lead.segmento} em ${lead.localizacao} e tenho algumas ideias que podem ser úteis.\n\nPosso compartilhar em uma conversa rápida?\n\nAbraço!`,
    `Assunto: Dúvida rápida sobre a ${lead.nome}\n\nOi, tudo bem?\n\nEstava pesquisando sobre ${lead.segmento} em ${lead.localizacao} e encontrei vocês.\n\nFiquei curioso: como vocês lidam com a captação de clientes hoje?\n\nPergunto porque trabalho nessa área e gosto de entender como cada negócio funciona.\n\nAbs!`
  ],
  ligacao: [
    `"Oi, [nome do contato]? Tudo bem? Aqui é [seu nome], tô ligando rapidinho."`,
    `"Vi que vocês trabalham com ${lead.segmento} em ${lead.localizacao} e fiquei curioso sobre uma coisa."`,
    `"Como vocês tão lidando com a parte digital do negócio hoje? Tem site, redes ativas?"`,
    `"Entendi. Olha, trabalho nessa área e posso ter algumas ideias úteis. Posso mandar algo por WhatsApp pra você dar uma olhada sem compromisso?"`
  ]
});

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

const channelConfig = {
  whatsapp: { title: 'WhatsApp', icon: MessageCircle, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
  instagram: { title: 'Instagram DM', icon: Instagram, color: 'text-pink-500', border: 'border-pink-500/20', bg: 'bg-pink-500/5' },
  email: { title: 'E-mail', icon: Mail, color: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5' },
  ligacao: { title: 'Roteiro de Ligação', icon: Phone, color: 'text-orange-500', border: 'border-orange-500/20', bg: 'bg-orange-500/5' },
} as const;

type ChannelKey = keyof typeof channelConfig;

export function ApproachModal({ open, onOpenChange, lead }: ApproachModalProps) {
  const [activeTab, setActiveTab] = useState<'consultiva' | 'direta'>('consultiva');
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [messageToTranslate, setMessageToTranslate] = useState('');
  const [messageType, setMessageType] = useState<ChannelKey>('whatsapp');

  const consultiveMessages = useMemo(() => lead ? getConsultiveMessages(lead) : null, [lead]);
  const directMessages = useMemo(() => lead ? getDirectMessages(lead) : null, [lead]);
  const currentMessages = activeTab === 'consultiva' ? consultiveMessages : directMessages;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Mensagem copiada!');
  };

  const handleTranslate = (message: string, type: ChannelKey) => {
    setMessageToTranslate(message);
    setMessageType(type);
    setTranslateModalOpen(true);
  };

  const openGoogleMaps = () => {
    if (!lead) return;
    const query = encodeURIComponent(`${lead.nome} ${lead.localizacao}`);
    window.open(`https://www.google.com/maps/search/${query}`, '_blank');
  };

  if (!lead || !currentMessages) return null;

  const channels: ChannelKey[] = ['whatsapp', 'instagram', 'email', 'ligacao'];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-w-[95vw] sm:max-w-lg md:max-w-2xl max-h-[85vh] p-0 gap-0 overflow-hidden"
          hideCloseButton
        >
          {/* Compact Header */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-border/50">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <DialogHeader className="space-y-0">
                  <DialogTitle className="text-base font-bold truncate">
                    Abordagem — {lead.nome}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground truncate">
                    {lead.segmento} · {lead.localizacao}
                  </DialogDescription>
                </DialogHeader>
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 h-7 w-7 rounded-full" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Compact Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'consultiva' | 'direta')} className="mt-3">
              <TabsList className="grid grid-cols-2 h-9 p-0.5">
                <TabsTrigger value="consultiva" className="gap-1.5 text-xs h-8 data-[state=active]:shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" />
                  Consultiva
                </TabsTrigger>
                <TabsTrigger value="direta" className="gap-1.5 text-xs h-8 data-[state=active]:shadow-sm">
                  <Handshake className="h-3.5 w-3.5" />
                  Direta
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scrollable Content */}
          <ScrollArea className="flex-1 max-h-[calc(85vh-120px)]">
            <div className="px-4 py-3 space-y-4">
              {channels.map((channelKey) => {
                const cfg = channelConfig[channelKey];
                const Icon = cfg.icon;
                const msgs = currentMessages[channelKey] || [];
                if (msgs.length === 0) return null;

                return (
                  <div key={channelKey} className="space-y-2">
                    {/* Channel Header */}
                    <div className="flex items-center gap-2">
                      <Icon className={`h-3.5 w-3.5 ${cfg.color}`} />
                      <span className="text-xs font-semibold text-foreground">{cfg.title}</span>
                      <Badge variant="outline" className="text-[9px] h-4 ml-auto">{msgs.length}</Badge>
                    </div>

                    {/* Messages */}
                    <div className="space-y-2">
                      {msgs.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg border ${cfg.border} ${cfg.bg} p-3 transition-colors hover:border-primary/30`}
                        >
                          <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-wrap line-clamp-4">
                            {msg}
                          </p>
                          <div className="flex gap-1.5 mt-2">
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => copyToClipboard(msg)}>
                              <Copy className="h-3 w-3" /> Copiar
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1" onClick={() => handleTranslate(msg, channelKey)}>
                              <Languages className="h-3 w-3" /> Traduzir
                            </Button>
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] gap-1 text-primary ml-auto" onClick={openGoogleMaps}>
                              <MapPin className="h-3 w-3" /> Maps
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <TranslateApproachModal
        open={translateModalOpen}
        onOpenChange={setTranslateModalOpen}
        originalMessage={messageToTranslate}
        messageType={messageType}
      />
    </>
  );
}
