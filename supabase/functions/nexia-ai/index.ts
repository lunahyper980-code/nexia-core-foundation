import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

interface StrategicObjective {
  name: string;
  description: string;
  area: string;
}

interface StrategicTask {
  title: string;
  objective: string;
  description: string;
  steps: string[];
  completion_criteria: string;
  area: string;
  objective_name: string;
}

interface GenerationResult {
  strategy_summary: string;
  objectives: StrategicObjective[];
  tasks: StrategicTask[];
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

const FOCUS_AREA_LABELS: Record<string, string> = {
  marketing: "Marketing",
  comercial: "Comercial",
  operacional: "Operacional",
  produto: "Produto",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planningData } = await req.json() as { planningData: PlanningData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating strategy for:", planningData.company_name);

    const channels = planningData.acquisition_channels
      ?.map(c => CHANNEL_LABELS[c] || c)
      .join(", ") || "Não informado";

    const contextPrompt = `
Você é um estrategista de marketing e vendas experiente, especializado em criar planos de ação para PMEs brasileiras.

Com base nos dados da empresa e no diagnóstico realizado, crie uma ESTRATÉGIA COMPLETA com TAREFAS ACIONÁVEIS.

## DADOS DA EMPRESA

**Empresa:** ${planningData.company_name}
**Setor/Nicho:** ${planningData.sector_niche}
**Tamanho:** ${COMPANY_SIZE_LABELS[planningData.company_size] || planningData.company_size}
**Ticket Médio:** ${planningData.average_ticket}
**Localização:** ${planningData.location_region}
**Produtos/Serviços:** ${planningData.main_products_services}
**Público-Alvo:** ${planningData.target_audience}
**Objetivo com o Nexia:** ${planningData.initial_objective}
**Área de Foco:** ${FOCUS_AREA_LABELS[planningData.focus_area] || planningData.focus_area || "Não definida"}

## ESTRUTURA DE OPERAÇÃO

**Como vende hoje:** ${SALES_METHOD_LABELS[planningData.sales_method] || planningData.sales_method}
**Canais de aquisição:** ${channels}
**Equipe de vendas/marketing:** ${TEAM_LABELS[planningData.has_team] || planningData.has_team}
**Como mede resultados:** ${MEASUREMENT_LABELS[planningData.results_measurement] || planningData.results_measurement}

## POSICIONAMENTO E DESAFIOS

**Diferencial competitivo:** ${planningData.competitive_differential || "Não informado"}
**Principais desafios:** ${planningData.main_challenges || "Não informado"}
**Gargalos de crescimento:** ${planningData.growth_bottlenecks || "Não informado"}
**O que mais impede crescer:** ${planningData.growth_blockers || "Não informado"}

## METAS

**Meta 3 meses:** ${planningData.goal_3_months || "Não informado"}
**Meta 12 meses:** ${planningData.goal_12_months || "Não informado"}
**Urgência (1-5):** ${planningData.urgency_level}/5

## AUTOAVALIAÇÃO (1-5)

**Estrutura de Marketing:** ${RATING_LABELS[planningData.marketing_structure_rating]} (${planningData.marketing_structure_rating}/5)
**Estrutura Comercial:** ${RATING_LABELS[planningData.sales_structure_rating]} (${planningData.sales_structure_rating}/5)
**Organização Digital:** ${RATING_LABELS[planningData.digital_organization_rating]} (${planningData.digital_organization_rating}/5)
**Clareza de Posicionamento:** ${RATING_LABELS[planningData.positioning_clarity_rating]} (${planningData.positioning_clarity_rating}/5)

## DIAGNÓSTICO REALIZADO

${planningData.diagnosis_text || "Diagnóstico não disponível."}

---

## INSTRUÇÕES PARA GERAÇÃO

Você DEVE retornar um JSON válido com a seguinte estrutura EXATA:

{
  "strategy_summary": "Texto com a estratégia central recomendada, justificativa baseada no diagnóstico, e indicação de prioridade (curto/médio prazo). Máximo 500 palavras. Seja específico e direto.",
  "objectives": [
    {
      "name": "Nome curto do objetivo",
      "description": "Breve explicação do que esse objetivo busca alcançar",
      "area": "marketing|comercial|digital|operacional"
    }
  ],
  "tasks": [
    {
      "title": "Título claro da tarefa",
      "objective": "O que essa tarefa busca alcançar",
      "description": "Descrição detalhada do que precisa ser feito",
      "steps": ["Passo 1", "Passo 2", "Passo 3"],
      "completion_criteria": "Considerar concluído quando...",
      "area": "marketing|comercial|web|social|trafego|automacao",
      "objective_name": "Nome do objetivo que esta tarefa pertence"
    }
  ]
}

## REGRAS OBRIGATÓRIAS

1. Gere de 3 a 6 objetivos estratégicos
2. Gere de 6 a 12 tarefas no total, distribuídas entre os objetivos
3. Cada tarefa deve ter entre 3 e 7 passos claros
4. As tarefas devem ser específicas para este negócio, NÃO genéricas
5. NÃO prometa resultados financeiros
6. NÃO ensine como fazer tráfego pago avançado - apenas estruture a base
7. Foque em organização, estruturação e fundamentos
8. Linguagem profissional e direta
9. Considere o contexto brasileiro
10. Retorne APENAS o JSON, sem texto adicional antes ou depois

Possíveis áreas de foco da estratégia (escolha baseado nos dados):
- Tráfego pago (Google/Meta) - estruturação básica
- Estruturação de redes sociais
- Web design / site / landing page
- Organização comercial
- Fortalecimento digital
- Automação básica de atendimento

IMPORTANTE: A estratégia deve ser REALISTA para o tamanho e maturidade da empresa.
`;

    console.log("Calling Lovable AI Gateway for strategy generation...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "Você é um estrategista de marketing e vendas experiente. Você SEMPRE retorna JSON válido, sem markdown ou texto adicional. Seja específico e prático em suas recomendações." 
          },
          { role: "user", content: contextPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao seu workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "Erro ao gerar estratégia. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error("No strategy generated");
    }

    console.log("Raw response length:", responseText.length);

    // Clean up the response - remove markdown code blocks if present
    responseText = responseText.trim();
    if (responseText.startsWith("```json")) {
      responseText = responseText.slice(7);
    } else if (responseText.startsWith("```")) {
      responseText = responseText.slice(3);
    }
    if (responseText.endsWith("```")) {
      responseText = responseText.slice(0, -3);
    }
    responseText = responseText.trim();

    // Parse JSON
    let result: GenerationResult;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Response text preview:", responseText.substring(0, 500));
      throw new Error("Erro ao processar resposta da IA. Tente novamente.");
    }

    // Validate structure
    if (!result.strategy_summary || !result.objectives || !result.tasks) {
      throw new Error("Resposta incompleta da IA. Tente novamente.");
    }

    console.log("Strategy generated successfully:", {
      objectives_count: result.objectives.length,
      tasks_count: result.tasks.length
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in nexia-ai:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});