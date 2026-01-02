import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PositioningData {
  companyName: string;
  segment: string;
  cityState: string;
  targetAudience: string;
  mainProductService: string;
  businessDifferential: string;
  objectives: string[];
  observations: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { positioningData } = await req.json() as { positioningData: PositioningData };
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const objectivesText = positioningData.objectives.length > 0 
      ? positioningData.objectives.join(', ') 
      : 'Não especificado';

    const contextPrompt = `
Você é um especialista em posicionamento de marca e marketing digital.
Sua tarefa é criar um posicionamento digital profissional e completo para uma empresa.

DADOS DA EMPRESA:
- Nome: ${positioningData.companyName}
- Segmento/Nicho: ${positioningData.segment || 'Não informado'}
- Localização: ${positioningData.cityState || 'Não informada'}
- Público-alvo: ${positioningData.targetAudience || 'Não informado'}
- Principal produto/serviço: ${positioningData.mainProductService || 'Não informado'}
- Diferencial do negócio: ${positioningData.businessDifferential || 'Não informado'}
- Objetivos do posicionamento: ${objectivesText}
- Observações adicionais: ${positioningData.observations || 'Nenhuma'}

RETORNE UM JSON com exatamente esta estrutura (sem markdown, apenas JSON puro):
{
  "posicionamento_central": "Texto em parágrafos naturais sobre a essência da marca, o que faz, para quem e qual valor entrega. Use 2-3 parágrafos.",
  "tom_comunicacao": "Descrição em texto corrido de como a marca deve se comunicar, com exemplos práticos em linguagem natural.",
  "bio_instagram": "Bio de até 150 caracteres, profissional e clara.",
  "frase_autoridade": "Uma frase impactante que posicione a empresa como referência no segmento.",
  "cta_sugerido": "Um call-to-action principal em texto natural.",
  "diretrizes_conteudo": "Texto corrido explicando o que postar e o que evitar, em parágrafos naturais sem listas."
}

REGRAS IMPORTANTES:
- NÃO use hashtags (#), bullets (•), hífens (-) ou asteriscos (**)
- NÃO use listas numeradas ou com marcadores
- Escreva tudo em parágrafos corridos e naturais
- Use linguagem simples, profissional e direta
- Retorne APENAS o JSON, sem texto adicional
- Escreva em português brasileiro
`;


    console.log('Generating positioning for:', positioningData.companyName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em posicionamento de marca e marketing digital para pequenas e médias empresas brasileiras.' },
          { role: 'user', content: contextPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos para continuar.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let generatedPositioning = data.choices?.[0]?.message?.content;

    if (!generatedPositioning) {
      throw new Error('No positioning generated');
    }

    // Clean any code block markers from the response
    generatedPositioning = generatedPositioning
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log('Positioning generated successfully');

    return new Response(JSON.stringify({ positioning: generatedPositioning }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-positioning function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar posicionamento';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
