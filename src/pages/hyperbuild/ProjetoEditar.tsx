import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Smartphone, 
  Globe, 
  Copy,
  PlusCircle,
  Bug,
  Paintbrush,
  Settings,
  Link,
  Bot,
  Code2,
  Zap,
  Image,
  Smartphone as PWAIcon,
  Check
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EditProjectModal, EditType } from '@/components/hyperbuild/EditProjectModal';

interface EditOption {
  id: EditType;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
}

const buildOptions: EditOption[] = [
  { id: 'add-function', icon: PlusCircle, title: 'Nova Funcionalidade', description: 'Nova funcionalidade ou tela', color: 'text-emerald-500' },
  { id: 'fix-bug', icon: Bug, title: 'Resolver Erro', description: 'Resolver problema ou erro', color: 'text-red-500' },
  { id: 'visual-change', icon: Paintbrush, title: 'Ajuste de Design', description: 'Alterar cores, fontes, layout', color: 'text-purple-500' },
];

const technicalOptions: EditOption[] = [
  { id: 'adjust-function', icon: Settings, title: 'Modificar Recurso', description: 'Modificar comportamento existente', color: 'text-blue-500' },
  { id: 'integrate-tool', icon: Link, title: 'Conectar Serviço', description: 'Conectar API ou serviço externo', color: 'text-orange-500' },
  { id: 'improve-ai', icon: Bot, title: 'Aprimorar IA', description: 'Aprimorar funcionalidades com IA', color: 'text-pink-500' },
  { id: 'refactor-code', icon: Code2, title: 'Reorganizar Código', description: 'Melhorar organização e performance', color: 'text-cyan-500' },
];

const finalizationOptions: EditOption[] = [
  { id: 'optimize', icon: Zap, title: 'Acelerar Performance', description: 'Melhorar velocidade e performance', color: 'text-yellow-500' },
  { id: 'change-images', icon: Image, title: 'Trocar Imagens', description: 'Trocar ou adicionar imagens', color: 'text-green-500' },
  { id: 'make-pwa', icon: PWAIcon, title: 'Converter em PWA', description: 'Transformar em app instalável', color: 'text-indigo-500' },
];

export default function ProjetoEditar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedEdit, setSelectedEdit] = useState<EditType | null>(null);
  const [generatedUpdatePrompt, setGeneratedUpdatePrompt] = useState<string | null>(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const copyPrompt = () => {
    if (!generatedUpdatePrompt) {
      toast.error('Nenhum prompt de atualização gerado');
      return;
    }
    navigator.clipboard.writeText(generatedUpdatePrompt);
    toast.success('Prompt copiado para a área de transferência!');
  };

  const handleEditComplete = (prompt: string) => {
    setGeneratedUpdatePrompt(prompt);
    setSelectedEdit(null);
    toast.success('Prompt de atualização gerado!');
  };

  if (isLoading) {
    return (
      <AppLayout title="Carregando...">
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout title="Projeto não encontrado">
        <div className="max-w-5xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Projeto não encontrado</h2>
          <Button onClick={() => navigate('/hyperbuild/projetos')}>
            Voltar para Projetos
          </Button>
        </div>
      </AppLayout>
    );
  }

  // Detecta se é um App/SaaS (mostra PWA) ou Site/Landing Page (não mostra PWA)
  const siteKeywords = ['site', 'landing', 'pagina', 'página', 'vendas', 'captura', 'institucional', 'portfolio', 'lancamento', 'lançamento', 'mentoria'];
  const templateId = project.template_id?.toLowerCase() || '';
  const isSiteOrLandingPage = siteKeywords.some(keyword => templateId.includes(keyword));
  const isApp = !isSiteOrLandingPage;

  const renderOptionCard = (option: EditOption, showForSiteOnly: boolean = false) => {
    if (option.id === 'make-pwa' && !isApp) return null;
    
    return (
      <Card 
        key={option.id}
        className="group cursor-pointer hover:shadow-md hover:border-primary/30 transition-all duration-200"
        onClick={() => setSelectedEdit(option.id)}
      >
        <CardContent className="p-4 flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center group-hover:scale-110 transition-transform`}>
            <option.icon className={`h-6 w-6 ${option.color}`} />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {option.title}
            </h4>
            <p className="text-sm text-muted-foreground">{option.description}</p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <AppLayout title={`Editar: ${project.app_name}`}>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(`/hyperbuild/projeto/${project.id}`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isApp ? 'bg-primary/10' : 'bg-emerald-500/10'
              }`}>
                {isApp ? (
                  <Smartphone className="h-5 w-5 text-primary" />
                ) : (
                  <Globe className="h-5 w-5 text-emerald-500" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Editar: {project.app_name}</h1>
                <p className="text-muted-foreground">Selecione o tipo de alteração que deseja fazer</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Prompt Display */}
        {generatedUpdatePrompt && (
          <Card className="border-success bg-success/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <CardTitle className="text-lg text-success">Prompt de Atualização Gerado</CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={copyPrompt} className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-4 rounded-lg max-h-64 overflow-y-auto font-mono">
                {generatedUpdatePrompt}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Block 1: Build/Fix */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                1
              </Badge>
              <CardTitle>O que vamos construir ou arrumar?</CardTitle>
            </div>
            <CardDescription>Novas funcionalidades, correções e mudanças visuais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {buildOptions.map(option => renderOptionCard(option))}
            </div>
          </CardContent>
        </Card>

        {/* Block 2: Technical */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                2
              </Badge>
              <CardTitle>Ajustes técnicos e integrações</CardTitle>
            </div>
            <CardDescription>Modificações mais avançadas no funcionamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {technicalOptions.map(option => renderOptionCard(option))}
            </div>
          </CardContent>
        </Card>

        {/* Block 3: Finalization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                3
              </Badge>
              <CardTitle>Finalização</CardTitle>
            </div>
            <CardDescription>Polimento e preparação para produção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {finalizationOptions.filter(opt => isApp || opt.id !== 'make-pwa').map(option => renderOptionCard(option))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Modal */}
      <EditProjectModal
        open={!!selectedEdit}
        onOpenChange={(open) => !open && setSelectedEdit(null)}
        editType={selectedEdit}
        projectName={project.app_name}
        projectType={isApp ? 'app' : 'site'}
        onComplete={handleEditComplete}
      />
    </AppLayout>
  );
}
