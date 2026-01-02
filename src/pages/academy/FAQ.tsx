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
    question: 'Preciso saber marketing?',
    answer: 'Não. A Nexia faz a análise e indica exatamente o que oferecer. Você só precisa seguir o passo a passo e executar. O sistema foi feito para iniciantes que nunca venderam serviços digitais.',
  },
  {
    question: 'Funciona só com celular?',
    answer: 'Sim! O Nexia Suite é responsivo e funciona perfeitamente no celular. Você pode fazer diagnósticos, gerar propostas e gerenciar clientes de qualquer lugar.',
  },
  {
    question: 'O que eu vendo primeiro?',
    answer: 'Use o Nexia Simples para descobrir. Responda as perguntas sobre o cliente e a Nexia vai dizer qual solução oferecer: site, app, organização de processos ou posicionamento digital.',
  },
  {
    question: 'Onde ficam meus apps e sites?',
    answer: 'Em "Meus Projetos". Lá você encontra todos os apps e sites que está desenvolvendo, com status, prompts gerados e acesso rápido para continuar o trabalho.',
  },
  {
    question: 'Qual diferença do Nexia Simples e Avançado?',
    answer: 'Nexia Simples: 7 perguntas rápidas, resultado imediato, ideal para iniciantes. Nexia Avançado: 4 blocos de análise estratégica com justificativas profissionais, ideal para quem quer parecer consultor.',
  },
  {
    question: 'Como envio para o cliente?',
    answer: 'Vá em Vendas e gere uma mensagem de WhatsApp personalizada. Você também pode gerar uma proposta formal em PDF para enviar por e-mail ou mostrar em reunião.',
  },
  {
    question: 'Posso usar com mais de um cliente?',
    answer: 'Sim! Cada diagnóstico e proposta são independentes. Você pode gerenciar quantos clientes quiser, cada um com seu histórico e documentos.',
  },
  {
    question: 'Como salvo o histórico do cliente?',
    answer: 'Ao criar diagnósticos, propostas e entregas, tudo fica vinculado ao cliente automaticamente. Acesse o histórico de cada cliente na área de Clientes.',
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
              <h1 className="text-2xl font-bold text-foreground">Perguntas Frequentes</h1>
              <HelpCircle className="h-5 w-5 text-primary" />
            </div>
            <p className="text-muted-foreground">
              Dúvidas rápidas e contato com suporte
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
