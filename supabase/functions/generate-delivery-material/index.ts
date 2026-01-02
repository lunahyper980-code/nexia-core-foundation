import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosisData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    console.log("Gerando material de entrega para:", diagnosisData.company_name);

    const prompt = `Você é um especialista em consultoria digital e marketing. Gere um material de entrega profissional para o cliente baseado nas informações do diagnóstico digital.

DADOS DO DIAGNÓSTICO:
- Empresa: ${diagnosisData.company_name}
- Segmento: ${diagnosisData.segment || 'Não informado'}
- Cidade/Estado: ${diagnosisData.city_state || 'Não informado'}
- Possui site: ${diagnosisData.has_website ? 'Sim' : 'Não'}
- Redes sociais: ${diagnosisData.social_networks?.join(', ') || 'Não informado'}
- Objetivo principal: ${diagnosisData.main_objective || 'Não informado'}
- Problema percebido: ${diagnosisData.main_problem_perceived || 'Não informado'}
- Avaliações:
  Presença online: ${diagnosisData.online_presence_rating || 0}/5
  Facilidade de contato: ${diagnosisData.contact_ease_rating || 0}/5
  Profissionalismo: ${diagnosisData.professionalism_rating || 0}/5
  Comunicação digital: ${diagnosisData.digital_communication_rating || 0}/5

${diagnosisData.diagnosis_text ? `DIAGNÓSTICO GERADO:\n${diagnosisData.diagnosis_text}\n` : ''}

RETORNE UM JSON com exatamente esta estrutura (sem markdown, apenas JSON puro):
{
  "resumo_executivo": "Resumo em 2-3 parágrafos sobre o diagnóstico realizado e principais descobertas, escrito de forma natural.",
  "situacao_atual": "Análise da presença digital atual em parágrafos naturais, sem listas.",
  "pontos_criticos": "Texto corrido explicando os principais problemas ou oportunidades de melhoria.",
  "recomendacoes": "Ações recomendadas em ordem de prioridade, escritas em parágrafos naturais.",
  "proximos_passos": "Timeline sugerida para implementação em texto corrido.",
  "oportunidades_servico": "Serviços que podem resolver os problemas identificados, em linguagem natural.",
  "observacoes_finais": "Considerações finais e mensagem de encerramento profissional."
}

REGRAS IMPORTANTES:
- NÃO use hashtags (#), bullets (•), hífens (-), emojis ou asteriscos (**)
- NÃO use listas numeradas ou com marcadores
- Escreva tudo em parágrafos corridos e naturais
- Use linguagem profissional mas acessível
- Seja específico e prático
- Retorne APENAS o JSON, sem texto adicional
- Escreva em português brasileiro`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Você é um consultor digital experiente que gera materiais de entrega profissionais." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns segundos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("Erro na API:", response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    let deliveryMaterial = data.choices?.[0]?.message?.content;

    if (!deliveryMaterial) {
      throw new Error("Não foi possível gerar o material de entrega");
    }

    // Clean any code block markers from the response
    deliveryMaterial = deliveryMaterial
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log("Material de entrega gerado com sucesso");

    return new Response(JSON.stringify({ deliveryMaterial }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao gerar material de entrega:", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
