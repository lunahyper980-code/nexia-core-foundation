import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Copy,
  Sparkles,
  Check,
  Gift,
  CalendarDays,
  Megaphone,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const MAX_SLOTS = 10;

const promoLinks = {
  mensal: 'https://go.perfectpay.com.br/PPU38CQ5GFF',
  vitalicio: 'https://go.perfectpay.com.br/PPU38CQ5JOM',
};

const salesPageLink = '';

const howItWorksItems = [
  {
    icon: Wallet,
    title: 'Receba 10% dos ganhos no primeiro mês',
    description:
      'Quando o seu indicado começar a usar o Nexxa Suite, você recebe 10% sobre os ganhos gerados por ele nos primeiros 30 dias. Exemplo: se ele fechar R$ 3.000 em projetos, você recebe R$ 300 automaticamente.',
  },
  {
    icon: CalendarDays,
    title: 'Válido somente nos primeiros 30 dias',
    description:
      'Sua bonificação considera todo o desempenho do indicado no primeiro mês de uso. Quanto mais ele vender, maior será sua recompensa — e esse valor é pago pelo Nexxa, sem sair do bolso do indicado.',
  },
  {
    icon: Gift,
    title: 'Preço especial para indicados',
    description:
      'Quem entra pelo seu link acessa condições promocionais exclusivas para começar com mais facilidade e aumentar as chances de ativação rápida dentro da sua equipe.',
  },
] as const;

const sharingIdeas = [
  'Compartilhe nas redes: publique seu link nos Stories, Feed, Bio do Instagram, TikTok e WhatsApp.',
  'Envie para amigos: fale com pessoas que querem vender mais com sites, apps e soluções digitais.',
  'Crie conteúdo: grave vídeos curtos mostrando os benefícios do Nexxa Suite e inclua seu link.',
  'Divulgue em grupos e comunidades: use grupos de empreendedores, freelancers, afiliados e vendas online.',
] as const;

