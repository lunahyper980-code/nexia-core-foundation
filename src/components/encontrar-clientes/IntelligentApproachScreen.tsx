import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Instagram, Mail, Phone, Copy, ChevronRight, ChevronLeft, RefreshCw, FileText, Save, CheckCircle2, AlertTriangle, Target, MessageSquare, ShieldCheck, Handshake, Sparkles, ArrowRight, Languages, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ApproachLoadingAnimation } from './ApproachLoadingAnimation';
import { TranslateApproachModal } from './TranslateApproachModal';
import { SendBriefingModal } from './SendBriefingModal';
import { useModuleState } from '@/hooks/useModuleState';
import { ResumeSessionBanner } from '@/components/ResumeSessionBanner';
import type { Lead } from './LeadCard';

// Templates prontos - substituem {nome}, {segmento}, {localizacao}
const createApproachTemplate = (lead: Lead) => {
  const nome = lead.nome;
  const segmento = lead.segmento;
  const localizacao = lead.localizacao;

  return {
    whatsapp: {
      objetivo: "Iniciar conversa de forma natural e humana, sem parecer vendedor.",
      mensagens: [
        `Oi, tudo bem? Vi o perfil da ${nome} e achei interessante o trabalho de vocês com ${segmento}. Como está o movimento por aí?`,
        `Olá! Trabalho com presença digital e estava pesquisando negócios de ${segmento} em ${localizacao}. Posso fazer uma pergunta rápida sobre como vocês lidam com clientes online?`,
        `E aí, tudo certo? Percebi que vocês trabalham com ${segmento} em ${localizacao}. Já pensaram em fortalecer a presença online do negócio? Fico curioso pra saber como funciona pra vocês hoje.`
      ]
    },
    instagram: {
      objetivo: "Engajar primeiro, criar familiaridade antes de abordar diretamente.",
      mensagens: [
        `Curti demais o trabalho de vocês! Quanto tempo de mercado em ${localizacao}?`,
        `Que legal o perfil! Vocês trabalham mais com qual público dentro de ${segmento}?`,
        `Parabéns pelo trabalho com ${segmento}! Como está sendo a experiência no digital?`
      ]
    },
    email: {
      objetivo: "Abordagem mais formal e consultiva, ideal para negócios maiores.",
      mensagens: [
        `assunto: Uma observação sobre ${segmento} em ${localizacao} | corpo: Olá, equipe da ${nome}!\n\nMeu nome é [seu nome] e trabalho ajudando negócios locais a crescerem no digital.\n\nPercebi que vocês atuam com ${segmento} em ${localizacao} e tenho algumas ideias que podem ser úteis para o momento de vocês.\n\nPosso compartilhar em uma conversa rápida?\n\nAbraço!`,
        `assunto: Dúvida rápida sobre a ${nome} | corpo: Oi, tudo bem?\n\nEstava pesquisando sobre ${segmento} em ${localizacao} e encontrei vocês.\n\nFiquei curioso: como vocês lidam com a captação de clientes hoje? É mais boca a boca ou usam alguma estratégia digital?\n\nPergunto porque trabalho nessa área e gosto de entender como cada negócio funciona.\n\nAbs!`
      ]
    },
    ligacao: {
      objetivo: "Estabelecer conexão rápida por voz, ser direto e respeitoso com o tempo.",
      roteiro: [
        "\"Oi, [nome do contato]? Tudo bem? Aqui é [seu nome], tô ligando rapidinho.\"",
        "\"Vi que vocês trabalham com " + segmento + " em " + localizacao + " e fiquei curioso sobre uma coisa.\"",
        "\"Como vocês tão lidando com a parte digital do negócio hoje? Tem site, redes ativas?\"",
        "\"Entendi. Olha, trabalho nessa área e posso ter algumas ideias úteis. Posso mandar algo por WhatsApp pra você dar uma olhada sem compromisso?\""
      ]
    },
    continuacao: {
      introducao: "Quando o cliente responder, continue a conversa com curiosidade genuína. Faça perguntas abertas sobre o negócio e os desafios do dia a dia. Não apresente soluções antes de entender o problema.",
      respostas: [
        "Legal, faz sentido. E como vocês lidam com [aspecto do negócio] hoje?",
        "Entendi. Isso costuma impactar em quê no dia a dia de vocês?",
        "Interessante. Posso te mostrar algo que vi em negócios parecidos com o de vocês?"
      ]
    },
    objecoes: [
      {
        objecao: "Agora não tenho tempo",
        resposta: "Entendo perfeitamente, sei como é corrido. Posso te mandar uma mensagem em outro momento? Qual seria melhor pra você?",
        naoFalar: "Não insista dizendo que é rápido ou que só precisa de 5 minutos",
        falar: "Respeite o tempo, agradeça e deixe a porta aberta para contato futuro"
      },
      {
        objecao: "Já tenho alguém que faz isso",
        resposta: "Ótimo! Ter suporte é importante mesmo. Fico disponível caso precisem de uma segunda opinião algum dia.",
        naoFalar: "Não critique o concorrente, não compare preços ou qualidade",
        falar: "Valide a escolha atual e se posicione como alternativa futura"
      },
      {
        objecao: "Não é prioridade agora",
        resposta: "Faz total sentido. Cada momento tem suas prioridades. Posso entrar em contato daqui uns meses pra ver se faz mais sentido?",
        naoFalar: "Não tente convencer que deveria ser prioridade ou criar urgência artificial",
        falar: "Aceite a resposta e programe um follow-up futuro com permissão"
      },
      {
        objecao: "Quanto custa?",
        resposta: "Depende muito do que vocês precisam. Antes de falar de valor, posso entender melhor o cenário de vocês pra ver se realmente faz sentido?",
        naoFalar: "Não jogue preço sem entender a necessidade, não dê desconto de cara",
        falar: "Redirecione para entender a dor antes de apresentar solução e preço"
      }
    ],
    fechamento: {
      sinais: [
        "Cliente começa a fazer perguntas sobre como funciona o processo",
        "Pede informações de preço, prazo ou condições",
        "Menciona problemas específicos que precisa resolver urgente",
        "Pergunta se você já trabalhou com negócios parecidos"
      ],
      transicao: "Com base no que você me contou, faz sentido te mostrar uma proposta que resolve exatamente isso. Posso preparar algo específico pro caso de vocês?"
    }
  };
};

