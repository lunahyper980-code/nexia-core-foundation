import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RequestCreditsSection } from '@/components/lovable-credits/RequestCreditsSection';
import { Coins, AlertCircle, Gift, CheckCircle2 } from 'lucide-react';

export default function Creditos() {
  const benefits = [
    'Créditos para usar na plataforma Lovable',
    'Acesso a funcionalidades premium',
    'Suporte prioritário',
    'Materiais exclusivos',
  ];

  return (
    <AppLayout title="Créditos Lovable">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Coins className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Solicitar Créditos Lovable</CardTitle>
                <CardDescription>
                  Solicite créditos para usar na plataforma
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Warning Card */}
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground">Importante</p>
                <p className="text-sm text-muted-foreground mt-1">
                  A conta Lovable precisa ser <strong>nova</strong> para gerar os créditos. 
                  Contas já existentes não são elegíveis para o programa de créditos iniciais.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Gift className="h-5 w-5 text-success" />
              </div>
              <div>
                <CardTitle className="text-lg">O que você recebe</CardTitle>
                <CardDescription>Benefícios do programa de créditos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request Credits Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fazer Solicitação</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo para solicitar seus créditos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RequestCreditsSection />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
