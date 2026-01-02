import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosisData {
  companyName: string;
  segment: string;
  cityState: string;
  hasWebsite: boolean;
  socialNetworks: string[];
  mainObjective: string;
  onlinePresenceRating: number;
  digitalCommunicationRating: number;
  contactEaseRating: number;
  professionalismRating: number;
  mainProblemPerceived: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Muito fraco',
  2: 'Fraco',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosisData } = await req.json() as { diagnosisData: DiagnosisData };
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating diagnosis for:', diagnosisData.companyName);

    const socialNetworksText = diagnosisData.socialNetworks.length > 0 
      ? diagnosisData.socialNetworks.join(', ') 
      : 'Nenhuma';

    const contextPrompt = `
Você é um consultor de marketing digital especializado em empresas locais brasileiras.
Gere um diagnóstico digital profissional, objetivo e acionável para a empresa abaixo.

DADOS DA EMPRESA:
- Nome: ${diagnosisData.companyName}
- Segmento: ${diagnosisData.segment}
- Localização: ${diagnosisData.cityState}
- Possui site: ${diagnosisData.hasWebsite ? 'Sim' : 'Não'}
- Redes sociais: ${socialNetworksText}
- Objetivo principal: ${diagnosisData.mainObjective}

AVALIAÇÃO (escala 1-5):
- Presença online: ${diagnosisData.onlinePresenceRating}/5 (${RATING_LABELS[diagnosisData.onlinePresenceRating]})
- Comunicação digital: ${diagnosisData.digitalCommunicationRating}/5 (${RATING_LABELS[diagnosisData.digitalCommunicationRating]})
- Facilidade de contato: ${diagnosisData.contactEaseRating}/5 (${RATING_LABELS[diagnosisData.contactEaseRating]})
- Profissionalismo percebido: ${diagnosisData.professionalismRating}/5 (${RATING_LABELS[diagnosisData.professionalismRating]})

PRINCIPAL PROBLEMA PERCEBIDO:
${diagnosisData.mainProblemPerceived}

RETORNE UM JSON com exatamente esta estrutura (sem markdown, apenas JSON puro):
{
  "visao_geral": "Análise em 2-3 parágrafos sobre o estado atual da presença digital da empresa, escrito de forma natural e fluida.",
  "pontos_atencao": "Texto corrido explicando os 3-4 pontos críticos que precisam de atenção imediata, em parágrafos naturais.",
  "oportunidades": "Texto corrido com 3-4 oportunidades concretas de melhoria, explicadas em linguagem natural.",
  "recomendacoes": "Texto com 4-5 ações práticas e específicas, escritas de forma natural em parágrafos.",
  "proximo_passo": "Uma recomendação clara e direta do primeiro passo que a empresa deve dar."
}

REGRAS IMPORTANTES:
- NÃO use hashtags (#), bullets (•), hífens (-) ou asteriscos (**)
- NÃO use listas numeradas ou com marcadores
- Escreva tudo em parágrafos corridos e naturais
- Use linguagem simples e profissional, sem jargões técnicos
- Seja específico e acionável
- Mantenha o tom positivo mas realista
- Retorne APENAS o JSON, sem texto adicional
`;


    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um consultor de marketing digital experiente, especializado em ajudar pequenas e médias empresas brasileiras a melhorar sua presença online.' },
          { role: 'user', content: contextPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao seu workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let diagnosisText = data.choices?.[0]?.message?.content;

    if (!diagnosisText) {
      throw new Error('No diagnosis generated');
    }

    // Clean any code block markers from the response
    diagnosisText = diagnosisText
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log('Diagnosis generated successfully');

    return new Response(JSON.stringify({ diagnosisText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in generate-diagnosis function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
