import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeDollarSign,
  CheckCircle2,
  Copy,
  ExternalLink,
  Gift,
  Lock,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { buildAffiliateShareLink } from '@/lib/referral';
import { AFFILIATE_PROGRAM_OPTIONS, useAffiliateProgram } from '@/hooks/useAffiliateProgram';
import { AffiliateConfirmDialog } from '@/components/affiliate/AffiliateConfirmDialog';
import { AffiliateShareDialog } from '@/components/affiliate/AffiliateShareDialog';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
}

export default function IndiqueEGanhe() {
  const navigate = useNavigate();
  const { profile, referrals, stats, loading, saving, activateProgram } = useAffiliateProgram();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const shareUrl = useMemo(() => {
    return profile?.referral_code ? buildAffiliateShareLink(profile.referral_code) : '';
  }, [profile?.referral_code]);

  const programCards = [
    {
      key: AFFILIATE_PROGRAM_OPTIONS.sale_20.type,
      title: AFFILIATE_PROGRAM_OPTIONS.sale_20.title,
      description: AFFILIATE_PROGRAM_OPTIONS.sale_20.description,
      badge: 'Disponível para todos',
      available: true,
      highlights: [
        'Comissão creditada quando a venda é confirmada',
        'Sem limite de indicações',
        'Acompanhe tudo no seu painel',
      ],
      example: 'Exemplo: venda de R$ 247 = R$ 49,40 para você',
    },
    {
      key: AFFILIATE_PROGRAM_OPTIONS.recurring_10.type,
      title: 'Ganhe 10% Recorrente',
      description: 'Comissão em todas as vendas do indicado.',
      badge: 'Vagas esgotadas',
      available: false,
      highlights: [
        'Ganhos em todas as vendas',
        'Renda passiva recorrente',
        'Benefício exclusivo',
      ],
      example: 'Limite desta modalidade já atingido no momento.',
    },
  ] as const;

  const referralMessage = useMemo(() => {
    if (!shareUrl) return '';

    return encodeURIComponent(
      `Estou no programa de afiliados do Nexia. Use meu link para criar sua conta: ${shareUrl}`
    );
  }, [shareUrl]);

  const handleActivateProgram = async () => {
    try {
      await activateProgram('sale_20');
      setConfirmOpen(false);
      setShareOpen(true);
      toast.success('Programa de afiliados ativado com sucesso.');
    } catch (error: any) {
      toast.error(error?.message || 'Não foi possível ativar o programa agora.');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    toast.success('Link copiado com sucesso.');
  };

  const handleCopyCode = async () => {
    if (!profile?.referral_code) return;
    await navigator.clipboard.writeText(profile.referral_code);
    toast.success('Código copiado com sucesso.');
  };

  const handleShareWhatsApp = () => {
    if (!referralMessage) return;
    window.open(`https://wa.me/?text=${referralMessage}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AppLayout title="Indique e Ganhe">
      <div className="mx-auto w-full max-w-6xl space-y-6 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant="premium" className="w-fit gap-1.5 rounded-full px-3 py-1">
              <Gift className="h-3.5 w-3.5" />
              Programa de Afiliados
            </Badge>
            <div>
              <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                Escolha como <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">ganhar</span>
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                Ative sua modalidade, compartilhe seu link e acompanhe cadastros, conversões e comissão em um só lugar.
              </p>
            </div>
          </div>

          <Button variant="outline" className="gap-2 self-start sm:self-auto" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
            Voltar ao painel
          </Button>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-card/80 p-6 shadow-xl shadow-primary/10 backdrop-blur-xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="absolute -left-16 top-0 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute right-0 top-10 h-36 w-36 rounded-full bg-accent/10 blur-3xl" />

          <div className="relative grid gap-5 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit gap-1.5 rounded-full px-3 py-1">
                <Sparkles className="h-3.5 w-3.5" />
                Área oficial de indicações
              </Badge>
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold sm:text-3xl">Receba comissão por cada nova venda ligada ao seu link.</h2>
                <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
                  Usuários comuns podem se afiliar ao Nexia, distribuir seu link exclusivo e acompanhar tudo com visual premium, confirmação de modalidade e histórico de indicações.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border bg-background/60 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Modalidade</p>
                <p className="mt-2 text-lg font-semibold text-foreground">20% por venda</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/60 p-4 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Rastreamento</p>
                <p className="mt-2 text-lg font-semibold text-foreground">Link exclusivo</p>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <Card variant="glass">
            <CardContent className="flex min-h-[240px] items-center justify-center">
              <div className="space-y-3 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                <p className="text-sm text-muted-foreground">Carregando seu painel de afiliado...</p>
              </div>
            </CardContent>
          </Card>
        ) : profile?.status === 'blocked' ? (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-start">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10">
                <ShieldAlert className="h-6 w-6 text-destructive" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">Seu acesso ao programa está bloqueado</h2>
                <p className="text-sm text-muted-foreground">
                  Entre em contato com o time para revisar sua modalidade ou regularizar o acesso antes de continuar indicando.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !profile || profile.status === 'inactive' ? (
          <div className="grid gap-5 xl:grid-cols-2">
            {programCards.map((program) => (
              <Card
                key={program.key}
                variant="glass"
                className={cn(
                  'overflow-hidden border transition-all duration-200',
                  program.available ? 'border-primary/20 shadow-lg shadow-primary/10' : 'border-border/80 opacity-90'
                )}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <Badge variant={program.available ? 'premium' : 'secondary'} className="rounded-full px-3 py-1">
                      {program.badge}
                    </Badge>
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-2xl',
                      program.available ? 'bg-primary/10' : 'bg-secondary'
                    )}>
                      {program.available ? (
                        <BadgeDollarSign className="h-6 w-6 text-primary" />
                      ) : (
                        <Lock className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-3xl">{program.title}</CardTitle>
                    <CardDescription className="mt-2 text-base">{program.description}</CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="space-y-3">
                    {program.highlights.map((highlight) => (
                      <div key={highlight} className="flex items-start gap-3 rounded-2xl border border-border bg-background/50 p-3">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-sm text-foreground">{highlight}</p>
                      </div>
                    ))}
                  </div>

                  <div className={cn(
                    'rounded-2xl border p-4 text-sm',
                    program.available ? 'border-primary/20 bg-primary/10 text-primary' : 'border-warning/20 bg-warning/10 text-warning'
                  )}>
                    {program.example}
                  </div>

                  {program.available ? (
                    <Button variant="premium" size="lg" className="w-full" onClick={() => setConfirmOpen(true)}>
                      Selecionar esta opção
                    </Button>
                  ) : (
                    <Button variant="secondary" size="lg" className="w-full" disabled>
                      Indisponível no momento
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Indicações</p>
                      <p className="mt-2 text-3xl font-semibold">{stats.totalReferrals}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Conversões</p>
                      <p className="mt-2 text-3xl font-semibold">{stats.totalConverted}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Disponível</p>
                      <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats.totalCommissionAvailable)}</p>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-success/10">
                      <Wallet className="h-5 w-5 text-success" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card variant="glass">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Código</p>
                      <p className="mt-2 text-lg font-semibold">{profile.referral_code}</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-6">
                <Card variant="glass" className="overflow-hidden">
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <CardTitle className="text-2xl">Receba 20% por venda como afiliado</CardTitle>
                        <CardDescription className="mt-2 text-base">
                          Seu link exclusivo já está ativo. Compartilhe com sua audiência e acompanhe novas contas em tempo real.
                        </CardDescription>
                      </div>
                      <Button variant="outline" className="gap-2" onClick={() => setShareOpen(true)}>
                        <Gift className="h-4 w-4" />
                        Abrir modal de compartilhamento
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-sm font-medium text-foreground">Seu link de indicação</p>
                      <p className="mt-1 text-xs text-muted-foreground">Novas contas criadas por esse link entram automaticamente no seu painel.</p>
                      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                        <Input value={shareUrl} readOnly className="h-11" />
                        <div className="flex gap-2">
                          <Button variant="outline" className="gap-2" onClick={handleCopyLink}>
                            <Copy className="h-4 w-4" />
                            Copiar
                          </Button>
                          <Button variant="premium" className="gap-2" onClick={handleShareWhatsApp}>
                            Compartilhar
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-sm font-medium text-foreground">Como começar a ganhar</p>
                      <div className="mt-4 grid gap-3">
                        {[
                          {
                            step: '1',
                            title: 'Ative sua afiliação no programa',
                            description: 'Sua modalidade foi registrada e o código exclusivo já está liberado para uso.',
                          },
                          {
                            step: '2',
                            title: 'Compartilhe seu link oficial',
                            description: 'Envie para WhatsApp, grupos, stories, bio e campanhas com rastreio automático.',
                          },
                          {
                            step: '3',
                            title: 'Acompanhe cadastros e comissões',
                            description: 'Toda indicação aprovada aparece no seu painel com status e valores atualizados.',
                          },
                        ].map((item) => (
                          <div key={item.step} className="flex gap-3 rounded-2xl border border-border bg-card/50 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                              {item.step}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{item.title}</p>
                              <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-xl">Suas indicações</CardTitle>
                    <CardDescription>
                      Visualize quem entrou pelo seu link e em qual estágio cada indicação está.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {referrals.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-border bg-background/40 px-6 py-10 text-center">
                        <p className="text-base font-medium text-foreground">Nenhuma indicação ainda</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Compartilhe seu link para começar a receber cadastros e comissões no painel.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {referrals.map((referral) => (
                          <div key={referral.id} className="rounded-2xl border border-border bg-background/50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="font-medium text-foreground">{referral.referred_email || 'Usuário indicado'}</p>
                                  <Badge variant={referral.status === 'converted' || referral.status === 'paid' ? 'success' : 'secondary'}>
                                    {referral.status === 'signed_up' && 'Cadastro realizado'}
                                    {referral.status === 'converted' && 'Venda confirmada'}
                                    {referral.status === 'paid' && 'Comissão paga'}
                                    {referral.status === 'cancelled' && 'Cancelado'}
                                  </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                  Criado em {formatDate(referral.created_at)}
                                  {referral.subscribed_plan_name ? ` • Plano ${referral.subscribed_plan_name}` : ''}
                                </p>
                              </div>

                              <div className="text-left sm:text-right">
                                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Comissão</p>
                                <p className="mt-1 text-lg font-semibold text-foreground">
                                  {formatCurrency(Number(referral.commission_amount || 0))}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-xl">Ofertas que você pode divulgar</CardTitle>
                    <CardDescription>
                      Use estes valores como referência para estimar ganhos nas suas campanhas.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      {
                        title: 'Plano Mensal',
                        price: 'R$ 147/mês',
                        commission: 'R$ 29,40 por venda',
                      },
                      {
                        title: 'Plano Vitalício',
                        price: 'R$ 247 único',
                        commission: 'R$ 49,40 por venda',
                        highlight: true,
                      },
                    ].map((offer) => (
                      <div key={offer.title} className={cn(
                        'rounded-3xl border p-5',
                        offer.highlight ? 'border-primary/30 bg-primary/10' : 'border-border bg-background/60'
                      )}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-lg font-semibold text-foreground">{offer.title}</p>
                            <p className="mt-2 text-3xl font-bold text-foreground">{offer.price}</p>
                            <p className="mt-2 text-sm text-muted-foreground">Comissão estimada: {offer.commission}</p>
                          </div>
                          {offer.highlight && (
                            <Badge variant="premium" className="rounded-full px-3 py-1">Melhor valor</Badge>
                          )}
                        </div>
                        <Button asChild variant="premium" className="mt-5 w-full gap-2">
                          <a href={shareUrl} target="_blank" rel="noreferrer">
                            Tornar-se afiliado
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card variant="glass">
                  <CardHeader>
                    <CardTitle className="text-xl">Resumo financeiro</CardTitle>
                    <CardDescription>Visão consolidada do que já entrou e do que ainda está disponível.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-sm text-muted-foreground">Comissão disponível</p>
                      <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats.totalCommissionAvailable)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-sm text-muted-foreground">Comissão já paga</p>
                      <p className="mt-2 text-2xl font-semibold">{formatCurrency(stats.totalCommissionPaid)}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background/60 p-4">
                      <p className="text-sm text-muted-foreground">Ativado em</p>
                      <p className="mt-2 text-lg font-semibold">{formatDate(profile.activated_at)}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>

      <AffiliateConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleActivateProgram}
        loading={saving}
      />

      <AffiliateShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={shareUrl}
        referralCode={profile?.referral_code || ''}
        onCopyLink={handleCopyLink}
        onShareWhatsApp={handleShareWhatsApp}
      />
    </AppLayout>
  );
}
