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

// Fixed legal template - NO AI CALL
function generateContractFromTemplate(data: ContractData): string {
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(data.serviceValue || 0);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  return JSON.stringify({
    identificacao_partes: `CONTRATANTE: ${data.contractorName}, inscrito(a) no CPF/CNPJ sob o nº ${data.contractorDocument || '[A INFORMAR]'}, com endereço em ${data.contractorAddress || '[A INFORMAR]'}.

CONTRATADO(A): ${data.contractedName}, inscrito(a) no CPF/CNPJ sob o nº ${data.contractedDocument || '[A INFORMAR]'}.

As partes acima identificadas celebram o presente Contrato de Prestação de Serviços, que se regerá pelas cláusulas e condições a seguir estabelecidas.`,

    objeto: `O presente contrato tem por objeto a prestação dos seguintes serviços: ${data.serviceDescription || 'Prestação de serviços conforme especificações acordadas entre as partes'}.

O CONTRATADO(A) se compromete a executar os serviços descritos com zelo, dedicação e competência técnica, observando as melhores práticas de mercado.`,

    escopo: `Os serviços objeto deste contrato compreendem todas as atividades necessárias para a completa execução do projeto conforme descrito no objeto. Eventuais serviços adicionais não contemplados neste escopo deverão ser objeto de negociação específica entre as partes.

O CONTRATANTE fornecerá ao CONTRATADO(A) todas as informações e materiais necessários para a execução dos serviços.`,

    prazo: `O prazo para execução dos serviços é de ${data.deadline || '[A DEFINIR]'}, contado a partir da assinatura deste contrato e do recebimento do sinal de pagamento, quando aplicável.

O prazo poderá ser prorrogado mediante acordo escrito entre as partes, sem incidência de multa ou penalidade.`,

    valor_pagamento: `O valor total dos serviços é de ${formattedValue}.

Condições de pagamento: ${data.paymentTerms || 'A combinar entre as partes'}.

O não pagamento nas datas acordadas acarretará a suspensão imediata dos serviços, além de multa de 2% e juros de mora de 1% ao mês sobre o valor em atraso.`,

    obrigacoes_contratante: `O CONTRATANTE se obriga a fornecer todas as informações, acessos e materiais necessários para a execução dos serviços dentro dos prazos acordados. O CONTRATANTE deverá responder às solicitações do CONTRATADO(A) em tempo hábil, de forma a não prejudicar o andamento do projeto.

O CONTRATANTE se compromete a efetuar os pagamentos nas datas acordadas e a comunicar previamente qualquer alteração no escopo ou nas condições do projeto.`,

    obrigacoes_contratado: `O CONTRATADO(A) se obriga a executar os serviços com qualidade e profissionalismo, observando as especificações acordadas e os prazos estabelecidos. O CONTRATADO(A) manterá sigilo sobre todas as informações confidenciais do CONTRATANTE às quais tiver acesso durante a execução do contrato.

O CONTRATADO(A) se compromete a comunicar imediatamente qualquer impedimento ou dificuldade que possa afetar o cumprimento dos prazos ou a qualidade dos serviços.`,

    rescisao: `O presente contrato poderá ser rescindido por qualquer das partes, mediante aviso prévio de 15 dias por escrito. Em caso de rescisão, o CONTRATANTE pagará pelos serviços efetivamente prestados até a data da rescisão.

A rescisão por inadimplemento de qualquer das cláusulas contratuais poderá ocorrer de pleno direito, independentemente de notificação judicial ou extrajudicial.`,

    foro: `As partes elegem o foro da comarca onde está localizado o CONTRATANTE para dirimir quaisquer questões oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,

    disposicoes_finais: `E, por estarem assim justos e contratados, as partes assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas.

${formattedDate}

_________________________________
CONTRATANTE: ${data.contractorName}

_________________________________
CONTRATADO(A): ${data.contractedName}

TESTEMUNHAS:

_________________________________
Nome:
CPF:

_________________________________
Nome:
CPF:`
  });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { contractData } = await req.json() as { contractData: ContractData };
    
    console.log('Generating contract from template for:', contractData.contractorName);

    const contractText = generateContractFromTemplate(contractData);

    console.log('Contract generated successfully from template');

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