const sections = [
  { id: 'preparacao', label: 'Preparação', icon: Target },
  { id: 'mensagens', label: 'Primeiro contato', icon: MessageSquare },
  { id: 'continuacao', label: 'Continuação', icon: ChevronRight },
  { id: 'objecoes', label: 'Objeções', icon: ShieldCheck },
  { id: 'fechamento', label: 'Fechamento', icon: Handshake },
];

interface IntelligentApproachScreenProps {
  open: boolean;
  onClose: () => void;
  lead: Lead | null;
}

export function IntelligentApproachScreen({ open, onClose, lead }: IntelligentApproachScreenProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [activeSection, setActiveSection] = useState('preparacao');
  const [selectedObjecao, setSelectedObjecao] = useState<number | null>(null);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);
  const [messageToTranslate, setMessageToTranslate] = useState('');
  const [sendBriefingModalOpen, setSendBriefingModalOpen] = useState(false);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const touchStartX = useRef<number | null>(null);
  
  const { getSavedState, saveSubScreen, saveExtras, clearState } = useModuleState('prospeccao');

  // Gera o template com os dados do lead
  const approach = useMemo(() => {
    if (!lead) return null;
    return createApproachTemplate(lead);
  }, [lead]);

  const currentIndex = sections.findIndex(s => s.id === activeSection);

  // Check for saved state on mount
  useEffect(() => {
    if (open && lead) {
      const saved = getSavedState();
      // Only show resume banner if saved for this specific lead
      if (saved?.extras?.leadId === lead.nome && saved?.subScreen) {
        setShowResumeBanner(true);
      }
    }
  }, [open, lead]);

  const handleResumeSession = () => {
    const saved = getSavedState();
    if (saved) {
      if (saved.subScreen) setActiveSection(saved.subScreen);
      if (saved.extras?.selectedObjecao !== undefined) setSelectedObjecao(saved.extras.selectedObjecao);
    }
    setShowResumeBanner(false);
    setShowContent(true);
  };

  const handleStartFresh = () => {
    clearState();
    setShowResumeBanner(false);
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    saveSubScreen(sectionId);
    if (lead) {
      saveExtras({ leadId: lead.nome, selectedObjecao });
    }
  };

  useEffect(() => {
    if (open && lead && !showContent) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
        setShowContent(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [open, lead]);

  // Reset apenas quando fechar completamente
  useEffect(() => {
    if (!open) {
      // Pequeno delay para manter estado durante animação de saída
      const timer = setTimeout(() => {
        setShowContent(false);
        setActiveSection('preparacao');
        setSelectedObjecao(null);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado!');
  };

  const handleRegenerate = () => {
    setShowContent(false);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowContent(true);
      toast.success('Abordagem atualizada!');
    }, 2000);
  };

  const handleOpenTranslate = (message: string) => {
    setMessageToTranslate(message);
    setTranslateModalOpen(true);
  };

  const goToSection = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < sections.length) {
      const newSectionId = sections[newIndex].id;
      handleSectionChange(newSectionId);
      // Scroll to top of main content
      mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextSection = () => {
    if (currentIndex < sections.length - 1) {
      goToSection('next');
    }
  };

  // Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 80) {
      if (diff > 0 && currentIndex < sections.length - 1) {
        goToSection('next');
      } else if (diff < 0 && currentIndex > 0) {
        goToSection('prev');
      }
    }
    
    touchStartX.current = null;
  };

  if (!open) return null;

  // Show resume banner before loading
  if (showResumeBanner && !isLoading && !showContent) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
        <header className="shrink-0 border-b border-border/50 bg-background z-20">
          <div className="flex items-center gap-3 px-4 py-3 max-w-[1200px] mx-auto w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2 text-muted-foreground hover:text-foreground -ml-2 shrink-0"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <div className="flex-1 min-w-0 text-center">
              <h1 className="text-base sm:text-lg font-semibold text-foreground">
                Abordagem Inteligente
              </h1>
              <p className="text-xs text-muted-foreground truncate opacity-70">
                {lead?.nome}
              </p>
            </div>
          </div>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ResumeSessionBanner
              title="Continuar de onde parou?"
              description={`Você estava na seção "${sections.find(s => s.id === getSavedState()?.subScreen)?.label || 'Preparação'}"`}
              onResume={handleResumeSession}
              onStartFresh={handleStartFresh}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <ApproachLoadingAnimation open={isLoading} />;
  }

  if (!showContent || !approach) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col animate-fade-in">
      {/* Header - Sticky top, não fixed */}
      <header className="shrink-0 border-b border-border/50 bg-background z-20">
        <div className="flex items-center gap-3 px-4 py-3 max-w-[1200px] mx-auto w-full">
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2 text-muted-foreground hover:text-foreground -ml-2 shrink-0"
            onClick={onClose}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          
          <div className="flex-1 min-w-0 text-center">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Abordagem Inteligente
            </h1>
            <p className="text-xs text-muted-foreground truncate opacity-70">
              {lead?.nome}
            </p>
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => {
              const allContent = `Abordagem para ${lead?.nome}\n\n${JSON.stringify(approach, null, 2)}`;
              copyToClipboard(allContent);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Stepper - Horizontal scroll no mobile, fixo no fluxo */}
      <nav className="shrink-0 border-b border-border/20 bg-background z-10">
        <div className="max-w-[1200px] mx-auto w-full">
          {/* Container com scroll horizontal no mobile */}
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-1 sm:gap-2 px-4 py-3 min-w-max sm:min-w-0 sm:justify-between">
              {sections.map((section, index) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                const isPast = index < currentIndex;
                
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className="flex flex-col items-center gap-1.5 group touch-manipulation py-1 px-2 sm:px-3 sm:flex-1"
                  >
                    {/* Ícone */}
                    <div 
                      className={`
                        w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200
                        ${isActive 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : isPast 
                            ? 'bg-primary/15 text-primary' 
                            : 'bg-muted/60 text-muted-foreground group-hover:bg-muted group-active:scale-95'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {/* Label */}
                    <span 
                      className={`
                        text-[10px] sm:text-xs font-medium text-center leading-tight transition-colors whitespace-nowrap
                        ${isActive ? 'text-foreground' : 'text-muted-foreground/70'}
                      `}
                    >
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Progress bar simples */}
          <div className="h-0.5 bg-border/30 mx-4 mb-1">
            <div 
              className="h-full bg-primary/60 transition-all duration-500 ease-out"
              style={{ width: `${((currentIndex + 1) / sections.length) * 100}%` }}
            />
          </div>
        </div>
      </nav>

      {/* Main Content - ÚNICO scroll da página */}
      <main 
        ref={mainRef}
        className="flex-1 overflow-y-auto overscroll-contain"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-[800px] mx-auto w-full px-4 sm:px-6 py-6 pb-32 sm:pb-24">
          {/* Section: Preparação */}
          {activeSection === 'preparacao' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Antes de entrar em contato
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  O primeiro contato define toda a relação. Prepare-se corretamente.
                </p>
              </div>

              {/* Regras de ouro - Card elegante */}
              <div className="bg-amber-500/[0.03] border border-amber-500/10 rounded-xl p-4 sm:p-5">
                <div className="flex gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500/80" />
                  </div>
                  <div className="space-y-2.5 flex-1">
                    <p className="text-sm font-medium text-foreground">Regras de ouro do primeiro contato</p>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-2 shrink-0" />
                        <span>Não tente vender no primeiro contato</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-2 shrink-0" />
                        <span>Não fale de preço</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-2 shrink-0" />
                        <span>Não fale de serviço diretamente</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 mt-2 shrink-0" />
                        <span>O objetivo inicial é criar conexão e curiosidade</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Checklist elegante */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Checklist de preparação</h3>
                <div className="grid gap-2">
                  {[
                    { text: 'Entenda rapidamente o negócio', done: true },
                    { text: 'Observe presença digital atual', done: true },
                    { text: 'Identifique um ponto de melhoria real', done: false },
                    { text: 'Aborde com curiosidade, não oferta', done: false },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-border/40 bg-card/50 w-full"
                    >
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/60 text-muted-foreground'}`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <span className="text-sm flex-1">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sobre o lead */}
              <div className="bg-muted/20 rounded-xl p-4">
                <h3 className="font-medium text-xs text-muted-foreground mb-3">Sobre este lead</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{lead?.segmento}</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">{lead?.localizacao}</span>
                  {lead?.temSite && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/20 text-emerald-500">Possui site</span>}
                  {lead?.temInstagram && <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-pink-500/20 text-pink-500">Possui Instagram</span>}
                </div>
              </div>
            </div>
          )}

          {/* Section: Mensagens */}
          {activeSection === 'mensagens' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Primeiro contato
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Escolha o canal e a mensagem ideal para iniciar a conversa.
                </p>
              </div>

              <Tabs defaultValue="whatsapp" className="w-full">
                <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                  <TabsTrigger value="whatsapp" className="gap-1.5 text-xs sm:text-sm py-2">
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </TabsTrigger>
                  <TabsTrigger value="instagram" className="gap-1.5 text-xs sm:text-sm py-2">
                    <Instagram className="h-4 w-4" />
                    <span className="hidden sm:inline">Instagram</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="gap-1.5 text-xs sm:text-sm py-2">
                    <Mail className="h-4 w-4" />
                    <span className="hidden sm:inline">Email</span>
                  </TabsTrigger>
                  <TabsTrigger value="ligacao" className="gap-1.5 text-xs sm:text-sm py-2">
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Ligação</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="whatsapp" className="mt-4 space-y-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Objetivo:</span> {approach.whatsapp.objetivo}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {approach.whatsapp.mensagens.map((msg, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-xl p-4">
                        <p className="text-sm mb-3 leading-relaxed">{msg}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => copyToClipboard(msg)}>
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2 h-8 text-xs text-primary" onClick={() => handleOpenTranslate(msg)}>
                            <Languages className="h-3 w-3" />
                            Traduzir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="instagram" className="mt-4 space-y-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Objetivo:</span> {approach.instagram.objetivo}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {approach.instagram.mensagens.map((msg, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-xl p-4">
                        <p className="text-sm mb-3 leading-relaxed">{msg}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => copyToClipboard(msg)}>
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2 h-8 text-xs text-primary" onClick={() => handleOpenTranslate(msg)}>
                            <Languages className="h-3 w-3" />
                            Traduzir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="email" className="mt-4 space-y-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Objetivo:</span> {approach.email.objetivo}
                    </p>
                  </div>
                  <div className="space-y-3">
                    {approach.email.mensagens.map((msg, i) => (
                      <div key={i} className="bg-card border border-border/50 rounded-xl p-4">
                        <p className="text-sm mb-3 leading-relaxed whitespace-pre-wrap">{msg}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => copyToClipboard(msg)}>
                            <Copy className="h-3 w-3" />
                            Copiar
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2 h-8 text-xs text-primary" onClick={() => handleOpenTranslate(msg)}>
                            <Languages className="h-3 w-3" />
                            Traduzir
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ligacao" className="mt-4 space-y-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">Objetivo:</span> {approach.ligacao.objetivo}
                    </p>
                  </div>
                  <div className="bg-card border border-border/50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Roteiro sugerido</p>
                    <ol className="space-y-2">
                      {approach.ligacao.roteiro.map((item, i) => (
                        <li key={i} className="flex gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ol>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => copyToClipboard(approach.ligacao.roteiro.join('\n\n'))}>
                        <Copy className="h-3 w-3" />
                        Copiar roteiro
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-2 h-8 text-xs text-primary" onClick={() => handleOpenTranslate(approach.ligacao.roteiro.join('\n\n'))}>
                        <Languages className="h-3 w-3" />
                        Traduzir
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Section: Continuação */}
          {activeSection === 'continuacao' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ChevronRight className="h-5 w-5 text-primary" />
                  Continuação da conversa
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {approach.continuacao.introducao}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Respostas para manter o diálogo</h3>
                {approach.continuacao.respostas.map((resposta, i) => (
                  <div key={i} className="bg-card border border-border/50 rounded-xl p-4">
                    <p className="text-sm mb-3 leading-relaxed">"{resposta}"</p>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => copyToClipboard(resposta)}>
                        <Copy className="h-3 w-3" />
                        Copiar
                      </Button>
                      <Button size="sm" variant="ghost" className="gap-2 h-8 text-xs text-primary" onClick={() => handleOpenTranslate(resposta)}>
                        <Languages className="h-3 w-3" />
                        Traduzir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Dica:</span> Faça perguntas abertas e demonstre interesse genuíno no negócio do lead. O objetivo é entender os desafios antes de oferecer qualquer solução.
                </p>
              </div>
            </div>
          )}

          {/* Section: Objeções */}
          {activeSection === 'objecoes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Como lidar com objeções
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Respostas preparadas para as objeções mais comuns.
                </p>
              </div>

              <div className="space-y-3">
                {approach.objecoes.map((item, i) => (
                  <div 
                    key={i} 
                    className={`border rounded-xl transition-all ${selectedObjecao === i ? 'border-primary/30 bg-primary/[0.02]' : 'border-border/50 bg-card'}`}
                  >
                    <button
                      onClick={() => setSelectedObjecao(selectedObjecao === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-medium">"{item.objecao}"</span>
                      <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selectedObjecao === i ? 'rotate-90' : ''}`} />
                    </button>
                    
                    {selectedObjecao === i && (
                      <div className="px-4 pb-4 space-y-4 animate-fade-in">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                          <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Resposta sugerida:</p>
                          <p className="text-sm leading-relaxed">{item.resposta}</p>
                        </div>
                        
                        <div className="grid gap-2 sm:grid-cols-2">
                          <div className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                            <p className="text-xs font-medium text-red-500 mb-1">❌ Não falar</p>
                            <p className="text-xs text-muted-foreground">{item.naoFalar}</p>
                          </div>
                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3">
                            <p className="text-xs font-medium text-emerald-500 mb-1">✓ Falar</p>
                            <p className="text-xs text-muted-foreground">{item.falar}</p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" variant="outline" className="gap-2 h-8 text-xs" onClick={() => copyToClipboard(item.resposta)}>
                            <Copy className="h-3 w-3" />
                            Copiar resposta
                          </Button>
                          <Button size="sm" variant="ghost" className="gap-2 h-8 text-xs text-primary" onClick={() => handleOpenTranslate(item.resposta)}>
                            <Languages className="h-3 w-3" />
                            Traduzir
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: Fechamento */}
          {activeSection === 'fechamento' && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-primary" />
                  Sinais de fechamento
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Reconheça quando o lead está pronto para avançar.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">Sinais de interesse</h3>
                <div className="grid gap-2">
                  {approach.fechamento.sinais.map((sinal, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/40 bg-card/50">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm">{sinal}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-primary/5 via-purple-500/5 to-primary/5 border border-primary/10 rounded-xl p-4 sm:p-5">
                <p className="text-xs text-muted-foreground mb-2">Frase de transição para proposta:</p>
                <p className="text-sm font-medium text-foreground mb-4 leading-relaxed">"{approach.fechamento.transicao}"</p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-2" onClick={() => copyToClipboard(approach.fechamento.transicao)}>
                    <Copy className="h-4 w-4" />
                    Copiar frase
                  </Button>
                  <Button size="sm" variant="ghost" className="gap-2 text-primary" onClick={() => handleOpenTranslate(approach.fechamento.transicao)}>
                    <Languages className="h-4 w-4" />
                    Traduzir
                  </Button>
                </div>
              </div>

              {/* Card Próximo Passo - Briefing */}
              <div className="mt-6 p-5 rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-primary/10 to-purple-500/5">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-lg">Próximo passo recomendado</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Agora que você tem a abordagem, colete as informações essenciais do cliente com um briefing profissional.
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="gap-2 w-full bg-emerald-500 hover:bg-emerald-600" 
                    onClick={() => setSendBriefingModalOpen(true)}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Enviar Briefing Profissional
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer com ações - Desktop */}
      <footer className="hidden sm:flex shrink-0 border-t border-border/30 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center justify-between gap-4 px-6 py-3 max-w-[1200px] mx-auto w-full">
          <div className="flex items-center gap-2">
            {currentIndex > 0 && (
              <Button variant="ghost" size="sm" className="gap-2 h-9" onClick={() => goToSection('prev')}>
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 h-9" onClick={handleRegenerate}>
              <RefreshCw className="h-4 w-4" />
              Regenerar
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2 h-9" onClick={() => toast.info('Funcionalidade em breve')}>
              <Save className="h-4 w-4" />
              Salvar
            </Button>

            {currentIndex < sections.length - 1 ? (
              <Button size="sm" className="gap-2 h-9" onClick={goToNextSection}>
                Próxima etapa
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button size="sm" className="gap-2 h-9" onClick={() => toast.info('Funcionalidade em breve')}>
                <FileText className="h-4 w-4" />
                Gerar proposta
              </Button>
            )}
          </div>
        </div>
      </footer>

      {/* Botão Fixo - Mobile only */}
      <div className="sm:hidden fixed bottom-20 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        {currentIndex < sections.length - 1 ? (
          <Button 
            size="sm"
            className="h-10 px-5 text-sm gap-2 rounded-full shadow-lg pointer-events-auto"
            onClick={goToNextSection}
          >
            Próxima etapa
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            size="sm"
            className="h-10 px-5 text-sm gap-2 rounded-full shadow-lg pointer-events-auto"
            onClick={() => toast.info('Funcionalidade em breve')}
          >
            <FileText className="h-4 w-4" />
            Gerar proposta
          </Button>
        )}
      </div>

      {/* Modal de Tradução */}
      <TranslateApproachModal
        open={translateModalOpen}
        onOpenChange={setTranslateModalOpen}
        originalMessage={messageToTranslate}
      />

      {/* Modal de Enviar Briefing */}
      <SendBriefingModal
        open={sendBriefingModalOpen}
        onClose={() => setSendBriefingModalOpen(false)}
        lead={lead}
      />
    </div>
  );
}
