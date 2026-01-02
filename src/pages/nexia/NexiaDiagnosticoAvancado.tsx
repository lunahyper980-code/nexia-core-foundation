import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Globe,
  Smartphone,
  Network,
  Target,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  FileText,
  File,
  Save,
  UserPlus,
  Loader2,
  Building2,
  Cog,
  Share2,
  BarChart3,
  Zap,
} from 'lucide-react';

interface BlockAnswers {
  // Bloco 1 - Estrutura Digital
  has_website: string;
  website_converts: string;
  has_app_system: string;
  uses_digital_tools: string;
  // Bloco 2 - Operação e Processos
  organization_level: number;
  manual_dependency: string;
  operational_bottlenecks: string;
  service_capacity: string;
  // Bloco 3 - Aquisição e Relacionamento
  main_channels: string[];
  referral_dependency: string;
  digital_presence: string;
  post_sale_relationship: string;
  // Bloco 4 - Maturidade Digital
  maturity_level: string;
  automation_potential: string;
  scalability_potential: string;
}

interface DiagnosisResult {
  blockAnalysis: {
    title: string;
    status: 'critical' | 'warning' | 'good';
    summary: string;
    points: string[];
  }[];
  criticalPoints: string[];
  opportunities: string[];
  recommendations: {
    id: string;
    title: string;
    description: string;
    justification: string;
    icon: React.ComponentType<{ className?: string }>;
    path: string;
  }[];
  nextSteps: string[];
}

const BLOCKS = [
  { id: 'digital', title: 'Estrutura Digital', icon: Globe },
  { id: 'operations', title: 'Operação e Processos', icon: Cog },
  { id: 'acquisition', title: 'Aquisição e Relacionamento', icon: Share2 },
  { id: 'maturity', title: 'Maturidade Digital', icon: BarChart3 },
];

const ACQUISITION_CHANNELS = [
  { value: 'organic', label: 'Busca orgânica (Google)' },
  { value: 'paid', label: 'Anúncios pagos' },
  { value: 'social', label: 'Redes sociais' },
  { value: 'referral', label: 'Indicações' },
  { value: 'partnerships', label: 'Parcerias' },
  { value: 'events', label: 'Eventos/Networking' },
  { value: 'cold', label: 'Prospecção ativa' },
];

