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
  return `nexia-ai_${hash}`;
}

interface PlanningData {
  name: string;
  company_name: string;
  sector_niche: string;
  company_size: string;
  average_ticket: string;
  location_region: string;
  main_products_services: string;
  target_audience: string;
  initial_objective: string;
  sales_method: string;
  acquisition_channels: string[];
  has_team: string;
  results_measurement: string;
  competitive_differential: string;
  main_challenges: string;
  growth_bottlenecks: string;
  growth_blockers: string;
  goal_3_months: string;
  goal_12_months: string;
  urgency_level: number;
  marketing_structure_rating: number;
  sales_structure_rating: number;
  digital_organization_rating: number;
  positioning_clarity_rating: number;
  focus_area: string;
  diagnosis_text: string;
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  micro: "Microempresa",
  pequena: "Pequena empresa",
  media: "Média empresa",
  grande: "Grande empresa",
};

const SALES_METHOD_LABELS: Record<string, string> = {
  presencial: "Presencial",
  whatsapp: "WhatsApp",
  ecommerce: "E-commerce",
  representantes: "Representantes",
  misto: "Múltiplos canais",
  outros: "Outros",
};

const TEAM_LABELS: Record<string, string> = {
  nao: "Não possui equipe",
  interna: "Equipe interna",
  terceirizada: "Equipe terceirizada",
  mista: "Equipe mista",
};

const CHANNEL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google_ads: "Google Ads",
  trafego_pago: "Tráfego pago",
  whatsapp: "WhatsApp",
  indicacao: "Indicação",
  email: "E-mail",
  nenhum: "Nenhum",
};

const FOCUS_AREA_LABELS: Record<string, string> = {
  marketing: "Marketing",
  comercial: "Comercial",
  operacional: "Operacional",
  produto: "Produto",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planningData, forceRegenerate } = await req.json() as { 
      planningData: PlanningData;
      forceRegenerate?: boolean;
    };
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Check cache
    const cacheKey = getCacheKey(planningData);
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached strategy');
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Generating strategy for:', planningData.company_name);

    const channels = planningData.acquisition_channels
      ?.map(c => CHANNEL_LABELS[c] || c)
      .join(", ") || "Não informado";

    const contextPrompt = `
Você é um estrategista de marketing. Crie uma ESTRATÉGIA COMPLETA com TAREFAS ACIONÁVEIS.

## DADOS
**Empresa:** ${planningData.company_name}
**Setor:** ${planningData.sector_niche}
**Tamanho:** ${COMPANY_SIZE_LABELS[planningData.company_size] || planningData.company_size}
**Ticket:** ${planningData.average_ticket}
**Local:** ${planningData.location_region}
**Serviços:** ${planningData.main_products_services}
**Público:** ${planningData.target_audience}
**Objetivo:** ${planningData.initial_objective}
**Foco:** ${FOCUS_AREA_LABELS[planningData.focus_area] || planningData.focus_area || "Não definida"}
**Vendas:** ${SALES_METHOD_LABELS[planningData.sales_method] || planningData.sales_method}
**Canais:** ${channels}
**Equipe:** ${TEAM_LABELS[planningData.has_team] || planningData.has_team}
**Desafios:** ${planningData.main_challenges || "Não informado"}
**Meta 3m:** ${planningData.goal_3_months || "Não informado"}
**Meta 12m:** ${planningData.goal_12_months || "Não informado"}
**Diagnóstico:** ${planningData.diagnosis_text || "Não disponível"}

---

Retorne JSON VÁLIDO (sem markdown):
{
  "strategy_summary": "Estratégia central (máx 500 palavras)",
  "objectives": [
    {"name": "Nome objetivo", "description": "Descrição", "area": "marketing|comercial|digital|operacional"}
  ],
  "tasks": [
    {"title": "Título", "objective": "Objetivo", "description": "Descrição", "steps": ["Passo 1", "Passo 2"], "completion_criteria": "Critério", "area": "marketing|comercial|web|social|trafego|automacao", "objective_name": "Nome objetivo relacionado"}
  ]
}

REGRAS: 3-6 objetivos, 6-12 tarefas, 3-7 passos por tarefa, específico para este negócio.`;

    console.log('Calling Gemini API...');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: contextPrompt }] }],
        generationConfig: { maxOutputTokens: 4000, temperature: 0.7 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erro ao gerar estratégia.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    let responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!responseText) {
      throw new Error('No strategy generated');
    }

    // Clean response
    responseText = responseText.trim();
    if (responseText.startsWith('```json')) responseText = responseText.slice(7);
    else if (responseText.startsWith('```')) responseText = responseText.slice(3);
    if (responseText.endsWith('```')) responseText = responseText.slice(0, -3);
    responseText = responseText.trim();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Erro ao processar resposta. Tente novamente.');
    }

    if (!result.strategy_summary || !result.objectives || !result.tasks) {
      throw new Error('Resposta incompleta. Tente novamente.');
    }

    console.log('Strategy generated:', result.objectives.length, 'objectives,', result.tasks.length, 'tasks');

    // Cache result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nexia-ai:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
