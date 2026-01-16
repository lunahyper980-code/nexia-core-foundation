import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, DollarSign, CheckCircle, AlertTriangle, Target, Zap, Copy, Check, BookOpen, Wrench, Package, Layers, ArrowRight, FileSignature } from 'lucide-react';
import { toast } from 'sonner';

// ==============================================
// PACOTES ESTRATÉGICOS
// ==============================================

interface StrategicPackage {
  id: string;
  name: string;
  description: string;
  includes: string[];
  solutionIds: string[];
  pricing: {
    plan: { min: string; max: string };
    execution: { min: string; max: string };
  };
}

const strategicPackages: StrategicPackage[] = [
  {
    id: 'presenca-essencial',
    name: 'Presença Digital Essencial',
    description: 'Base profissional para começar no digital',
    includes: ['Posicionamento Digital', 'Autoridade Digital'],
    solutionIds: ['posicionamento', 'autoridade'],
    pricing: {
      plan: { min: 'R$ 1.200', max: 'R$ 1.800' },
      execution: { min: 'R$ 3.000', max: 'R$ 4.500' },
    },
  },
  {
    id: 'presenca-conversao',
    name: 'Presença + Conversão',
    description: 'Atraia e converta clientes com estrutura',
    includes: ['Posicionamento Digital', 'Autoridade Digital', 'Organização de Processos'],
    solutionIds: ['posicionamento', 'autoridade', 'organizacao'],
    pricing: {
      plan: { min: 'R$ 2.000', max: 'R$ 2.800' },
      execution: { min: 'R$ 4.500', max: 'R$ 6.500' },
    },
  },
  {
    id: 'negocio-completo',
    name: 'Negócio Digital Completo',
    description: 'Estrutura completa do zero',
    includes: ['Posicionamento Digital', 'Autoridade Digital', 'Kit de Lançamento', 'Site ou App simples'],
    solutionIds: ['posicionamento', 'autoridade', 'kit-lancamento', 'site'],
    pricing: {
      plan: { min: 'R$ 3.500', max: 'R$ 5.000' },
      execution: { min: 'R$ 7.000', max: 'R$ 12.000' },
    },
  },
];

// Encontra pacotes que incluem uma solução específica
const getPackagesForSolution = (solutionId: string): StrategicPackage[] => {
  return strategicPackages.filter(pkg => pkg.solutionIds.includes(solutionId));
};

// ==============================================
// COMMERCIAL DATA
// ==============================================

interface CommercialData {
  argument: {
    problem: string;
    consequence: string;
    solution: string;
    result: string;
    closing: string;
  };
  pricing: {
    instructional: {
      description: string;
      items: string[];
      minPrice: string;
      maxPrice: string;
      note: string;
    };
    execution: {
      description: string;
      items: string[];
      minPrice: string;
      maxPrice: string;
      note: string;
    };
  } | {
    tiers: Array<{
      name: string;
      minPrice: string;
      maxPrice: string;
    }>;
    whenChargeMore: string;
    howToJustify: string;
  };
  hasInstructionalExecution?: boolean;
}

