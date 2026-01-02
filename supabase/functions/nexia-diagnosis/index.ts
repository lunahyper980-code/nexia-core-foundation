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
  // Simple mode fields
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
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { planningData, mode } = await req.json() as { planningData: PlanningData; mode?: 'simple' | 'advanced' };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating diagnosis for:", planningData.company_name, "Mode:", mode || 'advanced');

    const isSimpleMode = mode === 'simple';

    let contextPrompt = "";

    if (isSimpleMode) {
      // Simple mode prompt - DIAGNÓSTICO OBJETIVO E ACIONÁVEL PARA VENDA
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

GERE O DIAGNÓSTICO SEGUINDO EXATAMENTE ESTA ESTRUTURA (use os títulos em negrito como estão):

**STATUS DO NEGÓCIO**
[Uma frase curta resumindo a situação atual do negócio. Seja direto e específico.]

**PROBLEMA CENTRAL**
[Uma frase clara apontando o principal gargalo que impede o crescimento. Sem rodeios.]

**SOLUÇÃO PRIORITÁRIA RECOMENDADA**
[Escolha APENAS UMA entre: Site Profissional | Aplicativo | Posicionamento Digital | Organização de Processos]

Critérios de decisão:
- Não tem site e precisa ser encontrado → Site Profissional
- Atendimento manual caótico, precisa automatizar → Aplicativo
- Não sabe comunicar valor, branding fraco → Posicionamento Digital
- Processos bagunçados, falta organização → Organização de Processos

**POR QUE ESSA SOLUÇÃO AGORA**
• [Motivo 1 - breve e direto]
• [Motivo 2 - breve e direto]
• [Motivo 3 - breve e direto]
• [Motivo 4 - opcional, se relevante]

**RESULTADO ESPERADO**
• [Benefício prático e mensurável 1]
• [Benefício prático e mensurável 2]
• [Benefício prático e mensurável 3]

**PRÓXIMO PASSO**
[Uma chamada clara para ação, ex: "Criar Site Profissional para [nome da empresa]" ou "Desenvolver Aplicativo para [nome da empresa]"]

---

REGRAS OBRIGATÓRIAS:
1. Seja DECIDIDO - não sugira várias opções, ESCOLHA UMA.
2. Linguagem profissional e direta - pareça um relatório pronto para enviar ao cliente.
3. Máximo 150 palavras no total.
4. NÃO use termos técnicos de marketing (funil, tráfego, leads, conversão).
5. Bullets curtos - máximo 10 palavras cada.
6. O diagnóstico deve GUIAR o usuário para a próxima ação sem confusão.
`;
    } else {
      // Advanced mode prompt - full strategic analysis
      const channels = planningData.acquisition_channels
        ?.map(c => CHANNEL_LABELS[c] || c)
        .join(", ") || "Não informado";

      contextPrompt = `
Você é um estrategista de marketing e vendas experiente, especializado em diagnósticos empresariais para PMEs brasileiras.

Analise os seguintes dados de uma empresa e gere um DIAGNÓSTICO ESTRATÉGICO completo COM RECOMENDAÇÃO DE SOLUÇÃO:

## DADOS DA EMPRESA

**Empresa:** ${planningData.company_name}
**Setor/Nicho:** ${planningData.sector_niche}
**Tamanho:** ${COMPANY_SIZE_LABELS[planningData.company_size] || planningData.company_size}
**Ticket Médio:** ${planningData.average_ticket}
**Localização:** ${planningData.location_region}
**Produtos/Serviços:** ${planningData.main_products_services}
**Público-Alvo:** ${planningData.target_audience}
**Objetivo com o Nexia:** ${planningData.initial_objective}

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

---

## INSTRUÇÕES PARA O DIAGNÓSTICO

Gere um diagnóstico estratégico ESTRUTURADO seguindo EXATAMENTE este formato com os títulos em markdown:

## Visão Geral do Negócio
- Resumo claro do estágio atual da empresa
- Grau de organização e presença digital
- Contexto competitivo do nicho

## Principais Gargalos Identificados
- Gargalos de marketing (se houver)
- Gargalos comerciais
- Gargalos operacionais/digitais
- Falta de estrutura, processo ou clareza

## Análise de Maturidade
- Marketing: análise com base nos dados e autoavaliação
- Comercial: análise se aplicável
- Posicionamento digital geral

## Riscos Atuais
- O que pode impedir o crescimento
- Onde há desperdício de oportunidade
- Dependências perigosas (ex: só WhatsApp, só indicação)

## Oportunidades Prioritárias
- Onde focar primeiro
- Quais áreas têm maior impacto no curto prazo
- O que pode ser estruturado antes de investir em tráfego ou mídia

## Solução Prioritária Recomendada

IMPORTANTE: Com base em TODA a análise, identifique qual solução é mais urgente para este negócio:

1. **SITE PROFISSIONAL** - Se falta presença online, o cliente não é encontrado, não tem credibilidade digital
2. **APLICATIVO / SISTEMA** - Se o atendimento é caótico, processos são manuais, precisa escalar com tecnologia
3. **ORGANIZAÇÃO DE PROCESSOS** - Se tem ferramentas mas falta método, rotina e padrão operacional
4. **POSICIONAMENTO DIGITAL** - Se não sabe comunicar valor, diferencial não é claro, branding fraco

Indique APENAS UMA solução prioritária. Justifique estrategicamente.

Formato:
**SOLUÇÃO PRIORITÁRIA:** [Nome da solução]
**Justificativa estratégica:** [2-3 frases explicando por que esta é a prioridade]
**Impacto esperado:** [O que muda no negócio após aplicar]

---

REGRAS OBRIGATÓRIAS:
1. Linguagem profissional e direta
2. NADA genérico - seja específico para este negócio
3. NADA motivacional ou promessas vazias
4. Pareça um diagnóstico feito por um estrategista experiente
5. Use bullet points para organização
6. Seja realista sobre a situação atual
7. Considere o contexto brasileiro de negócios
8. A recomendação de solução deve ser CLARA e ACIONÁVEL
`;
    }

    console.log("Calling Lovable AI Gateway...");

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
            content: isSimpleMode 
              ? "Você é um consultor de negócios prático e direto. Gere diagnósticos simples com recomendações claras de ação."
              : "Você é um estrategista de marketing e vendas experiente. Gere diagnósticos profissionais e realistas com recomendações estratégicas claras." 
          },
          { role: "user", content: contextPrompt },
        ],
        max_tokens: isSimpleMode ? 1000 : 2500,
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
      
      return new Response(JSON.stringify({ error: "Erro ao gerar diagnóstico. Tente novamente." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const diagnosisText = data.choices?.[0]?.message?.content;

    if (!diagnosisText) {
      throw new Error("No diagnosis generated");
    }

    // Extract recommended solution from the diagnosis
    let recommendedSolution = "";
    
    // Try multiple patterns to extract solution
    const solutionPatterns = [
      /\*\*SOLUÇÃO PRIORITÁRIA RECOMENDADA\*\*\s*\n?\s*([^\n*]+)/i,
      /\*\*SOLUÇÃO (?:PRIORITÁRIA|RECOMENDADA):\*\*\s*([^\n*]+)/i,
      /SOLUÇÃO PRIORITÁRIA RECOMENDADA[:\s]*([^\n]+)/i,
    ];
    
    let solutionText = "";
    for (const pattern of solutionPatterns) {
      const match = diagnosisText.match(pattern);
      if (match) {
        solutionText = match[1].trim().toUpperCase();
        break;
      }
    }
    
    if (solutionText) {
      if (solutionText.includes("SITE")) {
        recommendedSolution = "site";
      } else if (solutionText.includes("APLICATIVO") || solutionText.includes("SISTEMA") || solutionText.includes("APP")) {
        recommendedSolution = "app";
      } else if (solutionText.includes("ORGANIZAÇÃO") || solutionText.includes("PROCESSO")) {
        recommendedSolution = "processos";
      } else if (solutionText.includes("POSICIONAMENTO")) {
        recommendedSolution = "posicionamento";
      }
    }

    console.log("Diagnosis generated successfully. Recommended solution:", recommendedSolution);

    return new Response(JSON.stringify({ 
      diagnosis: diagnosisText,
      recommendedSolution: recommendedSolution
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in nexia-diagnosis:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
