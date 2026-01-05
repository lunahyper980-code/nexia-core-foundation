import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ArrowLeft,
  MessageCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: 'Eu preciso saber marketing para usar o Nexia?',
    answer: 'Não. A plataforma gera estrutura e entregáveis. Você só aplica o fluxo e personaliza.',
  },
  {
    question: 'O que eu vendo: plano ou execução?',
    answer: 'Você pode vender só o plano estratégico (entrega instrucional) ou oferecer execução como serviço adicional com ticket maior.',
  },
  {
    question: "O que é 'Entrega Instrucional'?",
    answer: 'É o material estratégico gerado pela plataforma, pronto para o cliente executar ou repassar para alguém executar.',
  },
  {
    question: "O que é 'Execução'?",
    answer: 'É você (ou sua equipe) executar as tarefas e ações do plano.',
  },
  {
    question: 'Como eu envio para o cliente?',
    answer: 'Você pode enviar link, imprimir em PDF quando disponível e/ou enviar proposta + entrega.',
  },
  {
    question: 'As tarefas são automáticas?',
    answer: 'Sim. O planejamento gera tarefas acionáveis que você pode acompanhar e concluir.',
  },
  {
    question: 'Soluções Digitais substituem o Diagnóstico?',
    answer: 'Não. Elas são entregáveis prontos. O diagnóstico orienta qual solução faz mais sentido.',
  },
  {
    question: 'Consigo usar só pelo celular?',
    answer: 'Sim, mas algumas ações como copiar/exportar e organizar tarefas ficam melhores no desktop.',
  },
  {
    question: 'Como eu faço proposta comercial?',
    answer: 'A área de Vendas/Propostas gera uma proposta base. Você personaliza e envia.',
  },
  {
    question: 'O Nexia serve para iniciantes?',
    answer: 'Sim. O Academy foi feito para guiar do zero até a primeira venda.',
  },
  {
    question: 'O que eu faço se o cliente não responde?',
    answer: 'Use follow-ups prontos e foque em volume: conversar com mais leads aumenta conversão.',
  },
  {
    question: 'Posso cancelar quando quiser?',
    answer: 'Sim. Sem fidelidade.',
  },
];

export default function FAQ() {
  const navigate = useNavigate();

  const handleSupport = () => {
    window.open('https://wa.me/5511999999999?text=Olá! Preciso de ajuda com o Nexia Suite.', '_blank');
  };

  return (
    <AppLayout title="FAQ e Suporte">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/academy')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">FAQ + Suporte</h1>
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Respostas rápidas sobre fluxo, entregas, soluções, propostas e uso da plataforma.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <Card className="border-primary/20">
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border-primary/10">
                  <AccordionTrigger className="px-5 py-4 text-left hover:no-underline hover:bg-primary/5">
                    <span className="text-sm font-medium text-foreground">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Precisa de mais ajuda?</h3>
                <p className="text-sm text-muted-foreground">
                  Nossa equipe está pronta para te ajudar. Fale com o suporte via WhatsApp.
                </p>
              </div>
              <Button onClick={handleSupport} className="gap-2 shrink-0">
                Falar com suporte
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Academy */}
        <div className="text-center pt-4">
          <Button variant="ghost" onClick={() => navigate('/academy')} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Academy
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
