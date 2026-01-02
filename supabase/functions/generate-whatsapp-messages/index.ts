import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DiagnosisData {
  companyName: string;
  segment: string;
  cityState: string;
  mainObjective: string;
  mainProblem: string;
  diagnosisText: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { diagnosisData, messageType } = await req.json() as { 
      diagnosisData: DiagnosisData;
      messageType: 'first_contact' | 'follow_up' | 'proposal' | 'closing' | 'all';
    };
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const messageTypeLabels: Record<string, string> = {
      first_contact: 'Primeiro Contato',
      follow_up: 'Follow-up',
      proposal: 'Envio de Proposta',
      closing: 'Fechamento',
      all: 'Todos os tipos'
    };

    const contextPrompt = `
Você é um especialista em copywriting e vendas consultivas para WhatsApp.
Sua tarefa é criar mensagens profissionais e persuasivas para enviar a clientes.

DADOS DO CLIENTE:
- Empresa: ${diagnosisData.companyName}
- Segmento: ${diagnosisData.segment || 'Não informado'}
- Localização: ${diagnosisData.cityState || 'Não informada'}
- Objetivo principal: ${diagnosisData.mainObjective || 'Não informado'}
- Principal problema identificado: ${diagnosisData.mainProblem || 'Não informado'}

CONTEXTO DO DIAGNÓSTICO:
${diagnosisData.diagnosisText ? diagnosisData.diagnosisText.substring(0, 500) + '...' : 'Diagnóstico não disponível'}

${messageType === 'all' ? `
GERE 4 MENSAGENS DIFERENTES:

1. **PRIMEIRO CONTATO**
Mensagem para iniciar conversa com o cliente, mostrando que você entende o negócio dele.
- Deve ser curta (máximo 3 parágrafos)
- Tom amigável e profissional
- Mencionar algo específico sobre o negócio

2. **FOLLOW-UP**
Mensagem para retomar contato após envio do diagnóstico.
- Relembrar os pontos principais
- Criar senso de urgência leve
- Oferecer próximo passo claro

3. **ENVIO DE PROPOSTA**
Mensagem para acompanhar o envio da proposta comercial.
- Destacar os benefícios principais
- Criar expectativa positiva
- Incluir CTA claro

4. **FECHAMENTO**
Mensagem para incentivar a decisão final.
- Reforçar valor da solução
- Abordar possíveis objeções
- Criar senso de oportunidade
` : `
GERE UMA MENSAGEM DO TIPO: ${messageTypeLabels[messageType]}

A mensagem deve:
- Ser natural e profissional
- Ter no máximo 3 parágrafos curtos
- Incluir emojis de forma moderada
- Ter um CTA claro ao final
`}

REGRAS:
- Use português brasileiro informal mas profissional
- Não use palavras como "revolucionário", "incrível" exageradamente
- Personalize com o nome da empresa
- Mantenha mensagens curtas e objetivas (WhatsApp não é email)
- Use quebras de linha para facilitar leitura
- Inclua 1-2 emojis relevantes por mensagem

Formato de resposta (use exatamente este formato):
${messageType === 'all' ? `
---PRIMEIRO_CONTATO---
[mensagem aqui]

---FOLLOW_UP---
[mensagem aqui]

---PROPOSTA---
[mensagem aqui]

---FECHAMENTO---
[mensagem aqui]
` : `
---MENSAGEM---
[mensagem aqui]
`}
`;

    console.log('Generating WhatsApp messages for:', diagnosisData.companyName);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'Você é um copywriter especializado em mensagens de vendas para WhatsApp Business.' },
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
        return new Response(JSON.stringify({ error: 'Créditos insuficientes. Adicione créditos para continuar.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('No messages generated');
    }

    // Parse the generated content into structured messages
    const messages: Record<string, string> = {};
    
    if (messageType === 'all') {
      const sections = ['PRIMEIRO_CONTATO', 'FOLLOW_UP', 'PROPOSTA', 'FECHAMENTO'];
      sections.forEach(section => {
        const regex = new RegExp(`---${section}---\\s*([\\s\\S]*?)(?=---[A-Z_]+---|$)`);
        const match = generatedContent.match(regex);
        if (match) {
          messages[section.toLowerCase()] = match[1].trim();
        }
      });
    } else {
      const match = generatedContent.match(/---MENSAGEM---\s*([\s\S]*)/);
      if (match) {
        messages[messageType] = match[1].trim();
      } else {
        messages[messageType] = generatedContent.trim();
      }
    }

    console.log('WhatsApp messages generated successfully');

    return new Response(JSON.stringify({ messages }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-whatsapp-messages function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar mensagens';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
