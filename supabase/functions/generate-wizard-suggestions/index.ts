import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Field {
  id: string;
  label: string;
  currentValue?: string;
}

interface RequestBody {
  projectType: 'app' | 'site';
  step?: number;
  fields?: Field[];
  context: Record<string, any>;
  // Single field mode
  mode?: 'single-field';
  fieldId?: string;
  fieldLabel?: string;
}

interface Suggestion {
  id: string;
  fieldId: string;
  title: string;
  description: string;
  value: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json() as RequestBody;
    const { projectType, context, mode, fieldId, fieldLabel, step, fields } = body;
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Build context description
    const contextDescription = Object.entries(context || {})
      .filter(([_, value]) => value)
      .map(([key, value]) => `- ${key}: ${value}`)
      .join('\n');

    const projectTypeLabel = projectType === 'app' ? 'aplicativo/SaaS' : 'site/página web';

    // Single field mode - simpler, faster response
    if (mode === 'single-field' && fieldId && fieldLabel) {
      console.log('Single field mode for:', fieldId, fieldLabel);

      const systemPrompt = `Você é um especialista em criação de ${projectTypeLabel}s. 
Gere 3 sugestões curtas e variadas para o campo solicitado.

REGRAS:
1. Cada sugestão deve ter no máximo 60 caracteres
2. Sugestões devem ser específicas e não genéricas
3. Considere o contexto já preenchido
4. Use linguagem profissional e direta`;

      const userPrompt = `Contexto do projeto:
${contextDescription || 'Novo projeto'}

Campo para sugerir: "${fieldLabel}"

Responda APENAS com um JSON:
{
  "suggestions": [
    {"id": "1", "value": "sugestão curta 1"},
    {"id": "2", "value": "sugestão curta 2"},
    {"id": "3", "value": "sugestão curta 3"}
  ]
}`;

      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-3-flash-preview',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.9,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Gateway error:', response.status, errorText);
        
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Limite de requisições atingido.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Créditos insuficientes.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        throw new Error(`AI Gateway error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const content = aiResponse.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content in AI response');
      }

      let jsonContent = content;
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1];
      }

      const parsed = JSON.parse(jsonContent.trim());
      const suggestions = (parsed.suggestions || []).slice(0, 3);

      console.log(`Generated ${suggestions.length} single-field suggestions`);

      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Multi-field mode (legacy)
    if (!fields || fields.length === 0) {
      return new Response(JSON.stringify({ suggestions: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Build fields description
    const fieldsDescription = fields
      .map(f => `- Campo "${f.label}" (id: ${f.id})${f.currentValue ? ` [valor atual: ${f.currentValue}]` : ''}`)
      .join('\n');

    const systemPrompt = `Você é um especialista em criação de ${projectTypeLabel}s profissionais. 
Sua tarefa é gerar sugestões criativas e úteis para ajudar o usuário a preencher os campos do formulário.

REGRAS IMPORTANTES:
1. Gere 1 a 3 sugestões DIFERENTES para cada campo solicitado
2. As sugestões devem ser específicas, não genéricas
3. Considere o contexto já preenchido pelo usuário
4. Use linguagem profissional e clara
5. Para ${projectType === 'app' ? 'apps, foque em funcionalidades, escalabilidade e UX' : 'sites, foque em conversão, clareza e impacto visual'}
6. Varie o tom e abordagem entre as sugestões
7. Cada sugestão deve ter um título curto (máx 50 caracteres) e uma descrição explicativa`;

    const userPrompt = `Gere sugestões para um ${projectTypeLabel}.

CONTEXTO JÁ PREENCHIDO:
${contextDescription || 'Nenhum contexto fornecido ainda.'}

CAMPOS QUE PRECISAM DE SUGESTÕES:
${fieldsDescription}

Responda APENAS com um JSON válido no seguinte formato:
{
  "suggestions": [
    {
      "id": "unique-id-1",
      "fieldId": "campo-id",
      "title": "Título curto da sugestão",
      "description": "Descrição explicando por que essa é uma boa opção",
      "value": "O valor completo que será preenchido no campo"
    }
  ]
}

Gere de 1 a 3 sugestões variadas para CADA campo listado.`;

    console.log('Generating suggestions for', projectType, 'step', step);
    console.log('Fields:', fields.map(f => f.id).join(', '));

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições atingido. Tente novamente em alguns segundos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos de IA insuficientes.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response received, parsing...');

    // Parse JSON from response (handle markdown code blocks)
    let jsonContent = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonContent = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonContent.trim());
    
    // Validate and clean suggestions
    const suggestions: Suggestion[] = (parsed.suggestions || [])
      .filter((s: any) => s.id && s.fieldId && s.title && s.value)
      .map((s: any, index: number) => ({
        id: s.id || `suggestion-${index}`,
        fieldId: s.fieldId,
        title: s.title.substring(0, 60),
        description: s.description || '',
        value: s.value
      }));

    console.log(`Generated ${suggestions.length} suggestions`);

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro ao gerar sugestões' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
