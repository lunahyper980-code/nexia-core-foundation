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
  return `nexia-diagnosis_${hash}`;
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
  has_website?: boolean;
  has_social_media?: boolean;
  main_contact_channel?: string;
  biggest_problem?: string;
  wants_more_clients?: boolean;
  attendance_is_manual?: boolean;
}

const COMPANY_SIZE_LABELS: Record<string, string> = {
  micro: "Microempresa (até 9 funcionários)",
  pequena: "Pequena empresa (10-49 funcionários)",
  media: "Média empresa (50-249 funcionários)",
  grande: "Grande empresa (250+ funcionários)",
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

const MEASUREMENT_LABELS: Record<string, string> = {
  nao_mede: "Não mede resultados",
  planilha: "Planilha",
  crm: "CRM",
  ferramentas: "Ferramentas digitais",
  intuicao: "Intuição",
};

const RATING_LABELS: Record<number, string> = {
  1: "Muito baixo",
  2: "Baixo",
  3: "Médio",
  4: "Bom",
  5: "Excelente",
};

const CHANNEL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  google_ads: "Google Ads",
  trafego_pago: "Tráfego pago (outros)",
  whatsapp: "WhatsApp",
  indicacao: "Indicação/Boca a boca",
  email: "E-mail",
  nenhum: "Nenhum estruturado",
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planningData, mode, forceRegenerate } = await req.json() as { 
      planningData: PlanningData; 
      mode?: 'simple' | 'advanced';
      forceRegenerate?: boolean;
    };
    
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Check cache unless force regenerate
    const cacheKey = getCacheKey({ planningData, mode });
    if (!forceRegenerate) {
      const cached = cache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        console.log('Returning cached diagnosis');
        return new Response(JSON.stringify(cached.data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    console.log('Generating diagnosis for:', planningData.company_name, 'Mode:', mode || 'advanced');

    const isSimpleMode = mode === 'simple';

    let contextPrompt = "";

    if (isSimpleMode) {
      contextPrompt = `
Você é um consultor de negócios experiente. Analise os dados e gere um DIAGNÓSTICO DE VENDA profissional.

## DADOS DO NEGÓCIO

**Empresa:** ${planningData.company_name}
**Setor/Nicho:** ${planningData.sector_niche}
**Tamanho:** ${COMPANY_SIZE_LABELS[planningData.company_size] || planningData.company_size || "Não informado"}
**Localização:** ${planningData.location_region || "Não informado"}
**Produtos/Serviços:** ${planningData.main_products_services || "Não informado"}
**Público-Alvo:** ${planningData.target_audience || "Não informado"}
**Possui site:** ${planningData.has_website ? "Sim" : "Não"}
**Possui redes sociais:** ${planningData.has_social_media ? "Sim" : "Não"}
**Principal canal de contato:** ${planningData.main_contact_channel || "Não informado"}
**Atendimento é manual:** ${planningData.attendance_is_manual ? "Sim" : "Não"}
**Quer mais clientes:** ${planningData.wants_more_clients ? "Sim" : "Não"}
**Problema principal:** ${planningData.biggest_problem || planningData.main_challenges || "Não informado"}
**Objetivo:** ${planningData.initial_objective || "Crescer e organizar o negócio"}

---

GERE O DIAGNÓSTICO SEGUINDO EXATAMENTE ESTA ESTRUTURA:

**STATUS DO NEGÓCIO**
[Uma frase curta resumindo a situação atual do negócio.]

**PROBLEMA CENTRAL**
[Uma frase clara apontando o principal gargalo.]

**SOLUÇÃO PRIORITÁRIA RECOMENDADA**
[Escolha APENAS UMA: Site Profissional | Aplicativo | Posicionamento Digital | Organização de Processos]

**POR QUE ESSA SOLUÇÃO AGORA**
• [Motivo 1]
• [Motivo 2]
• [Motivo 3]

**RESULTADO ESPERADO**
• [Benefício 1]
• [Benefício 2]
• [Benefício 3]

**PRÓXIMO PASSO**
[Chamada clara para ação]

REGRAS: Seja DECIDIDO, máximo 150 palavras, bullets curtos.`;
    } else {
      const channels = planningData.acquisition_channels
        ?.map(c => CHANNEL_LABELS[c] || c)
        .join(", ") || "Não informado";

      contextPrompt = `
Você é um estrategista de marketing e vendas. Analise e gere um DIAGNÓSTICO ESTRATÉGICO:

## DADOS DA EMPRESA
**Empresa:** ${planningData.company_name}
**Setor/Nicho:** ${planningData.sector_niche}
**Tamanho:** ${COMPANY_SIZE_LABELS[planningData.company_size] || planningData.company_size}
**Ticket Médio:** ${planningData.average_ticket}
**Localização:** ${planningData.location_region}
**Produtos/Serviços:** ${planningData.main_products_services}
**Público-Alvo:** ${planningData.target_audience}
**Objetivo:** ${planningData.initial_objective}

## ESTRUTURA
**Como vende:** ${SALES_METHOD_LABELS[planningData.sales_method] || planningData.sales_method}
**Canais:** ${channels}
**Equipe:** ${TEAM_LABELS[planningData.has_team] || planningData.has_team}
**Mede resultados:** ${MEASUREMENT_LABELS[planningData.results_measurement] || planningData.results_measurement}

## DESAFIOS
**Diferencial:** ${planningData.competitive_differential || "Não informado"}
**Desafios:** ${planningData.main_challenges || "Não informado"}
**Gargalos:** ${planningData.growth_bottlenecks || "Não informado"}
**Bloqueios:** ${planningData.growth_blockers || "Não informado"}

## METAS
**3 meses:** ${planningData.goal_3_months || "Não informado"}
**12 meses:** ${planningData.goal_12_months || "Não informado"}
**Urgência:** ${planningData.urgency_level}/5

## AUTOAVALIAÇÃO
**Marketing:** ${RATING_LABELS[planningData.marketing_structure_rating]} (${planningData.marketing_structure_rating}/5)
**Comercial:** ${RATING_LABELS[planningData.sales_structure_rating]} (${planningData.sales_structure_rating}/5)
**Digital:** ${RATING_LABELS[planningData.digital_organization_rating]} (${planningData.digital_organization_rating}/5)
**Posicionamento:** ${RATING_LABELS[planningData.positioning_clarity_rating]} (${planningData.positioning_clarity_rating}/5)

---

GERE DIAGNÓSTICO COM: Visão Geral, Gargalos, Análise de Maturidade, Riscos, Oportunidades, e SOLUÇÃO PRIORITÁRIA (Site | App | Processos | Posicionamento).

Formato final:
**SOLUÇÃO PRIORITÁRIA:** [Nome]
**Justificativa:** [2-3 frases]
**Impacto:** [O que muda]`;
    }

    console.log('Calling Gemini API...');

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: contextPrompt }]
        }],
        generationConfig: {
          maxOutputTokens: isSimpleMode ? 1000 : 2500,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: 'Erro ao gerar diagnóstico. Tente novamente.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const diagnosisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!diagnosisText) {
      throw new Error('No diagnosis generated');
    }

    // Extract recommended solution
    let recommendedSolution = "";
    const solutionPatterns = [
      /\*\*SOLUÇÃO PRIORITÁRIA RECOMENDADA\*\*\s*\n?\s*([^\n*]+)/i,
      /\*\*SOLUÇÃO (?:PRIORITÁRIA|RECOMENDADA):\*\*\s*([^\n*]+)/i,
      /SOLUÇÃO PRIORITÁRIA[:\s]*([^\n]+)/i,
    ];
    
    for (const pattern of solutionPatterns) {
      const match = diagnosisText.match(pattern);
      if (match) {
        const solutionText = match[1].trim().toUpperCase();
        if (solutionText.includes("SITE")) recommendedSolution = "site";
        else if (solutionText.includes("APLICATIVO") || solutionText.includes("APP")) recommendedSolution = "app";
        else if (solutionText.includes("ORGANIZAÇÃO") || solutionText.includes("PROCESSO")) recommendedSolution = "processos";
        else if (solutionText.includes("POSICIONAMENTO")) recommendedSolution = "posicionamento";
        break;
      }
    }

    console.log('Diagnosis generated. Solution:', recommendedSolution);

    const result = { diagnosis: diagnosisText, recommendedSolution };
    
    // Cache the result
    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in nexia-diagnosis:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
