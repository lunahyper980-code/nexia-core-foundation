import { type ReactNode, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeDollarSign,
  Eye,
  ExternalLink,
  Gift,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { AppLayout } from '@/components/AppLayout';
import { AffiliateConfirmDialog } from '@/components/affiliate/AffiliateConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AFFILIATE_PROGRAM_OPTIONS, useAffiliateProgram } from '@/hooks/useAffiliateProgram';
import { cn } from '@/lib/utils';



const selectionCards = [
  {
    key: AFFILIATE_PROGRAM_OPTIONS.sale_20.type,
    title: 'Ganhe 20% por Venda',
    description: 'Comissão direta em cada indicação',
    badge: 'Disponível para Todos',
    available: true,
    icon: BadgeDollarSign,
    points: [
      { icon: BadgeDollarSign, text: 'Comissão creditada na hora' },
      { icon: Users, text: 'Sem limite de indicações' },
      { icon: TrendingUp, text: 'Acompanhe em tempo real' },
    ],
    helper: 'Exemplo: Venda de R$ 297 = R$ 59,40 pra você!',
    helperTone: 'primary',
  },
  {
    key: AFFILIATE_PROGRAM_OPTIONS.recurring_10.type,
    title: 'Ganhe 10% Recorrente',
    description: 'Comissão em todas as vendas do indicado',
    badge: 'Vagas Esgotadas',
    available: false,
    icon: Sparkles,
    points: [
      { icon: TrendingUp, text: 'Ganhos em todas as vendas' },
      { icon: BadgeDollarSign, text: 'Renda passiva recorrente' },
      { icon: Gift, text: 'Benefício exclusivo' },
    ],
    helper: 'Limite de vagas atingido\n50/50 vagas preenchidas. Não é possível aceitar mais participantes nesta modalidade.',
    helperTone: 'warning',
  },
] as const;

const activationSteps = [
  {
    step: '1',
    title: 'Cadastre-se na plataforma parceira',
    description: 'Acesse a plataforma de pagamentos e crie sua conta para poder receber suas comissões com segurança.',
  },
  {
    step: '2',
    title: 'Solicite sua afiliação ao Nexia',
    description: 'Use o botão abaixo para acessar a página oficial de afiliação. Após a aprovação, seu link personalizado será gerado automaticamente.',
  },
  {
    step: '3',
    title: 'Compartilhe e fature 20%',
    description: 'Envie seu link exclusivo para amigos, redes sociais e grupos. A cada venda confirmada, 20% é creditado direto na sua conta.',
  },
] as const;

const offerCards = [
  {
    title: 'Plano Mensal',
    price: 'R$ 147/mês',
    commission: 'R$ 26,25',
    url: 'https://dashboard.kiwify.com/join/affiliate/3GYM4lw2',
    highlight: false,
  },
  {
    title: 'Plano Vitalício',
    price: 'R$ 247 único',
    commission: 'R$ 44,46',
    url: 'https://dashboard.kiwify.com/join/affiliate/0lLidBnF',
    highlight: true,
  },
] as const;

function PremiumStage({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-primary/20 bg-card/95 px-4 py-6 shadow-2xl shadow-primary/10 backdrop-blur-xl sm:px-8 sm:py-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage: [
            'radial-gradient(circle at top, hsl(var(--primary) / 0.18), transparent 34%)',
            'linear-gradient(120deg, transparent 24%, hsl(var(--primary) / 0.08) 45%, transparent 57%)',
            'linear-gradient(130deg, transparent 18%, hsl(var(--accent) / 0.07) 48%, transparent 63%)',
          ].join(','),
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(120deg, transparent 0%, transparent 42%, hsl(var(--primary) / 0.18) 49%, transparent 56%, transparent 100%)',
          backgroundSize: '340px 340px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

function HeaderBlock({
  title,
  description,
}: {
  title: ReactNode;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-center">
      <Badge variant="secondary" className="mx-auto w-fit gap-2 rounded-full border border-primary/20 bg-background/50 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl">
        <Gift className="h-4 w-4 text-primary" />
        Programa de Afiliados
      </Badge>
      <div className="space-y-3">
        <h1 className="text-4xl font-bold leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-xl">{description}</p>
      </div>
    </div>
  );
}

export default function IndiqueEGanhe() {
  const navigate = useNavigate();
  const { profile, loading, saving, activateProgram } = useAffiliateProgram();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [showSelection, setShowSelection] = useState(true);

  const isActive = profile?.status === 'active';
  const isBlocked = profile?.status === 'blocked';


  const topAction = useMemo(() => {
    if (isActive && !showSelection) {
      return {
        label: 'Voltar à tela de seleção',
        icon: Eye,
        onClick: () => setShowSelection(true),
      };
    }

    return {
      label: 'Voltar ao Painel de Indicação',
      icon: ArrowLeft,
      onClick: () => navigate('/dashboard'),
    };
  }, [isActive, navigate, showSelection]);

  const handleActivateProgram = async () => {
    try {
      await activateProgram('sale_20');
      setConfirmOpen(false);
      setShowSelection(false);
      toast.success('Modalidade ativada com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Não foi possível confirmar sua modalidade agora.');
    }
  };


  return (
    <AppLayout title="Indique e Ganhe">
      <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
        <div className="flex justify-end">
          <Button variant="outline" className="gap-2 rounded-full px-4" onClick={topAction.onClick}>
            <topAction.icon className="h-4 w-4" />
            {topAction.label}
          </Button>
        </div>

        <PremiumStage>
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="space-y-4 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
                <p className="text-sm text-muted-foreground">Carregando programa de afiliados...</p>
              </div>
            </div>
          ) : isBlocked ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-destructive/10">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Seu acesso ao programa está bloqueado</h1>
                <p className="text-muted-foreground">
                  Regularize sua situação com o time responsável antes de continuar no fluxo de afiliação.
                </p>
              </div>
            </div>
          ) : showSelection ? (
            <div className="space-y-8">
              <HeaderBlock
                title={
                  <>
                    Escolha como <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Ganhar</span>
                  </>
                }
                description="Selecione uma das modalidades abaixo para começar a lucrar indicando o Nexia."
              />

              <div className="grid gap-6 xl:grid-cols-2">
                {selectionCards.map((card) => {
                  const Icon = card.icon;
                  const isCurrentSelection = isActive && card.key === 'sale_20';

                  return (
                    <Card
                      key={card.key}
                      variant="glass"
                      className={cn(
                        'relative overflow-visible rounded-[2rem] border px-0 pt-10',
                        card.available ? 'border-primary/25 shadow-xl shadow-primary/10' : 'border-border/80'
                      )}
                    >
                      <Badge
                        variant={card.available ? 'premium' : 'secondary'}
                        className="absolute left-6 top-5 rounded-full px-3 py-1"
                      >
                        {card.badge}
                      </Badge>

                      <CardContent className="space-y-6 p-6 pt-6 sm:p-8 sm:pt-6">
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              'flex h-16 w-16 items-center justify-center rounded-[1.35rem]',
                              card.available ? 'bg-primary/12 text-primary' : 'bg-secondary text-muted-foreground'
                            )}
                          >
                            <Icon className="h-8 w-8" />
                          </div>

                          <div className="space-y-2">
                            <div>
                              <h2 className="text-3xl font-bold leading-tight text-foreground">{card.title}</h2>
                              <p className="text-lg text-foreground/80">{card.description}</p>
                            </div>
                            <p className="text-base text-muted-foreground">
                              {card.available
                                ? 'Indique o Nexia e receba 20% de comissão em cada venda realizada através do seu link.'
                                : 'Receba 10% de todas as vendas realizadas por quem você indicar. Renda passiva contínua!'}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {card.points.map((point) => {
                            const PointIcon = point.icon;
                            return (
                              <div key={point.text} className="flex items-center gap-3 text-lg text-foreground">
                                <PointIcon className={cn('h-5 w-5 shrink-0', card.available ? 'text-primary' : 'text-accent')} />
                                <span>{point.text}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div
                          className={cn(
                            'rounded-[1.4rem] border px-5 py-4 text-lg font-medium whitespace-pre-line',
                            card.helperTone === 'primary'
                              ? 'border-primary/25 bg-primary/10 text-foreground'
                              : 'border-destructive/30 bg-destructive/10 text-foreground'
                          )}
                        >
                          {card.helper}
                        </div>

                        {card.available ? (
                          <Button
                            variant={isCurrentSelection ? 'outline' : 'premium'}
                            size="lg"
                            className="h-14 w-full rounded-2xl text-lg font-semibold"
                            onClick={isCurrentSelection ? () => setShowSelection(false) : () => setConfirmOpen(true)}
                          >
                            {isCurrentSelection ? 'Ver modalidade ativa' : 'Selecionar esta opção →'}
                          </Button>
                        ) : (
                          <Button variant="secondary" size="lg" className="h-14 w-full rounded-2xl text-lg font-semibold" disabled>
                            <Lock className="h-5 w-5" />
                            Indisponível
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <HeaderBlock
                title={
                  <>
                    Receba <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">20% por Venda</span> como Afiliado
                  </>
                }
                description="Torne-se afiliado do Nexia e ganhe 20% de comissão em cada venda concluída."
              />

              <div className="mx-auto max-w-5xl space-y-6">
                <Card variant="glass" className="rounded-[2rem] border-primary/20">
                  <CardContent className="space-y-5 p-5 sm:p-7">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary/12 text-primary">
                        <Sparkles className="h-7 w-7" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">Como começar a ganhar</h2>
                        <p className="mt-1 text-lg text-muted-foreground">Siga estes passos simples para ativar sua comissão</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {activationSteps.map((item) => (
                        <div key={item.step} className="rounded-[1.6rem] border border-border bg-background/40 p-5 sm:p-6">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/12 text-lg font-bold text-primary">
                              {item.step}
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold leading-tight text-foreground">{item.title}</h3>
                              <p className="mt-2 text-base text-muted-foreground sm:text-lg">{item.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  {offerCards.map((offer) => (
                    <Card
                      key={offer.title}
                      variant="glass"
                      className={cn(
                        'rounded-[2rem] border',
                        offer.highlight ? 'border-primary/30 shadow-lg shadow-primary/10' : 'border-border/80'
                      )}
                    >
                      <CardContent className="flex h-full flex-col space-y-5 p-6 sm:p-7">
                        <div className="flex flex-1 items-start justify-between gap-4">
                          <div>
                            <h3 className="text-3xl font-bold text-foreground">{offer.title}</h3>
                            <p className="mt-4 text-5xl font-bold tracking-tight text-foreground">{offer.price}</p>
                            <p className="mt-3 text-xl text-muted-foreground">
                              Comissão estimada: <span className="font-semibold text-primary">{offer.commission}</span>
                            </p>
                          </div>
                          {offer.highlight && (
                            <Badge variant="premium" className="rounded-full px-3 py-1">
                              Melhor Valor
                            </Badge>
                          )}
                        </div>

                        <Button
                          variant="premium"
                          size="lg"
                          className="mt-auto h-14 w-full rounded-2xl text-lg font-semibold"
                          onClick={() => window.open(offer.url, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink className="h-5 w-5" />
                          Tornar-se Afiliado →
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </PremiumStage>
      </div>

      <AffiliateConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleActivateProgram}
        loading={saving}
      />
    </AppLayout>
  );
}
