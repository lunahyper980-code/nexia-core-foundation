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
  return `generate-leads_${hash}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nicho, cidade, possuiSite, possuiInstagram, forceRegenerate } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const payload = { nicho, cidade, possuiSite, possuiInstagram };

    // Check cache
    const cacheKey = getCacheKey(payload);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached leads');
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log(`Generating leads for: ${nicho} in ${cidade}`);

    const prompt = `Você é um especialista em negócios locais brasileiros. Gere lista de empresas PLAUSÍVEIS.

REGRAS CRÍTICAS:
- NUNCA INVENTE TELEFONE - sempre null
- NUNCA INVENTE URLS - linkPublico sempre null
- NUNCA INVENTE ENDEREÇOS ESPECÍFICOS - apenas bairros/regiões

NICHO: ${nicho}
CIDADE: ${cidade}
${possuiSite ? 'Filtro: empresas que provavelmente têm site' : ''}
${possuiInstagram ? 'Filtro: empresas que provavelmente têm Instagram' : ''}

Gere 6-10 leads. Retorne JSON:
{
  "leads": [
    {
      "nome": "Nome plausível da empresa",
      "segmento": "Segmento específico",
      "localizacao": "Cidade, Estado",
      "endereco": "Bairro/Região ou null",
      "telefone": null,
      "telefonePublico": false,
      "temSite": true/false,
      "temInstagram": true/false,
      "linkPublico": null,
      "confiancaNome": "alta|media|baixa"
    }
  ]
}`;

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
      throw new Error('Erro ao comunicar com IA');
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    let leads = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        leads = parsed.leads || [];
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      leads = [];
    }

    // Sanitize leads - NEVER trust AI-generated data
    leads = leads.map((lead: any, index: number) => {
      const validFields = [
        lead.nome && lead.nome.length > 2,
        lead.localizacao && lead.localizacao.length > 2,
        lead.segmento && lead.segmento.length > 2,
        lead.endereco && lead.endereco.length > 2,
      ].filter(Boolean).length;

      return {
        id: `lead-${Date.now()}-${index}`,
        nome: lead.nome || 'Empresa não identificada',
        segmento: lead.segmento || 'Não especificado',
        localizacao: lead.localizacao || cidade,
        endereco: lead.endereco || null,
        telefone: null, // ALWAYS null
        telefonePublico: false,
        temSite: Boolean(lead.temSite),
        temInstagram: Boolean(lead.temInstagram),
        linkPublico: null, // ALWAYS null
        confiancaNome: ['alta', 'media', 'baixa'].includes(lead.confiancaNome) 
          ? lead.confiancaNome 
          : 'media',
        validado: validFields >= 2,
      };
    });

    const validatedLeads = leads.filter((l: any) => l.validado);
    const unvalidatedLeads = leads.filter((l: any) => !l.validado);

    const cleanLeads = validatedLeads.map(({ validado, ...rest }: any) => rest);
    const cleanUnvalidated = unvalidatedLeads.map(({ validado, ...rest }: any) => rest);

    const result = { leads: cleanLeads, leadsNaoConfirmados: cleanUnvalidated };

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-leads:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
