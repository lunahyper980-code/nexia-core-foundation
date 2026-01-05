import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Simple cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getCacheKey(payload: any): string {
  const str = JSON.stringify(payload);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return `generate-positioning_${hash}`;
}

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
    const { positioningData, forceRegenerate } = await req.json() as { 
      positioningData: PositioningData;
      forceRegenerate?: boolean;
    };
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Check cache
    const cacheKey = getCacheKey(positioningData);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached positioning');
        return new Response(JSON.stringify({ positioning: JSON.stringify(cached.data) }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const objectivesText = positioningData.objectives.length > 0 
      ? positioningData.objectives.join(', ') 
      : 'Não especificado';

    const prompt = `Você é um especialista em posicionamento de marca.

EMPRESA: ${positioningData.companyName}
SEGMENTO: ${positioningData.segment || 'Não informado'}
LOCAL: ${positioningData.cityState || 'Não informada'}
PÚBLICO: ${positioningData.targetAudience || 'Não informado'}
PRODUTO: ${positioningData.mainProductService || 'Não informado'}
DIFERENCIAL: ${positioningData.businessDifferential || 'Não informado'}
OBJETIVOS: ${objectivesText}
OBS: ${positioningData.observations || 'Nenhuma'}

Retorne JSON (sem markdown):
{
  "posicionamento_central": "2-3 parágrafos sobre essência da marca",
  "tom_comunicacao": "Como a marca deve se comunicar",
  "bio_instagram": "Bio de até 150 caracteres",
  "frase_autoridade": "Frase impactante de posicionamento",
  "cta_sugerido": "Call-to-action principal",
  "diretrizes_conteudo": "O que postar e evitar"
}

REGRAS: Sem bullets, hashtags ou marcadores. Parágrafos naturais.`;

    console.log('Generating positioning for:', positioningData.companyName);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    let generatedPositioning = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedPositioning) {
      throw new Error('No positioning generated');
    }

    // Clean response
    generatedPositioning = generatedPositioning
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .replace(/```/g, '')
      .trim();

    // Cache result
    try {
      const parsed = JSON.parse(generatedPositioning);
      cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
    } catch {
      // If not valid JSON, still return it
    }

    console.log('Positioning generated successfully');

    return new Response(JSON.stringify({ positioning: generatedPositioning }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-positioning:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar posicionamento';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
