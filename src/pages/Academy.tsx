import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MapPin,
  Smartphone,
  PenTool,
  Globe,
  Copy,
  FolderOpen,
  FileSignature,
  DollarSign,
  Rocket,
  Sparkles,
  TrendingUp,
  Users,
  CheckCircle2,
  ArrowRight,
  Zap,
  Target,
} from 'lucide-react';

interface AcademyCard {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'outline';
  title: string;
  subtitle: string;
  content: React.ReactNode;
  tips?: string[];
  pricing?: { label: string; value: string }[];
}

const academyCards: AcademyCard[] = [
  {
    id: 'encontrar-clientes',
    icon: <MapPin className="h-7 w-7" />,
    iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    badge: 'Passo 1',
    title: 'Encontrar Clientes',
    subtitle: 'Prospecção inteligente por nicho e região',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          O Nexia encontra leads qualificados filtrando por <strong className="text-foreground">nicho de mercado</strong> e <strong className="text-foreground">localização</strong>. Você recebe contatos prontos para prospecção ativa.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">🏪 Barbearias</Badge>
          <Badge variant="outline" className="text-xs">🏥 Clínicas</Badge>
          <Badge variant="outline" className="text-xs">🍕 Restaurantes</Badge>
          <Badge variant="outline" className="text-xs">💪 Academias</Badge>
        </div>
      </div>
    ),
    tips: [
      'Comece por nichos locais da sua cidade',
      'Barbearias e clínicas têm alta conversão',
      'Use os leads para WhatsApp direto',
    ],
  },
  {
    id: 'app-modelo',
    icon: <Smartphone className="h-7 w-7" />,
    iconBg: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    badge: 'Velocidade',
    title: 'Criar App (Modelo Pronto)',
    subtitle: 'Demonstre em minutos, venda na hora',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Use modelos prontos para <strong className="text-foreground">demonstrar rápido</strong> e impressionar o cliente. Ideal para lives, reuniões e primeiros projetos.
        </p>
        <p className="text-sm text-muted-foreground">
          Tudo pode ser editado depois: cores, textos, funcionalidades.
        </p>
      </div>
    ),
    tips: [
      'Perfeito para live selling',
      'Edite depois conforme o cliente pede',
      'Mostre funcionando, fecha mais rápido',
    ],
    pricing: [
      { label: 'App Simples', value: 'R$ 1.000 a R$ 1.500' },
    ],
  },
  {
    id: 'app-zero',
    icon: <PenTool className="h-7 w-7" />,
    iconBg: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    badge: 'Personalizado',
    title: 'Criar App (Do Zero)',
    subtitle: 'Projeto único para clientes específicos',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Quando o cliente tem necessidades específicas, crie do zero. O Nexia gera um <strong className="text-foreground">prompt inteligente</strong> que você cola no Lovable.
        </p>
        <div className="flex items-center gap-2 text-xs text-primary">
          <Zap className="h-4 w-4" />
          <span>Nexia pensa → Lovable constrói</span>
        </div>
      </div>
    ),
    tips: [
      'Para clientes que sabem o que querem',
      'Maior ticket = maior personalização',
      'Copie o prompt e cole no Lovable',
    ],
    pricing: [
      { label: 'App Personalizado', value: 'R$ 2.000 a R$ 3.000+' },
    ],
  },
  {
    id: 'criar-site',
    icon: <Globe className="h-7 w-7" />,
    iconBg: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
    badge: 'Entrada',
    title: 'Criar Site',
    subtitle: 'Porta de entrada para novos clientes',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sites são a <strong className="text-foreground">primeira venda</strong> para negócios locais. Rápido de entregar, fácil de vender, abre porta para apps depois.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ArrowRight className="h-4 w-4 text-primary" />
          <span>Gera prompt → Abre Lovable → Cola → Pronto</span>
        </div>
      </div>
    ),
    tips: [
      'Ideal para negócios locais',
      'Entrega rápida = cliente feliz',
      'Depois oferece app como upgrade',
    ],
    pricing: [
      { label: 'Site Simples', value: 'R$ 300 a R$ 600' },
      { label: 'Site Completo', value: 'R$ 800 a R$ 1.500' },
    ],
  },
  {
    id: 'prompt-lovable',
    icon: <Copy className="h-7 w-7" />,
    iconBg: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    badge: 'Fluxo',
    title: 'Usar Prompt no Lovable',
    subtitle: 'Nexia pensa, Lovable executa',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          O <strong className="text-foreground">Nexia cria a inteligência</strong> do projeto (o que construir). O <strong className="text-foreground">Lovable executa</strong> e transforma em app/site real.
        </p>
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
          <p className="text-xs text-center text-primary font-medium">
            📋 Gerou no Nexia → Copiou → Colou no Lovable ✨
          </p>
        </div>
      </div>
    ),
    tips: [
      'Sempre copie o prompt completo',
      'Não precisa alterar nada',
      'O Lovable entende tudo automaticamente',
    ],
  },
  {
    id: 'meus-projetos',
    icon: <FolderOpen className="h-7 w-7" />,
    iconBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    title: 'Meus Projetos',
    subtitle: 'Gerencie e reutilize seus trabalhos',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Todos os apps e sites que você cria ficam salvos aqui. <strong className="text-foreground">Edite, ajuste e reutilize</strong> para novos clientes.
        </p>
      </div>
    ),
    tips: [
      'Duplique projetos para novos clientes',
      'Ajuste cores e textos facilmente',
      'Mantenha organizado por cliente',
    ],
  },
  {
    id: 'contratos',
    icon: <FileSignature className="h-7 w-7" />,
    iconBg: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    title: 'Criar Contratos',
    subtitle: 'Formalize e proteja seus projetos',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Sempre formalize com contrato. <strong className="text-foreground">Protege você e o cliente</strong>. Essencial para serviços recorrentes (manutenção, hospedagem).
        </p>
      </div>
    ),
    tips: [
      'Contrato = profissionalismo',
      'Defina escopo claro para evitar problemas',
      'Use para cobrar mensalidades',
    ],
  },
  {
    id: 'precificacao',
    icon: <DollarSign className="h-7 w-7" />,
    iconBg: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    badge: 'Importante',
    title: 'Precificação Inteligente',
    subtitle: 'Quanto cobrar por cada serviço',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Não venda barato!</strong> Apps têm valor alto. Sites são entrada, apps são escala.
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Globe className="h-4 w-4 mx-auto mb-1 text-cyan-500" />
            <span className="text-muted-foreground">Site</span>
            <p className="font-semibold text-foreground">R$ 300-1.500</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2 text-center">
            <Smartphone className="h-4 w-4 mx-auto mb-1 text-blue-500" />
            <span className="text-muted-foreground">App</span>
            <p className="font-semibold text-foreground">R$ 1.000-3.000+</p>
          </div>
        </div>
      </div>
    ),
    tips: [
      'Esses são valores de referência',
      'Ajuste conforme sua região',
      'Quanto mais personalizado, mais caro',
    ],
  },
  {
    id: 'dica-final',
    icon: <Rocket className="h-7 w-7" />,
    iconBg: 'bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary border-primary/20',
    badge: 'Mindset',
    badgeVariant: 'default',
    title: 'Dica de Ouro',
    subtitle: 'Comece simples, escale depois',
    content: (
      <div className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Comece simples, não tente fazer tudo</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Venda primeiro, ajuste depois</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Nexia = cérebro / Lovable = executor</p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground">Não complique o que pode ser simples</p>
          </div>
        </div>
      </div>
    ),
  },
];

