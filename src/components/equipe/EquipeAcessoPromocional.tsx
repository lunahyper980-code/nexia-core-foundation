import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Sparkles, Check, Users } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from 'sonner';

const MAX_SLOTS = 10;

const promoLinks = {
  mensal: 'https://go.perfectpay.com.br/PPU38CQ5GFF',
  vitalicio: 'https://go.perfectpay.com.br/PPU38CQ5JOM',
};

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
          <Sparkles className="h-3.5 w-3.5" />
          Benefício Exclusivo
        </div>
        <h2 className="text-2xl font-bold text-foreground">Acesso Promocional da Equipe</h2>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          Benefício exclusivo para membros vinculados à equipe. Incentivo estratégico para acelerar resultados.
        </p>
      </div>

      {/* Progress Section */}
      <Card className="border-border/60">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <span className="cursor-default select-none">
                    Pessoas vinculadas à equipe
                  </span>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <p className="text-xs text-muted-foreground px-2 pb-2">Selecione quantas pessoas já entraram:</p>
                  <div className="grid grid-cols-4 gap-1">
                    {Array.from({ length: MAX_SLOTS + 1 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelect(i)}
                        className={`rounded-md px-2 py-1.5 text-sm font-medium transition-colors ${
                          membersJoined === i
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <span className="text-sm font-medium text-foreground">{membersJoined} de {MAX_SLOTS}</span>
          </div>
          <Progress value={progressPercent} className="h-2.5" />
          {membersJoined >= MAX_SLOTS && (
            <p className="text-xs text-center text-primary font-medium">Todas as vagas foram preenchidas!</p>
          )}
        </CardContent>
      </Card>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Monthly Plan */}
        <Card className="relative overflow-hidden border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Plano Mensal</CardTitle>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold text-foreground">R$ 147</span>
              <span className="text-muted-foreground text-sm">/ mês</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {[
                'Acesso completo ao Nexia Suite',
                'Todas as soluções digitais',
                'Diagnóstico e planejamento com IA',
                'Ideal para operação contínua',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
            <p className="text-sm text-center text-muted-foreground font-medium">pague à vista</p>
            <Button onClick={() => copyLink('mensal')} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copiar link do plano mensal
            </Button>
          </CardContent>
        </Card>

        {/* Lifetime Plan */}
        <Card className="relative overflow-hidden border-primary/40 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="absolute top-4 right-4">
            <Badge className="bg-primary text-primary-foreground text-xs">Melhor custo-benefício</Badge>
          </div>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">Plano Vitalício</CardTitle>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-4xl font-bold text-foreground">R$ 247</span>
              <span className="text-muted-foreground text-sm">único</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <ul className="space-y-3">
              {[
                'Tudo do plano mensal',
                'Acesso vitalício garantido',
                'Melhor custo-benefício',
                'Ideal para quem quer escalar',
              ].map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {benefit}
                </li>
              ))}
            </ul>
            <p className="text-sm text-center text-muted-foreground font-medium">parcele em até 12x</p>
            <Button onClick={() => copyLink('vitalicio')} className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copiar link do plano vitalício
            </Button>
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground pt-4">
        Esta área é administrativa e representa uma visão interna de performance da equipe.
      </p>
    </div>
  );
}
