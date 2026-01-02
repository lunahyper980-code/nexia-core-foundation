import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, segment, mainChannel, frequency, objective, targetAudience } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é um estrategista de presença e autoridade digital. Sua função é criar estratégias de reconhecimento e autoridade orgânica para marcas que ainda não são conhecidas.

Você NÃO faz diagnósticos. Você EXECUTA estratégias com base nas informações fornecidas.

Responda SEMPRE em JSON válido com a seguinte estrutura:
{
  "estrategia_reconhecimento": "Descrição da estratégia de reconhecimento em 2-3 parágrafos",
  "diretrizes_posicionamento": [
    "diretriz 1",
    "diretriz 2",
    "diretriz 3",
    "diretriz 4"
  ],
  "ideias_conteudo": [
    {
      "tipo": "tipo de conteúdo",
      "descricao": "descrição do conteúdo",
      "objetivo": "objetivo específico"
    }
  ],
  "checklist_acoes_organicas": ["ação 1", "ação 2", "ação 3", "ação 4", "ação 5", "ação 6", "ação 7", "ação 8"]
}`;

    const userPrompt = `Crie uma estratégia de autoridade e reconhecimento digital para:

**Negócio:** ${businessName}
**Segmento:** ${segment}
**Canal principal:** ${mainChannel}
**Frequência de presença:** ${frequency}
**Objetivo de autoridade:** ${objective}
**Público-alvo:** ${targetAudience || 'Não informado'}

Gere uma estratégia completa focada em ${objective.toLowerCase()}, sem tráfego pago, apenas ações orgânicas.`;

    console.log('Generating authority strategy for:', businessName);

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

    // Parse JSON from response
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
      result = { raw_content: content };
    }

    console.log('Authority strategy generated successfully');

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating authority strategy:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