export default function Academy() {
  return (
    <AppLayout title="Academy">
      <div className="w-full max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Guia Rápido Nexia
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tudo o que você precisa saber para <strong className="text-foreground">encontrar clientes</strong>, <strong className="text-foreground">criar projetos</strong> e <strong className="text-foreground">fazer dinheiro</strong> — sem complicação.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/50 border border-primary/10 rounded-xl p-4 text-center">
            <Target className="h-5 w-5 mx-auto mb-2 text-emerald-500" />
            <p className="text-2xl font-bold text-foreground">9</p>
            <p className="text-xs text-muted-foreground">Tópicos práticos</p>
          </div>
          <div className="bg-card/50 border border-primary/10 rounded-xl p-4 text-center">
            <TrendingUp className="h-5 w-5 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold text-foreground">R$300</p>
            <p className="text-xs text-muted-foreground">Mínimo por site</p>
          </div>
          <div className="bg-card/50 border border-primary/10 rounded-xl p-4 text-center">
            <Smartphone className="h-5 w-5 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold text-foreground">R$1.000</p>
            <p className="text-xs text-muted-foreground">Mínimo por app</p>
          </div>
          <div className="bg-card/50 border border-primary/10 rounded-xl p-4 text-center">
            <Users className="h-5 w-5 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold text-foreground">∞</p>
            <p className="text-xs text-muted-foreground">Potencial de clientes</p>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {academyCards.map((card) => (
            <Card 
              key={card.id} 
              className="group relative overflow-hidden border-primary/10 hover:border-primary/25 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-xl border ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {card.badge && (
                    <Badge 
                      variant={card.badgeVariant || 'secondary'} 
                      className="text-xs"
                    >
                      {card.badge}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.subtitle}
                  </p>
                </div>

                {/* Content */}
                <div className="pt-2">
                  {card.content}
                </div>

                {/* Tips */}
                {card.tips && (
                  <div className="pt-3 border-t border-primary/5 space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wide">
                      Dicas
                    </p>
                    {card.tips.map((tip, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-primary text-xs mt-0.5">•</span>
                        <p className="text-xs text-muted-foreground">{tip}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pricing */}
                {card.pricing && (
                  <div className="pt-3 border-t border-primary/5">
                    <p className="text-xs font-medium text-emerald-500 uppercase tracking-wide mb-2">
                      💰 Quanto cobrar
                    </p>
                    <div className="space-y-1">
                      {card.pricing.map((price, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{price.label}</span>
                          <span className="text-sm font-semibold text-foreground">{price.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="p-4 rounded-2xl bg-primary/20 border border-primary/30 shrink-0">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  Pronto para começar?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Escolha um nicho, encontre seus primeiros leads e crie seu primeiro projeto. <strong className="text-foreground">O Nexia cuida do resto.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
