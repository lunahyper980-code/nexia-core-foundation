import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  Globe,
  Smartphone,
  Network,
  Target,
  Stethoscope,
  CheckCircle2,
  Sparkles,
  FileText,
} from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: { value: string; label: string }[];
}

interface SolutionRecommendation {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  priority: 'high' | 'medium' | 'low';
}

const QUESTIONS: Question[] = [
  {
    id: 'has_website',
    question: 'O cliente já possui site?',
    options: [
      { value: 'no', label: 'Não' },
      { value: 'old', label: 'Sim, mas é antigo' },
      { value: 'yes', label: 'Sim, funciona bem' },
    ],
  },
  {
    id: 'receives_online_contacts',
    question: 'O cliente recebe contatos ou pedidos online?',
    options: [
      { value: 'no', label: 'Não' },
      { value: 'few', label: 'Poucos' },
      { value: 'yes', label: 'Sim, regularmente' },
    ],
  },
  {
    id: 'depends_whatsapp',
    question: 'O cliente depende muito de WhatsApp para atender clientes?',
    options: [
      { value: 'no', label: 'Não' },
      { value: 'yes', label: 'Sim' },
    ],
  },
  {
    id: 'loses_clients_delay',
    question: 'O cliente perde clientes por demora no atendimento?',
    options: [
      { value: 'unknown', label: 'Não sabe' },
      { value: 'sometimes', label: 'Às vezes' },
      { value: 'yes', label: 'Sim' },
    ],
  },
  {
    id: 'has_system_app',
    question: 'O cliente tem algum sistema ou aplicativo próprio?',
    options: [
      { value: 'no', label: 'Não' },
      { value: 'simple', label: 'Usa ferramentas simples' },
      { value: 'yes', label: 'Sim' },
    ],
  },
  {
    id: 'organization_difficulty',
    question: 'O cliente tem dificuldades para se organizar no dia a dia?',
    options: [
      { value: 'yes', label: 'Sim' },
      { value: 'some', label: 'Um pouco' },
      { value: 'no', label: 'Não' },
    ],
  },
  {
    id: 'social_presence',
    question: 'O cliente tem presença ativa nas redes sociais?',
    options: [
      { value: 'no', label: 'Não' },
      { value: 'little', label: 'Pouca' },
      { value: 'yes', label: 'Sim' },
    ],
  },
];

