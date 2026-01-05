import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  return `generate-launch-kit_${hash}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, businessType, segment, location, mainChannel, objective, deadline, urgency, forceRegenerate } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const payload = { businessName, businessType, segment, location, mainChannel, objective, deadline, urgency };

    // Check cache
    const cacheKey = getCacheKey(payload);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached launch kit');
        return new Response(JSON.stringify({ success: true, data: cached.data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const prompt = `Você é um estrategista de lançamentos digitais.

NEGÓCIO: ${businessName}
TIPO: ${businessType}
SEGMENTO: ${segment}
LOCAL: ${location || 'Não informada'}
CANAL: ${mainChannel}
OBJETIVO: ${objective}
PRAZO: ${deadline}
URGÊNCIA: ${urgency}

Crie kit de lançamento prático e executável focado em ${objective.toLowerCase()}.

Retorne JSON válido:
{
  "estrutura_lancamento": "2-3 parágrafos sobre estrutura",
  "sequencia_acoes": {
    "pre_lancamento": ["ação 1", "ação 2", "ação 3"],
    "durante": ["ação 1", "ação 2", "ação 3"],
    "pos_lancamento": ["ação 1", "ação 2", "ação 3"]
  },
  "ideia_oferta": "Descrição da oferta sugerida",
  "mensagens_divulgacao": {
    "teaser": "Mensagem teaser",
    "lancamento": "Mensagem principal",
    "urgencia": "Mensagem de urgência"
  },
  "checklist_execucao": ["item 1", "item 2", "item 3", "item 4", "item 5", "item 6", "item 7", "item 8"]
}`;

    console.log('Generating launch kit for:', businessName);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 2000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      result = { raw_content: content };
    }

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

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
