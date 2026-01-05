import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getDemoModePrompt(demoMode: boolean): string {
  if (!demoMode) return '';
  
  return `
IMPORTANTE - MODO DEMONSTRAÇÃO:
Os dados podem estar incompletos ou genéricos. Gere uma resposta COMPLETA e PROFISSIONAL.
- Mantenha 100% da estrutura
- Use tom profissional
- Inclua avisos sutis como "Com base nas informações disponíveis..."
- NUNCA gere erros ou interrompa
- Gere conteúdo plausível e profissional
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { demoMode = false, ...briefingData } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const demoPrompt = getDemoModePrompt(demoMode);

    const systemPrompt = `Você é um consultor de negócios digitais. Analise o briefing fornecido e gere uma análise inteligente.
${demoPrompt}

Responda SEMPRE em JSON válido com a seguinte estrutura:
{
  "maturity_level": "iniciante | básico | intermediário | avançado",
  "main_pains": "Resumo das principais dores identificadas (2-3 frases)",
  "opportunities": "Principais oportunidades de melhoria (2-3 frases)",
  "intelligent_summary": "Resumo executivo completo da análise (3-4 parágrafos)",
  "recommended_solution": "site | app | posicionamento | processos | autoridade | kit_lancamento",
  "priority_actions": ["ação 1", "ação 2", "ação 3"]
}`;

    const userPrompt = `Analise este briefing de negócio:

**Dados do Negócio:**
- Nome: ${briefingData.company_name || 'Empresa demonstração'}
- Localização: ${briefingData.location || 'Não informada'}
- Segmento: ${briefingData.segment || 'Não informado'}
- Tempo de atuação: ${briefingData.time_in_business || 'Não informado'}
- Tamanho: ${briefingData.company_size || 'Não informado'}

**Presença Digital:**
- Possui site: ${briefingData.has_website ? 'Sim' : 'Não'}
- Redes sociais: ${briefingData.social_networks?.join(', ') || 'Nenhuma'}
- Canal principal: ${briefingData.main_contact_channel || 'Não informado'}
- Tipo de atendimento: ${briefingData.service_type || 'Não informado'}

**Situação Atual:**
- Principal dificuldade: ${briefingData.main_difficulty || 'Não informada'}
- Onde perde clientes: ${briefingData.where_loses_clients || 'Não informado'}
- Principal gargalo: ${briefingData.main_bottleneck || 'Não informado'}

**Objetivos:**
- O que deseja melhorar: ${briefingData.what_to_improve || 'Não informado'}
- Prioridade principal: ${briefingData.main_priority || 'Não informada'}
- Interesses: ${briefingData.interests?.join(', ') || 'Nenhum especificado'}

Gere uma análise profissional e objetiva.`;

    console.log('Generating briefing analysis for:', briefingData.company_name, 'Demo mode:', demoMode);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      result = { 
        maturity_level: 'básico',
        main_pains: 'Análise não disponível',
        opportunities: 'Análise não disponível',
        intelligent_summary: content,
        recommended_solution: 'diagnostico',
        priority_actions: []
      };
    }

    console.log('Briefing analysis generated successfully');

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating briefing analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