export default function NexiaDiagnosticoRapido() {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (value: string) => {
    const questionId = QUESTIONS[currentQuestion].id;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const canProceed = answers[QUESTIONS[currentQuestion]?.id];

  const generateRecommendations = (): SolutionRecommendation[] => {
    const recommendations: SolutionRecommendation[] = [];

    // Criar site profissional
    if (answers.has_website === 'no' || answers.has_website === 'old') {
      recommendations.push({
        id: 'site',
        title: 'Criar site profissional',
        description: answers.has_website === 'no' 
          ? 'O cliente não tem presença online. Um site é essencial para ser encontrado e transmitir credibilidade.'
          : 'O site atual está desatualizado. Um novo site moderno vai melhorar a imagem e atrair mais clientes.',
        icon: Globe,
        path: '/solucoes/criar/site',
        priority: 'high',
      });
    }

    // Criar aplicativo
    if (
      (answers.depends_whatsapp === 'yes' && answers.loses_clients_delay !== 'no') ||
      (answers.has_system_app === 'no' && answers.receives_online_contacts !== 'yes')
    ) {
      recommendations.push({
        id: 'app',
        title: 'Criar aplicativo simples',
        description: 'Um aplicativo pode automatizar o atendimento, receber pedidos e reduzir a dependência do WhatsApp manual.',
        icon: Smartphone,
        path: '/solucoes/criar/app',
        priority: answers.loses_clients_delay === 'yes' ? 'high' : 'medium',
      });
    }

    // Organização de processos
    if (answers.organization_difficulty === 'yes' || answers.organization_difficulty === 'some') {
      recommendations.push({
        id: 'organizacao',
        title: 'Organização de processos',
        description: 'O cliente precisa estruturar rotinas e fluxos para ganhar produtividade e evitar retrabalho.',
        icon: Network,
        path: '/solucoes/organizacao',
        priority: answers.organization_difficulty === 'yes' ? 'high' : 'medium',
      });
    }

    // Posicionamento digital
    if (answers.social_presence === 'no' || answers.social_presence === 'little') {
      recommendations.push({
        id: 'posicionamento',
        title: 'Posicionamento digital',
        description: 'O cliente precisa de uma comunicação clara e profissional para se destacar no digital.',
        icon: Target,
        path: '/solucoes/posicionamento',
        priority: answers.social_presence === 'no' ? 'high' : 'medium',
      });
    }

    // Diagnóstico completo (sempre como opcional)
    if (recommendations.length >= 2) {
      recommendations.push({
        id: 'diagnostico',
        title: 'Diagnóstico estratégico completo',
        description: 'Para uma análise mais profunda e um plano de ação detalhado, recomendamos o diagnóstico completo.',
        icon: Stethoscope,
        path: '/nexia-ai/planejamento/novo',
        priority: 'low',
      });
    }

    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  };

  const recommendations = showResults ? generateRecommendations() : [];

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    return (
      <AppLayout title="Diagnóstico Rápido">
        <div className="w-full max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Recomendação da Nexia</h1>
                <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  Resultado
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Com base nas respostas e na análise do negócio, a Nexia identificou que este cliente precisa das seguintes soluções para melhorar seus resultados.
              </p>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length === 0 ? (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-6 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Cliente bem estruturado!</h3>
                <p className="text-muted-foreground">
                  Com base nas respostas, este cliente já está em boa situação digital. 
                  Você pode sugerir melhorias pontuais ou explorar outras oportunidades.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const Icon = rec.icon;
                return (
                  <Card 
                    key={rec.id} 
                    className={`border-primary/20 hover:border-primary/40 transition-all cursor-pointer group ${
                      rec.priority === 'high' ? 'ring-1 ring-primary/30' : ''
                    }`}
                    onClick={() => navigate(rec.path)}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          rec.priority === 'high' 
                            ? 'bg-primary/15 border border-primary/25' 
                            : 'bg-primary/10 border border-primary/15'
                        }`}>
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-foreground">{rec.title}</h3>
                            {rec.priority === 'high' && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
                                Prioridade
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {rec.description}
                          </p>
                        </div>
                        <Button size="sm" className="shrink-0 gap-2 group-hover:bg-primary/90">
                          Aplicar solução
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Transition Message */}
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium mb-2">
                    Essas soluções podem ser aplicadas agora, sem necessidade de conhecimento técnico.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    A Nexia já identificou exatamente o que fazer. Você só precisa executar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Final Message */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-foreground font-medium mb-1">
                    Próximo passo
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Aplique as soluções agora ou gere uma proposta profissional para apresentar ao cliente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <Button variant="outline" onClick={handleReset}>
              Fazer novo diagnóstico
            </Button>
            <div className="flex gap-2">
              {recommendations.length > 0 && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => navigate(recommendations[0].path)}
                >
                  Aplicar solução agora
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button onClick={() => navigate('/vendas/propostas/nova')} className="gap-2">
                <FileText className="h-4 w-4" />
                Gerar proposta para o cliente
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentQ = QUESTIONS[currentQuestion];

  return (
    <AppLayout title="Diagnóstico Rápido">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Nexia Simples</h1>
              <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                <Zap className="h-3 w-3" />
                Diagnóstico Rápido
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Responda perguntas simples. A Nexia analisa e indica exatamente quais soluções aplicar.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Pergunta {currentQuestion + 1} de {QUESTIONS.length}
            </span>
            <span className="font-medium text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="border-primary/20">
          <CardContent className="p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">
              {currentQ.question}
            </h2>

            <RadioGroup
              value={answers[currentQ.id] || ''}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {currentQ.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                    answers[currentQ.id] === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label 
                    htmlFor={option.value} 
                    className="flex-1 cursor-pointer text-base font-medium"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceed}
            className="gap-2"
          >
            {currentQuestion === QUESTIONS.length - 1 ? 'Ver resultado' : 'Próxima'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