export default function NexiaDiagnosticoAvancado() {
  const navigate = useNavigate();
  const [currentBlock, setCurrentBlock] = useState(0);
  const [answers, setAnswers] = useState<Partial<BlockAnswers>>({
    organization_level: 3,
    main_channels: [],
  });
  const [showResults, setShowResults] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);

  const progress = ((currentBlock + 1) / BLOCKS.length) * 100;

  const updateAnswer = <K extends keyof BlockAnswers>(key: K, value: BlockAnswers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const toggleChannel = (channel: string) => {
    const current = answers.main_channels || [];
    if (current.includes(channel)) {
      updateAnswer('main_channels', current.filter(c => c !== channel));
    } else {
      updateAnswer('main_channels', [...current, channel]);
    }
  };

  const canProceedBlock = (blockIndex: number): boolean => {
    switch (blockIndex) {
      case 0:
        return !!(answers.has_website && answers.website_converts && answers.has_app_system && answers.uses_digital_tools);
      case 1:
        return !!(answers.manual_dependency && answers.operational_bottlenecks && answers.service_capacity);
      case 2:
        return !!((answers.main_channels?.length || 0) > 0 && answers.referral_dependency && answers.digital_presence && answers.post_sale_relationship);
      case 3:
        return !!(answers.maturity_level && answers.automation_potential && answers.scalability_potential);
      default:
        return false;
    }
  };

  const generateDiagnosis = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const result: DiagnosisResult = {
      blockAnalysis: [],
      criticalPoints: [],
      opportunities: [],
      recommendations: [],
      nextSteps: [],
    };

    // Bloco 1 Analysis
    const digitalStatus = 
      (answers.has_website === 'no' || answers.website_converts === 'no') ? 'critical' :
      (answers.has_website === 'old' || answers.website_converts === 'partial') ? 'warning' : 'good';
    
    result.blockAnalysis.push({
      title: 'Estrutura Digital',
      status: digitalStatus,
      summary: digitalStatus === 'critical' 
        ? 'Infraestrutura digital precisa de atenção urgente'
        : digitalStatus === 'warning'
        ? 'Estrutura digital funcional, mas com pontos de melhoria'
        : 'Estrutura digital bem estabelecida',
      points: [
        answers.has_website === 'no' ? 'Não possui site próprio' : answers.has_website === 'old' ? 'Site desatualizado' : 'Site funcional',
        answers.website_converts === 'no' ? 'Site não gera conversões' : answers.website_converts === 'partial' ? 'Conversão abaixo do ideal' : 'Boa taxa de conversão',
        answers.has_app_system === 'no' ? 'Sem sistema/app próprio' : answers.has_app_system === 'simple' ? 'Usa ferramentas básicas' : 'Sistema robusto implementado',
        answers.uses_digital_tools === 'no' ? 'Não utiliza ferramentas digitais' : answers.uses_digital_tools === 'few' ? 'Poucas ferramentas digitais' : 'Bom uso de ferramentas',
      ],
    });

    // Bloco 2 Analysis
    const orgLevel = answers.organization_level || 3;
    const opsStatus = 
      (orgLevel <= 2 || answers.manual_dependency === 'high') ? 'critical' :
      (orgLevel === 3 || answers.manual_dependency === 'medium') ? 'warning' : 'good';
    
    result.blockAnalysis.push({
      title: 'Operação e Processos',
      status: opsStatus,
      summary: opsStatus === 'critical'
        ? 'Processos operacionais desorganizados impactam resultados'
        : opsStatus === 'warning'
        ? 'Operação funciona, mas há gargalos a resolver'
        : 'Processos bem estruturados e eficientes',
      points: [
        `Nível de organização: ${orgLevel}/5`,
        answers.manual_dependency === 'high' ? 'Alta dependência de atendimento manual' : answers.manual_dependency === 'medium' ? 'Dependência moderada de atendimento manual' : 'Baixa dependência manual',
        answers.operational_bottlenecks || 'Gargalos não especificados',
        answers.service_capacity === 'limited' ? 'Capacidade de atendimento limitada' : answers.service_capacity === 'ok' ? 'Capacidade adequada' : 'Boa capacidade de escala',
      ],
    });

    // Bloco 3 Analysis
    const acqStatus = 
      (answers.referral_dependency === 'high' && (answers.main_channels?.length || 0) <= 1) ? 'critical' :
      (answers.digital_presence === 'no' || answers.post_sale_relationship === 'no') ? 'warning' : 'good';
    
    result.blockAnalysis.push({
      title: 'Aquisição e Relacionamento',
      status: acqStatus,
      summary: acqStatus === 'critical'
        ? 'Dependência excessiva de poucos canais de aquisição'
        : acqStatus === 'warning'
        ? 'Canais funcionais, mas com oportunidades de expansão'
        : 'Estratégia de aquisição diversificada e eficiente',
      points: [
        `${answers.main_channels?.length || 0} canais de aquisição ativos`,
        answers.referral_dependency === 'high' ? 'Alta dependência de indicações' : 'Fonte de clientes diversificada',
        answers.digital_presence === 'no' ? 'Sem presença digital ativa' : answers.digital_presence === 'limited' ? 'Presença digital limitada' : 'Presença digital consolidada',
        answers.post_sale_relationship === 'no' ? 'Sem estratégia de pós-venda' : answers.post_sale_relationship === 'basic' ? 'Pós-venda básico' : 'Pós-venda estruturado',
      ],
    });

    // Bloco 4 Analysis
    const matStatus = 
      answers.maturity_level === 'beginner' ? 'critical' :
      answers.maturity_level === 'intermediate' ? 'warning' : 'good';
    
    result.blockAnalysis.push({
      title: 'Maturidade Digital',
      status: matStatus,
      summary: matStatus === 'critical'
        ? 'Estágio inicial de maturidade digital'
        : matStatus === 'warning'
        ? 'Em processo de amadurecimento digital'
        : 'Maturidade digital avançada',
      points: [
        `Nível de maturidade: ${answers.maturity_level === 'beginner' ? 'Iniciante' : answers.maturity_level === 'intermediate' ? 'Intermediário' : 'Avançado'}`,
        answers.automation_potential === 'high' ? 'Alto potencial de automação identificado' : answers.automation_potential === 'medium' ? 'Potencial moderado de automação' : 'Já bastante automatizado',
        answers.scalability_potential === 'high' ? 'Grande potencial de escala' : answers.scalability_potential === 'medium' ? 'Potencial moderado de escala' : 'Operação já escalável',
      ],
    });

    // Critical Points
    if (answers.has_website === 'no') result.criticalPoints.push('Ausência de site impede visibilidade online');
    if (answers.manual_dependency === 'high') result.criticalPoints.push('Alta dependência manual limita crescimento');
    if (answers.referral_dependency === 'high' && (answers.main_channels?.length || 0) <= 1) {
      result.criticalPoints.push('Risco de concentração em poucas fontes de clientes');
    }
    if (orgLevel <= 2) result.criticalPoints.push('Desorganização interna afeta produtividade');

    // Opportunities
    if (answers.automation_potential === 'high') result.opportunities.push('Automação pode reduzir custos e aumentar eficiência');
    if (answers.scalability_potential === 'high') result.opportunities.push('Modelo de negócio permite escala com pouco investimento');
    if (answers.digital_presence === 'limited') result.opportunities.push('Expansão da presença digital pode gerar novos leads');
    if (answers.post_sale_relationship !== 'structured') result.opportunities.push('Melhorar pós-venda aumenta recompra e indicações');

    // Recommendations
    if (answers.has_website !== 'functional' || answers.website_converts !== 'yes') {
      result.recommendations.push({
        id: 'site',
        title: 'Site Profissional',
        description: 'Criar ou reformular site com foco em conversão',
        justification: 'Um site profissional é a base da presença digital e canal principal de conversão',
        icon: Globe,
        path: '/solucoes/criar/site',
      });
    }

    if (answers.has_app_system === 'no' || answers.manual_dependency === 'high') {
      result.recommendations.push({
        id: 'app',
        title: 'Aplicativo ou Sistema',
        description: 'Desenvolver sistema para automatizar operações',
        justification: 'Reduzir dependência manual e aumentar capacidade de atendimento',
        icon: Smartphone,
        path: '/solucoes/criar/app',
      });
    }

    if (orgLevel <= 3 || answers.operational_bottlenecks) {
      result.recommendations.push({
        id: 'organizacao',
        title: 'Organização de Processos',
        description: 'Estruturar fluxos e rotinas operacionais',
        justification: 'Processos claros aumentam produtividade e reduzem erros',
        icon: Network,
        path: '/solucoes/organizacao',
      });
    }

    if (answers.digital_presence !== 'strong') {
      result.recommendations.push({
        id: 'posicionamento',
        title: 'Posicionamento Digital',
        description: 'Definir comunicação e identidade digital',
        justification: 'Posicionamento claro diferencia e atrai o público certo',
        icon: Target,
        path: '/solucoes/posicionamento',
      });
    }

    if (answers.automation_potential === 'high') {
      result.recommendations.push({
        id: 'automacao',
        title: 'Automação de Marketing',
        description: 'Implementar fluxos automatizados de captação',
        justification: 'Automação gera leads constantemente com menos esforço',
        icon: Zap,
        path: '/nexia-ai/planejamento/novo',
      });
    }

    // Next Steps
    result.nextSteps = [
      'Apresentar este diagnóstico ao cliente como análise profissional',
      'Priorizar as soluções marcadas como críticas',
      'Elaborar proposta comercial baseada nas recomendações',
      'Definir cronograma de implementação por etapas',
    ];

    setDiagnosis(result);
    setShowResults(true);
    setIsGenerating(false);
  };

  const handleNext = () => {
    if (currentBlock < BLOCKS.length - 1) {
      setCurrentBlock(prev => prev + 1);
    } else {
      generateDiagnosis();
    }
  };

  const handlePrev = () => {
    if (currentBlock > 0) {
      setCurrentBlock(prev => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentBlock(0);
    setAnswers({ organization_level: 3, main_channels: [] });
    setShowResults(false);
    setDiagnosis(null);
  };

  const getStatusColor = (status: 'critical' | 'warning' | 'good') => {
    switch (status) {
      case 'critical': return 'text-destructive border-destructive/30 bg-destructive/10';
      case 'warning': return 'text-amber-500 border-amber-500/30 bg-amber-500/10';
      case 'good': return 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10';
    }
  };

  const getStatusIcon = (status: 'critical' | 'warning' | 'good') => {
    switch (status) {
      case 'critical': return AlertTriangle;
      case 'warning': return TrendingUp;
      case 'good': return CheckCircle2;
    }
  };

  if (isGenerating) {
    return (
      <AppLayout title="Diagnóstico Avançado">
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative p-6 rounded-full bg-primary/10 border border-primary/20">
              <Brain className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold text-foreground">Analisando dados...</h2>
            <p className="text-muted-foreground">A Nexia está processando as informações e gerando o diagnóstico estratégico</p>
          </div>
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </AppLayout>
    );
  }

  if (showResults && diagnosis) {
    return (
      <AppLayout title="Diagnóstico Estratégico">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">Direcionamento Estratégico da Nexia</h1>
                <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  Gerado pela IA
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Com base no diagnóstico estratégico, a Nexia identificou oportunidades claras de melhoria e crescimento para este negócio.
              </p>
            </div>
          </div>

          {/* Block Analysis */}
          <div className="grid gap-4 md:grid-cols-2">
            {diagnosis.blockAnalysis.map((block) => {
              const StatusIcon = getStatusIcon(block.status);
              return (
                <Card key={block.title} className={`border ${getStatusColor(block.status)}`}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-5 w-5" />
                      <CardTitle className="text-base">{block.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-medium">{block.summary}</p>
                    <ul className="space-y-1">
                      {block.points.map((point, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 rounded-full bg-current shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Critical Points */}
          {diagnosis.criticalPoints.length > 0 && (
            <Card className="border-destructive/30 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  Pontos Críticos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnosis.criticalPoints.map((point, i) => (
                    <li key={i} className="text-sm text-destructive/90 flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Opportunities */}
          {diagnosis.opportunities.length > 0 && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-emerald-600">
                  <TrendingUp className="h-5 w-5" />
                  Oportunidades de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {diagnosis.opportunities.map((opp, i) => (
                    <li key={i} className="text-sm text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {opp}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Soluções Recomendadas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {diagnosis.recommendations.map((rec) => {
                const Icon = rec.icon;
                return (
                  <div 
                    key={rec.id}
                    className="p-4 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
                    onClick={() => navigate(rec.path)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground">{rec.title}</h4>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        <p className="text-xs text-primary/80 mt-1 italic">"{rec.justification}"</p>
                      </div>
                      <Button size="sm" className="shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Aplicar
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Próximos Passos Recomendados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {diagnosis.nextSteps.map((step, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-medium flex items-center justify-center">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          {/* Strategic Transition Message */}
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground font-medium mb-2">
                    A aplicação dessas soluções corrige os gargalos atuais e cria uma base sólida para crescimento sustentável.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Este diagnóstico pode ser usado como base para apresentação profissional ao cliente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleReset}>
                Novo diagnóstico
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => toast.info('Função em desenvolvimento')}>
                <UserPlus className="h-4 w-4" />
                Vincular ao cliente
              </Button>
              {diagnosis.recommendations.length > 0 && (
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => navigate(diagnosis.recommendations[0].path)}
                >
                  Aplicar solução recomendada
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <Button className="gap-2" onClick={() => navigate('/vendas/propostas/nova')}>
                <FileText className="h-4 w-4" />
                Gerar proposta
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Render current block questions
  const renderBlockQuestions = () => {
    switch (currentBlock) {
      case 0: // Estrutura Digital
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">O cliente possui site?</Label>
              <RadioGroup
                value={answers.has_website || ''}
                onValueChange={(v) => updateAnswer('has_website', v)}
                className="space-y-2"
              >
                {[
                  { value: 'no', label: 'Não possui site' },
                  { value: 'old', label: 'Sim, mas está desatualizado' },
                  { value: 'functional', label: 'Sim, funciona bem' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('has_website', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`website-${opt.value}`} />
                    <Label htmlFor={`website-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">O site gera conversão?</Label>
              <RadioGroup
                value={answers.website_converts || ''}
                onValueChange={(v) => updateAnswer('website_converts', v)}
                className="space-y-2"
              >
                {[
                  { value: 'no', label: 'Não gera ou não sei' },
                  { value: 'partial', label: 'Gera algumas, mas poderia melhorar' },
                  { value: 'yes', label: 'Sim, gera conversões regularmente' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('website_converts', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`converts-${opt.value}`} />
                    <Label htmlFor={`converts-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Possui aplicativo ou sistema próprio?</Label>
              <RadioGroup
                value={answers.has_app_system || ''}
                onValueChange={(v) => updateAnswer('has_app_system', v)}
                className="space-y-2"
              >
                {[
                  { value: 'no', label: 'Não possui' },
                  { value: 'simple', label: 'Usa ferramentas simples (planilhas, etc)' },
                  { value: 'yes', label: 'Sim, tem sistema próprio' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('has_app_system', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`app-${opt.value}`} />
                    <Label htmlFor={`app-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Utiliza ferramentas digitais no dia a dia?</Label>
              <RadioGroup
                value={answers.uses_digital_tools || ''}
                onValueChange={(v) => updateAnswer('uses_digital_tools', v)}
                className="space-y-2"
              >
                {[
                  { value: 'no', label: 'Não utiliza' },
                  { value: 'few', label: 'Poucas ferramentas' },
                  { value: 'yes', label: 'Sim, várias ferramentas' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('uses_digital_tools', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`tools-${opt.value}`} />
                    <Label htmlFor={`tools-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 1: // Operação e Processos
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Nível de organização interna (1 a 5)</Label>
              <div className="px-2">
                <Slider
                  value={[answers.organization_level || 3]}
                  onValueChange={([v]) => updateAnswer('organization_level', v)}
                  min={1}
                  max={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                  <span>1 - Caótico</span>
                  <span>3 - Mediano</span>
                  <span>5 - Excelente</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Dependência de atendimento manual</Label>
              <RadioGroup
                value={answers.manual_dependency || ''}
                onValueChange={(v) => updateAnswer('manual_dependency', v)}
                className="space-y-2"
              >
                {[
                  { value: 'high', label: 'Alta - quase tudo é manual' },
                  { value: 'medium', label: 'Média - alguns processos automatizados' },
                  { value: 'low', label: 'Baixa - maioria automatizado' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('manual_dependency', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`manual-${opt.value}`} />
                    <Label htmlFor={`manual-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Principais gargalos operacionais</Label>
              <Textarea
                placeholder="Ex: demora no atendimento, erros em pedidos, falta de controle de estoque..."
                value={answers.operational_bottlenecks || ''}
                onChange={(e) => updateAnswer('operational_bottlenecks', e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Capacidade de atendimento atual</Label>
              <RadioGroup
                value={answers.service_capacity || ''}
                onValueChange={(v) => updateAnswer('service_capacity', v)}
                className="space-y-2"
              >
                {[
                  { value: 'limited', label: 'Limitada - já opera no limite' },
                  { value: 'ok', label: 'Adequada - consegue atender a demanda' },
                  { value: 'scalable', label: 'Escalável - pode crescer facilmente' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('service_capacity', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`capacity-${opt.value}`} />
                    <Label htmlFor={`capacity-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 2: // Aquisição e Relacionamento
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Principais canais de entrada de clientes</Label>
              <p className="text-sm text-muted-foreground">Selecione todos que se aplicam</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {ACQUISITION_CHANNELS.map(channel => (
                  <div
                    key={channel.value}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${
                      answers.main_channels?.includes(channel.value)
                        ? 'border-primary bg-primary/10'
                        : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
                    }`}
                    onClick={() => toggleChannel(channel.value)}
                  >
                    <Checkbox
                      checked={answers.main_channels?.includes(channel.value)}
                      onCheckedChange={() => toggleChannel(channel.value)}
                    />
                    <Label className="flex-1 cursor-pointer text-sm">{channel.label}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Dependência de indicações</Label>
              <RadioGroup
                value={answers.referral_dependency || ''}
                onValueChange={(v) => updateAnswer('referral_dependency', v)}
                className="space-y-2"
              >
                {[
                  { value: 'high', label: 'Alta - maioria vem de indicação' },
                  { value: 'medium', label: 'Média - equilibrado com outros canais' },
                  { value: 'low', label: 'Baixa - poucos clientes por indicação' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('referral_dependency', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`referral-${opt.value}`} />
                    <Label htmlFor={`referral-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Presença digital ativa</Label>
              <RadioGroup
                value={answers.digital_presence || ''}
                onValueChange={(v) => updateAnswer('digital_presence', v)}
                className="space-y-2"
              >
                {[
                  { value: 'no', label: 'Sem presença digital' },
                  { value: 'limited', label: 'Presença limitada ou irregular' },
                  { value: 'strong', label: 'Presença forte e consistente' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('digital_presence', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`presence-${opt.value}`} />
                    <Label htmlFor={`presence-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Relacionamento pós-venda</Label>
              <RadioGroup
                value={answers.post_sale_relationship || ''}
                onValueChange={(v) => updateAnswer('post_sale_relationship', v)}
                className="space-y-2"
              >
                {[
                  { value: 'no', label: 'Não faz pós-venda' },
                  { value: 'basic', label: 'Pós-venda básico e reativo' },
                  { value: 'structured', label: 'Pós-venda estruturado e proativo' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('post_sale_relationship', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`postsale-${opt.value}`} />
                    <Label htmlFor={`postsale-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 3: // Maturidade Digital
        return (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Nível de maturidade digital</Label>
              <RadioGroup
                value={answers.maturity_level || ''}
                onValueChange={(v) => updateAnswer('maturity_level', v)}
                className="space-y-2"
              >
                {[
                  { value: 'beginner', label: 'Iniciante - primeiros passos no digital' },
                  { value: 'intermediate', label: 'Intermediário - já usa algumas ferramentas' },
                  { value: 'advanced', label: 'Avançado - operação digitalizada' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('maturity_level', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`maturity-${opt.value}`} />
                    <Label htmlFor={`maturity-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Potencial de automação</Label>
              <RadioGroup
                value={answers.automation_potential || ''}
                onValueChange={(v) => updateAnswer('automation_potential', v)}
                className="space-y-2"
              >
                {[
                  { value: 'high', label: 'Alto - muitos processos podem ser automatizados' },
                  { value: 'medium', label: 'Médio - alguns processos podem ser automatizados' },
                  { value: 'low', label: 'Baixo - já está bastante automatizado' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('automation_potential', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`automation-${opt.value}`} />
                    <Label htmlFor={`automation-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Potencial de escalabilidade</Label>
              <RadioGroup
                value={answers.scalability_potential || ''}
                onValueChange={(v) => updateAnswer('scalability_potential', v)}
                className="space-y-2"
              >
                {[
                  { value: 'high', label: 'Alto - modelo permite crescer facilmente' },
                  { value: 'medium', label: 'Médio - precisa ajustes para escalar' },
                  { value: 'low', label: 'Baixo - modelo já está no limite' },
                ].map(opt => (
                  <div key={opt.value} className="flex items-center space-x-3 p-3 rounded-lg border border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer" onClick={() => updateAnswer('scalability_potential', opt.value)}>
                    <RadioGroupItem value={opt.value} id={`scalability-${opt.value}`} />
                    <Label htmlFor={`scalability-${opt.value}`} className="flex-1 cursor-pointer">{opt.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const currentBlockData = BLOCKS[currentBlock];
  const Icon = currentBlockData.icon;

  return (
    <AppLayout title="Diagnóstico Avançado">
      <div className="w-full max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/nexia-ai')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">Nexia Avançado</h1>
              <Badge className="gap-1 bg-primary/10 text-primary border-primary/20">
                <Brain className="h-3 w-3" />
                Diagnóstico Estratégico
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Diagnóstico completo para entender o negócio, identificar gargalos e estruturar um plano profissional de crescimento.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Bloco {currentBlock + 1} de {BLOCKS.length}
            </span>
            <span className="font-medium text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex gap-2 flex-wrap">
            {BLOCKS.map((block, i) => {
              const BlockIcon = block.icon;
              return (
                <Badge
                  key={block.id}
                  variant={i === currentBlock ? 'default' : i < currentBlock ? 'secondary' : 'outline'}
                  className={`gap-1.5 ${i === currentBlock ? '' : i < currentBlock ? 'opacity-70' : 'opacity-50'}`}
                >
                  <BlockIcon className="h-3 w-3" />
                  {block.title}
                </Badge>
              );
            })}
          </div>
        </div>

        {/* Block Card */}
        <Card className="border-primary/20">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle>{currentBlockData.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {renderBlockQuestions()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-2">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentBlock === 0}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Anterior
          </Button>

          <Button
            onClick={handleNext}
            disabled={!canProceedBlock(currentBlock)}
            className="gap-2"
          >
            {currentBlock === BLOCKS.length - 1 ? 'Gerar diagnóstico' : 'Próximo bloco'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
