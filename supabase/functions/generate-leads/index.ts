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
    const { nicho, cidade, possuiSite, possuiInstagram } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating leads for: ${nicho} in ${cidade}`);

    const systemPrompt = `Você é um especialista em negócios locais brasileiros. Sua tarefa é gerar uma lista de empresas PLAUSÍVEIS e REALISTAS baseadas em padrões reais de mercado.

REGRAS CRÍTICAS - NUNCA QUEBRE ESSAS REGRAS:

1. NUNCA INVENTE TELEFONE - O campo "telefone" deve ser SEMPRE null
2. NUNCA INVENTE WHATSAPP - Não existe esse campo
3. NUNCA INVENTE AVALIAÇÕES - Não existe esse campo
4. NUNCA INVENTE SITES OU URLS - O campo "linkPublico" deve ser null se não souber com certeza
5. NUNCA INVENTE ENDEREÇOS ESPECÍFICOS - Use apenas bairros/regiões prováveis

CAMPOS OBRIGATÓRIOS:
- nome: Nome plausível da empresa (seguindo padrões brasileiros reais)
- segmento: Subcategoria específica do nicho
- localizacao: Cidade, Estado
- endereco: Apenas bairro/região provável OU null se incerto (NUNCA número de rua específico)
- telefone: SEMPRE null (nunca inventar)
- telefonePublico: SEMPRE false
- temSite: true/false baseado na probabilidade do segmento
- temInstagram: true/false baseado na probabilidade do segmento
- linkPublico: null (nunca inventar URLs)
- confiancaNome: "alta" | "media" | "baixa"

NÍVEIS DE CONFIANÇA DO NOME:
- "alta": Nomes genéricos muito comuns no Brasil (ex: "Barbearia do Zé", "Pizzaria Bella Italia", "Clínica Vida")
- "media": Nomes plausíveis mas menos comuns
- "baixa": Nomes estimados baseados apenas na região/categoria

VALIDAÇÃO MÍNIMA:
Cada lead DEVE ter pelo menos 2 destes: nome plausível + localização + segmento específico

Gere entre 6 e 10 leads variados.

Responda APENAS com um JSON válido no formato:
{
  "leads": [
    {
      "nome": "Nome da Empresa",
      "segmento": "Segmento específico",
      "localizacao": "Cidade, Estado",
      "endereco": "Bairro/Região ou null",
      "telefone": null,
      "telefonePublico": false,
      "temSite": true/false,
      "temInstagram": true/false,
      "linkPublico": null,
      "confiancaNome": "alta" | "media" | "baixa"
    }
  ]
}`;

    const userPrompt = `Gere uma lista de leads plausíveis para prospecção comercial:

Nicho/Segmento: ${nicho}
Cidade/Região: ${cidade}
${possuiSite ? 'Filtro: Empresas que provavelmente possuem site' : ''}
${possuiInstagram ? 'Filtro: Empresas que provavelmente possuem Instagram' : ''}

LEMBRE-SE:
- NUNCA inventar telefone, WhatsApp, URLs ou endereços específicos
- Telefone deve ser SEMPRE null
- Usar apenas dados que podem ser estimados com segurança
- Indicar o nível de confiança do nome`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
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
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione mais créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Erro ao comunicar com IA");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log("AI response:", content);

    // Parse JSON from response
    let leads = [];
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        leads = parsed.leads || [];
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      leads = [];
    }

    // Sanitize and validate leads - NEVER trust AI-generated phone numbers
    leads = leads.map((lead: any, index: number) => {
      // Count valid fields for validation
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
        // FORÇA telefone como null - NUNCA confiar no que a IA gerar
        telefone: null,
        telefonePublico: false,
        temSite: Boolean(lead.temSite),
        temInstagram: Boolean(lead.temInstagram),
        linkPublico: null, // NUNCA confiar em URLs geradas
        confiancaNome: ['alta', 'media', 'baixa'].includes(lead.confiancaNome) 
          ? lead.confiancaNome 
          : 'media',
        // Flag interno de validação
        validado: validFields >= 2,
      };
    });

    // Separate validated and unvalidated leads
    const validatedLeads = leads.filter((l: any) => l.validado);
    const unvalidatedLeads = leads.filter((l: any) => !l.validado);

    // Remove internal flag before sending
    const cleanLeads = validatedLeads.map(({ validado, ...rest }: any) => rest);
    const cleanUnvalidated = unvalidatedLeads.map(({ validado, ...rest }: any) => rest);

    return new Response(JSON.stringify({ 
      leads: cleanLeads,
      leadsNaoConfirmados: cleanUnvalidated 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-leads:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
