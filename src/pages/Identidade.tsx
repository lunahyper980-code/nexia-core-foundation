import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { toast } from 'sonner';
import { 
  Fingerprint, 
  Save, 
  Loader2, 
  Building2, 
  Target, 
  Users, 
  Sparkles,
  Instagram,
  MessageCircle,
  UserCircle,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Premium Section Component
function IdentitySection({ 
  title, 
  icon: Icon, 
  children, 
  className 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "relative rounded-2xl border border-primary/10 bg-gradient-to-br from-card via-card to-primary/[0.02] p-6 md:p-8",
      "shadow-[0_0_30px_-10px_hsl(var(--primary)/0.15)]",
      className
    )}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-foreground tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

// Generated Card Component
function GeneratedCard({ 
  title, 
  content, 
  onCopy 
}: { 
  title: string; 
  content: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative rounded-xl border border-primary/10 bg-primary/[0.03] p-4 hover:border-primary/20 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-primary mb-2">{title}</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{content}</p>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="flex-shrink-0 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </Button>
      </div>
    </div>
  );
}

// Social Media Card Component
function SocialCard({ 
  platform, 
  icon: Icon, 
  content, 
  onCopy 
}: { 
  platform: string;
  icon: React.ElementType;
  content: string;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group rounded-xl border border-primary/10 bg-primary/[0.03] p-4 hover:border-primary/20 transition-all">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{platform}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}

export default function Identidade() {
  const { workspace, updateWorkspace, loading: workspaceLoading } = useWorkspace();
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    operation_name: '',
    niche: '',
    one_liner: '',
    tone: '',
  });

  // Extended form data for new fields (stored locally, could be extended to DB)
  const [extendedData, setExtendedData] = useState({
    city_region: '',
    service_type: '',
    problem_solved: '',
    solution_type: '',
    main_benefit: '',
  });

  // Generated content
  const [generatedContent, setGeneratedContent] = useState({
    presentation: '',
    explanation: '',
    differentiation: '',
    instagramBio: '',
    whatsappDescription: '',
    firstContact: '',
  });

  // Sync form data when workspace loads
  useEffect(() => {
    if (workspace) {
      setFormData({
        operation_name: workspace.operation_name || '',
        niche: workspace.niche || '',
        one_liner: workspace.one_liner || '',
        tone: workspace.tone || '',
      });
    }
  }, [workspace]);

  // Generate positioning content based on form data
  const generatePositioning = () => {
    if (!formData.operation_name || !formData.niche) {
      toast.error('Preencha pelo menos o nome da operação e o nicho');
      return;
    }

    setGenerating(true);

    // Simulate generation (in production, this would call an AI endpoint)
    setTimeout(() => {
      const name = formData.operation_name || 'Minha Operação';
      const niche = formData.niche || 'negócios locais';
      const problem = extendedData.problem_solved || 'organização e presença digital';
      const benefit = extendedData.main_benefit || 'mais clientes e organização';
      const city = extendedData.city_region || 'sua região';

      setGeneratedContent({
        presentation: `Sou responsável pela ${name}, especializada em estruturar soluções digitais completas para ${niche}. Ajudo empresas que precisam de ${problem} a conquistarem ${benefit}.`,
        
        explanation: `Trabalho com ${niche} que precisam se organizar e aparecer melhor para os clientes. Entrego soluções prontas — você não precisa entender de tecnologia. Eu cuido de tudo para que seu negócio funcione melhor.`,
        
        differentiation: `Diferente de freelancers que fazem só uma parte, entrego soluções completas e prontas para usar. Não sou vendedor de serviço, sou parceiro de estruturação do seu negócio.`,
        
        instagramBio: `📍 ${city}\n✨ Soluções digitais para ${niche}\n💼 Estruturação • Organização • Resultados\n📩 Fale comigo 👇`,
        
        whatsappDescription: `${name} | Soluções digitais para ${niche}. Organização e resultados para seu negócio.`,
        
        firstContact: `Olá! Sou da ${name}. Trabalhamos com soluções digitais para ${niche}. Posso te ajudar a ${benefit.toLowerCase()}. Podemos conversar?`,
      });

      setGenerating(false);
      toast.success('Posicionamento gerado com sucesso!');
    }, 1500);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateWorkspace(formData);
      toast.success('Identidade atualizada com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar identidade');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    toast.success('Copiado!');
  };

  if (workspaceLoading) {
    return (
      <AppLayout title="Identidade — Posicionamento Profissional">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  const hasGeneratedContent = Object.values(generatedContent).some(v => v.length > 0);

  return (
    <AppLayout title="Identidade — Posicionamento Profissional">
      <div className="w-full max-w-5xl mx-auto space-y-8 pb-8">
        
        {/* Header Context */}
        <div className="text-center space-y-2 py-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium">
            <Fingerprint className="h-3.5 w-3.5" />
            Posicionamento Estratégico
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Identidade da Sua Operação
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-base">
            Você não precisa saber marketing. A Nexia organiza sua identidade e te ajuda a se posicionar com clareza.
          </p>
        </div>

        {/* SEÇÃO 1 — Identidade da Operação */}
        <IdentitySection title="Identidade da Operação" icon={Building2}>
          <p className="text-sm text-muted-foreground mb-6">
            Essas informações definem como sua operação será apresentada aos clientes.
          </p>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="operation_name">Nome da Operação / Agência</Label>
              <Input
                id="operation_name"
                value={formData.operation_name}
                onChange={(e) => setFormData({ ...formData, operation_name: e.target.value })}
                placeholder="Ex: Studio Digital, Agência Flow"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city_region">Cidade / Região de Atuação</Label>
              <Input
                id="city_region"
                value={extendedData.city_region}
                onChange={(e) => setExtendedData({ ...extendedData, city_region: e.target.value })}
                placeholder="Ex: São Paulo - SP, Interior de Minas"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche">Nicho Principal Atendido</Label>
              <Input
                id="niche"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                placeholder="Ex: Barbearias, Clínicas, Restaurantes"
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_type">Tipo de Serviço Principal</Label>
              <Input
                id="service_type"
                value={extendedData.service_type}
                onChange={(e) => setExtendedData({ ...extendedData, service_type: e.target.value })}
                placeholder="Ex: Soluções digitais, Estruturação, Apps"
                className="bg-background/50"
              />
            </div>
          </div>
        </IdentitySection>

        {/* SEÇÃO 2 — Proposta de Valor */}
        <IdentitySection title="Proposta de Valor" icon={Target}>
          <p className="text-sm text-muted-foreground mb-6">
            Defina com clareza o que você entrega e para quem.
          </p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="problem_solved">Qual problema você resolve para o cliente?</Label>
              <Textarea
                id="problem_solved"
                value={extendedData.problem_solved}
                onChange={(e) => setExtendedData({ ...extendedData, problem_solved: e.target.value })}
                placeholder="Ex: Falta de organização, dificuldade para aparecer na internet, perda de clientes"
                rows={2}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="solution_type">Que tipo de solução você entrega com a Nexia?</Label>
              <Textarea
                id="solution_type"
                value={extendedData.solution_type}
                onChange={(e) => setExtendedData({ ...extendedData, solution_type: e.target.value })}
                placeholder="Ex: Sites prontos, apps de agendamento, organização de processos"
                rows={2}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="main_benefit">Qual é o principal benefício para o cliente final?</Label>
              <Textarea
                id="main_benefit"
                value={extendedData.main_benefit}
                onChange={(e) => setExtendedData({ ...extendedData, main_benefit: e.target.value })}
                placeholder="Ex: Mais clientes, menos bagunça, aparência profissional"
                rows={2}
                className="bg-background/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="one_liner">Resumo em 1 frase (proposta de valor)</Label>
              <Textarea
                id="one_liner"
                value={formData.one_liner}
                onChange={(e) => setFormData({ ...formData, one_liner: e.target.value })}
                placeholder="Ex: Estruturo soluções digitais prontas para negócios locais venderem mais e se organizarem melhor."
                rows={2}
                className="bg-background/50"
              />
            </div>
          </div>
        </IdentitySection>

        {/* Generate Button */}
        <div className="flex justify-center">
          <Button 
            onClick={generatePositioning} 
            disabled={generating}
            size="lg"
            className="gap-2 px-8"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando posicionamento...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar Posicionamento Automático
              </>
            )}
          </Button>
        </div>

        {/* SEÇÃO 3 — Posicionamento como Agência */}
        {hasGeneratedContent && (
          <IdentitySection title="Posicionamento como Agência" icon={Users}>
            <p className="text-sm text-muted-foreground mb-6">
              Sugestões geradas automaticamente com base na sua identidade.
            </p>
            
            <div className="space-y-4">
              <GeneratedCard 
                title="📌 Como você deve se apresentar"
                content={generatedContent.presentation}
                onCopy={handleCopy}
              />
              
              <GeneratedCard 
                title="📌 Como explicar seu serviço sem parecer vendedor"
                content={generatedContent.explanation}
                onCopy={handleCopy}
              />
              
              <GeneratedCard 
                title="📌 Como se diferenciar de freelancers comuns"
                content={generatedContent.differentiation}
                onCopy={handleCopy}
              />
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generatePositioning}
                disabled={generating}
                className="gap-2"
              >
                <RefreshCw className={cn("h-3.5 w-3.5", generating && "animate-spin")} />
                Regenerar
              </Button>
            </div>
          </IdentitySection>
        )}

        {/* SEÇÃO 4 — Presença Digital */}
        {hasGeneratedContent && (
          <IdentitySection title="Presença Digital" icon={MessageCircle}>
            <p className="text-sm text-muted-foreground mb-6">
              Textos prontos para usar nas suas redes sociais e contatos.
            </p>
            
            <div className="grid gap-4 md:grid-cols-3">
              <SocialCard 
                platform="Bio do Instagram"
                icon={Instagram}
                content={generatedContent.instagramBio}
                onCopy={handleCopy}
              />
              
              <SocialCard 
                platform="WhatsApp Business"
                icon={MessageCircle}
                content={generatedContent.whatsappDescription}
                onCopy={handleCopy}
              />
              
              <SocialCard 
                platform="Primeiro Contato"
                icon={UserCircle}
                content={generatedContent.firstContact}
                onCopy={handleCopy}
              />
            </div>
          </IdentitySection>
        )}

        {/* Save Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Essas informações alimentam os módulos da Nexia automaticamente.
          </p>
          
          <Button onClick={handleSave} disabled={saving} size="lg" className="gap-2 px-8">
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar Identidade
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
