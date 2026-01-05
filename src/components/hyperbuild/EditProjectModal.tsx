import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  PlusCircle,
  Bug,
  Paintbrush,
  Settings,
  Link,
  Bot,
  Code2,
  Zap,
  Image,
  Smartphone,
  Copy,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type EditType = 
  | 'add-function'
  | 'fix-bug'
  | 'visual-change'
  | 'adjust-function'
  | 'integrate-tool'
  | 'improve-ai'
  | 'refactor-code'
  | 'optimize'
  | 'change-images'
  | 'make-pwa';

interface ProjectContext {
  templateId?: string;
  targetAudience?: string;
  mainBenefit?: string;
  pages?: string;
}

interface EditProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editType: EditType | null;
  projectName: string;
  projectType: 'app' | 'site';
  projectContext?: ProjectContext;
  onComplete: (prompt: string) => void;
}

const editConfigs: Record<EditType, {
  icon: React.ElementType;
  title: string;
  fields: { id: string; label: string; placeholder: string; type: 'input' | 'textarea' }[];
  promptTemplate: (projectName: string, projectType: string, values: Record<string, string>) => string;
}> = {
  'add-function': {
    icon: PlusCircle,
    title: 'Adicionar Nova Função',
    fields: [
      { id: 'functionName', label: 'Nome da função', placeholder: 'Ex: Sistema de notificações', type: 'input' },
      { id: 'description', label: 'Descrição detalhada', placeholder: 'Descreva o que essa função deve fazer...', type: 'textarea' },
      { id: 'location', label: 'Onde deve aparecer?', placeholder: 'Ex: Na tela principal, após o login...', type: 'input' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: ADICIONAR NOVA FUNÇÃO

📌 FUNÇÃO A ADICIONAR: ${values.functionName}

📝 DESCRIÇÃO:
${values.description}

📍 LOCALIZAÇÃO:
${values.location}

INSTRUÇÕES:
- Implementar esta nova funcionalidade mantendo o padrão visual existente
- Garantir que funcione corretamente com o resto do sistema
- Adicionar feedback visual apropriado (loading, sucesso, erro)
- Manter responsividade

=== FIM DO PROMPT ===
`.trim(),
  },
  'fix-bug': {
    icon: Bug,
    title: 'Corrigir Bug',
    fields: [
      { id: 'bugDescription', label: 'Descreva o problema', placeholder: 'O que está acontecendo de errado?', type: 'textarea' },
      { id: 'expectedBehavior', label: 'Comportamento esperado', placeholder: 'O que deveria acontecer?', type: 'textarea' },
      { id: 'steps', label: 'Como reproduzir?', placeholder: 'Passos para reproduzir o bug...', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: CORREÇÃO DE BUG

🐛 PROBLEMA:
${values.bugDescription}

✅ COMPORTAMENTO ESPERADO:
${values.expectedBehavior}

🔄 PASSOS PARA REPRODUZIR:
${values.steps}

INSTRUÇÕES:
- Identificar a causa raiz do problema
- Corrigir sem quebrar outras funcionalidades
- Testar cenários relacionados
- Adicionar tratamento de erro se necessário

=== FIM DO PROMPT ===
`.trim(),
  },
  'visual-change': {
    icon: Paintbrush,
    title: 'Mudança Visual',
    fields: [
      { id: 'element', label: 'Elemento a alterar', placeholder: 'Ex: Botões, cabeçalho, cards...', type: 'input' },
      { id: 'currentState', label: 'Estado atual', placeholder: 'Como está agora?', type: 'textarea' },
      { id: 'desiredState', label: 'Como deve ficar?', placeholder: 'Descreva as mudanças visuais desejadas...', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: MUDANÇA VISUAL

🎨 ELEMENTO: ${values.element}

📍 ESTADO ATUAL:
${values.currentState}

✨ COMO DEVE FICAR:
${values.desiredState}

INSTRUÇÕES:
- Aplicar as mudanças visuais solicitadas
- Manter consistência com o design system existente
- Garantir responsividade
- Preservar acessibilidade

=== FIM DO PROMPT ===
`.trim(),
  },
  'adjust-function': {
    icon: Settings,
    title: 'Ajustar Função Existente',
    fields: [
      { id: 'functionName', label: 'Qual função ajustar?', placeholder: 'Nome ou descrição da função', type: 'input' },
      { id: 'currentBehavior', label: 'Comportamento atual', placeholder: 'Como funciona agora?', type: 'textarea' },
      { id: 'desiredBehavior', label: 'Novo comportamento', placeholder: 'Como deve funcionar?', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: AJUSTE DE FUNÇÃO

⚙️ FUNÇÃO: ${values.functionName}

📍 COMPORTAMENTO ATUAL:
${values.currentBehavior}

🎯 NOVO COMPORTAMENTO:
${values.desiredBehavior}

INSTRUÇÕES:
- Modificar a função conforme solicitado
- Manter compatibilidade com outras partes do sistema
- Atualizar testes se existirem
- Verificar efeitos colaterais

=== FIM DO PROMPT ===
`.trim(),
  },
  'integrate-tool': {
    icon: Link,
    title: 'Integrar Ferramenta Externa',
    fields: [
      { id: 'toolName', label: 'Nome da ferramenta/API', placeholder: 'Ex: Stripe, SendGrid, Google Maps...', type: 'input' },
      { id: 'purpose', label: 'Para que usar?', placeholder: 'Qual o objetivo da integração?', type: 'textarea' },
      { id: 'details', label: 'Detalhes adicionais', placeholder: 'Configurações específicas, endpoints...', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: INTEGRAÇÃO EXTERNA

🔗 FERRAMENTA: ${values.toolName}

🎯 OBJETIVO:
${values.purpose}

📋 DETALHES:
${values.details}

INSTRUÇÕES:
- Implementar a integração de forma segura
- Usar variáveis de ambiente para credenciais
- Adicionar tratamento de erros adequado
- Documentar a configuração necessária

=== FIM DO PROMPT ===
`.trim(),
  },
  'improve-ai': {
    icon: Bot,
    title: 'Melhorar com IA',
    fields: [
      { id: 'feature', label: 'Funcionalidade', placeholder: 'Qual parte usar IA?', type: 'input' },
      { id: 'aiTask', label: 'O que a IA deve fazer?', placeholder: 'Descreva a tarefa da IA...', type: 'textarea' },
      { id: 'context', label: 'Contexto adicional', placeholder: 'Informações extras relevantes...', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: MELHORIA COM IA

🤖 FUNCIONALIDADE: ${values.feature}

📝 TAREFA DA IA:
${values.aiTask}

📌 CONTEXTO:
${values.context}

INSTRUÇÕES:
- Implementar a funcionalidade de IA solicitada
- Usar Lovable AI ou configurar API apropriada
- Adicionar loading states enquanto a IA processa
- Tratar erros de forma amigável

=== FIM DO PROMPT ===
`.trim(),
  },
  'refactor-code': {
    icon: Code2,
    title: 'Refatorar Código',
    fields: [
      { id: 'area', label: 'Área do código', placeholder: 'Qual parte refatorar?', type: 'input' },
      { id: 'issues', label: 'Problemas atuais', placeholder: 'O que está ruim no código atual?', type: 'textarea' },
      { id: 'goals', label: 'Objetivos da refatoração', placeholder: 'O que espera melhorar?', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: REFATORAÇÃO

📂 ÁREA: ${values.area}

⚠️ PROBLEMAS ATUAIS:
${values.issues}

🎯 OBJETIVOS:
${values.goals}

INSTRUÇÕES:
- Refatorar mantendo a mesma funcionalidade
- Melhorar legibilidade e organização
- Criar componentes reutilizáveis se apropriado
- NÃO alterar comportamento visível ao usuário

=== FIM DO PROMPT ===
`.trim(),
  },
  'optimize': {
    icon: Zap,
    title: 'Otimização de Performance',
    fields: [
      { id: 'area', label: 'Área a otimizar', placeholder: 'Qual parte está lenta?', type: 'input' },
      { id: 'symptoms', label: 'Sintomas observados', placeholder: 'Lentidão, travamento, alto consumo...', type: 'textarea' },
      { id: 'priority', label: 'Prioridade', placeholder: 'Alta, Média, Baixa', type: 'input' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: OTIMIZAÇÃO

⚡ ÁREA: ${values.area}

🔍 SINTOMAS:
${values.symptoms}

📊 PRIORIDADE: ${values.priority}

INSTRUÇÕES:
- Identificar gargalos de performance
- Implementar lazy loading onde apropriado
- Otimizar queries e chamadas de API
- Usar memoization quando benéfico
- Manter funcionalidade idêntica

=== FIM DO PROMPT ===
`.trim(),
  },
  'change-images': {
    icon: Image,
    title: 'Alterar Imagens',
    fields: [
      { id: 'location', label: 'Onde estão as imagens?', placeholder: 'Página ou seção', type: 'input' },
      { id: 'currentImages', label: 'Imagens atuais', placeholder: 'Descrição das imagens atuais', type: 'textarea' },
      { id: 'newImages', label: 'Novas imagens', placeholder: 'Como devem ser as novas imagens?', type: 'textarea' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE ATUALIZAÇÃO ===
Projeto: ${projectName} (${projectType})
Tipo: ALTERAÇÃO DE IMAGENS

📍 LOCALIZAÇÃO: ${values.location}

📸 IMAGENS ATUAIS:
${values.currentImages}

🖼️ NOVAS IMAGENS:
${values.newImages}

INSTRUÇÕES:
- Substituir imagens conforme solicitado
- Manter proporções e dimensões adequadas
- Otimizar para web (tamanho do arquivo)
- Adicionar alt text apropriado

=== FIM DO PROMPT ===
`.trim(),
  },
  'make-pwa': {
    icon: Smartphone,
    title: 'Transformar em PWA',
    fields: [
      { id: 'appName', label: 'Nome do app', placeholder: 'Nome que aparecerá na tela inicial', type: 'input' },
      { id: 'shortName', label: 'Nome curto', placeholder: 'Nome abreviado (máx 12 caracteres)', type: 'input' },
      { id: 'description', label: 'Descrição do app', placeholder: 'Descrição breve do aplicativo', type: 'textarea' },
      { id: 'themeColor', label: 'Cor tema (hex)', placeholder: 'Ex: #6366f1', type: 'input' },
      { id: 'backgroundColor', label: 'Cor de fundo (hex)', placeholder: 'Ex: #ffffff', type: 'input' },
    ],
    promptTemplate: (projectName, projectType, values) => `
=== PROMPT DE TRANSFORMAÇÃO PWA ===

📌 CONTEXTO DO PROJETO
Projeto: ${projectName}
Tipo: ${projectType === 'app' ? 'Aplicativo / SaaS' : 'Site'}
Objetivo: Transformar este aplicativo em um PWA (Progressive Web App) completo e profissional

⚠️ IMPORTANTE: Este prompt deve ser copiado e colado no Lovable para implementação.

---

📄 1. MANIFEST.JSON COMPLETO

Criar arquivo manifest.json na pasta public com as seguintes propriedades:

- name: "${values.appName}"
- short_name: "${values.shortName}"
- description: "${values.description}"
- start_url: "/"
- scope: "/"
- display: "standalone"
- orientation: "portrait-primary"
- background_color: "${values.backgroundColor || '#ffffff'}"
- theme_color: "${values.themeColor || '#6366f1'}"
- icons: Array de ícones nos tamanhos 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384 e 512x512 (todos em PNG com purpose "any maskable")

---

⚙️ 2. SERVICE WORKER

Implementar service worker com:

- Registro correto no arquivo principal da aplicação
- Cache de todos os assets estáticos (JS, CSS, imagens, fontes)
- Estratégia de cache "Cache First" para assets estáticos
- Estratégia "Network First" para chamadas de API
- Fallback para página offline quando sem conexão
- Atualização automática de versão do cache
- Limpeza de caches antigos ao ativar nova versão

---

📱 3. SUPORTE ANDROID

- Implementar detecção automática de dispositivo Android
- Criar banner/modal de instalação com instruções claras
- Utilizar evento "beforeinstallprompt" para oferecer instalação nativa
- Comportamento standalone após instalação (sem barra de navegador)
- Instruções visuais para o usuário instalar o app

---

🍎 4. SUPORTE iOS (Safari)

- Implementar detecção automática de dispositivo iOS/Safari
- Mostrar instruções personalizadas: "Toque em Compartilhar → Adicionar à Tela de Início"
- Adicionar meta tags específicas no index.html:
  * apple-mobile-web-app-capable: "yes"
  * apple-mobile-web-app-status-bar-style: "black-translucent"
  * apple-mobile-web-app-title: "${values.appName}"
  * apple-touch-icon com ícone 180x180

---

🎨 5. UX DE INSTALAÇÃO

- Criar componente modal/banner de instalação
- Detectar se já está instalado (display-mode: standalone)
- Mostrar conteúdo diferente para Android e iOS
- Botão de fechar que lembra a escolha do usuário (localStorage)
- Design integrado com o visual do aplicativo
- Não mostrar novamente se usuário dispensou recentemente

---

✅ 6. REQUISITOS FINAIS OBRIGATÓRIOS

- HTTPS obrigatório (já garantido pelo Lovable)
- Funcionamento como app nativo (tela cheia, sem barra do navegador)
- Ícone de qualidade na tela inicial
- Splash screen personalizada
- Comportamento offline gracioso (mostrar mensagem amigável)
- Performance otimizada (Lighthouse PWA score > 90)

---

📋 CHECKLIST DE IMPLEMENTAÇÃO:

[ ] manifest.json criado e linkado no index.html
[ ] Service worker registrado e funcionando
[ ] Ícones em todos os tamanhos necessários
[ ] Meta tags iOS adicionadas
[ ] Detecção de plataforma implementada
[ ] Modal de instalação criado
[ ] Teste de instalação em dispositivo real

=== FIM DO PROMPT ===
`.trim(),
  },
};

export function EditProjectModal({
  open,
  onOpenChange,
  editType,
  projectName,
  projectType,
  projectContext,
  onComplete,
}: EditProjectModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedPrompt, setAiGeneratedPrompt] = useState<string | null>(null);

  if (!editType) return null;

  const config = editConfigs[editType];
  const Icon = config.icon;

  const handleSubmit = () => {
    const emptyFields = config.fields.filter(f => !values[f.id]?.trim());
    if (emptyFields.length > 0) {
      toast.error('Preencha todos os campos');
      return;
    }

    const prompt = aiGeneratedPrompt || config.promptTemplate(projectName, projectType, values);
    onComplete(prompt);
    setValues({});
    setAiGeneratedPrompt(null);
  };

  const handleCopy = () => {
    const prompt = aiGeneratedPrompt || config.promptTemplate(projectName, projectType, values);
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copiado!');
  };

  const handleGenerateWithAI = async () => {
    const emptyFields = config.fields.filter(f => !values[f.id]?.trim());
    if (emptyFields.length > 0) {
      toast.error('Preencha todos os campos primeiro');
      return;
    }

    setIsGeneratingAI(true);
    setAiGeneratedPrompt(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-edit-prompt', {
        body: {
          editType,
          projectName,
          projectType,
          values,
          projectContext
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setAiGeneratedPrompt(data.prompt);
      toast.success('Prompt gerado com IA!');
    } catch (error) {
      console.error('Error generating AI prompt:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao gerar prompt com IA');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const isPWA = editType === 'make-pwa';

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setValues({});
        setAiGeneratedPrompt(null);
      }
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{config.title}</DialogTitle>
              <DialogDescription>
                {isPWA 
                  ? 'Preencha os campos para gerar o prompt PWA profissional'
                  : 'Preencha os campos para gerar o prompt de atualização'
                }
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.type === 'input' ? (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  disabled={isGeneratingAI}
                />
              ) : (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={values[field.id] || ''}
                  onChange={(e) => setValues({ ...values, [field.id]: e.target.value })}
                  rows={3}
                  disabled={isGeneratingAI}
                />
              )}
            </div>
          ))}
        </div>

        {/* AI Generated Preview */}
        {aiGeneratedPrompt && (
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Prompt gerado com IA
            </div>
            <pre className="whitespace-pre-wrap text-sm bg-muted/50 p-3 rounded-lg max-h-48 overflow-y-auto font-mono text-foreground">
              {aiGeneratedPrompt}
            </pre>
          </div>
        )}

        {isPWA && !aiGeneratedPrompt && (
          <div className="bg-muted/50 border border-border rounded-lg p-3 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">ℹ️ Como usar este prompt</p>
            <p>Este prompt atualiza seu aplicativo para PWA quando colado no Lovable. Copie e cole para implementar.</p>
          </div>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isGeneratingAI}>
            Cancelar
          </Button>
          <Button 
            variant="outline" 
            onClick={handleGenerateWithAI} 
            disabled={isGeneratingAI}
            className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Gerar com IA
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleCopy} className="gap-2" disabled={isGeneratingAI}>
            <Copy className="h-4 w-4" />
            Copiar
          </Button>
          <Button onClick={handleSubmit} disabled={isGeneratingAI}>
            Usar Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