const commercialContent: Record<string, CommercialData> = {
  'site': {
    argument: {
      problem: 'Seu cliente perde vendas todos os dias por falta de presença profissional na internet.',
      consequence: 'Clientes desconfiam, não conseguem encontrar informações e acabam indo para o concorrente que tem site.',
      solution: 'Um site simples, bonito e com botão direto para WhatsApp ou contato.',
      result: 'Mais credibilidade, mais clientes encontrando o negócio e mais conversões automáticas.',
      closing: '"Hoje você perde cliente por falta de estrutura. Um site simples muda isso em 48h."'
    },
    pricing: {
      tiers: [
        { name: 'Site Simples (institucional)', minPrice: 'R$ 497', maxPrice: 'R$ 900' },
        { name: 'Com formulário / WhatsApp integrado', minPrice: 'R$ 900', maxPrice: 'R$ 1.500' },
        { name: 'Com pedido online / agendamento', minPrice: 'R$ 1.500', maxPrice: 'R$ 2.500' }
      ],
      whenChargeMore: 'Quando o cliente precisa de funcionalidades extras como agendamento, cardápio digital ou sistema de pedidos.',
      howToJustify: 'Mostre quanto ele perde por mês sem ter presença profissional. Se perde 5 clientes por mês a R$100 cada, já são R$500 perdidos. O site se paga no primeiro mês.'
    }
  },
  'app': {
    argument: {
      problem: 'O negócio do seu cliente depende 100% do WhatsApp e está sempre desorganizado.',
      consequence: 'Perde pedidos, esquece clientes, não consegue crescer e vive apagando incêndio.',
      solution: 'Um aplicativo próprio que centraliza tudo: pedidos, clientes, histórico e comunicação.',
      result: 'Clientes voltam mais, operação organizada e imagem profissional que destaca da concorrência.',
      closing: '"Quem tem app não disputa atenção, cria hábito no cliente."'
    },
    pricing: {
      tiers: [
        { name: 'App Simples (vitrine/cardápio)', minPrice: 'R$ 900', maxPrice: 'R$ 1.500' },
        { name: 'App Funcional (pedidos/agendamento)', minPrice: 'R$ 1.500', maxPrice: 'R$ 2.500' },
        { name: 'App Completo (sistema integrado)', minPrice: 'R$ 2.500', maxPrice: 'R$ 4.000' }
      ],
      whenChargeMore: 'Quando envolve integrações, painel administrativo ou funcionalidades personalizadas.',
      howToJustify: 'Compare com o custo de plataformas prontas (mensalidade) vs ter algo próprio. Em 6 meses, o app se paga e ele tem controle total.'
    }
  },
  'kit-lancamento': {
    argument: {
      problem: 'Seu cliente quer lançar algo mas não sabe por onde começar.',
      consequence: 'Fica travado, não comunica direito e perde o timing do mercado.',
      solution: 'Um kit completo com estrutura de lançamento, cronograma e mensagens prontas.',
      result: 'Lançamento organizado, profissional e com todas as ações mapeadas.',
      closing: '"Lançamento sem estrutura é desperdício. Com esse kit, você lança certo de primeira."'
    },
    pricing: {
      instructional: {
        description: 'Você recebe o plano estratégico completo gerado pela IA Nexia, com diretrizes claras e ações organizadas para execução.',
        items: [
          'Plano estratégico gerado pela IA Nexia',
          'Estrutura lógica da solução escolhida',
          'Diretrizes práticas de execução',
          'Checklists de ações organizadas',
          'Orientações estratégicas aplicáveis ao negócio',
          'Documento estruturado e exportável (PDF)'
        ],
        minPrice: 'R$ 197',
        maxPrice: 'R$ 497',
        note: 'Você executa internamente ou contrata alguém de sua confiança. Execução em formato de projeto, com início, meio e fim. Ideal para lançamentos de curto prazo.'
      },
      execution: {
        description: 'Além do plano estratégico, o Nexia executa para você as ações definidas pela IA, de forma organizada e prática.',
        items: [
          'Tudo o que está incluído na entrega instrucional',
          'Execução prática das ações orgânicas geradas pelo plano',
          'Implementação dos checklists definidos pela IA Nexia',
          'Organização e acompanhamento da execução',
          'Aplicação real da estratégia no negócio'
        ],
        minPrice: 'R$ 997',
        maxPrice: 'R$ 2.500',
        note: 'Nós executamos o plano que a IA criou para o seu negócio. Execução em formato de projeto, com início, meio e fim.'
      }
    },
    hasInstructionalExecution: true
  },
  'autoridade': {
    argument: {
      problem: 'Seu cliente posta mas ninguém reconhece ele como referência.',
      consequence: 'Fica invisível, perde espaço para concorrentes e não consegue cobrar mais caro.',
      solution: 'Estratégia de autoridade com direcionamento de conteúdo e posicionamento.',
      result: 'Reconhecimento, seguidores qualificados e clientes que pagam mais.',
      closing: '"Autoridade não é sobre seguidores, é sobre ser lembrado quando precisam de você."'
    },
    pricing: {
      instructional: {
        description: 'Você recebe o plano estratégico completo gerado pela IA Nexia, com diretrizes claras e ações organizadas para execução.',
        items: [
          'Plano estratégico gerado pela IA Nexia',
          'Estrutura lógica da solução escolhida',
          'Diretrizes práticas de execução',
          'Checklists de ações organizadas',
          'Orientações estratégicas aplicáveis ao negócio',
          'Documento estruturado e exportável (PDF)'
        ],
        minPrice: 'R$ 297',
        maxPrice: 'R$ 697',
        note: 'Você executa internamente ou contrata alguém de sua confiança. Execução contínua, focada em presença digital orgânica e construção de autoridade.'
      },
      execution: {
        description: 'Além do plano estratégico, o Nexia executa para você as ações definidas pela IA, de forma organizada e prática.',
        items: [
          'Tudo o que está incluído na entrega instrucional',
          'Execução prática das ações orgânicas geradas pelo plano',
          'Implementação dos checklists definidos pela IA Nexia',
          'Organização e acompanhamento da execução',
          'Aplicação real da estratégia no negócio'
        ],
        minPrice: 'R$ 1.500',
        maxPrice: 'R$ 3.500',
        note: 'Nós executamos o plano que a IA criou para o seu negócio. Execução contínua, focada em presença digital orgânica.'
      }
    },
    hasInstructionalExecution: true
  },
  'posicionamento': {
    argument: {
      problem: 'Seu cliente não sabe explicar o que faz em uma frase.',
      consequence: 'Confunde clientes, perde oportunidades e parece amador.',
      solution: 'Posicionamento claro com proposta de valor, bio e mensagem central.',
      result: 'Comunicação clara, clientes certos e percepção profissional.',
      closing: '"Quando você sabe exatamente o que faz e pra quem, o cliente certo te encontra."'
    },
    pricing: {
      instructional: {
        description: 'Você recebe o plano estratégico completo gerado pela IA Nexia, com diretrizes claras e ações organizadas para execução.',
        items: [
          'Plano estratégico gerado pela IA Nexia',
          'Estrutura lógica da solução escolhida',
          'Diretrizes práticas de execução',
          'Checklists de ações organizadas',
          'Orientações estratégicas aplicáveis ao negócio',
          'Documento estruturado e exportável (PDF)'
        ],
        minPrice: 'R$ 197',
        maxPrice: 'R$ 497',
        note: 'Você executa internamente ou contrata alguém de sua confiança.'
      },
      execution: {
        description: 'Além do plano estratégico, o Nexia executa para você as ações definidas pela IA, de forma organizada e prática.',
        items: [
          'Tudo o que está incluído na entrega instrucional',
          'Execução prática das ações orgânicas geradas pelo plano',
          'Implementação dos checklists definidos pela IA Nexia',
          'Organização e acompanhamento da execução',
          'Aplicação real da estratégia no negócio'
        ],
        minPrice: 'R$ 697',
        maxPrice: 'R$ 1.500',
        note: 'Nós executamos o plano que a IA criou para o seu negócio.'
      }
    },
    hasInstructionalExecution: true
  },
  'organizacao': {
    argument: {
      problem: 'O negócio do seu cliente vive no caos: tarefas perdidas, atendimento bagunçado.',
      consequence: 'Perde tempo, perde dinheiro e não consegue escalar.',
      solution: 'Organização de processos com rotinas, checklists e fluxos claros.',
      result: 'Operação funcionando, menos estresse e negócio pronto para crescer.',
      closing: '"Negócio organizado é negócio que cresce. Caos tem limite, organização não."'
    },
    pricing: {
      instructional: {
        description: 'Você recebe o plano estratégico completo gerado pela IA Nexia, com diretrizes claras e ações organizadas para execução.',
        items: [
          'Plano estratégico gerado pela IA Nexia',
          'Estrutura lógica da solução escolhida',
          'Diretrizes práticas de execução',
          'Checklists de ações organizadas',
          'Orientações estratégicas aplicáveis ao negócio',
          'Documento estruturado e exportável (PDF)'
        ],
        minPrice: 'R$ 297',
        maxPrice: 'R$ 697',
        note: 'Você executa internamente ou contrata alguém de sua confiança.'
      },
      execution: {
        description: 'Além do plano estratégico, o Nexia executa para você as ações definidas pela IA, de forma organizada e prática.',
        items: [
          'Tudo o que está incluído na entrega instrucional',
          'Execução prática das ações orgânicas geradas pelo plano',
          'Implementação dos checklists definidos pela IA Nexia',
          'Organização e acompanhamento da execução',
          'Aplicação real da estratégia no negócio'
        ],
        minPrice: 'R$ 1.200',
        maxPrice: 'R$ 3.000',
        note: 'Nós executamos o plano que a IA criou para o seu negócio.'
      }
    },
    hasInstructionalExecution: true
  }
};

