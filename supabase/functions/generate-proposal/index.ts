import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalData {
  companyName: string;
  contactName: string;
  serviceOffered: string;
  serviceValue: number;
  deadline: string;
  paymentMethod: string;
  scopeItems: string[];
  observations: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalData } = await req.json() as { proposalData: ProposalData };
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating proposal for:', proposalData.companyName);

    const scopeText = proposalData.scopeItems.length > 0 
      ? proposalData.scopeItems.map((item, i) => `${i + 1}. ${item}`).join('\n')
      : 'Não especificado';

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(proposalData.serviceValue || 0);

    const contextPrompt = `
Você é um especialista em redação de propostas comerciais profissionais.
Gere uma proposta comercial completa, profissional e convincente com base nos dados abaixo.

DADOS DA PROPOSTA:
- Empresa cliente: ${proposalData.companyName}
- Responsável: ${proposalData.contactName || 'Não informado'}
- Serviço oferecido: ${proposalData.serviceOffered}
- Valor: ${formattedValue}
- Prazo de entrega: ${proposalData.deadline || 'A combinar'}
- Forma de pagamento: ${proposalData.paymentMethod || 'A combinar'}

ESCOPO DO SERVIÇO:
${scopeText}

OBSERVAÇÕES ADICIONAIS:
${proposalData.observations || 'Nenhuma observação adicional.'}

RETORNE UM JSON com exatamente esta estrutura (sem markdown, apenas JSON puro):
{
  "apresentacao": "Texto de introdução profissional apresentando a proposta, em 2-3 parágrafos naturais.",
  "entendimento": "Descrição do problema ou necessidade do cliente em parágrafos corridos.",
  "solucao": "Explicação clara da solução proposta em linguagem natural.",
  "escopo": "Detalhamento do que está incluído, em texto corrido e natural.",
  "prazo": "Especificação dos prazos em formato de texto.",
  "investimento": "Apresentação do valor e condições de pagamento em linguagem clara.",
  "proximos_passos": "Indicação de como o cliente pode aprovar e iniciar o projeto."
}

REGRAS IMPORTANTES:
- NÃO use hashtags (#), bullets (•), hífens (-) ou asteriscos (**)
- NÃO use listas numeradas ou com marcadores
- Escreva tudo em parágrafos corridos e naturais
- Use linguagem profissional mas acessível
- Seja objetivo e direto
- Destaque os benefícios para o cliente
- Retorne APENAS o JSON, sem texto adicional
`;


    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um especialista em vendas e redação de propostas comerciais, com experiência em ajudar pequenas e médias empresas brasileiras.' },
          { role: 'user', content: contextPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos ao seu workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    let proposalText = data.choices?.[0]?.message?.content;

    if (!proposalText) {
      throw new Error('No proposal generated');
    }

    // Clean any code block markers from the response
    proposalText = proposalText
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log('Proposal generated successfully');

    return new Response(JSON.stringify({ proposalText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in generate-proposal function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
