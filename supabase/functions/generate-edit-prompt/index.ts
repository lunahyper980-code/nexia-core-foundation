import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EditPromptRequest {
  editType: string;
  projectName: string;
  projectType: 'app' | 'site';
  values: Record<string, string>;
  projectContext?: {
    templateId?: string;
    targetAudience?: string;
    mainBenefit?: string;
    pages?: string;
  };
}

const EDIT_TYPE_CONTEXTS: Record<string, string> = {
  'add-function': `Você é um especialista em adicionar novas funcionalidades a projetos web/mobile.
Considere:
- Integração com funcionalidades existentes
- UX/UI consistente com o restante do projeto
- Tratamento de erros e loading states
- Responsividade mobile
- Acessibilidade`,

  'fix-bug': `Você é um especialista em debugging e correção de erros.
Considere:
- Investigar a causa raiz do problema
- Verificar edge cases relacionados
- Adicionar logs para debugging futuro
- Testes de regressão
- Verificar em diferentes browsers/dispositivos`,

  'visual-change': `Você é um especialista em design e UI/UX.
Considere:
- Consistência visual com o design system existente
- Responsividade em todos os tamanhos de tela
- Acessibilidade (contraste, tamanhos de fonte)
- Animações sutis para melhor UX
- Dark mode compatibilidade se aplicável`,

  'adjust-function': `Você é um especialista em refatoração de funcionalidades.
Considere:
- Manter compatibilidade com código existente
- Não quebrar outras funcionalidades
- Melhorar performance se possível
- Documentar mudanças importantes
- Validar inputs do usuário`,

  'integrate-tool': `Você é um especialista em integrações de terceiros.
Considere:
- Segurança: nunca expor API keys no frontend
- Usar edge functions para chamadas seguras
- Tratamento de erros de API
- Rate limiting e retry logic
- Feedback visual para o usuário`,

  'improve-ai': `Você é um especialista em implementação de IA.
Considere:
- Usar Lovable AI com o modelo google/gemini-2.5-flash
- Implementar streaming para melhor UX
- Loading states enquanto IA processa
- Tratamento de erros de rate limit (429)
- Cache de respostas quando apropriado`,

  'refactor-code': `Você é um especialista em clean code e arquitetura.
Considere:
- Componentes pequenos e reutilizáveis
- Separação de responsabilidades
- Custom hooks para lógica reutilizável
- Tipagem TypeScript adequada
- Performance com memoization quando necessário`,

  'optimize': `Você é um especialista em performance web.
Considere:
- Code splitting e lazy loading
- Otimização de imagens
- Memoization de componentes caros
- Debounce/throttle em inputs
- Queries otimizadas ao banco`,

  'change-images': `Você é um especialista em assets e mídia.
Considere:
- Formatos otimizados (WebP, AVIF)
- Tamanhos adequados para cada uso
- Lazy loading de imagens
- Alt text para acessibilidade
- Placeholder durante carregamento`,

  'make-pwa': `Você é um especialista em Progressive Web Apps.
Considere:
- Manifest.json completo com ícones
- Service worker para cache
- Prompt de instalação iOS/Android
- Funcionamento offline
- Ícones para todas as plataformas`
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { editType, projectName, projectType, values, projectContext } = await req.json() as EditPromptRequest;

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurado');
    }

    const editContext = EDIT_TYPE_CONTEXTS[editType] || 'Você é um especialista em desenvolvimento web.';
    
    const projectTypeLabel = projectType === 'app' ? 'aplicativo' : 'site';
    
    // Build user prompt with all context
    let userPrompt = `Gere um prompt detalhado e técnico para o Lovable fazer a seguinte modificação:

## Projeto
- Nome: ${projectName}
- Tipo: ${projectTypeLabel}`;

    if (projectContext?.templateId) {
      userPrompt += `\n- Template: ${projectContext.templateId}`;
    }
    if (projectContext?.targetAudience) {
      userPrompt += `\n- Público-alvo: ${projectContext.targetAudience}`;
    }
    if (projectContext?.mainBenefit) {
      userPrompt += `\n- Benefício principal: ${projectContext.mainBenefit}`;
    }
    if (projectContext?.pages) {
      userPrompt += `\n- Páginas: ${projectContext.pages}`;
    }

    userPrompt += `\n\n## Tipo de Edição: ${editType}\n\n## Detalhes fornecidos pelo usuário:`;

    for (const [key, value] of Object.entries(values)) {
      if (value && value.trim()) {
        userPrompt += `\n- ${key}: ${value}`;
      }
    }

    userPrompt += `\n\n## Instruções
Gere um prompt completo em português para o Lovable executar essa tarefa.
O prompt deve:
1. Ser claro e específico sobre O QUE fazer
2. Incluir instruções técnicas detalhadas de COMO fazer
3. Mencionar boas práticas relevantes
4. Considerar edge cases importantes
5. Ser direto e acionável

Retorne APENAS o prompt, sem explicações adicionais.`;

    console.log('Calling Lovable AI for edit prompt generation...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: `${editContext}

Você gera prompts otimizados para o Lovable (uma plataforma de desenvolvimento com IA).
Seus prompts devem ser:
- Técnicos mas claros
- Em português brasileiro
- Focados em resultado
- Com instruções específicas e acionáveis
- Considerando boas práticas de desenvolvimento web moderno`
          },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns segundos.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos à sua conta.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    const generatedPrompt = data.choices?.[0]?.message?.content;

    if (!generatedPrompt) {
      throw new Error('Resposta vazia da IA');
    }

    console.log('Successfully generated edit prompt');

    return new Response(
      JSON.stringify({ prompt: generatedPrompt.trim() }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-edit-prompt:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