// ==============================================
// PACKAGES MODAL
// ==============================================

interface PackagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  highlightPackageId?: string;
}

export function PackagesModal({ open, onOpenChange, highlightPackageId }: PackagesModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Pacotes Estratégicos
          </DialogTitle>
          <DialogDescription>
            Combine soluções para acelerar resultados e aumentar o retorno do cliente
          </DialogDescription>
        </DialogHeader>

        <p className="text-sm text-muted-foreground mt-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
          💡 Os pacotes combinam soluções estratégicas para acelerar resultados, reduzir retrabalho e aumentar o retorno do cliente.
        </p>

        <div className="space-y-4 mt-4">
          {strategicPackages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`p-4 rounded-xl border transition-all ${
                highlightPackageId === pkg.id 
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                  : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">{pkg.description}</p>
                </div>
                {highlightPackageId === pkg.id && (
                  <Badge className="bg-primary text-primary-foreground">Recomendado</Badge>
                )}
              </div>

              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Inclui:</p>
                <div className="flex flex-wrap gap-1.5">
                  {pkg.includes.map((item, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 border">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    Entrega Instrucional
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {pkg.pricing.plan.min} <span className="text-muted-foreground font-normal">a</span> {pkg.pricing.plan.max}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                    <Wrench className="h-3 w-3" />
                    Execução Nexia
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {pkg.pricing.execution.min} <span className="text-muted-foreground font-normal">a</span> {pkg.pricing.execution.max}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center mt-4">
          <p className="text-xs text-muted-foreground">
            ⚠️ Valores sugeridos para facilitar a venda. Ajuste conforme seu mercado.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================
// PACKAGE SUGGESTION COMPONENT
// ==============================================

interface PackageSuggestionProps {
  solutionId: string;
  onOpenPackages: () => void;
}

function PackageSuggestion({ solutionId, onOpenPackages }: PackageSuggestionProps) {
  const packages = getPackagesForSolution(solutionId);
  
  if (packages.length === 0) return null;

  const bestPackage = packages[0];

  return (
    <div 
      className="p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 cursor-pointer hover:border-primary/40 transition-all"
      onClick={onOpenPackages}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <div>
            <p className="text-xs font-medium text-primary">Venda como pacote</p>
            <p className="text-xs text-muted-foreground">
              Inclua em "{bestPackage.name}" e aumente o valor
            </p>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-primary" />
      </div>
    </div>
  );
}

// ==============================================
// ARGUMENT MODAL
// ==============================================

interface ArgumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutionId: string;
  solutionTitle: string;
}

export function ArgumentModal({ open, onOpenChange, solutionId, solutionTitle }: ArgumentModalProps) {
  const [copied, setCopied] = useState(false);
  const content = commercialContent[solutionId]?.argument;

  if (!content) return null;

  const fullScript = `PROBLEMA: ${content.problem}

CONSEQUÊNCIA: ${content.consequence}

O QUE VOCÊ ENTREGA: ${content.solution}

RESULTADO: ${content.result}

FRASE DE FECHAMENTO: ${content.closing}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(fullScript);
    setCopied(true);
    toast.success('Script copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Como vender no X1
          </DialogTitle>
          <DialogDescription>
            Script para vender {solutionTitle} no WhatsApp, lives ou X1
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-destructive">Problema que o cliente sente</p>
                  <p className="text-sm text-foreground mt-1">{content.problem}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-600">Consequência de não resolver</p>
                  <p className="text-sm text-foreground mt-1">{content.consequence}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-start gap-2">
                <Target className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary">O que você entrega</p>
                  <p className="text-sm text-foreground mt-1">{content.solution}</p>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-emerald-600">Resultado prático</p>
                  <p className="text-sm text-foreground mt-1">{content.result}</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
              <div className="flex items-start gap-2">
                <Zap className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-primary">Frase de fechamento</p>
                  <p className="text-sm text-foreground mt-1 font-medium italic">{content.closing}</p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={handleCopy} className="w-full gap-2" variant="outline">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado!' : 'Copiar Script Completo'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==============================================
// PRICING MODAL
// ==============================================

interface PricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solutionId: string;
  solutionTitle: string;
}

export function PricingModal({ open, onOpenChange, solutionId, solutionTitle }: PricingModalProps) {
  const [packagesOpen, setPackagesOpen] = useState(false);
  const data = commercialContent[solutionId];
  const packages = getPackagesForSolution(solutionId);
  
  if (!data) return null;

  const hasInstructionalExecution = data.hasInstructionalExecution;
  const pricing = data.pricing;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Quanto cobrar
            </DialogTitle>
            <DialogDescription>
              Precificação sugerida para {solutionTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {hasInstructionalExecution && 'instructional' in pricing ? (
              <Tabs defaultValue="instructional" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="instructional" className="gap-1.5 text-xs">
                    <BookOpen className="h-3.5 w-3.5" />
                    Entrega Instrucional
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="gap-1.5 text-xs">
                    <Wrench className="h-3.5 w-3.5" />
                    Execução Nexia
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="instructional" className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-muted/50 border">
                    <p className="text-sm text-muted-foreground mb-3">{pricing.instructional.description}</p>
                    <ul className="space-y-2">
                      {pricing.instructional.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Faixa de preço:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background">
                          {pricing.instructional.minPrice}
                        </Badge>
                        <span className="text-muted-foreground">até</span>
                        <Badge className="bg-emerald-500 text-white">
                          {pricing.instructional.maxPrice}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    💡 {pricing.instructional.note}
                  </p>

                  {/* Package Suggestion */}
                  {packages.length > 0 && (
                    <PackageSuggestion solutionId={solutionId} onOpenPackages={() => setPackagesOpen(true)} />
                  )}
                </TabsContent>

                <TabsContent value="execution" className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-sm text-muted-foreground mb-3">{pricing.execution.description}</p>
                    <ul className="space-y-2">
                      {pricing.execution.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Faixa de preço:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-background">
                          {pricing.execution.minPrice}
                        </Badge>
                        <span className="text-muted-foreground">até</span>
                        <Badge className="bg-primary text-primary-foreground">
                          {pricing.execution.maxPrice}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground italic">
                    💡 {pricing.execution.note}
                  </p>

                  {/* Package Suggestion */}
                  {packages.length > 0 && (
                    <PackageSuggestion solutionId={solutionId} onOpenPackages={() => setPackagesOpen(true)} />
                  )}
                </TabsContent>
              </Tabs>
            ) : 'tiers' in pricing ? (
              <div className="space-y-4">
                <div className="space-y-3">
                  {pricing.tiers.map((tier, i) => (
                    <div key={i} className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{tier.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-background text-xs">
                            {tier.minPrice}
                          </Badge>
                          <span className="text-xs text-muted-foreground">a</span>
                          <Badge className="bg-emerald-500 text-white text-xs">
                            {tier.maxPrice}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-xs font-medium text-amber-600 mb-1">Quando cobrar mais:</p>
                  <p className="text-sm text-foreground">{pricing.whenChargeMore}</p>
                </div>

                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-xs font-medium text-primary mb-1">Como justificar o valor:</p>
                  <p className="text-sm text-foreground">{pricing.howToJustify}</p>
                </div>

                {/* Package Suggestion for site/app */}
                {packages.length > 0 && (
                  <PackageSuggestion solutionId={solutionId} onOpenPackages={() => setPackagesOpen(true)} />
                )}
              </div>
            ) : null}

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center">
              <p className="text-xs text-muted-foreground">
                ⚠️ Valores sugeridos para facilitar a venda. Ajuste conforme seu mercado.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <PackagesModal 
        open={packagesOpen} 
        onOpenChange={setPackagesOpen}
        highlightPackageId={packages[0]?.id}
      />
    </>
  );
}

// ==============================================
// COMMERCIAL BUTTONS
// ==============================================

interface CommercialButtonsProps {
  solutionId: string;
  solutionTitle: string;
}

export function CommercialButtons({ solutionId, solutionTitle }: CommercialButtonsProps) {
  const navigate = useNavigate();
  const [argumentOpen, setArgumentOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);
  const [packagesOpen, setPackagesOpen] = useState(false);

  const hasContent = commercialContent[solutionId];
  const packages = getPackagesForSolution(solutionId);

  if (!hasContent) return null;

  const handleGenerateContract = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/contratos/novo?solucao=${solutionId}`);
  };

  return (
    <>
      <div className="flex gap-2 mt-3">
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 text-xs gap-1.5 h-8"
          onClick={(e) => {
            e.stopPropagation();
            setArgumentOpen(true);
          }}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Argumento
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 text-xs gap-1.5 h-8"
          onClick={(e) => {
            e.stopPropagation();
            setPricingOpen(true);
          }}
        >
          <DollarSign className="h-3.5 w-3.5" />
          Preço
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex-1 text-xs gap-1.5 h-8"
          onClick={handleGenerateContract}
        >
          <FileSignature className="h-3.5 w-3.5" />
          Contrato
        </Button>
        {packages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs gap-1.5 h-8 px-2"
            onClick={(e) => {
              e.stopPropagation();
              setPackagesOpen(true);
            }}
          >
            <Package className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <ArgumentModal 
        open={argumentOpen} 
        onOpenChange={setArgumentOpen}
        solutionId={solutionId}
        solutionTitle={solutionTitle}
      />
      <PricingModal 
        open={pricingOpen} 
        onOpenChange={setPricingOpen}
        solutionId={solutionId}
        solutionTitle={solutionTitle}
      />
      <PackagesModal 
        open={packagesOpen} 
        onOpenChange={setPackagesOpen}
        highlightPackageId={packages[0]?.id}
      />
    </>
  );
}

// Export packages for use elsewhere
export { strategicPackages, getPackagesForSolution };