export function EquipeAcessoPromocional() {
  const [membersJoined, setMembersJoined] = useState(() => {
    const saved = localStorage.getItem('equipe_promo_members');
    return saved ? Number(saved) : 0;
  });
  const [popoverOpen, setPopoverOpen] = useState(false);

  const handleSelect = (count: number) => {
    setMembersJoined(count);
    localStorage.setItem('equipe_promo_members', String(count));
    setPopoverOpen(false);
  };

  const copyLink = (type: 'mensal' | 'vitalicio') => {
    navigator.clipboard.writeText(promoLinks[type]);
    toast.success(`Link do plano ${type === 'mensal' ? 'mensal' : 'vitalício'} copiado!`);
  };

  const progressPercent = (membersJoined / MAX_SLOTS) * 100;

  const copySalesPageLink = () => {
    if (!salesPageLink) {
      toast.info('Quando sua página de vendas estiver pronta, eu posso ligar este botão ao link final.');
      return;
    }

    navigator.clipboard.writeText(salesPageLink);
    toast.success('Link da página de vendas copiado!');
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4 text-center">
        <Badge variant="secondary" className="mx-auto gap-2 rounded-full px-4 py-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          Programa Exclusivo
        </Badge>
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Convide amigos e ganhe recompensas</h2>
          <p className="mx-auto max-w-3xl text-sm text-muted-foreground sm:text-base">
            Ao indicar novos usuários para o Nexxa Suite, você recebe{' '}
            <span className="font-semibold text-foreground">10% dos ganhos gerados por eles durante o primeiro mês de uso</span>.
          </p>
        </div>
      </div>

      <Card className="border-border/60">
        <CardContent className="pt-6">
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="w-full space-y-3 text-center">
                <p className="text-sm font-medium text-foreground">Pessoas Indicadas</p>
                <div className="text-3xl font-bold text-foreground">
                  {membersJoined} <span className="text-muted-foreground">/ {MAX_SLOTS}</span>
                </div>
                <p className="text-sm text-muted-foreground">Você pode convidar até 10 pessoas neste programa.</p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="center">
              <p className="px-2 pb-2 text-xs text-muted-foreground">Selecione quantas pessoas já entraram:</p>
              <div className="grid grid-cols-4 gap-1">
                {Array.from({ length: MAX_SLOTS + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(i)}
                    className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                      membersJoined === i ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="mt-4 space-y-2">
            <Progress value={progressPercent} className="h-2.5" />
            {membersJoined >= MAX_SLOTS && (
              <p className="text-center text-xs font-medium text-primary">Todas as vagas deste programa foram preenchidas.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Como funciona o programa de indicação?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {howItWorksItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-2xl border border-border bg-background/50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">Preço especial para indicados</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Quem entrar pelo seu link ganha acesso a condições exclusivas para começar no Nexxa Suite.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="relative flex h-full flex-col overflow-hidden border-border/60">
            <CardHeader className="pb-4">
              <Badge variant="outline" className="w-fit rounded-full">
                -40% OFF
              </Badge>
              <CardTitle className="text-lg font-semibold">Plano Mensal</CardTitle>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-lg text-muted-foreground line-through">R$ 247</span>
                <span className="text-4xl font-bold text-foreground">R$ 147</span>
                <span className="pb-1 text-sm text-muted-foreground">por mês</span>
              </div>
              <p className="text-sm text-muted-foreground">Ideal para começar com baixo custo e validar a operação.</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-6">
              <ul className="flex-1 space-y-3">
                {[
                  'Acesso completo ao Nexxa Suite',
                  'Ideal para quem quer começar com baixo custo',
                  'Perfeito para validar a operação e ganhar tração',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button onClick={() => copyLink('mensal')} variant="outline" className="mt-auto w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copiar link do plano mensal
              </Button>
            </CardContent>
          </Card>

          <Card className="relative flex h-full flex-col overflow-hidden border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="absolute right-4 top-4">
              <Badge className="text-xs">🔥 MAIS POPULAR</Badge>
            </div>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Plano Vitalício</CardTitle>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-lg text-muted-foreground line-through">R$ 697</span>
                <span className="text-4xl font-bold text-foreground">R$ 247</span>
                <span className="pb-1 text-sm text-muted-foreground">único</span>
              </div>
              <p className="text-sm text-muted-foreground">ou parcele em até 12x</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-6">
              <ul className="flex-1 space-y-3">
                {[
                  'Pagamento único com acesso prolongado',
                  'Melhor custo-benefício para quem quer escalar',
                  'Oferta estratégica para fechar mais indicações',
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {benefit}
                  </li>
                ))}
              </ul>
              <Button onClick={() => copyLink('vitalicio')} className="mt-auto w-full">
                <Copy className="mr-2 h-4 w-4" />
                Copiar link do plano vitalício
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-sm font-medium text-primary">
          ⚡ Esses preços são exclusivos para quem entra por indicação.
        </p>
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="space-y-4 pt-6">
          <div className="space-y-1">
            <p className="text-sm font-medium text-primary">Programa Ativo</p>
            <h3 className="text-xl font-semibold text-foreground">
              Você recebe 10% dos ganhos dos seus indicados no primeiro mês deles
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Você também poderá divulgar sua página de vendas com os preços promocionais já aplicados para aumentar a conversão.
          </p>
          <Button onClick={copySalesPageLink} className="w-full sm:w-auto">
            <Copy className="mr-2 h-4 w-4" />
            Copiar página de vendas
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <Megaphone className="h-5 w-5 text-primary" />
              Como divulgar seu link
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sharingIdeas.map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-background/50 p-4 text-sm text-muted-foreground">
                {item}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
              <TrendingUp className="h-5 w-5 text-primary" />
              Exemplo de ganhos no 1º mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              👤 Você indica <span className="font-semibold text-foreground">5 pessoas</span> para o Nexxa Suite
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              💰 Cada uma fecha em média <span className="font-semibold text-foreground">R$ 3.000</span> em projetos de apps e sites no 1º mês
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4">
              📊 Total movimentado pelos indicados: <span className="font-semibold text-foreground">R$ 15.000</span>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-base">
              🎉 Você ganha <span className="font-bold text-foreground">R$ 1.500</span> automaticamente — pago pelo Nexxa, não pelos seus indicados.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
