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
  return `generate-authority-strategy_${hash}`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { businessName, segment, mainChannel, frequency, objective, targetAudience, forceRegenerate, demoMode = false } = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const payload = { businessName, segment, mainChannel, frequency, objective, targetAudience };
    
    // Check cache (skip in demo mode)
    const cacheKey = getCacheKey(payload);
    if (!forceRegenerate && !demoMode) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached authority strategy');
        return new Response(JSON.stringify({ success: true, data: cached.data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const demoModePrompt = demoMode ? `
IMPORTANTE - MODO DEMONSTRAÇÃO:
Os dados podem estar incompletos ou genéricos. Gere uma resposta COMPLETA e PROFISSIONAL.
- Mantenha 100% da estrutura
- Use tom profissional
- Inclua avisos sutis como "Com base nas informações disponíveis..."
- NUNCA gere erros ou interrompa
- Gere conteúdo plausível e profissional
` : '';

    const prompt = `Você é um estrategista de presença e autoridade digital, especializado em criar planos executáveis para negócios locais e prestadores de serviço.
${demoModePrompt}

NEGÓCIO: ${businessName || 'Empresa demonstração'}
SEGMENTO: ${segment || 'Serviços'}
CANAL PRINCIPAL: ${mainChannel || 'Instagram'}
FREQUÊNCIA DE POSTAGEM: ${frequency || '3x por semana'}
OBJETIVO: ${objective || 'Aumentar autoridade'}
PÚBLICO-ALVO: ${targetAudience || 'Público local'}

Crie um PLANO ESTRATÉGICO EXECUTÁVEL de autoridade e reconhecimento digital focado em ${(objective || 'aumentar autoridade').toLowerCase()}.

REGRAS OBRIGATÓRIAS:
- Use linguagem simples e profissional (sem termos técnicos)
- Conecte autoridade com geração de conversas no WhatsApp
- Defina métricas mínimas de sucesso
- Defina prioridade de execução
- O plano deve ser executável por qualquer pessoa sem conhecimento técnico

Retorne JSON válido com esta estrutura exata:
{
  "objetivo_autoridade": "1 parágrafo descrevendo o objetivo principal de reconhecimento e qual resultado prático ele deve gerar (ex: conversas qualificadas, autoridade local, confiança). Conecte com WhatsApp como canal de conversão.",
  
  "estrategia_reconhecimento": {
    "canal_principal": "Nome do canal onde será construída a autoridade",
    "canal_conversao": "WhatsApp ou outro canal de conversão direta",
    "frequencia_minima": "Ex: 3 posts por semana + 5 stories por dia",
    "horizonte_resultado": "30, 60 ou 90 dias com explicação do que esperar",
    "metrica_sucesso": "Ex: 10 conversas qualificadas por semana no WhatsApp"
  },
  
  "diretrizes_posicionamento": {
    "publico_central": "Descrição clara de quem é o cliente ideal",
    "promessa_principal": "O que a marca promete entregar",
    "diferencial": "O que diferencia dos concorrentes",
    "tom_comunicacao": "Como a marca deve se comunicar",
    "mensagem_chave": "Frase principal que resume a marca"
  },
  
  "ideias_conteudo": [
    {
      "tipo": "Tipo de conteúdo (ex: Carrossel, Vídeo curto, Story, Post)",
      "titulo_sugerido": "Título ou gancho do conteúdo",
      "objetivo_estrategico": "alcance, autoridade, conversa ou conversão",
      "onde_publicar": "Instagram Feed, Stories, Reels, etc",
      "call_to_action": "Ação que o público deve tomar (ex: Chama no WhatsApp)"
    }
  ],
  
  "checklist_execucao": {
    "semana_1": [
      "Ação específica e executável",
      "Ação específica e executável",
      "Ação específica e executável"
    ],
    "semana_2": [
      "Ação específica e executável",
      "Ação específica e executável",
      "Ação específica e executável"
    ],
    "semana_3": [
      "Ação específica e executável",
      "Ação específica e executável",
      "Ação específica e executável"
    ]
  }
}

IMPORTANTE: Gere pelo menos 6 ideias de conteúdo variadas. O checklist deve ter ações práticas e sequenciais.`;

    console.log('Generating authority strategy for:', businessName);

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
