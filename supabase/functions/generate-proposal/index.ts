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

// Fixed template - NO AI CALL
function generateProposalFromTemplate(data: ProposalData): string {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(data.serviceValue || 0);

  const scopeText = data.scopeItems.length > 0 
    ? data.scopeItems.map((item, i) => `${i + 1}. ${item}`).join('\n')
    : 'A definir conforme alinhamento';

  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return JSON.stringify({
    apresentacao: `Prezado(a) ${data.contactName || 'Cliente'},

É com satisfação que apresentamos esta proposta comercial para a ${data.companyName}. Após analisar suas necessidades, desenvolvemos uma solução personalizada que atenderá aos objetivos do seu negócio.

Esta proposta foi elaborada com base no entendimento das demandas apresentadas e reflete nosso compromisso em entregar resultados de qualidade dentro do prazo acordado.`,

    entendimento: `Compreendemos que a ${data.companyName} busca ${data.serviceOffered.toLowerCase()}. O objetivo principal é fortalecer a presença digital e otimizar processos para gerar mais resultados.

${data.observations ? `Observações específicas: ${data.observations}` : 'Estamos preparados para adaptar nossa abordagem conforme necessidades adicionais identificadas durante a execução.'}`,

    solucao: `Propomos a execução de ${data.serviceOffered}, contemplando todas as etapas necessárias para garantir a entrega com qualidade e dentro do prazo estabelecido.

Nossa metodologia inclui reuniões de alinhamento, desenvolvimento iterativo e validações em cada etapa do projeto, garantindo transparência e adequação às expectativas.`,

    escopo: `O escopo deste projeto inclui:

${scopeText}

Itens não mencionados explicitamente nesta proposta poderão ser incluídos mediante acordo adicional entre as partes.`,

    prazo: `O prazo estimado para conclusão do projeto é de ${data.deadline || 'a definir em comum acordo'}. Este prazo considera todas as etapas de desenvolvimento, revisões e ajustes necessários.

O cronograma detalhado será apresentado após a aprovação desta proposta.`,

    investimento: `O investimento total para este projeto é de ${formattedValue}.

Condições de pagamento: ${data.paymentMethod || 'A combinar conforme negociação'}.

Esta proposta tem validade de 15 dias a partir da data de emissão (${formattedDate}).`,

    proximos_passos: `Para dar início ao projeto, solicitamos a aprovação desta proposta por e-mail ou mensagem. Após a confirmação, enviaremos o contrato de prestação de serviços e o cronograma detalhado.

Permanecemos à disposição para esclarecer quaisquer dúvidas e realizar ajustes que se façam necessários.`
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposalData } = await req.json() as { proposalData: ProposalData };
    
    console.log('Generating proposal from template for:', proposalData.companyName);

    const proposalText = generateProposalFromTemplate(proposalData);

    console.log('Proposal generated successfully from template');

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
