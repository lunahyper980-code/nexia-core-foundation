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
    const { businessName, businessType, segment, location, mainChannel, objective, deadline, urgency } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é um estrategista de lançamentos digitais. Sua função é criar um plano de lançamento simples, prático e executável para negócios em início ou novas ofertas.

Você NÃO faz diagnósticos. Você EXECUTA com base nas informações fornecidas.

Responda SEMPRE em JSON válido com a seguinte estrutura:
{
  "estrutura_lancamento": "Descrição da estrutura do lançamento em 2-3 parágrafos",
  "sequencia_acoes": {
    "pre_lancamento": ["ação 1", "ação 2", "ação 3"],
    "durante": ["ação 1", "ação 2", "ação 3"],
    "pos_lancamento": ["ação 1", "ação 2", "ação 3"]
  },
  "ideia_oferta": "Descrição da oferta inicial sugerida",
  "mensagens_divulgacao": {
    "teaser": "Mensagem de teaser para antes do lançamento",
    "lancamento": "Mensagem principal do lançamento",
    "urgencia": "Mensagem de urgência/escassez"
  },
  "checklist_execucao": ["item 1", "item 2", "item 3", "item 4", "item 5", "item 6", "item 7", "item 8"]
}`;

    const userPrompt = `Crie um kit de lançamento digital para:

**Negócio:** ${businessName}
**Tipo:** ${businessType}
**Segmento:** ${segment}
**Localização:** ${location || 'Não informada'}
**Canal principal:** ${mainChannel}
**Objetivo do lançamento:** ${objective}
**Prazo desejado:** ${deadline}
**Nível de urgência:** ${urgency}

Gere um plano de lançamento simples, prático e executável focado em ${objective.toLowerCase()}.`;

    console.log('Generating launch kit for:', businessName);

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

    console.log('Launch kit generated successfully');

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating launch kit:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ success: false, error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
