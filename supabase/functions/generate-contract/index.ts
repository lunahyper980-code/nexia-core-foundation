import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContractData {
  contractorName: string;
  contractorDocument: string;
  contractorAddress: string;
  contractedName: string;
  contractedDocument: string;
  serviceDescription: string;
  serviceValue: number;
  paymentTerms: string;
  deadline: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractData } = await req.json() as { contractData: ContractData };
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating contract for:', contractData.contractorName);

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(contractData.serviceValue || 0);

    const contextPrompt = `
Você é um especialista em redação de contratos de prestação de serviços.
Gere um contrato simples, profissional e legalmente válido com base nos dados abaixo.

DADOS DO CONTRATO:

CONTRATANTE:
- Nome/Razão Social: ${contractData.contractorName}
- CPF/CNPJ: ${contractData.contractorDocument || 'A ser informado'}
- Endereço: ${contractData.contractorAddress || 'A ser informado'}

CONTRATADO:
- Nome/Razão Social: ${contractData.contractedName}
- CPF/CNPJ: ${contractData.contractedDocument || 'A ser informado'}

DETALHES DO SERVIÇO:
- Descrição: ${contractData.serviceDescription || 'Prestação de serviços conforme proposta comercial'}
- Valor: ${formattedValue}
- Condições de pagamento: ${contractData.paymentTerms || 'A combinar'}
- Prazo de entrega: ${contractData.deadline || 'A combinar'}

RETORNE UM JSON com exatamente esta estrutura (sem markdown, apenas JSON puro):
{
  "identificacao_partes": "Texto formal identificando contratante e contratado com seus dados.",
  "objeto": "Descrição clara do serviço a ser prestado em texto corrido.",
  "escopo": "Detalhamento do que está incluído no serviço.",
  "prazo": "Prazo para conclusão dos serviços em texto.",
  "valor_pagamento": "Valores e condições de pagamento descritos de forma clara.",
  "obrigacoes_contratante": "Responsabilidades do contratante em texto corrido.",
  "obrigacoes_contratado": "Responsabilidades do contratado em texto corrido.",
  "rescisao": "Condições para rescisão do contrato.",
  "foro": "Foro competente para dirimir questões.",
  "disposicoes_finais": "Considerações finais e espaço indicativo para assinaturas."
}

REGRAS IMPORTANTES:
- NÃO use hashtags (#), bullets (•), hífens (-) ou asteriscos (**)
- NÃO use listas numeradas ou com marcadores
- Escreva tudo em parágrafos corridos e formais
- Use linguagem jurídica mas compreensível
- Seja claro e objetivo
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
          { role: 'system', content: 'Você é um especialista em direito contratual brasileiro, especializado em contratos de prestação de serviços para pequenas e médias empresas.' },
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
    let contractText = data.choices?.[0]?.message?.content;

    if (!contractText) {
      throw new Error('No contract generated');
    }

    // Clean any code block markers from the response
    contractText = contractText
      .replace(/^```(?:json)?\s*\n?/gi, '')
      .replace(/\n?```\s*$/gi, '')
      .replace(/```/g, '')
      .trim();

    console.log('Contract generated successfully');

    return new Response(JSON.stringify({ contractText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in generate-contract function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
